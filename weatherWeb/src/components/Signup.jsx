import React, { Component } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "./requestHandler.js";

function Control({ label, children }) {
  return (
    <div className="form-row">
      {label && <label className="input-label">{label}</label>}
      {children}
    </div>
  );
}

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      rep_password: "",
      role: "",
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, rep_password, role } = this.state;

    if (password !== rep_password) {
      alert("Passwords must be repeated");
      return;
    }

    const res = await apiRequest("signup", false, {
      method: "POST",
      body: { "username" : username, "password": password, "role": role, "email": email, "isVerified": false},
    });

    if (res.success) {
      this.props.navigate("/");
    } else {
      alert(res.message || "Unknown signup error");
    }
  };

  render() {
    const { username, email, password, rep_password } = this.state;

    const SIGNUP_FIELDS = [
      {
        label: "Username:",
        key: "username",
        type: "text",
        value: username,
        placeholder: "Enter your username",
      },
      {
        label: "E-Mail:",
        key: "email",
        type: "email",
        value: email,
        placeholder: "Enter your email",
      },
      {
        label: "Password:",
        key: "password",
        type: "password",
        value: password,
        placeholder: "Enter your password",
      },
      {
        label: "Repeat Password:",
        key: "rep_password",
        type: "password",
        value: rep_password,
        placeholder: "Repeat your password",
      },
    ];

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Sign up for Weather Dashboard</h2>
          <form onSubmit={this.handleSubmit}>
            {SIGNUP_FIELDS.map(({ label, key, type, value, placeholder }) => (
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
                Sign Up
              </button>
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
