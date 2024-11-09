import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Components/sidebar/sidebar'

const Layout = () => {
  return (
    <div>
        <div><Sidebar/></div>
        <Outlet />
    </div>
  )
}

export default Layout