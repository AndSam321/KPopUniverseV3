import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/nav/Navbar.jsx";
import NavigationProgress from "./components/nav/NavigationProgress.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NavigationLoadingProvider } from "./context/NavigationLoadingContext.jsx";
import GuestRoute from "./components/routes/GuestRoute.jsx";
import PrivateRoute from "./components/routes/PrivateRoute.jsx";

const Sandbox = React.lazy(() => import("./playground/Sandbox.jsx"));
const Register = React.lazy(() => import("./components/auth/Register.jsx"));
const Login = React.lazy(() => import("./components/auth/Login.jsx"));
const Profile = React.lazy(() => import("./components/profile/Profile.jsx"));
const Home = React.lazy(() => import("./components/home/Home.jsx"));
const GroupsList = React.lazy(() => import("./components/groups/GroupsList.jsx"));
const GroupDetail = React.lazy(() => import("./components/groups/GroupDetail.jsx"));
const CommunityPage = React.lazy(() => import("./pages/CommunityPage.jsx"));
const PostDetail = React.lazy(() => import("./pages/PostDetail.jsx"));
const AccountSettings = React.lazy(() => import("./components/settings/AccountSettings.jsx"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage.jsx"));
const SearchResults = React.lazy(() => import("./pages/SearchResults.jsx"));

const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader__spinner" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <NavigationLoadingProvider>
      <AuthProvider>
        <Navbar />
        <NavigationProgress />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/following"
            element={
              <PrivateRoute>
                <Home variant="following" />
              </PrivateRoute>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <PrivateRoute>
                <PostDetail />
              </PrivateRoute>
            }
          />
          <Route path="/groups" element={<GroupsList />} />
          <Route path="/search" element={<SearchResults />} />
          <Route
            path="/groups/:id"
            element={
              <PrivateRoute>
                <GroupDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/communities/:id"
            element={
              <PrivateRoute>
                <CommunityPage />
              </PrivateRoute>
            }
          />
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
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <AccountSettings />
              </PrivateRoute>
            }
          />
        </Routes>
        </Suspense>
      </AuthProvider>
      </NavigationLoadingProvider>
    </ThemeProvider>
  );
}

export default App;
