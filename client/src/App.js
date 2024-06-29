import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ContestList from "./components/ContestList";
import ContestPrediction from "./components/ContestPrediction";
import Signup from "./components/Signup";
import Signin from "./components/SignIn";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      const decodedToken = jwtDecode(storedToken);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('jwt_token');
        setToken(null);
      } else {
        setToken(storedToken);
      }
    }
  }, [token]);

  const isValid = (result) => {
    if(result.token) {
      localStorage.setItem('jwt_token', result.token);
      setToken(result.token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
  };

  console.log(token);
  return (
    <div className="App">
      <Routes>
          <Route exact path="/" element={token ? <ContestList /> : <Navigate to="/signin" />} />
          <Route path="/prediction/:contestId" element={token ? <ContestPrediction /> : <Navigate to="/signin" />} />
          <Route 
            path="/signup" 
            element={!token ? <Signup valid={isValid} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/signin" 
            element={!token ? <Signin valid={isValid} /> : <Navigate to="/" />} 
          />
      </Routes>
    </div>
  );
}

export default App;
