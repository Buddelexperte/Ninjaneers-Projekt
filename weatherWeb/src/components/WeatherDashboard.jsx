import React, { useState } from "react";
import {User, LogOut} from "lucide-react";
import Wd_table from "./wd_table.jsx";
import Wd_chart from "./wd_charts.jsx";
import {useNavigate} from "react-router-dom";

function Control({ label, children }) {
  return (
    <div className="control-item">
      {label && <label className="input-label">{label}</label>}
      {children}
    </div>
  );
}

// Key mapping for the form fields
const PROFILE_FIELDS = [
  { label: "Username:", key: "newUsername", type: "text" },
  { label: "Password:", key: "newPassword", type: "password" },
  { label: "Repeat Password:", key: "newRepeatedPassword", type: "password" },
];

function WeatherDashboard({loggedUser}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table");
  const [showProfile, setShowProfile] = useState(false);
  const [formData, setFormData] = useState({
    newUsername : "",
    newPassword : "",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    alert(`Username: ${formData.newUsername}\nPassword: ${formData.newPassword}`);
    setShowProfile(false);
    setFormData({newUsername : "", newPassword : ""});
  };

  return (
    <div>
      <div className="title-bar">
        <button
            className="left-title-icon"
            onClick={() => setShowProfile(!showProfile)}
        >
          <User size={40}/>
        </button>
        <h1 className="title">Weather Dashboard</h1>
        <button
            className="right-title-icon"
            onClick={() => navigate("/")}
        >
          <LogOut size={40}/>
        </button>
      </div>
      <div className="dashboard">
        <div className="view-switch-div">
          <button
            className="standalone-btn"
            onClick={() => setViewMode(viewMode === "table" ? "chart" : "table")}
          >
            Switch to {viewMode === "table" ? "Chart" : "Table"} View
          </button>
        </div>
      </div>
      {viewMode === "table" ? <Wd_table /> : <Wd_chart />}

      {/* Modal */}
      {showProfile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileSave}>
              <div className="form-row">
                {PROFILE_FIELDS.map(({ label, key, type }) => (
                  <Control key={key} label={label}>
                    <input
                      name={key}
                      type={type}
                      className="form-input-stretch"
                      value={formData[key]}
                      onChange={handleProfileChange}
                      required
                    />
                  </Control>
                ))}
              </div>
            </form>
            <div className="modal-buttons">
              <button className="standalone-btn" onClick={() => setShowProfile(false)} type="button">
                Cancel
              </button>
              <button className="standalone-btn" type="submit" onClick={handleProfileSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default WeatherDashboard;
