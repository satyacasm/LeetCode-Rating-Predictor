const User = require("../models/User");
const ContestRankings = require("../models/contestRankings");
const axios = require("axios");
const pLimit = require('p-limit');
const puppeteer = require('puppeteer');
const url = 'https://leetcode.com/graphql';
const batchSize = 500;
const MAX_CONCURRENT_REQUESTS = 5; // Adjust this value based on the server's rate limit
const limit = pLimit(MAX_CONCURRENT_REQUESTS);

const timeoutBetweenBatches = 1000;
async function updateUserData(username, rating, contestsCount) {
  try {
    const user = await User.findOne({ username });

    if (user) {
      user.rating = rating;
      user.contestsCount = contestsCount;
      await user.save();
    } else {
      await User.create({
        username,
        rating,
        contestsCount,
      });
    }
  } catch (error) {
    console.error(`Error updating user data: ${error}`);
  }
}

async function fetchUserDetailsBatch(usernames) {
    const promises = usernames.map((username) => 
      limit(() => fetchAndProcessUserDetails(username))
    );
  
    await Promise.all(promises);
  }
  
  async function fetchAndProcessUserDetails(username) {
    const query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
        }
      }
    `;
  
    const variables = { username };
  
    const maxRetries = 5;
    const baseDelay = 1000; // Start with 1 second delay
  
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.post(url, { query, variables });
        const { rating, attendedContestsCount } = response.data.data.userContestRanking || {};
  
        await updateUserData(
            username,
            rating || 1500,
            attendedContestsCount || 0
          );
  
        return; // If successful, exit the function
  
      } catch (err) {
        if (err.response && err.response.status === 429) {
          // If we hit a 429, wait and retry
          const delay = baseDelay * 2 ** attempt; // Exponential backoff
          console.warn(`Rate limited. Retrying ${username} in ${delay} ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(`Failed to fetch user details for ${username}: ${err}`);
          return; // If other errors, exit
        }
      }
    }
  
    console.error(`Failed to fetch user details for ${username} after ${maxRetries} retries`);
  }
async function updateAllUsers(req, res) {
  try {
    const usernames = await fetchAllUsernames();

    for (let i = 0; i < usernames.length; i += batchSize) {
      const batchUsernames = usernames.slice(i, i + batchSize);
      await fetchUserDetailsBatch(batchUsernames);

      if (i + batchSize < usernames.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, timeoutBetweenBatches)
        );
      }
    console.log(i);
    }


    res.json({ message: "Successfully updated the users" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to update user details",
      error: err,
    });
  }
}

async function fetchAllUsernames() {
  try {
    const distinctUsernames = await ContestRankings.distinct("username");
    return distinctUsernames;
  } catch (error) {
    console.error(`Error fetching usernames: ${error}`);
    return [];
  }
}



/**************************************************************************************************************************************/
// Predict Ratings



async function fetchAllUsernames(contestID) {
  try {
    const distinctUsernames = await ContestRankings.find({ contestID });
    return distinctUsernames;
  } catch (error) {
    console.error(`Error fetching usernames: ${error}`);
    return [];
  }
}

async function sortUsernamesByRanking(data) {
  return data
    .sort((a, b) => a.ranking - b.ranking)
    .map((user) => user.username);
}

async function fetchUserDataBatch(usernames) {
  return await User.find({ username: { $in: usernames } });
}

async function fetchData(sortedUsernames) {
  const batchSize = 500;
  let offset = 0;
  let allUserData = [];

  while (offset < sortedUsernames.length) {
    const batchUsernames = sortedUsernames.slice(offset, offset + batchSize);
    const userDataBatch = await fetchUserDataBatch(batchUsernames);
    const orderedUserDataBatch = batchUsernames.map((username) =>
      userDataBatch.find((user) => user.username === username)
    );

    allUserData = allUserData.concat(orderedUserDataBatch);
    offset += batchSize;
  }
  const contestCounts = allUserData.map((user) => (user && user.contestsCount !== undefined) ? user.contestsCount : 0);

//   console.log(allUserData)
  const ratings = allUserData.map((user) => (user && user.rating !== undefined) ? user.rating : 1500);

  return [contestCounts, ratings];
}

async function predictRating(req, res) {
  try {
    const { contestSlug } = req.body;

    const contestID = await getContestID(contestSlug);
    const data = (await fetchAllUsernames(contestID)).map((user) => ({
      username: user.username,
      ranking: user.ranking,
    }));

    const sortedUsernames = await sortUsernamesByRanking(data);

    const response = await fetchData(sortedUsernames);
    
    for(let u = 0; u < 10; u ++) {
      console.log((getPredictedRatings(response[1], u) - response[1][u]) * f(response[0][u]));
    }


    res.json(response[1]);
  } catch (err) {
    console.error(`Error predicting rating: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
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
const memo = {};

function f(k) {
  function g(k) {
    if (k in memo) {
      return memo[k];
    }

    if (k >= 1) {
      const result = ((5 / 7) ** k) + g(k - 1);
      memo[k] = result;
      return result;
    }

    return 1;
  }

  if (k <= 100) {
    return 1 / (1 + g(k));
  }

  return 2 / 9;
}

function getEstimatedRating(rating, ratings) {
  const func = (a, b) => {
    const x = 1 + (10 ** ((a - b) / 400));
    return 1 / x;
  };
  let ans = 0.5;
  for (let i = 0; i < ratings.length; i++) {
    ans += func(rating, ratings[i]);
  }
  return ans;
}

function getEstimatedRank(estimatedRating, rank) {
  return Math.sqrt(rank * estimatedRating);
}

function binary_search_rating(m, ratings) {
  let estimate = m;
  let low = 0, high = 4000; // max rating will not be 4k (as of now)
  let precision = 0.01;
  let max_iterations = 25;
  while(high - low > precision && max_iterations >= 0) {
    var mid = low + (high - low) / 2;
    if(getEstimatedRating(mid, ratings) < estimate) {
      high = mid;
    }
    else {
      low = mid;
    }
    max_iterations --;
  }
  return mid;
}

function getPredictedRatings(ratings, u) {
  let er0 = getEstimatedRating(ratings[u], ratings);
  let m = getEstimatedRank(er0, u + 1);
  return binary_search_rating(m, ratings);
}





module.exports = {
  updateAllUsers,
  predictRating
};