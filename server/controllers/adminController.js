const axios = require("axios");
const User = require('../models/Admin');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path=require('path');
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

module.exports.getContestRank =  async (req,res)=>{
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
    res.send('Logged in succesfully');
    
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