import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./components/SidebarContext";
import Register from "./pages/RegisterAdmin";
import LoginAdmin from "./pages/LoginAdmin";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import MentorDashboard from "./pages/MentorDashboard";

const App = () => {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginAdmin />} />
          <Route path="/registerAdmin" element={<Register />} />
          <Route path="/loginAdmin" element={<LoginAdmin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/userdashboard" element={<UserDashboard />} />
          <Route path="/mentorsdashboard" element={<MentorDashboard />} />
        </Routes>
      </Router>
    </SidebarProvider>
  );
};

export default App;
