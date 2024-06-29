import React, { useEffect, useState } from 'react';
import '../styles/ContestPrediction.scss';
import axios from 'axios';
import NavBar from './NavBar';

const ContestPrediction = () => {
  const initialRankList = [
    { username: 'User1', oldRating: 1500, newRating: 1600, change: 100 },
    { username: 'User2', oldRating: 1800, newRating: 1750, change: -50 },
    { username: 'User3', oldRating: 2000, newRating: 2000, change: 0 },
  ];

  const [rankList, setRankList] = useState(initialRankList);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filteredList = initialRankList.filter(
      (rank) => rank.username.toLowerCase().includes(query)
    );
    setRankList(filteredList);
  };

  useEffect(() => {
    const x = axios.get('http://localhost:3001/getContestData').then((res) => {
      console.log(res.data);
    }).catch((err) => {});
  }, []);
  return (
    
    <div className="contest-prediction">
      <NavBar></NavBar>
      <h1 className="title">Contest Prediction</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by username"
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      <table className="rank-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Old Rating</th>
            <th>New Rating</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {rankList.map((rank, index) => (
            <tr key={index}>
              <td>{rank.username}</td>
              <td>{rank.oldRating}</td>
              <td>{rank.newRating}</td>
              <td className={`change ${rank.change > 0 ? 'positive' : rank.change < 0 ? 'negative' : ''}`}>
                {rank.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContestPrediction;
