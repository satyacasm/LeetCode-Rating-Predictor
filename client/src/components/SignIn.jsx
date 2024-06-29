import { useRef } from "react";
import styles from "../styles/Signup.module.css";
import { Link } from "react-router-dom";

const Signin = (props) => {
  const emailRef = useRef();
  const passwordRef = useRef();

  const signUpHandler = async (event) => {
    event.preventDefault();
    const data = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };
    try {
      const response = await fetch("http://localhost:4000/admin/login", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log(result.token);
      props.valid(result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.body}> 
      <div className={styles.login}>
        <p className={styles.welcome}>Welcome Back</p>
        <form onSubmit={signUpHandler}>
          <label htmlFor="Email">Enter Email</label>
          <input type="text" name="Email" ref={emailRef} />
          <label htmlFor="Password">Enter Password</label>
          <input type="password" name="Password" ref={passwordRef} />
          <button type="submit">Submit</button>
          <br />
          <p>First Time Here ?? Create account</p>
          <Link to="/signup"><button type="submit">Sign Up</button></Link>
        </form>
      </div>
    </div>
  );
};

export default Signin;
