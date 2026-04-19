import Feed from "../posts/Feed";
import "./Home.css";

const Home = ({ variant = "for-you" }) => {
  return (
    <div className="home">
      <Feed variant={variant} />
    </div>
  );
};

export default Home;