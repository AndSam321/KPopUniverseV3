import BackButton from "../components/common/BackButton";
import "./Privacy.css";

const SUPPORT_EMAIL = "kpopuniversesupport@gmail.com";

export default function Privacy() {
  return (
    <div className="legal-page">
      <BackButton fallback="/" />

      <header className="legal-page__header">
        <h1 className="page-title">Privacy Policy</h1>
        <p className="legal-page__updated">Last updated: October 6, 2026</p>
      </header>

      <p className="legal-page__intro">
        K-pop Universe is a community app, currently in beta. This policy
        explains what we collect, why, and how it's handled — in plain language.
      </p>

      <section className="legal-section">
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account info:</strong> your email and username, and your
            password (stored only as a securely hashed value — we never see or
            store it in plain text). If you sign in with Google, we receive
            basic profile info from Google.
          </li>
          <li>
            <strong>Profile &amp; content:</strong> anything you add — bio,
            avatar image, posts, comments, messages, likes, and the communities
            you join.
          </li>
          <li>
            <strong>Technical info:</strong> we keep a "last active" timestamp on
            your account to understand overall usage — but we do <strong>not</strong>{" "}
            store your IP address on your account. Like any website, your IP is
            used momentarily to prevent spam and abuse (rate limiting) and may
            appear in the standard server logs kept by our hosting providers. New
            sign-ups pass a bot check (Cloudflare Turnstile).
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>How we use it</h2>
        <ul>
          <li>To run the service — log you in, show your content, and deliver features.</li>
          <li>To keep the community safe — prevent spam, bots, and abuse.</li>
          <li>To send essential emails, like password resets.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal information, and we don't
          run third-party advertising or ad-tracking.
        </p>
      </section>

      <section className="legal-section">
        <h2>Who we share it with</h2>
        <p>
          We use a small set of trusted providers to operate the app. They only
          process data as needed to provide their service:
        </p>
        <ul>
          <li><strong>Render</strong> — app hosting and database.</li>
          <li><strong>Amazon S3</strong> — storage for uploaded images.</li>
          <li><strong>Cloudflare</strong> — website delivery and bot protection.</li>
          <li><strong>Our email provider</strong> — to send account emails.</li>
          <li>
            <strong>Spotify</strong> — we fetch public artist and album info; we
            do not send Spotify any of your personal data.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Security</h2>
        <p>
          Traffic is encrypted in transit over HTTPS, passwords are hashed, and
          data is stored with reputable providers that encrypt data at rest.
          Please note that messages are not end-to-end encrypted, and no online
          service can guarantee perfect security.
        </p>
      </section>

      <section className="legal-section">
        <h2>Your choices</h2>
        <p>
          You can edit your profile and delete your posts and comments at any
          time. To delete your account or request a copy of your data, email us
          and we'll take care of it.
        </p>
      </section>

      <section className="legal-section">
        <h2>Children</h2>
        <p>
          K-pop Universe isn't directed to children under 13, and we don't
          knowingly collect their information.
        </p>
      </section>

      <section className="legal-section">
        <h2>Changes</h2>
        <p>
          We may update this policy as the app grows. We'll update the date above
          and note any significant changes.
        </p>
      </section>

      <section className="legal-section">
        <h2>Contact</h2>
        <p>
          Questions about your privacy? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="legal-link">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
