import React from "react";
import { Link } from "react-router-dom";
import "../styles/ContestList.scss";
import NavBar from "./NavBar";

const ContestList = () => {
  const contests = [
    { id: 1, name: "Contest 1", leaderboardId: "12345" },
    { id: 2, name: "Contest 2", leaderboardId: "67890" },
    { id: 3, name: "Contest 3", leaderboardId: "54321" },
  ];

  return (
    <>
      <NavBar></NavBar>
      <div className="body">
        <div className="contest-list">
          <h1 className="title">LeetCode Contests</h1>
          <table className="contest-table">
            <thead>
              <tr>
                <th>Contest Name</th>
                <th>Original Leaderboard</th>
                <th>Prediction</th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest, index) => (
                <tr key={contest.id} className="fade-in">
                  <td>{contest.name}</td>
                  <td>
                    <a
                      href={`https://leetcode.com/contest/${contest.leaderboardId}`}
                      className="leaderboard-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Leaderboard
                    </a>
                  </td>
                  <td>
                    <Link
                      to={`/prediction/${contest.id}`}
                      className="prediction-link"
                    >
                      Go to Prediction
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ContestList;
