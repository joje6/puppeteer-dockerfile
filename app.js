const puppeteer = require('puppeteer');
const AWS = require('aws-sdk');
const fs = require('fs');


(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  // console.log(process.env.PAGE_GOTO);
  await page.goto('https://naver.com');

  const screenshotPath = 'screenshot.png';
  await page.screenshot({ path: screenshotPath });

  await browser.close();

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    endpoint: AWS_S3_ENDPOINT_URL,
  });

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: process.env.AWS_S3_FILENAME,
    Body: fs.createReadStream(screenshotPath)
  };

  s3.upload(uploadParams, function(err, data) {
    if (err) {
      console.error("에러 발생:", err);
    } else {
      console.log("업로드 성공:", data.Location);
    }
  });

  await new Promise(resolve => setTimeout(resolve, 600000)); 

})();
