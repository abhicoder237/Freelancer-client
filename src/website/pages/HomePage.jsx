import { usePageSections }    from "@hooks/useSections.js";
import { useClient }          from "@context/ClientContext.jsx";
import { SkeletonBox }        from "@components/Loader.jsx";
import SectionRenderer        from "../sections/SectionRenderer.jsx";

// ─────────────────────────────────────────
// HOME PAGE
// Renders dynamic sections from DB
// ─────────────────────────────────────────

const HomePage = () => {
  const { clientSlug }   = useClient();
  const { data, isLoading } = usePageSections("home");

  const sections = data?.data || [];

  if (isLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ marginBottom: "2rem" }}>
            <SkeletonBox className="h-64 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
        <div>
          <p style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏗️</p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            Coming Soon
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            This website is being set up. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section._id} section={section} />
      ))}
    </div>
  );
};

export default HomePage;