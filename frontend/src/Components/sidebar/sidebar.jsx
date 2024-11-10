import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Styles from './sidebar.module.css';
import axios from 'axios';

const Sidebar = () => {
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    const handleDelete = async () => {
      const confirmDelete = window.confirm("Are you sure you want to delete your account?");
      if (!confirmDelete) return;

      try {
        const res = await axios.delete(`http://localhost:4003/api/delete-user/${userId}`);
        
        if (res.data && res.data.userDeleted) {
          alert(res.data.userDeleted);
          localStorage.removeItem('userId');
          navigate('/'); 
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete account. Please try again later.');
      }
    };

  return (
    <div className={Styles.sidebar}>
      <NavLink
        to={`/home/${userId}/review-analysis`}
        className={({ isActive }) => `${Styles.link} ${isActive ? Styles.activeLink : ''}`}
        style={{ color: "#FFFFFF" }} 
      >
        Review Analysis
      </NavLink>

      <NavLink
        to={`/home/${userId}/settings`}
        className={({ isActive }) => `${Styles.link} ${isActive ? Styles.activeLink : ''}`}
        style={{ color: "#FFFFFF" }} 
      >
        Settings
      </NavLink>

      <NavLink
      
        to={`/home/${userId}/files`}
        className={({ isActive }) => `${Styles.link} ${isActive ? Styles.activeLink : ''}`}
        style={{ color: "#FFFFFF" }} 
      >
        Reviews Backup
      </NavLink>

      <NavLink
        onClick={handleDelete}
        className={Styles.link}
        style={{ color: "#FFFFFF", cursor: "pointer" }}
      >
        Delete Account
      </NavLink>

      <NavLink
        to={'/'}
        onClick={() => {
          localStorage.removeItem('userId');
        }}
        className={({ isActive }) => `${Styles.link} ${isActive ? Styles.activeLink : ''}`}
        style={{ color: "#FFFFFF" }}
      >
         Logout
      </NavLink>
    </div>
  );
};

export default Sidebar;
