import React, {useEffect, useState} from "react";
import {User, LogOut, Users} from "lucide-react";
import Wd_table from "./wd_table.jsx";
import Wd_chart from "./wd_charts.jsx";
import {useNavigate} from "react-router-dom";
import {apiRequest} from "./requestHandler.js";

function Control({ label, children }) {
  return (
    <div className="control-item">
      {label && <label className="input-label">{label}</label>}
      {children}
    </div>
  );
}


function WeatherDashboard({loggedUser}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table");

  const isLoggedAsAdmin = async () => {
    const res = await apiRequest(
        "getUserRole",
        {
          method: "POST",
          body: {
            username : loggedUser.username,
            password: "",
            role: "",
          }
        }
    );

    if (res.success)
      return (res.body.role === "admin");
    return false;
  }

  const usernamePlaceholder = loggedUser?.username || "Enter new username";



  const PROFILE_FIELDS = [
    { label: "Username:", key: "newUsername", type: "text", placeholder: usernamePlaceholder },
    { label: "Password:", key: "newPassword", type: "password", placeholder: "Enter new password" },
    { label: "Repeat Password:", key: "repNewPassword", type: "password", placeholder: "Repeat new password" },
  ];

  const [showProfile, setShowProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    newUsername : "",
    newPassword : "",
    repNewPassword : "",
  });

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [users, setUsers] = useState([])
  const [roleChanges, setRoleChanges] = useState([])

  const fetchUsers = async () => {
    return;
    const res = await apiRequest("getAllUsers");
    if (!res.success)
    {
      setUsers([]);
      return;
    }

    setUsers(res.body);
  }

  const postRoleChanges = async () => {
    return;
    const res = await apiRequest(
        "updateUserRoles",
        {
          method: "PUT",
          body: roleChanges,
        }
    );
    console.log(res.message);
  }

  const onAdminViewClick = () => {
    setShowAdminPanel(!showAdminPanel);
    setShowProfile(false);
    if (showAdminPanel)
      setOpenModal(adminPanelModal);
  }

  const onProfileEditClick = () => {
    setShowProfile(!showProfile);
    setShowAdminPanel(false);
    if (showProfile)
      setOpenModal(editProfileModal);
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (profileFormData.repNewPassword === profileFormData.newPassword)
    {
      const res = await apiRequest(
          "updateUser",
          {
            method: "PUT",
            body: {
              currentUser: {
                username: loggedUser.username,
                password: "",
                role: "",
              },
              newUserData: {
                username: profileFormData.newUsername,
                password: profileFormData.newPassword,
                role: "",
              }
            }
          }
      );

      if (res.success)
      {
        setShowProfile(false);
        return;
      }
      alert(res.message);
    }

    setProfileFormData({newUsername : "", newPassword : "", repNewPassword: ""});
  };
  const noModal = {};
  const editProfileModal = <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileSave}>
              <div className="form-row">
                {PROFILE_FIELDS.map(({ label, key, type, placeholder }) => (
                  <Control key={key} label={label}>
                    <input
                      name={key}
                      type={type}
                      className="form-input-stretch"
                      value={profileFormData[key]}
                      placeholder={placeholder}
                      onChange={handleProfileChange}
                      required
                    />
                  </Control>
                ))}
              </div>
              <div className="modal-buttons">
                <button className="standalone-btn" onClick={() => setShowProfile(false)} type="button">
                  Cancel
                </button>
                <button className="standalone-btn" type="submit" onClick={handleProfileSave}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>;
  const adminPanelModal = <div className="modal-overlay">
  <div className="modal-content" style={{ width: '500px', maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
    <h2>Edit Profile</h2>
    <div
      className="table-container"
      style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 4 }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Username</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(({ id, username, role }) => (
            <tr key={id}>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{username}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(id, e.target.value)}
                  style={{ width: '100%' }}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="modal-buttons" style={{ marginTop: '12px', textAlign: 'right' }}>
      <button
        className="standalone-btn"
        onClick={() => setShowProfile(false)}
        type="button"
      >
        Close
      </button>
    </div>
  </div>
</div>

  const [openModal, setOpenModal] = useState(noModal);


  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    postRoleChanges();
  }, [roleChanges]);

  return (
    <div>
      <div className="title-bar">
        <div className="title-bar-l">
          <button
              className="left-title-icon"
              onClick={() => onProfileEditClick()}
          >
            <User size={40}/>
          </button>

          { ?? (
            <button
              className="left-title-icon"
              onClick={() => onAdminViewClick()}
            >
              <Users size={40}/>
            </button>
          )}

        </div>
        <h1 className="title">Weather Dashboard</h1>
        <div className="title-bar-r">
          <button
              className="right-title-icon"
              onClick={() => navigate("/")}
          >
            <LogOut size={40}/>
          </button>
        </div>
      </div>
      <div className="dashboard">
        <div className="border-div-col">
          <button
            className="standalone-btn"
            onClick={() => setViewMode(viewMode === "table" ? "chart" : "table")}
          >
            Switch to {viewMode === "table" ? "Chart" : "Table"} View
          </button>
        </div>
      </div>
      {viewMode === "table" ? <Wd_table /> : <Wd_chart />}

      openModal

    </div>
  );
}

export default WeatherDashboard;
