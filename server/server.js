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
  const totalPages = 300; // Set the total number of pages to fetch
  const batchSize = 20; // Set the batch size
  const browser = await puppeteer.launch({ headless: "new" });
  const data = [];

  try {
    for (let batchStart = 1; batchStart <= totalPages; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize - 1, totalPages);
      const pagePromises = [];

      for (let pageNumber = batchStart; pageNumber <= batchEnd; pageNumber++) {
        const page = await browser.newPage();
        const pagePromise = (async () => {
          await page.goto(
            `https://leetcode.com/contest/weekly-contest-345/ranking/${pageNumber}/`
          );
          await page.waitForSelector(".table-responsive");

          const source = await page.evaluate(() => {
            const rows = Array.from(
              document
                .getElementsByTagName("tbody")[0]
                .getElementsByTagName("tr")
            );
            return rows.map((row) => {
              const rank = row.getElementsByTagName("td")[0].textContent;
              const name = row
                .getElementsByClassName("ranking-username")[0]
                .textContent.trim();
              return { rank, name };
            });
          });

          return source;
        })();

        pagePromises.push(pagePromise);
      }

      const pageResults = await Promise.all(pagePromises);
      data.push(...pageResults.flat());
    }
  } finally {
    await browser.close();
  }

  res.send(data);
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
