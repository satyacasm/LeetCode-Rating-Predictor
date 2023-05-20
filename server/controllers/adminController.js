const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const puppeteer = require('puppeteer');
const User = require('../models/Admin');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path=require('path');
require('dotenv').config();

const url = "https://leetcode.com/username/";

module.exports.getRating = async (req, res) => {
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
  };

module.exports.getContestRank = async (req, res) => {
    const getLastPage = async function fetchLastSecondLi() {
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.goto(
        "https://leetcode.com/contest/weekly-contest-345/ranking/1/"
      );
      const elements = await page.$$eval(".pagination li", (lis) =>
        lis.slice(-2, -1).map((li) => li.textContent)
      );
      await browser.close();
  
      return elements[0];
    };
  
    const start = parseInt(req.params.id);
    const totalPages = Math.min(99 + start, await getLastPage()); // Set the total number of pages to fetch
    // console.log(totalPages);
    const batchSize = 5; // Set the batch size
    const browser = await puppeteer.launch({ headless: "new" });
    const data = [];
    try {
      for (
        let batchStart = start;
        batchStart <= totalPages;
        batchStart += batchSize
      ) {
        const batchEnd = Math.min(batchStart + batchSize - 1, totalPages);
        const pagePromises = [];
  
        for (let pageNumber = batchStart; pageNumber <= batchEnd; pageNumber++) {
            console.log(pageNumber)
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
  };


  module.exports.getLastPage = async function fetchLastSecondLi(req,res) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(
      "https://leetcode.com/contest/weekly-contest-345/ranking/1/"
    );
    const elements = await page.$$eval(".pagination li", (lis) =>
      lis.slice(-2, -1).map((li) => li.textContent)
    );
    await browser.close();

    res.send(elements[0]);
};

  //Login-Signup module

  module.exports.signup = (req,res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password){
        res.status(400).json({msg: 'Please enter all fields'});
    }

    User.findOne({email})
    .then(user => {
        if(user) return res.status(400).json({msg: 'User already exists'});

        const newUser = new User({ name, email, password });

        // Create salt and hash
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                    .then(user => {
                        jwt.sign(
                            { id: user._id },
                            config.get('jwtsecret'),
                            { expiresIn: 3600 },
                            (err, token) => {
                                if(err) throw err;
                                res.json({
                                    token,
                                    user: {
                                        id: user._id,
                                        name: user.name,
                                        email: user.email
                                    }
                                });
                            }
                        )

                    });
            })
        })
    })
    .catch(err =>{
        console.log(err);
    });
}

// Login controller
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Sign JWT token and set cookie
    const token = jwt.sign({ id: user._id }, config.get('jwtsecret'), { expiresIn: '1h' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });
    res.redirect('/admin/dashboard');
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
}

// Logout controller
module.exports.logout = (req, res) => {
  res.clearCookie('jwt');
//   res.json({ msg: 'Logged out' });
    // req.flash('Logged Out', 'You are successfully logged out')
  res.redirect('/');
}

// Get user controller
module.exports.get_user = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
}