import React, { Component } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "./requestHandler.js";

// Reusable Control component
function Control({ label, children }) {
  return (
    <div className="form-row">
      {label && <label className="input-label">{label}</label>}
      {children}
    </div>
  );
}

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

    const res = await apiRequest("login", false, {
      method: "POST",
      body: this.state,
    });

    if (res.success) {
      const loginToken = res.body.access_token;
      this.props.onLoginSuccess(loginToken);
    } else {
      switch (res.error)
      {
        case "pw-mismatch":
          this.setState({ password: "" });
          break;
        case "name-not-found":
          this.setState({username: "", password: ""})
          break;
      }
      console.log(res.message);
    }
  };

  render() {
    const { username, password } = this.state;

    const LOGIN_FIELDS = [
      {
        label: "Username:",
        key: "username",
        type: "text",
        value: username,
        placeholder: "Enter your Username",
      },
      {
        label: "Password:",
        key: "password",
        type: "password",
        value: password,
        placeholder: "Enter your Password",
      },
    ];

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Login to Weather Dashboard</h2>
          <form onSubmit={this.handleSubmit}>
            {LOGIN_FIELDS.map(({ label, key, type, value, placeholder }) => (
              <Control key={key} label={label}>
                <input
                  name={key}
                  type={type}
                  className="form-input-stretch"
                  value={value}
                  placeholder={placeholder}
                  onChange={this.handleChange}
                  required
                />
              </Control>
            ))}
            <div className="login-signup">
              <button type="submit" className="standalone-btn">
                Login
              </button>
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
