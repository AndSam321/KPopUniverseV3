import { useAuth } from "../../context/AuthContext";
import Feed from "../posts/Feed";
import HomeHero from "./HomeHero";
import "./Home.css";

const Home = ({ variant = "for-you" }) => {
  const { user, loading } = useAuth();
  const showHero = !loading && !user && variant === "for-you";

  return (
    <div className="home">
      {showHero && <HomeHero />}
      <Feed variant={variant} />
    </div>
  );
};

export default Home;
