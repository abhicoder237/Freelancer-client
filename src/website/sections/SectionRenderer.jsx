import HeroSection         from "./HeroSection.jsx";
import FeaturesSection     from "./FeaturesSection.jsx";
import BannerSection       from "./BannerSection.jsx";
import StatsSection        from "./StatsSection.jsx";
import TestimonialsSection  from "./TestimonialsSection.jsx";
import FaqSection          from "./FaqSection.jsx";
import NewsletterSection   from "./NewsletterSection.jsx";
import GallerySection      from "./GallerySection.jsx";
import ProductsSection     from "./ProductsSection.jsx";

// ─────────────────────────────────────────
// SECTION RENDERER
// Maps section type to component
// ─────────────────────────────────────────

const SectionRenderer = ({ section }) => {
  if (!section || !section.isVisible) return null;

  // Section-level background override
  const sectionStyle = {
    backgroundColor: section.backgroundColor || undefined,
    paddingTop:      section.paddingTop    === "none" ? "0"      :
                     section.paddingTop    === "sm"   ? "2rem"   :
                     section.paddingTop    === "md"   ? "3rem"   :
                     section.paddingTop    === "xl"   ? "7rem"   : "5rem",
    paddingBottom:   section.paddingBottom === "none" ? "0"      :
                     section.paddingBottom === "sm"   ? "2rem"   :
                     section.paddingBottom === "md"   ? "3rem"   :
                     section.paddingBottom === "xl"   ? "7rem"   : "5rem",
  };

  const renderSection = () => {
    switch (section.type) {
      case "hero":
        return <HeroSection data={section.heroData} />;
      case "features":
        return <FeaturesSection data={section.featuresData} />;
      case "banner":
        return <BannerSection data={section.bannerData} />;
      case "stats":
        return <StatsSection data={section.statsData} />;
      case "testimonials":
        return <TestimonialsSection data={section.testimonialsData} />;
      case "faq":
        return <FaqSection data={section.faqData} />;
      case "newsletter":
        return <NewsletterSection data={section.newsletterData} />;
      case "gallery":
        return <GallerySection data={section.galleryData} />;
      case "products":
        return <ProductsSection />;
      case "custom":
        return (
          <div
            dangerouslySetInnerHTML={{ __html: section.customData?.html || "" }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section style={sectionStyle}>
      {renderSection()}
    </section>
  );
};

export default SectionRenderer;