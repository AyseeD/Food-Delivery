import React, { useState, useEffect } from "react";
import "../../styles/AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  //  Backend'ten kullanıcıları çekme
  useEffect(() => {
    async function fetchUsers() {
      try{
        const res = await fetch("http://localhost:4000/auth/admin/users");
        const data = await res.json();
        setUsers(data);
      }catch(err){
        console.error("Failed to load users:", err);
      }
    }

    fetchUsers();
  }, []);

 
  //   Kullanıcı silme

  const deleteUser = (id) => {
  

    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  //   Yeni kullanıcı ekleme

  const handleAddUser = (e) => {
    e.preventDefault();

  

    setUsers((prev) => [
      ...prev,
      {
        id: Date.now(),
        full_name: newUser.full_name,
        email: newUser.email,
      },
    ]);

    setNewUser({ full_name: "", email: "", password: "" });
  };

  return (
    <div className="admin-users">
      <h2 className="admin-section-title">Users</h2>

      {/* USERS TABLE */}
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteUser(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD USER */}
      <div className="add-user-box">
        <h3>Add New User</h3>

        <form onSubmit={handleAddUser}>

          <input
            type="text"
            placeholder="Full Name"
            value={newUser.full_name}
            onChange={(e) =>
              setNewUser({ ...newUser, full_name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
          />

          <button className="add-user-btn" type="submit">
            Add User
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminUsers;
