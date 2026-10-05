import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/nav/Navbar.jsx";
import NavigationProgress from "./components/nav/NavigationProgress.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NavigationLoadingProvider } from "./context/NavigationLoadingContext.jsx";
import { MessagesProvider } from "./context/MessagesContext.jsx";
import GuestRoute from "./components/routes/GuestRoute.jsx";
import PrivateRoute from "./components/routes/PrivateRoute.jsx";
import BetaToast from "./components/common/BetaToast.jsx";
import ScrollToTop from "./components/common/ScrollToTop.jsx";
import AddToHomeScreen from "./components/common/AddToHomeScreen.jsx";

const Sandbox = React.lazy(() => import("./playground/Sandbox.jsx"));
const Register = React.lazy(() => import("./components/auth/Register.jsx"));
const Login = React.lazy(() => import("./components/auth/Login.jsx"));
const Profile = React.lazy(() => import("./components/profile/Profile.jsx"));
const Home = React.lazy(() => import("./components/home/Home.jsx"));
const GroupsList = React.lazy(() => import("./components/groups/GroupsList.jsx"));
const GroupDetail = React.lazy(() => import("./components/groups/GroupDetail.jsx"));
const CommunityPage = React.lazy(() => import("./pages/CommunityPage.jsx"));
const Communities = React.lazy(() => import("./pages/Communities.jsx"));
const Comebacks = React.lazy(() => import("./pages/Comebacks.jsx"));
const PostDetail = React.lazy(() => import("./pages/PostDetail.jsx"));
const AccountSettings = React.lazy(() => import("./components/settings/AccountSettings.jsx"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage.jsx"));
const SearchResults = React.lazy(() => import("./pages/SearchResults.jsx"));
const Messages = React.lazy(() => import("./pages/Messages.jsx"));
const Help = React.lazy(() => import("./pages/Help.jsx"));
const AdminAnalytics = React.lazy(() => import("./pages/AdminAnalytics.jsx"));

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
        <MessagesProvider>
        <ScrollToTop />
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
          <Route path="/communities" element={<Communities />} />
          <Route
            path="/comebacks"
            element={
              <PrivateRoute>
                <Comebacks />
              </PrivateRoute>
            }
          />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/help" element={<Help />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />
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
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
        </Routes>
        </Suspense>
        <BetaToast />
        <AddToHomeScreen />
        </MessagesProvider>
      </AuthProvider>
      </NavigationLoadingProvider>
    </ThemeProvider>
  );
}

export default App;
