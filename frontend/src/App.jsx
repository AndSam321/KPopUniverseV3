import { Routes, Route } from "react-router-dom";
import Sandbox from "./playground/Sandbox.jsx";
import Register from "./components/auth/Register.jsx";
import Login from "./components/auth/Login.jsx";
import Profile from "./components/profile/Profile.jsx";
import Feed from "./components/posts/Feed.jsx";
import Navbar from "./components/nav/Navbar.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import GuestRoute from "./components/routes/GuestRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
