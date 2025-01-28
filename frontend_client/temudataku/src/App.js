import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/RegisterAdmin";
import LoginAdmin from "./pages/LoginAdmin";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginAdmin />} />
        <Route path="/registerAdmin" element={<Register />} />
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/userdashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
