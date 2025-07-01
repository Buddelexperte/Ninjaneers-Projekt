import React, { Component } from "react";

const LOGIN_CHECK_URL = "http://localhost:8000/weather/login";

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
            method : "POST",
            mode : "cors",
            headers:
                {
                    "Content-Type": "application/json",
                },
            body : JSON.stringify(this.state)
        });
        if (!loginTryRes.ok) throw new Error(`HTTP error: ${res.status}`);
        const json = await loginTryRes.json();

        if (json.success)
        {
          this.props.onLoginSuccess();
        }
      alert(json.message || "Unknown login error");

    } catch (err) {
        console.error("Fetch error:", err.message);
        return [];
    }


  };

  render() {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Login to Weather Dashboard</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              name="username"
              type="text"
              value={this.state.username}
              onChange={this.handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              name="password"
              type="password"
              value={this.state.password}
              onChange={this.handleChange}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }
}

export default Login;
