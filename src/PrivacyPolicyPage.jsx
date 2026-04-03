/**
 * Standalone Privacy Policy view for Northing.in — matches home footer chrome.
 */
export default function PrivacyPolicyPage({ onNavigate }) {
  const linkBtn = {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    font: "inherit",
    color: "inherit",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <main style={{ flex: 1, width: "100%", maxWidth: 720, margin: "0 auto", padding: "28px max(20px, env(safe-area-inset-left)) max(80px, calc(40px + env(safe-area-inset-bottom))) max(20px, env(safe-area-inset-right))", boxSizing: "border-box" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          <button type="button" onClick={() => onNavigate("home")} style={{ ...linkBtn, color: "var(--primary)", fontWeight: 600 }}>
            ← Back to Home
          </button>
        </p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 800, color: "var(--navy)", margin: "0 0 8px", lineHeight: 1.2 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>Effective date: 3 April 2026 · Northing (“we”, “us”) operates Northing.in, a property listing and marketing platform for real estate professionals and property owners in India.</p>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>1. Scope</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            This policy describes how we collect, use, store, and share personal information when you use our website, create an account, list or browse properties, download marketing materials (such as PDFs or photo packs), or contact us. By using Northing, you agree to this policy. If you do not agree, please do not use the service.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>2. Information we collect</h2>
          <ul style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)", paddingLeft: 20, margin: 0 }}>
            <li><strong>Account data:</strong> name, email address, phone number, role (for example agent, seller, or seeker), and optional profile details such as agency name, address, website, and logo image you upload.</li>
            <li><strong>Listing content:</strong> property descriptions, pricing, location, photos, and other fields you submit for public or shared marketing outputs.</li>
            <li><strong>Usage and technical data:</strong> device type, browser, approximate region (from IP), pages viewed, and interactions such as brochure downloads or share events, used to improve the product and prevent abuse.</li>
            <li><strong>Authentication:</strong> we use Supabase for sign-in; session tokens and security-related metadata are handled according to our infrastructure provider’s standards.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>3. How we use your information</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            We use personal data to provide and improve Northing: to create and manage accounts, display listings and agent profiles, generate PDFs, WhatsApp cards, watermarked images, and marketing kits, measure engagement, send service-related notices, enforce our terms, and comply with law. We do not sell your personal information to third parties for their independent marketing.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>4. Sharing</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            Listing and profile information you choose to make public is visible to visitors (for example on property pages or shared links). We share data with trusted service providers who host our application, database, and files (for example cloud hosting and storage), solely to operate the platform. We may disclose information if required by law or to protect the rights, safety, and security of our users and Northing.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>5. Retention</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            We retain account and listing data for as long as your account is active or as needed to provide the service. You may request deletion of your account subject to legal or legitimate business retention needs (for example fraud prevention or regulatory obligations).
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>6. Security</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            We use industry-standard safeguards including encryption in transit (HTTPS) and access controls on our systems. No method of transmission over the internet is completely secure; we work to protect your data but cannot guarantee absolute security.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>7. Your choices</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            You may update profile and listing information in the app where available. You may request access, correction, or deletion of personal data by contacting us at the email below. If you are in India, you may have rights under applicable law including the Digital Personal Data Protection Act, 2023; we will respond in line with those requirements.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>8. Children</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            Northing is not directed at children under 18. We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us and we will take appropriate steps to delete it.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>9. Changes</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            We may update this policy from time to time. The effective date at the top will change when we do. Continued use of Northing after changes constitutes acceptance of the updated policy where permitted by law.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>10. Contact</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            For privacy questions or requests, contact us at{" "}
            <a href="mailto:privacy@northing.in" style={{ color: "var(--primary)", fontWeight: 600 }}>
              privacy@northing.in
            </a>
            . Please include your registered email so we can verify your account when needed.
          </p>
        </section>
      </main>

      <footer className="glass-footer" style={{ padding: "clamp(36px, 5vw, 52px) 0", position: "relative", marginTop: "auto" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.92) 100%)", pointerEvents: "none" }} />
        <div className="home-footer-inner">
          <button type="button" onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", background: "none", border: "none", padding: 0, cursor: "pointer" }} aria-label="Northing home">
            <img src="/northing-logo-light.svg" alt="Northing" style={{ height: 48, width: "auto", maxWidth: 260, objectFit: "contain", display: "block" }} />
          </button>
          <p style={{ fontSize: 12, color: "rgba(248,250,252,0.55)", fontWeight: 500 }}>© 2026 Northing · Professional Property Marketing · Made in India</p>
          <div style={{ display: "flex", gap: 22, fontSize: 12, color: "rgba(248,250,252,0.55)", fontWeight: 500, alignItems: "center" }}>
            <button type="button" onClick={() => onNavigate("privacy")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(248,250,252,0.95)", font: "inherit", fontWeight: 600 }}>
              Privacy
            </button>
            <span style={{ opacity: 0.5 }}>·</span>
            <button type="button" onClick={() => onNavigate("terms")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", font: "inherit", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => { e.currentTarget.style.color = "rgba(248,250,252,0.95)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(248,250,252,0.55)"; }}>
              Terms
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
