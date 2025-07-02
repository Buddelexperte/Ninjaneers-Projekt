import React, { Component } from "react";
import { Link } from "react-router-dom";
import {apiRequest} from "./requestHandler.js";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      role: "",
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    console.log(this.state);

    const res = await apiRequest(
        "login",
        {
          method: "POST",
          body: this.state
        });

    if (res.success)
    {
      const usernameJSON = {"username" : this.state.username};
      this.props.onLoginSuccess(usernameJSON);
    }
    else
    {
      this.setState({password : ""});
    }
    console.log(res.message);
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
                placeholder="Username eingeben"
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
                placeholder="Passwort eingeben"
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
