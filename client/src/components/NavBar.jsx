import React, { useEffect } from 'react';
import '../styles/NavBar.css'; // Ensure you import your CSS module

const NavBar = () => {

  const logOutHandler = (event) =>{
    localStorage.removeItem('jwt_token');
    window.location.reload();
  }
  let profile_var;
  useEffect(()=>{
    const fetchProfile = async ()=>{
      const response = await fetch('http://localhost:4000/admin/user');
      profile_var = await response.json();
    }
    fetchProfile();
  },[profile_var]);

  const profileHandler = ()=>{
    console.log(profile_var);
  }

  return (
    <header>
      <ul>
        <div className="left">
          <li>Svg</li>
          <li>LeetCode Rating Predictor</li>
        </div>
        <div className="right">
          <li onClick={profileHandler}>Profile</li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            viewBox="0 0 256 256"
            xmlSpace="preserve"
          >
            <defs />
            <g
              style={{
                stroke: 'none',
                strokeWidth: 0,
                strokeDasharray: 'none',
                strokeLinecap: 'butt',
                strokeLinejoin: 'miter',
                strokeMiterlimit: 10,
                fill: 'none',
                fillRule: 'nonzero',
                opacity: 1
              }}
              transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
            >
              <circle
                cx="45"
                cy="45"
                r="44"
                style={{
                  stroke: 'none',
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'rgb(178,178,178)',
                  fillRule: 'nonzero',
                  opacity: 1
                }}
                transform="matrix(1 0 0 1 0 0)"
              />
              <circle
                cx="44.997"
                cy="39.727"
                r="19.817"
                style={{
                  stroke: 'none',
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'rgb(109,109,109)',
                  fillRule: 'nonzero',
                  opacity: 1
                }}
                transform="matrix(1 0 0 1 0 0)"
              />
              <path
                d="M 11.266 73.25 C 19.337 63.622 31.454 57.5 45 57.5 c 13.546 0 25.663 6.122 33.734 15.75 l 0 0 C 70.663 82.878 58.547 89 45 89 C 31.454 89 19.337 82.878 11.266 73.25 L 11.266 73.25 z"
                style={{
                  stroke: 'none',
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'rgb(109,109,109)',
                  fillRule: 'nonzero',
                  opacity: 1
                }}
                transform="matrix(1 0 0 1 0 0)"
                strokeLinecap="round"
              />
              <path
                d="M 45 90 C 20.187 90 0 69.813 0 45 C 0 20.187 20.187 0 45 0 c 24.813 0 45 20.187 45 45 C 90 69.813 69.813 90 45 90 z M 45 2 C 21.29 2 2 21.29 2 45 c 0 23.71 19.29 43 43 43 c 23.71 0 43 -19.29 43 -43 C 88 21.29 68.71 2 45 2 z"
                style={{
                  stroke: 'none',
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'rgb(43,43,43)',
                  fillRule: 'nonzero',
                  opacity: 1
                }}
                transform="matrix(1 0 0 1 0 0)"
                strokeLinecap="round"
              />
              <path
                d="M 78.734 73.25 c -6.576 -7.844 -15.837 -13.358 -26.368 -15.133 c 7.294 -2.925 12.451 -10.048 12.451 -18.387 c 0 -10.945 -8.873 -19.817 -19.817 -19.817 S 25.183 28.785 25.183 39.73 c 0 8.339 5.157 15.462 12.451 18.387 c -10.531 1.775 -19.793 7.29 -26.368 15.133 v 0 C 19.337 82.878 31.454 89 45 89 C 58.547 89 70.663 82.878 78.734 73.25 L 78.734 73.25 z"
                style={{
                  stroke: 'none',
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'rgb(109,109,109)',
                  fillRule: 'nonzero',
                  opacity: 1
                }}
                transform="matrix(1 0 0 1 0 0)"
                strokeLinecap="round"
              />
              <path
                d="M 45 90 c -13.344 0 -25.919 -5.871 -34.5 -16.107 L 9.961 73.25 l 0.539 -0.643 c 6.239 -7.441 14.692 -12.654 24.046 -14.883 c -6.379 -3.687 -10.363 -10.467 -10.363 -17.995 c 0 -11.479 9.339 -20.817 20.817 -20.817 s 20.817 9.339 20.817 20.817 c 0 7.528 -3.983 14.309 -10.362 17.995 c 9.354 2.229 17.808 7.441 24.046 14.883 l 0.538 0.643 l -0.538 0.643 C 70.919 84.129 58.344 90 45 90 z M 12.581 73.25 C 20.764 82.635 32.531 88 45 88 c 12.47 0 24.236 -5.365 32.419 -14.75 C 70.887 65.761 61.964 60.748 52.2 59.104 l -3.506 -0.591 l 3.3 -1.323 c 7.183 -2.882 11.823 -9.734 11.823 -17.46 c 0 -10.376 -8.441 -18.817 -18.817 -18.817 s -18.817 8.441 -18.817 18.817 c 0 7.726 4.641 14.578 11.823 17.46 l 3.3 1.323 L 37.8 59.104 C 28.037 60.748 19.114 65.76 12.581 73.25 z"
                style={{
                  stroke: 'none',
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'rgb(43,43,43)',
                  fillRule: 'nonzero',
                  opacity: 1
                }}
                transform="matrix(1 0 0 1 0 0)"
                strokeLinecap="round"
              />
            </g>
          </svg>
          <li onClick={logOutHandler}>Logout</li>
        </div>
      </ul>
    </header>
  );
};

export default NavBar;
