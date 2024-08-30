const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/test", async (req, res) => {
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      ignoreDefaultArgs: ["--disable-extensions"],
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    page.once("load", () => res.send({ loaded: true }));
    page.on("error", (err) => res.send({ error: true }));
    await page.goto('https://google.com');
  } catch (err) {
    res.send({ error: true, message: err.message });
  }
});

function generateRandomFilename() {
  const uuid = uuidv4();
  return `${uuid}.png`;
}

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
