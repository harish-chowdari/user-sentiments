import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/Signup";
import PasswordReset from "./Components/PasswordReset/PasswordReset";
import Home from "./Components/Home/Home";
import Layout from "./layout/Layout";
import Settings from "./pages/Settings/Settings";
import ReviewAnalysis from "./pages/ReviewAnalysis/ReviewAnalysis";
import UserCsvFiles from "./pages/UserCsvFiles/UserCsvFiles";


const App = () => {
  const userId = localStorage.getItem('userId');
  return (
    <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element= {<Signup />} />
        <Route path="/reset" element= {<PasswordReset/>} />
        <Route path="/home/:userId" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="review-analysis" element={<ReviewAnalysis />} />
          <Route path="settings" element={<Settings />} />
          <Route path="files" element={<UserCsvFiles />} />
        </Route>  
        
      </Routes>
    </BrowserRouter>
      
      
    </div>
  );
};

export default App;
