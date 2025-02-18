import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./components/SidebarContext";
import { OrderProvider } from "./components/OrderContext";
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
import RequestResetPassword from "./pages/RequestResetPassword";
import ResetPassword from "./pages/ResetPassword";
import UserInfo from "./pages/UserInfo";
import MentoringList from "./pages/MentoringList";
import OrderDetail from "./pages/DetailOrder";
import CreateOrder from "./pages/CreateOrder";
import OrderUserPage from "./pages/OrderPages";

const App = () => {
  return (
    <SidebarProvider>
      <OrderProvider>
        <Router>
          <Routes>
            <Route path="/" element={<UserMainPage />} />
            <Route path="/mentoring" element={<UserMentoring />} />
            <Route path="/practice" element={<UserPractice />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route
              path="/request-reset-password"
              element={<RequestResetPassword />}
            />
            <Route path="/profile" element={<UserInfo />} />
            <Route path="/mentoring-list" element={<MentoringList />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/order-detail/:order_id" element={<OrderDetail />} />
            <Route path="/orders" element={<OrderUserPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
      </OrderProvider>
    </SidebarProvider>
  );
};

export default App;
