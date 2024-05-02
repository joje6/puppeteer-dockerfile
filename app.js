const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ],
  });
  const page = await browser.newPage();
  await page.goto('https://cloudtype.io');
  await page.screenshot({ path: 'cloudtype.png' });

  await new Promise(resolve => setTimeout(resolve, 600000)); 

  await browser.close();
})();
