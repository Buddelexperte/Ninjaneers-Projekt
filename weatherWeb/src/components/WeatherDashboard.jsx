import React, {useEffect, useState} from "react";
import {User, LogOut, Users, Trash2, Pencil} from "lucide-react";
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

function WeatherDashboard({login, setToken}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table");

  const [userInfo, setUserInfo] = useState({"username" : "", "role" : "", "isAdmin" : false})

  const usernamePlaceholder = userInfo.username || "Enter new username";

  const defaultProfileFormData = {
    newUsername: "",
    newPassword: "",
    repNewPassword: "",
  };

  const [profileFormData, setProfileFormData] = useState(defaultProfileFormData);

  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([]);
  const [roleChanges, setRoleChanges] = useState([])

  const fetchUsers = async () => {
    const res = await apiRequest("getAllUsers", login.token);
    if (!res.success)
    {
      setUsers([]);
      return;
    }

    console.log(res.body);
    setUsers(res.body);
  }

  const fetchRoles = async () => {
    const res = await apiRequest("getRoles", login.token);

    if (!res.success)
    {
      setRoles([])
      console.log(res.message);
      return;
    }

    console.log(res.body);
    setRoles(res.body);
  }

  const fetchOwnInfo = async () => {
    const res = await apiRequest(
        "getPersonalInfo",
        login.token
    );

    console.log(login.token)

    if (!res.success)
    {
      setUserInfo({"username" : "", "role" : "", "isAdmin" : false});
      return;
    }

    const info = {
      "username" : res.body.username,
      "role" : res.body.role,
      "isAdmin" : res.body.role === "admin",
    };

    setUserInfo(info);
  }

  const postRoleChanges = async () => {
    if (roleChanges.length === 0) return;

    console.log(roleChanges);

    const res = await apiRequest(
      "updateUserRoles",
        login.token,
      {
        method: "PUT",
        body: roleChanges,
      }
    );

    if (res.success) {
      await fetchUsers(); // Refresh user list
    } else {
      console.log(`Failed to update roles: ${res.message}`);
    }
  };

  const deleteUser = async (username) => {
    setRoleChanges(prev => {
      return [...prev.filter(u => u.username !== username)];;
    });

    const res = await apiRequest(
      "deleteUser",
        login.token,
      {
        method: "POST",
        body: {
          username : username,
          password : "",
          role : "",
        },
      }
    );

    if (res.success) {
      await fetchUsers(); // Refresh user list
    } else {
      alert(`Failed to delete user: ${res.message}`);
    }
  }

  const handleRoleChange = (newSet) => {
    setRoleChanges(prev => {
      const updated = [...prev.filter(u => u.username !== newSet.username), newSet];
      return updated;
    });
  };


  const closeModal = () => {
    setRoleChanges([]);
    setProfileFormData(defaultProfileFormData);
    setModalType(null);
  }

  const onAdminViewClick = () => {
    closeModal()
    if (modalType !== "admin")
      setModalType("admin");
  }

  const onProfileEditClick = () => {
    closeModal()
    if (modalType !== "profile_edit")
      setModalType("profile_edit");
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    const name_differs = (profileFormData.newUsername !== userInfo.username)
    const data_empty = !(profileFormData.newUsername !== "" || profileFormData.newPassword !== "")

    if (data_empty)
    {
      closeModal()
      setProfileFormData(defaultProfileFormData)
      return;
    }


    if (profileFormData.repNewPassword !== profileFormData.newPassword)
    {
      setProfileFormData(prev => ({
        ...prev,
        newPassword: "",
        repNewPassword: "",
      }));
      alert("Passwort wurde nicht korrekt wiederholt!")
      return;
    }

    const res = await apiRequest(
        "updateUser",
        login.token,
        {
          method: "PUT",
          body:
          {
            username: profileFormData.newUsername,
            password: profileFormData.newPassword,
            role: "",
          }
        }
    );

    if (res.success)
    {
      setToken(res.body.newToken)
      closeModal()
      return
    }

    alert(res.message)

    setProfileFormData(defaultProfileFormData);
  };
  const editProfileModal = (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <form onSubmit={handleProfileSave}>
          <div className="form-row">
            {[
            { label: "Username:", key: "newUsername", type: "text", placeholder: userInfo.username || "Enter new username" },
            { label: "Password:", key: "newPassword", type: "password", placeholder: "Enter new password" },
            { label: "Repeat Password:", key: "repNewPassword", type: "password", placeholder: "Repeat new password" },
          ].map(({ label, key, type, placeholder }) => (
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
            <button className="standalone-btn" onClick={() => closeModal()} type="button">
              Cancel
            </button>
            <button
              className={`standalone-btn ${userInfo.isAdmin ? "disabled-btn" : "danger-btn"}`}
              type="button"
              disabled={userInfo.isAdmin}
              title={userInfo.isAdmin ? "Admin accounts cannot be deleted" : "Delete your profile"}
              onClick={async () => {
                const confirmed = window.confirm("Are you sure you want to delete your profile?");
                if (!confirmed) return;
                await deleteUser(userInfo.username);
                navigate("/");
              }}
            >
              {userInfo.isAdmin ? "Deletion Disabled for Admins" : "Delete Profile"}
            </button>

            <button className="standalone-btn" type="submit" onClick={handleProfileSave}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const adminPanelModal = <div className="modal-overlay">
  <div className="modal-content">
    <h2>Manage Users</h2>
    <div className="admin-user-table-wrapper">
      <div className="scrollable-div">
        <table className="admin-user-table">
          <thead>
            <tr>
              <th style={{width: "30%"}}>Username</th>
              <th style={{width: "30%"}}>Role</th>
              <th style={{width: "15%"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(({ username, role }) => (
              <tr key={username}>
                <td>
                  {username}
                </td>
                <td>
                  <select
                    value={
                      username === userInfo.username
                        ? role // always use current role for loggedUser
                        : roleChanges.find((u) => u.username === username)?.role || role
                    }
                    onChange={(e) => {
                      if (username !== userInfo.username) {
                        handleRoleChange({ "username" : username, "password" : "", role: e.target.value });
                      }
                    }}
                    style={{ width: "100%" }}
                    disabled={username === userInfo.username} // disable select for loggedUser
                  >
                    {username === userInfo.username ? (
                      <option>{role}</option>
                    ) : (
                      roles.map((r) => (
                        <option key={r.id} value={r.roleTitle}>
                          {r.roleTitle}
                        </option>
                      ))
                    )}

                  </select>
                </td>
                <td className="action-cell">
                  {role !== "admin" ?
                      (
                        <button onClick={() => deleteUser(username)} className="icon-btn" title="Delete">
                          <Trash2 size={18} color="red" />
                        </button>
                      )
                  :
                      (
                        <button className="icon-btn no-interact" title="Delete">
                          <Trash2 size={18} color="gray" />
                        </button>
                      )
                  }
                </td>
              </tr>

            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="modal-buttons" style={{ marginTop: '12px', textAlign: 'right' }}>
      <button
        className="standalone-btn"
        onClick={() => closeModal()}
        type="button"
      >
        Close
      </button>
      <button
        className="standalone-btn"
        onClick={async () => {
          await postRoleChanges();
          closeModal();
        }}
        type="button"
      >
        Save Changes
      </button>
    </div>
  </div>
</div>

  const [modalType, setModalType] = useState(null); // "profile", "admin", or null

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchOwnInfo();
  }, []);

  useEffect(() => {
    fetchOwnInfo();
    fetchUsers();
  }, [login]);

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

          {userInfo.isAdmin && (
            <button
              className="left-title-icon"
              onClick={() => onAdminViewClick()}
            >
              <Users size={40} />
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

      {modalType === "profile_edit" && editProfileModal}
      {modalType === "admin" && adminPanelModal}


    </div>
  );
}

export default WeatherDashboard;
