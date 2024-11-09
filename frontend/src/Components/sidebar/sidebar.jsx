import React from 'react'
import { NavLink } from 'react-router-dom'
import Styles from './sidebar.module.css'

const Sidebar = () => {
    const userId = localStorage.getItem('userId');
  return (
    <div className={Styles.sidebar} >

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
  )
}

export default Sidebar