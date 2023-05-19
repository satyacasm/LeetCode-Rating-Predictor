const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const cors = require("cors");
app.use(express.json());
app.use(cors());
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");

const url = "https://leetcode.com/username/";

const port = process.env.PORT || 3001;

app.get("/rating/:id", async (req, res) => {
  try {
    const url1 = url.replace("username", req.params.id);
    console.log(url1);
    const { data } = await axios.get(url1);
    const $ = cheerio.load(data);

    const ratings = [];
    $(".text-label-1.flex.items-center.text-2xl").each((index, element) => {
      const rating = $(element).text().replace(",", "");
      ratings.push(parseInt(rating));
    });
    console.log(ratings[0]);
    res.send(`You LeetCode Rating is ${ratings[0]}`);
    // const $ = cheerio.load(html);
  } catch (err) {
    console.log(err);
  }
});

app.get("/getContestData", async (req, res) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://leetcode.com/contest/weekly-contest-345/ranking/10/");
  await page.waitForSelector(".table-responsive");
  let source = await page.evaluate(() => {
    const rows = Array.from(
      document.getElementsByTagName("tbody")[0].getElementsByTagName("tr")
    );
    return rows.map((row) => {
      const rank = row.getElementsByTagName("td")[0].textContent;
      const name = row
        .getElementsByClassName("ranking-username")[0]
        .textContent.trim();
      return { rank, name };
    });
  });
  console.log(source);

  // Extract rank and username
  res.send(source);
  await browser.close();
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
