const axios = require("axios");
const User = require('../models/Admin');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path=require('path');
const puppeteer = require('puppeteer');
const ContestRankings = require("../models/contestRankings");
const LCUser = require("../models/User");
require('dotenv').config();



async function getUserContestRating(id) {
  try {
    
    const response = await axios.post('https://leetcode.com/graphql', {
      query: `{
          userContestRanking(username: "${id}") {
            attendedContestsCount
            rating
          }
        }`
    });

    const { attendedContestsCount, rating } = response.data.data.userContestRanking;
    // console.log(rating)
    return { attendedContestsCount, rating };
  } catch (error) {
    console.error('Error:', error);
    return error;
    // Handle error appropriately
  }
}



module.exports.getRating = async (req, res) => {
    try {
      const data =await  getUserContestRating(req.params.id);
      console.log(data)
      res.send(data);
    }
    catch(err){
        console.log(err);
        throw err;
    }
  };



// const participants = [];
module.exports.getContestRank =  async (req,res)=>{
  let firstPageResponse;
      const participants = [];
      const pageSize = 25;
      const contestSlug=req.body.slug;
      firstPageResponse = await fetchContestRankings(contestSlug,1)
      // firstPageResponse = await axios.get(`https://leetcode.com/contest/api/ranking/weekly-contest-344/?pagination=2&region=global`);
      // // weekly-contest-345
      const firstPageData = firstPageResponse;
  
      let totalPages = Math.ceil(firstPageData.user_num / pageSize);
      // totalPages =3;
      let ranks = firstPageData.total_rank;
      let contestID;
      if(firstPageData && firstPageData.total_rank){
        contestID = ''+firstPageData.total_rank[0].contest_id;
      }
      // console.log(firstPageData.total_rank[0])
      console.log(totalPages+" "+contestID)
      try{
        for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
          console.log(currentPage)
          const pageResponse = await fetchContestRankings(contestSlug,currentPage);
          const pageData = pageResponse;
          // console.log(pageData.total_rank)
          if (pageData && pageData.total_rank) {
            pageData.total_rank.forEach((participant) => {
              // console.log(participant)
              const { username, rank } = participant;
              participants.push({ username, rank });
            });
          }
        }
        console.log(participants);
        await postContestRankings(contestSlug,participants);
        res.send(participants);
      }
      catch(err){
        res.send('Error fetching Ranks');
        console.log(err);
      }
      
      // res.send(firstPageResponse)
  };


  async function fetchContestRankings(contestSlug, currentPage) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set the User-Agent header
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
  
    // Go to the contest rankings page
    const url = `https://leetcode.com/contest/api/ranking/${contestSlug}/?pagination=${currentPage}&region=global`;
    await page.goto(url);
  
     // Extract the JSON data from the <pre> tag
    const jsonData = await page.evaluate(() => {
      const preElement = document.querySelector('pre');
      if (preElement) {
        return JSON.parse(preElement.textContent);
      }
      return null;
    });

    await browser.close();
    return jsonData;
  }
  async function getContestID(contestSlug){
      const firstPageResponse = await fetchContestRankings(contestSlug,1)
      // firstPageResponse = await axios.get(`https://leetcode.com/contest/api/ranking/weekly-contest-344/?pagination=2&region=global`);
      // // weekly-contest-345
      const firstPageData = firstPageResponse;
      let ranks = firstPageData.total_rank;
      let contestID;
      if(firstPageData && firstPageData.total_rank){
        contestID = ''+firstPageData.total_rank[0].contest_id;
      }
      return contestID;
  }
module.exports.getAllContest = async (req,res)=>{
  try{
    const response = await axios.get(`https://leetcode.com/_next/data/lYmU2J-PXaqwL3Mv1FM8J/contest.json`);
    res.send(response.data.pageProps.dehydratedState.queries[1].state.data.pastContests.data)
  }
  catch(err){
    console.log(err)
    throw(err)
  }
}
async function postContestRankings(contestSlug, data) {
  const contestID = await getContestID(contestSlug);
  try {
    // Log the start of the operation
    console.log(`Starting to update contest rankings for contestID: ${contestID}`);

    const bulkOps = data.map(({ username, rank }) => ({
      updateOne: {
        filter: { contestID, username },
        update: { $set: { contestID, username, ranking: rank } },
        upsert: true,
      },
    }));

    // Log the number of bulk operations to be performed
    console.log(`Preparing to perform ${bulkOps.length} bulk operations`);

    const result = await ContestRankings.bulkWrite(bulkOps);

    // Log the result of the bulkWrite operation
    console.log(`Bulk write operation completed. Result:`);
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);

  } catch (err) {
    // Log the error
    console.error("Error updating contest rankings:", err);
    throw {
      message: "Error fetching ranks",
      error: err,
    };
  }
}



/*************************************************************************************************************************************/
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
                            { expiresIn: 10 },
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
    const token = jwt.sign({ id: user._id }, config.get('jwtsecret'), { expiresIn: '1000s' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000000 });

    res.send({
      token,
      user
    });
    
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
  res.send('Logged out succesfully');
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