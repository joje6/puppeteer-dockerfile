const puppeteer = require('puppeteer');
const AWS = require('aws-sdk');
const fs = require('fs');

const pageGoto = process.env.PAGE_GOTO || 'https://cloudtype.io';
const awsAccessKey = process.env.AWS_ACCESS_KEY || '';
const awsSecretKey = process.env.AWS_SECRET_KEY || '';
const awsS3EndpointUrl = process.env.AWS_S3_ENDPOINT_URL || '';
const awsS3Bucket = process.env.AWS_S3_BUCKET || '';
const awsS3Filename = process.env.AWS_S3_FILENAME || '';

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
  await page.goto(
    pageGoto, 
    { 
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });

  await page.setViewport({width: 1920, height: 1024});

  const screenshotPath = 'screenshot.png';
  await page.screenshot({ path: screenshotPath });

  await browser.close();

  const s3 = new AWS.S3({
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey,
    endpoint: awsS3EndpointUrl,
  });

  const uploadParams = {
    Bucket: awsS3Bucket,
    Key: awsS3Filename,
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
