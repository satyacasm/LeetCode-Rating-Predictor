import { useRef } from "react";
import styles from "../styles/Signup.module.css";
import { Link } from "react-router-dom";

const Signup = (props) => {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const signUpHandler = async (event) => {
    event.preventDefault();
    const data = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };
    try {
      const response = await fetch("http://localhost:4000/admin/register", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log(result);
      props.valid(result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.body}> 
      <div className={styles.login}>
        <p className={styles.welcome}>Welcome!!</p>
        <form onSubmit={signUpHandler}>
          <label htmlFor="Name">Enter Name</label>
          <input type="text" name="Name" ref={nameRef} />
          <label htmlFor="Email">Enter Email</label>
          <input type="text" name="Email" ref={emailRef} />
          <label htmlFor="Password">Enter Password</label>
          <input type="password" name="Password" ref={passwordRef} />
          <button type="submit">Submit</button>
          <br />
          <p>Already Have an Account ??</p>
          <Link to="/signin"><button type="submit">Sign in</button></Link>
        </form>
      </div>
    </div>
  );
};

export default Signup;
