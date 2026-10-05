import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "./HomeHero.css";

const HomeHero = () => (
  <section className="home-hero">
    <div className="home-hero__badge">
      <Sparkles size={13} strokeWidth={2.5} />
      <span>now in beta</span>
    </div>
    <h1 className="home-hero__title">K-pop Universe</h1>
    <p className="home-hero__tagline">
      Join communities for your favorite groups, track upcoming comebacks, and
      talk with fans around the world.
    </p>
    <div className="home-hero__actions">
      <Link to="/register" className="home-hero__cta home-hero__cta--primary">
        Join the Community
      </Link>
      <Link to="/login" className="home-hero__cta home-hero__cta--ghost">
        Log In
      </Link>
    </div>
  </section>
);

export default HomeHero;
