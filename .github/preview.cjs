/* Renders _preview/ screenshots of the site with the system Chrome.
   Run by .github/workflows/preview.yml — not part of the website itself. */

const puppeteer = require('puppeteer-core');

const sections = [
  { name: 'hero', sel: null },
  { name: 'maison', sel: '#maison' },
  { name: 'collections', sel: '#collections' },
  { name: 'signatures', sel: '#signatures' },
  { name: 'campaign', sel: '#campaign' },
  { name: 'lookbook', sel: '#lookbook' },
  { name: 'journal', sel: '#journal' },
  { name: 'newsletter', sel: '#newsletter' },
  { name: 'footer', sel: '#contact' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1'],
  });

  const still = `file://${process.cwd()}/index.html?still`;
  const live = `file://${process.cwd()}/index.html`;

  for (const vp of [
    { tag: 'desktop', width: 1440, height: 900 },
    { tag: 'mobile', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(still, { waitUntil: 'networkidle0' });
    await sleep(700);

    for (const s of sections) {
      await page.evaluate((sel) => {
        if (sel) document.querySelector(sel).scrollIntoView({ behavior: 'instant', block: 'start' });
        else window.scrollTo(0, 0);
      }, s.sel);
      await sleep(350);
      await page.screenshot({ path: `_preview/${vp.tag}-${s.name}.png` });
    }

    const diag = await page.evaluate(() => ({
      htmlClass: document.documentElement.className,
      scrollY: window.scrollY,
      bodyScrollTop: document.body.scrollTop,
      docHeight: document.documentElement.scrollHeight,
      charOpacity: getComputedStyle(document.querySelector('.hero__title .char')).opacity,
      heroImg: getComputedStyle(document.querySelector('.hero__media img')).opacity,
    }));
    console.log(`[diag ${vp.tag}]`, JSON.stringify(diag));

    if (vp.tag === 'desktop') {
      // signatures pane with the third row hovered
      await page.evaluate(() => document.querySelector('#signatures').scrollIntoView({ behavior: 'instant' }));
      await page.hover('#sigList .sig:nth-child(3) a');
      await sleep(450);
      await page.screenshot({ path: '_preview/desktop-signatures-hover.png' });

      // lookbook dragged midway
      await page.evaluate(() => {
        document.querySelector('#lookbook').scrollIntoView({ behavior: 'instant' });
        const vpEl = document.getElementById('lookViewport');
        vpEl.scrollLeft = (vpEl.scrollWidth - vpEl.clientWidth) / 2;
      });
      await sleep(350);
      await page.screenshot({ path: '_preview/desktop-lookbook-mid.png' });
    }

    if (vp.tag === 'mobile') {
      // fullscreen menu open
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.click('#menuToggle');
      await sleep(450);
      await page.screenshot({ path: '_preview/mobile-menu.png' });
    }

    await page.close();
  }

  // the real intro, no ?still: validates the wall-clock choreography lands
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(live, { waitUntil: 'networkidle0' });
  await sleep(4200);
  await page.screenshot({ path: '_preview/desktop-hero-live.png' });
  const liveDiag = await page.evaluate(() => ({
    htmlClass: document.documentElement.className,
    charOpacity: getComputedStyle(document.querySelector('.hero__title .char')).opacity,
    preloaderInDom: !!document.getElementById('preloader'),
  }));
  console.log('[diag live]', JSON.stringify(liveDiag));
  await page.close();

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
