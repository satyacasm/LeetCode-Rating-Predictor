const express = require('express');
const app=express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
require('dotenv').config()
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");

const url = "https://leetcode.com/username/";

const port=process.env.PORT||3001;

app.get('/rating/:id',async (req,res)=>{
    try{
        const url1=url.replace('username',req.params.id);
        console.log(url1)
        const { data } = await axios.get(url1);
        const $ = cheerio.load(data);
        
        const ratings = [];
        $('.text-label-1.flex.items-center.text-2xl').each((index, element) => {
        const rating = $(element).text().replace(',', '');
        ratings.push(parseInt(rating));
        });
        console.log(ratings[0]);
        res.send(`You LeetCode Rating is ${ratings[0]}`)
        // const $ = cheerio.load(html);
    }
    catch(err){
        console.log(err);

    }
});

app.get('/getContestData',async (req,res)=>{
    const url2='https://leetcode.com/contest/weekly-contest-345/ranking/1/';
    const {data}=await axios.get(url2)
    const $ = cheerio.load(data);
    // console.log(pretty($.html()))
    const usernames = [];
    const ranks = [];
    console.log(pretty($('html').html()))
    $('.table-responsive > tbody > tr').each((index, element) => {
        console.log(element)
      const rank = $(element).find('td').first().text();
      const username = $(element).find('.ranking-username').text();
      ranks.push(rank);
      usernames.push(username);
    });
    console.log(ranks)
    console.log(usernames)
    res.send('Done')
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    }
);