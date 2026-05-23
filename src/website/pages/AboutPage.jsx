import { usePageSections } from "@hooks/useSections.js";
import SectionRenderer     from "../sections/SectionRenderer.jsx";
import { useClient }       from "@context/ClientContext.jsx";

const AboutPage = () => {
  const { client, contact, social } = useClient();
  const { data, isLoading }         = usePageSections("about");
  const sections                    = data?.data || [];

  return (
    <div>
      {/* Dynamic sections */}
      {sections.map((section) => (
        <SectionRenderer key={section._id} section={section} />
      ))}

      {/* Default about content if no sections */}
      {!isLoading && sections.length === 0 && (
        <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "4rem 1.5rem" }}>

          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
              About Us
            </p>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)", marginBottom: "1.25rem" }}>
              {client?.name}
            </h1>
            {client?.tagline && (
              <p style={{ fontSize: "1.1rem", color: "var(--color-primary)", fontWeight: "500", marginBottom: "1.25rem" }}>
                {client.tagline}
              </p>
            )}
            {client?.description && (
              <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", lineHeight: "1.8" }}>
                {client.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1.25rem", marginTop: "3rem" }}>
            {[
              { icon: "🏆", value: "5+", label: "Years Experience" },
              { icon: "😊", value: "1000+", label: "Happy Customers" },
              { icon: "📦", value: "500+", label: "Products" },
              { icon: "⭐", value: "4.9", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center", padding: "1.5rem", background: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{stat.icon}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.375rem" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;