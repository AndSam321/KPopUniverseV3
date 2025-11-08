import { Routes, Route } from "react-router-dom";
import Sandbox from "./playground/Sandbox.jsx";
import Register from "./components/auth/Register.jsx";
import Login from "./components/auth/Login.jsx";
import Profile from "./components/profile/Profile.jsx";
import Navbar from "./components/nav/Navbar.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Home Page - Coming Soon</div>} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
