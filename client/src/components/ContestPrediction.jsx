import React from 'react';
import '../styles/ContestPrediction.scss';

const ContestPrediction = () => {
  const rankList = [
    { username: 'User1', oldRating: 1500, newRating: 1600, change: 100 },
    { username: 'User2', oldRating: 1800, newRating: 1750, change: -50 },
    { username: 'User3', oldRating: 2000, newRating: 2000, change: 0 },
  ];

  return (
    <div className="contest-prediction">
      <h1 className="title">Contest Prediction</h1>
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
            <tr key={index} className="fade-in">
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
