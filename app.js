const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const express = require("express");

const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

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

app.get("/test", async (req, res) => {
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

  res.send({src:screenshotPath});
});

function generateRandomFilename() {
  const uuid = uuidv4();
  return `${uuid}.png`;
}

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
