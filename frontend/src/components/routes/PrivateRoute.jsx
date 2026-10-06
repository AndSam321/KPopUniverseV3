import { useAuth } from "../../context/AuthContext";
import LoginGate from "./LoginGate";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (!user) {
    return <LoginGate />;
  }

  return children;
};

export default PrivateRoute;
