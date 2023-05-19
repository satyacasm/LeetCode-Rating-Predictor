const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");

const url = "https://leetcode.com/codeRuddh/";

module.exports.evaluate = async (req,res)=>{
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    res.send("hi")
    const items=$("text-label-1 dark flex items-center text-2xl")
    console.log(items);
}