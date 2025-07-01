import React, { Component } from "react";
import { Link } from "react-router-dom";

const SIGNUP_URL = "http://localhost:8000/weather/signup";

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      rep_password: ""
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, rep_password } = this.state;

    if (password !== rep_password) {
      alert("Passwords must be repeated");
      return;
    }

    try {
      const signUpRes = await fetch(SIGNUP_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!signUpRes.ok) throw new Error(`HTTP error: ${signUpRes.status}`);

      const json = await signUpRes.json();

      if (json.success) {
        this.props.navigate("/");
      } else {
        alert(json.message || "Unknown signup error");
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      alert("Network or server error.");
    }
  };

  render() {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Sign up for Weather Dashboard</h2>
          <form onSubmit={this.handleSubmit}>
            <div className="form-row">
              <label className="input-label">Username:</label>
              <input
                name="username"
                type="text"
                className="form-input-stretch"
                value={this.state.username}
                onChange={this.handleChange}
                required
              />
            </div>
            <div className="form-row">
              <label className="input-label">Password:</label>
              <input
                name="password"
                type="password"
                className="form-input-stretch"
                value={this.state.password}
                onChange={this.handleChange}
                required
              />
            </div>
            <div className="form-row">
              <label className="input-label">Repeat Password:</label>
              <input
                name="rep_password"
                type="password"
                className="form-input-stretch"
                value={this.state.rep_password}
                onChange={this.handleChange}
                required
              />
            </div>
            <div className="login-signup">
              <button type="submit" className="standalone-btn">Sign Up</button>
              <p>
                or <Link to="/">log into existing account</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Signup;