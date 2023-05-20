const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const mongoose=require('mongoose');
const cookieParser = require('cookie-parser');
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

const dbURI = process.env.DB_URI;
const port = process.env.PORT || 3001;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((res)=>console.log("Connected to MongoDB database"))
.catch((err)=>console.log("Error in connection to MongoDB"))

const adminRoutes = require('./routes/adminRoutes');
app.get('/contestRank',async (req,res)=>{
  try {
    const pageSize = 25;

    const firstPageResponse = await axios.get(`https://leetcode.com/contest/api/ranking/weekly-contest-344/?pagination=1&region=global`);
    const firstPageData = firstPageResponse.data;

    const totalPages = Math.ceil(firstPageData.user_num / pageSize);

    const participants = [];

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      console.log(currentPage)
      const pageResponse = await axios.get(`https://leetcode.com/contest/api/ranking/weekly-contest-344/?pagination=${currentPage}&region=global`);
      const pageData = pageResponse.data;

      if (pageData && pageData.total_rank && Array.isArray(pageData.total_rank)) {
        pageData.total_rank.forEach((participant) => {
          const { username, rank } = participant;
          participants.push({ username, rank });
        });
      }
    }

    res.send(participants);
  } catch (error) {
    console.error('Error fetching contest data:', error);
    throw error;
  }
})
app.use('/admin',adminRoutes);

async function getParticipantsData() {
  
}



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
