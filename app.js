require("dotenv").config();

const puppeteer = require("puppeteer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const express = require("express");

const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const awsAccessKey = process.env.AWS_ACCESS_KEY || "";
const awsSecretKey = process.env.AWS_SECRET_KEY || "";
const awsS3EndpointUrl = process.env.AWS_S3_ENDPOINT_URL || "";
const awsS3Bucket = process.env.AWS_S3_BUCKET || "";

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
      res.type('text/css');
  }
  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { pageUrl: "" });
});

app.post("/", async (req, res) => {
  const { pageUrl } = req.body;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 120000 });
  await page.setViewport({ width: 1920, height: 1024 });

  const screenshotPath = "screenshot.png";
  await page.screenshot({ path: screenshotPath });

  await browser.close();

  const s3 = new AWS.S3({
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey,
    endpoint: awsS3EndpointUrl,
  });

  const awsS3Filename = generateRandomFilename();

  const uploadParams = {
    Bucket: awsS3Bucket,
    Key: awsS3Filename,
    Body: fs.createReadStream(screenshotPath),
  };

  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.error("에러 발생:", err);
      res.status(500).send("파일 업로드 중에 오류가 발생했습니다.");
    } else {
      res.send(`스크린샷이 업로드되었습니다.`);
    }
  });
});

function generateRandomFilename() {
  const uuid = uuidv4();
  return `${uuid}.png`;
}

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
