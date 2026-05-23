import { useState } from "react";

const NewsletterSection = ({ data }) => {
  if (!data) return null;

  const {
    heading         = "Subscribe to our newsletter",
    subheading,
    placeholder     = "Enter your email",
    buttonLabel     = "Subscribe",
    successMessage  = "Thank you for subscribing!",
    backgroundColor = "var(--color-surface)",
  } = data;

  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div style={{ background: backgroundColor, padding: "3rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {heading && (
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>
            {heading}
          </h2>
        )}
        {subheading && (
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            {subheading}
          </p>
        )}

        {submitted ? (
          <p style={{ color: "var(--color-success)", fontWeight: "600", fontSize: "1rem" }}>
            ✅ {successMessage}
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.625rem", maxWidth: "400px", margin: "0 auto" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              style={{ flex: 1, padding: "0.625rem 1rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", fontSize: "0.9rem", outline: "none", background: "var(--color-background)", color: "var(--color-text-primary)" }}
            />
            <button
              type="submit"
              style={{ padding: "0.625rem 1.25rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap" }}
            >
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsletterSection;