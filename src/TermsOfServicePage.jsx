/**
 * Terms of Service for Northing.in — matches home footer chrome.
 */
export default function TermsOfServicePage({ onNavigate }) {
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
      <main style={{ flex: 1, width: "100%", maxWidth: 720, margin: "0 auto", padding: "28px var(--home-gutter-x, 24px) 48px", boxSizing: "border-box" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          <button type="button" onClick={() => onNavigate("home")} style={{ ...linkBtn, color: "var(--primary)", fontWeight: 600 }}>
            ← Back to Home
          </button>
        </p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 800, color: "var(--navy)", margin: "0 0 8px", lineHeight: 1.2 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>
          Effective date: 3 April 2026 · These Terms govern your use of Northing.in and related services operated by Northing (“we”, “us”, “our”) in India.
        </p>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>1. Agreement</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            By accessing or using Northing, you agree to these Terms and our Privacy Policy. If you are using Northing on behalf of a company or brokerage, you represent that you have authority to bind that organisation. If you do not agree, do not use the service.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>2. The service</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            Northing provides tools to create and publish property listings, generate marketing outputs (such as PDF brochures, WhatsApp-friendly cards, watermarked photos, and downloadable kits), and browse or share listings. Features may change over time. We aim for high availability but do not guarantee uninterrupted access.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>3. Accounts and eligibility</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            You must provide accurate registration information and keep your credentials secure. You are responsible for activity under your account. We may offer different capabilities by user type (for example agents, sellers, or seekers). You must be at least 18 years old to use Northing.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>4. Listings and content</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            You retain ownership of content you upload. You grant us a non-exclusive licence to host, process, display, and distribute that content as needed to operate the platform—including public listing pages, shared links, and generated marketing materials. You represent that you have the rights to all photos and text you submit, that listings are truthful, and that they comply with applicable laws (including advertising and real-estate regulations where they apply). You must not post unlawful, misleading, defamatory, or infringing material.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>5. Acceptable use</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            You may not misuse Northing: no scraping or automated access that harms the service, no attempt to bypass security, no distribution of malware, and no use that violates others’ rights. We may investigate and suspend or terminate accounts that breach these Terms or pose risk to users or the platform.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>6. Third parties</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            Northing may link to or integrate third-party services (for example maps, hosting, or authentication). Those services have their own terms. We are not responsible for third-party sites or for transactions you arrange outside Northing with buyers, tenants, or agents.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>7. Disclaimers</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            The service is provided on an “as is” and “as available” basis. We do not verify every listing or guarantee the accuracy of user-provided information. Northing is not a broker, developer, or party to any sale or lease—you are responsible for your own due diligence, documentation, and compliance with RERA and other local requirements where applicable.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>8. Limitation of liability</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            To the maximum extent permitted by law, we are not liable for indirect, incidental, special, or consequential damages, or for loss of profits, data, or goodwill. Our total liability arising from these Terms or the service is limited to the greater of (a) the amount you paid us for the service in the twelve months before the claim, or (b) ₹500, except where the law does not allow such a cap.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>9. Indemnity</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            You agree to indemnify and hold harmless Northing and its team from claims, damages, and expenses (including reasonable legal fees) arising from your content, your use of the service, or your breach of these Terms.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>10. Changes and termination</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            We may update these Terms; we will post the new effective date on this page. Continued use after changes constitutes acceptance where permitted by law. We may suspend or end access to the service at any time, with or without notice, especially for breach or operational reasons. You may stop using Northing at any time.
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>11. Governing law</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            These Terms are governed by the laws of India. Courts at Mumbai, Maharashtra shall have exclusive jurisdiction, subject to any mandatory consumer protections that apply to you.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>12. Contact</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
            Questions about these Terms:{" "}
            <a href="mailto:legal@northing.in" style={{ color: "var(--primary)", fontWeight: 600 }}>
              legal@northing.in
            </a>
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
            <button type="button" onClick={() => onNavigate("privacy")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", font: "inherit", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => { e.currentTarget.style.color = "rgba(248,250,252,0.95)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(248,250,252,0.55)"; }}>
              Privacy
            </button>
            <span style={{ opacity: 0.5 }}>·</span>
            <button type="button" onClick={() => onNavigate("terms")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(248,250,252,0.95)", font: "inherit", fontWeight: 600 }}>
              Terms
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
