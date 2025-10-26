import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Main/Navbar";
import Footer from "./Components/Main/Footer";
import Home from "./Pages/Home";
import AdminLogin from "./Pages/AdminLogin";
import UserLogin from "./Pages/UserLogin";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />

        {/* Main scrollable content */}
        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/user/login" element={<UserLogin />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
