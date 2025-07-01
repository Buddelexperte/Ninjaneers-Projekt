import React, { Component } from "react";
import { Link } from "react-router-dom";

const LOGIN_CHECK_URL = "http://localhost:8000/weather/login"; // Set your actual login URL

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginTryRes = await fetch(LOGIN_CHECK_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.state),
      });

      if (!loginTryRes.ok)
        throw new Error(`HTTP error: ${loginTryRes.status}`);

      const json = await loginTryRes.json();

      if (json.success) {
        this.props.onLoginSuccess();
      } else {
        alert(json.message || "Unknown login error");
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
          <h2>Login to Weather Dashboard</h2>
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
            <div className="login-signup">
              <button type="submit" className="standalone-btn">Login</button>
              <p>
                or <Link to="/signup">create an account</Link>
              </p>
            </div>
          </form>

        </div>
      </div>
    );
  }
}

export default Login;
