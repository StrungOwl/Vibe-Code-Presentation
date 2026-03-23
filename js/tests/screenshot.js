/**
 * Visual Screenshot Test
 *
 * Starts a local server, opens the presentation in a headless browser,
 * and captures screenshots of specified slides for visual review.
 *
 * Usage:
 *   npm test                    # Screenshot the title slide (default)
 *   npm test -- --slide 5       # Screenshot slide 5
 *   npm test -- --all           # Screenshot every slide
 *   npm test -- --slide 3 --slide 10  # Screenshot specific slides
 */

const { chromium } = require('playwright');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const PORT = 8787;
const BASE_URL = `http://localhost:${PORT}`;

function parseArgs() {
  const args = process.argv.slice(2);
  const slides = [];
  let all = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') {
      all = true;
    } else if (args[i] === '--slide' && args[i + 1]) {
      slides.push(parseInt(args[i + 1], 10));
      i++;
    }
  }

  if (!all && slides.length === 0) {
    slides.push(0); // default: title slide
  }

  return { slides, all };
}

function startServer() {
  return new Promise((resolve, reject) => {
    const rootDir = path.join(__dirname, '..');
    const server = exec(`npx serve "${rootDir}" -l ${PORT} --no-clipboard`, {
      cwd: rootDir,
    });

    // Wait for server to be ready
    const timeout = setTimeout(() => {
      reject(new Error('Server failed to start within 10s'));
    }, 10000);

    server.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Accepting connections') || msg.includes('Local:')) {
        clearTimeout(timeout);
        resolve(server);
      }
    });

    server.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Accepting connections') || msg.includes('Local:')) {
        clearTimeout(timeout);
        resolve(server);
      }
    });

    // Fallback: just wait 3 seconds
    setTimeout(() => {
      clearTimeout(timeout);
      resolve(server);
    }, 3000);
  });
}

async function getTotalSlides(page) {
  return await page.evaluate(() => {
    return Reveal.getTotalSlides();
  });
}

async function navigateToSlide(page, index) {
  await page.evaluate((idx) => {
    const slides = Reveal.getSlides();
    if (idx < slides.length) {
      Reveal.slide(Reveal.getIndices(slides[idx]).h, Reveal.getIndices(slides[idx]).v);
    }
  }, index);
  // Wait for transitions
  await page.waitForTimeout(1000);
}

async function run() {
  const { slides, all } = parseArgs();

  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Starting local server...');
  const server = await startServer();

  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    // Collect console errors
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    console.log(`Opening ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for Reveal.js to initialize
    await page.waitForFunction(() => typeof Reveal !== 'undefined' && Reveal.isReady(), { timeout: 15000 });
    await page.waitForTimeout(500);

    const totalSlides = await getTotalSlides(page);
    console.log(`Presentation has ${totalSlides} slides.`);

    const targetSlides = all
      ? Array.from({ length: totalSlides }, (_, i) => i)
      : slides;

    for (const idx of targetSlides) {
      if (idx >= totalSlides) {
        console.log(`Slide ${idx} out of range (max ${totalSlides - 1}), skipping.`);
        continue;
      }
      await navigateToSlide(page, idx);
      const filename = `slide-${String(idx).padStart(3, '0')}.png`;
      const filepath = path.join(SCREENSHOTS_DIR, filename);
      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`Captured: ${filename}`);
    }

    // Report console errors
    if (errors.length > 0) {
      console.log(`\n--- Browser Console Errors (${errors.length}) ---`);
      errors.forEach((e) => console.log(`  ERROR: ${e}`));
    } else {
      console.log('\nNo browser console errors detected.');
    }

    console.log(`\nScreenshots saved to: ${SCREENSHOTS_DIR}`);
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }
}

run().catch((err) => {
  console.error('Screenshot test failed:', err);
  process.exit(1);
});
