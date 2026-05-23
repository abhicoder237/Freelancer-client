import { useState }        from "react";
import { usePageSections } from "@hooks/useSections.js";
import SectionRenderer     from "../sections/SectionRenderer.jsx";
import { useClient }       from "@context/ClientContext.jsx";

const ContactPage = () => {
  const { client, contact, social } = useClient();
  const { data }                    = usePageSections("contact");
  const sections                    = data?.data || [];

  const [form,      setForm]      = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const socialLinks = [
    { key: "facebook",  icon: "📘", label: "Facebook" },
    { key: "instagram", icon: "📸", label: "Instagram" },
    { key: "twitter",   icon: "🐦", label: "Twitter" },
    { key: "linkedin",  icon: "💼", label: "LinkedIn" },
    { key: "youtube",   icon: "▶️", label: "YouTube" },
  ].filter((s) => social?.[s.key]);

  return (
    <div>
      {/* Dynamic sections */}
      {sections.map((section) => (
        <SectionRenderer key={section._id} section={section} />
      ))}

      {/* Contact content */}
      <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "4rem 1.5rem" }}>

        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
            Get In Touch
          </p>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}>
            Contact Us
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>

          {/* Contact Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            <div style={{ background: "var(--color-surface)", borderRadius: "14px", padding: "1.75rem", border: "1px solid var(--color-border)" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "1.25rem", fontFamily: "var(--font-heading)" }}>
                Contact Information
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {contact?.email && (
                  <a href={"mailto:" + contact.email} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--color-text-primary)", textDecoration: "none", fontSize: "0.9rem" }}>
                    <span style={{ width: "2.25rem", height: "2.25rem", borderRadius: "8px", background: "color-mix(in srgb, var(--color-primary) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📧</span>
                    {contact.email}
                  </a>
                )}

                {contact?.phone && (
                  <a href={"tel:" + contact.phone} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--color-text-primary)", textDecoration: "none", fontSize: "0.9rem" }}>
                    <span style={{ width: "2.25rem", height: "2.25rem", borderRadius: "8px", background: "color-mix(in srgb, var(--color-primary) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📞</span>
                    {contact.phone}
                  </a>
                )}

                {contact?.whatsapp && (
                  <a href={"https://wa.me/" + contact.whatsapp.replace(/\D/g, "")} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--color-text-primary)", textDecoration: "none", fontSize: "0.9rem" }}>
                    <span style={{ width: "2.25rem", height: "2.25rem", borderRadius: "8px", background: "color-mix(in srgb, var(--color-success) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>💬</span>
                    WhatsApp
                  </a>
                )}

                {contact?.address?.city && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                    <span style={{ width: "2.25rem", height: "2.25rem", borderRadius: "8px", background: "color-mix(in srgb, var(--color-accent) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📍</span>
                    <span>
                      {[contact.address.street, contact.address.city, contact.address.state, contact.address.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Social links */}
{socialLinks.length > 0 && (
  <div style={{ background: "var(--color-surface)", borderRadius: "14px", padding: "1.75rem", border: "1px solid var(--color-border)" }}>
    <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
      Follow Us
    </h2>
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      {socialLinks.map((s) => (
        <button
          key={s.key}
          onClick={() => window.open(social[s.key], "_blank")}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.875rem", background: "var(--color-background)", border: "1.5px solid var(--color-border)", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: "500" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
        >
          <span>{s.icon}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  </div>
)}
          </div>

          {/* Contact Form */}
          <div style={{ background: "var(--color-surface)", borderRadius: "14px", padding: "1.75rem", border: "1px solid var(--color-border)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "1.5rem", fontFamily: "var(--font-heading)" }}>
              Send a Message
            </h2>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</p>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                  Message Sent!
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                  Thank you for reaching out. We will get back to you soon.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
                  style={{ marginTop: "1.25rem", padding: "0.5rem 1.25rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem" }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "0.375rem" }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "0.375rem" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "0.375rem" }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.9rem", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ padding: "0.75rem 1.5rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "1rem", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(0.9)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                >
                  Send Message 📩
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;