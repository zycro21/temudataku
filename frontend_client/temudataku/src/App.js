import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./components/SidebarContext";
import Register from "./pages/RegisterAdmin";
import LoginAdmin from "./pages/LoginAdmin";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import SessionDashboard from "./pages/SessionDashboard";
import OrderDashboard from "./pages/OrderDashboard";
import ReviewDashboard from "./pages/ReviewDashboard";
import UserMainPage from "./pages/UserMainPage";
import UserMentoring from "./pages/UserMentoring";
import UserPractice from "./pages/UserPractice";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";

const App = () => {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<UserMainPage />} />
          <Route path="/mentoring" element={<UserMentoring />}/>
          <Route path="/practice" element={<UserPractice />}/>
          <Route path="/login" element={<UserLogin />}/>
          <Route path="/register" element={<UserRegister />}/>
          <Route path="/registerAdmin" element={<Register />} />
          <Route path="/loginAdmin" element={<LoginAdmin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/userdashboard" element={<UserDashboard />} />
          <Route path="/mentorsdashboard" element={<MentorDashboard />} />
          <Route path="/sessionsdashboard" element={<SessionDashboard />} />
          <Route path="/ordersdashboard" element={<OrderDashboard />} />
          <Route path="/reviewsdashboard" element={<ReviewDashboard />} />
        </Routes>
      </Router>
    </SidebarProvider>
  );
};

export default App;
