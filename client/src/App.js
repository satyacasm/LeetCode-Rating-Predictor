import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ContestList from "./components/ContestList";
import ContestPrediction from "./components/ContestPrediction";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<ContestList/>} />
        <Route path="/prediction/:contestId" element={<ContestPrediction/>} />
      </Routes>
    </div>
  );
}

export default App;
