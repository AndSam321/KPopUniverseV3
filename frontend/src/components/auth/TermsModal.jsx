import "./TermsModal.css";

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} title="Close">
          ✕
        </button>

        <header className="modal-header">
          <h2 className="modal-title">Terms and Conditions</h2>
          <p className="modal-subtitle">
            Last updated: {new Date().toLocaleDateString()} ✨
          </p>
        </header>

        <div className="modal-body">
          <section className="terms-section">
            <h3 className="terms-heading">1. Acceptance of Terms</h3>
            <p className="terms-text">
              By accessing and using K-pop Universe, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-heading">2. User Account</h3>
            <p className="terms-text">
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-heading">3. Content Guidelines</h3>
            <p className="terms-text">
              Users must respect copyright laws and the intellectual property
              rights of K-pop artists, agencies, and other content creators. Do
              not post content that is offensive, discriminatory, or violates
              community standards.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-heading">4. Community Conduct</h3>
            <p className="terms-text">
              Be respectful to all members of the K-pop Universe community.
              Harassment, hate speech, and toxic behavior will not be tolerated
              and may result in account suspension or termination.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-heading">5. Privacy</h3>
            <p className="terms-text">
              Your privacy is important to us. We collect and use your personal
              information as described in our{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              . By using our service, you consent to such processing.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-heading">6. Termination</h3>
            <p className="terms-text">
              We reserve the right to terminate or suspend your account at any
              time, without prior notice, for conduct that we believe violates
              these Terms and Conditions or is harmful to other users, us, or
              third parties.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-heading">7. Changes to Terms</h3>
            <p className="terms-text">
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes. Your continued use of the
              service after such modifications constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-heading">8. Contact Us</h3>
            <p className="terms-text">
              If you have any questions about these Terms and Conditions, please
              contact us through our support channels.
            </p>
          </section>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
