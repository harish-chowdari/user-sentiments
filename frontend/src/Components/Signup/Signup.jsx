import React, { useState } from "react";
import axios from "../../axios";
import styles from "./Signup.module.css";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [signup, setSignup] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSignup({ ...signup, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await axios.post("/signup", { ...signup });

      if (res.data.EnterAllDetails) {
        setErrorMessage(res.data.EnterAllDetails);
      } else if (res.data.AlreadyExist) {
        setErrorMessage(res.data.AlreadyExist);
      } else if (res.data.PasswordNotMatch) {
        setErrorMessage(res.data.PasswordNotMatch);
      } else {
        const userId = res.data._id;
        navigate(`/home/${userId}`);
        localStorage.setItem("userId", userId);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("An error occurred while signing up. Please try again.");
    }
  };

  return (
  
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h2>Signup</h2>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <div>
          <input
            placeholder="Enter Your Name"
            type="text"
            name="firstName"
            onChange={handleChange}
            value={signup.firstName}
            className={styles.input}
          />
        </div>
        <div>
          <input
            placeholder="Enter Your Last Name"
            type="text"
            name="lastName"
            onChange={handleChange}
            value={signup.lastName}
            className={styles.input}
          />
        </div>
        <div>
          <input
            placeholder="Enter Your Email"
            type="email"
            name="email"
            onChange={handleChange}
            value={signup.email}
            className={styles.input}
          />
        </div>
        <div>
          <input
            placeholder="Enter Your Mobile Number"
            type="number"
            name="mobile"
            onChange={handleChange}
            value={signup.mobile}
            className={styles.input}
          />
        </div>
        <div>
          <input
            placeholder="Enter Your Password"
            type="password"
            name="password"
            onChange={handleChange}
            value={signup.password}
            className={styles.input}
          />
        </div>
        <div>
          <input
            placeholder="Confirm Your Password"
            type="password"
            name="confirmPassword"
            onChange={handleChange}
            value={signup.confirmPassword}
            className={styles.input}
          />
        </div>

        <button type="submit" className={styles.button}>
          Submit
        </button>
        <p className={styles.text}>
          Already have an account?{" "}
          <Link to="/" className={styles.link}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
