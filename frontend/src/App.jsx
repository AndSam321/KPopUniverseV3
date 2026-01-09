import { Routes, Route } from "react-router-dom";
import Sandbox from "./playground/Sandbox.jsx";
import Register from "./components/auth/Register.jsx";
import Login from "./components/auth/Login.jsx";
import Profile from "./components/profile/Profile.jsx";
import Home from "./components/home/Home.jsx";
import GroupsList from "./components/groups/GroupsList.jsx";
import GroupDetail from "./components/groups/GroupDetail.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import AccountSettings from "./components/settings/AccountSettings.jsx";
import Navbar from "./components/nav/Navbar.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import GuestRoute from "./components/routes/GuestRoute.jsx";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/groups" element={<GroupsList />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
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
          <Route path="/settings" element={<AccountSettings />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
