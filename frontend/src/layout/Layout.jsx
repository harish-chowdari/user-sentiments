import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Components/sidebar/sidebar'
import Styles from './Layout.module.css'

const Layout = () => {
  return (
    <div className={Styles.layout}>
      <Sidebar /> 
      <div className={Styles.contentArea}>
        <Outlet /> 
      </div>
    </div>
  )
}

export default Layout