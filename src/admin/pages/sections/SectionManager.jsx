 import { useState }              from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast                     from "react-hot-toast";
import sectionService            from "@services/sectionService.js";
import clientService             from "@services/clientService.js";
import { useClient }             from "@context/ClientContext.jsx";
import { useAuth }               from "@context/AuthContext.jsx";
import { QUERY_KEYS }            from "@constants/api.js";
import { getSectionTypeLabel }   from "@utils/helpers.js";
import { Badge, Button, ConfirmDialog, EmptyState, Modal, ModalFooter } from "@components/index.js";
import { SkeletonTable }         from "@components/Loader.jsx";
import Input                     from "@components/Input.jsx";
import Select                    from "@components/Select.jsx";
import Textarea                  from "@components/Textarea.jsx";

// ─────────────────────────────────────────
// SECTION ROW
// ─────────────────────────────────────────

const SectionRow = ({
  section,
  index,
  total,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", borderBottom: index < total - 1 ? "1px solid var(--color-border)" : "none", transition: "background 0.15s" }}
    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
  >
    {/* Drag handle */}
    <div style={{ color: "var(--color-text-secondary)", cursor: "grab", fontSize: "1.1rem", flexShrink: 0 }}>
      ⠿
    </div>

    {/* Move buttons */}
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0 }}>
      <button
        onClick={() => onMoveUp(index)}
        disabled={index === 0}
        style={{ padding: "2px 6px", background: "none", border: "1px solid var(--color-border)", borderRadius: "4px", cursor: index === 0 ? "not-allowed" : "pointer", opacity: index === 0 ? 0.4 : 1, fontSize: "0.65rem", color: "var(--color-text-secondary)" }}
      >
        ▲
      </button>
      <button
        onClick={() => onMoveDown(index)}
        disabled={index === total - 1}
        style={{ padding: "2px 6px", background: "none", border: "1px solid var(--color-border)", borderRadius: "4px", cursor: index === total - 1 ? "not-allowed" : "pointer", opacity: index === total - 1 ? 0.4 : 1, fontSize: "0.65rem", color: "var(--color-text-secondary)" }}
      >
        ▼
      </button>
    </div>

    {/* Section type icon */}
    <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
      {section.type === "hero"         ? "🦸" :
       section.type === "features"     ? "✨" :
       section.type === "testimonials" ? "💬" :
       section.type === "banner"       ? "📢" :
       section.type === "stats"        ? "📊" :
       section.type === "gallery"      ? "🖼️" :
       section.type === "faq"          ? "❓" :
       section.type === "newsletter"   ? "📧" :
       section.type === "products"     ? "🛍️" : "⚙️"}
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {section.name}
      </p>
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
        {getSectionTypeLabel(section.type)} • Order: {section.order}
      </p>
    </div>

    {/* Page badge */}
    <Badge variant="info">{section.page}</Badge>

    {/* Visibility toggle */}
    <button
      onClick={() => onToggle(section._id)}
      style={{ padding: "0.375rem 0.625rem", borderRadius: "6px", border: "1px solid var(--color-border)", background: section.isVisible ? "var(--color-success)" : "var(--color-surface)", color: section.isVisible ? "#fff" : "var(--color-text-secondary)", cursor: "pointer", fontSize: "0.75rem", fontWeight: "500", transition: "all 0.2s", whiteSpace: "nowrap" }}
    >
      {section.isVisible ? "👁 Visible" : "🙈 Hidden"}
    </button>

    {/* Actions */}
    <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
      <Button size="sm" variant="outline" onClick={() => onEdit(section)}>Edit</Button>
      <Button size="sm" variant="ghost"   onClick={() => onDuplicate(section._id)}>Copy</Button>
      <Button size="sm" variant="danger"  onClick={() => onDelete(section._id)}>Del</Button>
    </div>
  </div>
);

// ─────────────────────────────────────────
// SECTION EDITOR MODAL
// ─────────────────────────────────────────

const SectionEditorModal = ({ section, isOpen, onClose, onSave, isSaving }) => {
  const [name,    setName]    = useState(section?.name || "");
  const [visible, setVisible] = useState(section?.isVisible ?? true);
  const [page,    setPage]    = useState(section?.page || "home");
  const [bgColor, setBgColor] = useState(section?.backgroundColor || "");

  // ── Hero data ────────────────────────────
  const [heroHeading,    setHeroHeading]    = useState(section?.heroData?.heading || "");
  const [heroSubheading, setHeroSubheading] = useState(section?.heroData?.subheading || "");
  const [heroDesc,       setHeroDesc]       = useState(section?.heroData?.description || "");
  const [heroBtnLabel,   setHeroBtnLabel]   = useState(section?.heroData?.primaryCta?.label || "");
  const [heroBtnHref,    setHeroBtnHref]    = useState(section?.heroData?.primaryCta?.href || "");
  const [heroBtn2Label,  setHeroBtn2Label]  = useState(section?.heroData?.secondaryCta?.label || "");
  const [heroBtn2Href,   setHeroBtn2Href]   = useState(section?.heroData?.secondaryCta?.href || "");
  const [heroAlignment,  setHeroAlignment]  = useState(section?.heroData?.alignment || "center");

  // ── Banner data ──────────────────────────
  const [bannerHeading,  setBannerHeading]  = useState(section?.bannerData?.heading || "");
  const [bannerSubtext,  setBannerSubtext]  = useState(section?.bannerData?.subheading || "");
  const [bannerBtnLabel, setBannerBtnLabel] = useState(section?.bannerData?.cta?.label || "");
  const [bannerBtnHref,  setBannerBtnHref]  = useState(section?.bannerData?.cta?.href || "");
  const [bannerBgColor,  setBannerBgColor]  = useState(section?.bannerData?.backgroundColor || "#3B82F6");
  const [bannerBadge,    setBannerBadge]    = useState(section?.bannerData?.badgeText || "");

  // ── Features data ─────────────────────────
  const [featHeading,  setFeatHeading]  = useState(section?.featuresData?.heading || "");
  const [featSubhead,  setFeatSubhead]  = useState(section?.featuresData?.subheading || "");
  const [featDesc,     setFeatDesc]     = useState(section?.featuresData?.description || "");
  const [featItems,    setFeatItems]    = useState(
    section?.featuresData?.items?.length > 0
      ? section.featuresData.items
      : [{ icon: "", title: "", description: "", order: 0 }]
  );

  // ── Stats data ────────────────────────────
  const [statsHeading, setStatsHeading] = useState(section?.statsData?.heading || "");
  const [statsItems,   setStatsItems]   = useState(
    section?.statsData?.items?.length > 0
      ? section.statsData.items
      : [{ icon: "", value: "", label: "", order: 0 }]
  );

  // ── Testimonials data ─────────────────────
  const [testiHeading, setTestiHeading] = useState(section?.testimonialsData?.heading || "");
  const [testiItems,   setTestiItems]   = useState(
    section?.testimonialsData?.items?.length > 0
      ? section.testimonialsData.items
      : [{ name: "", role: "", content: "", rating: 5, order: 0 }]
  );

  // ── FAQ data ──────────────────────────────
  const [faqHeading, setFaqHeading] = useState(section?.faqData?.heading || "");
  const [faqItems,   setFaqItems]   = useState(
    section?.faqData?.items?.length > 0
      ? section.faqData.items
      : [{ question: "", answer: "", order: 0 }]
  );

  // ── Newsletter data ───────────────────────
  const [newsHeading,   setNewsHeading]   = useState(section?.newsletterData?.heading || "");
  const [newsSubhead,   setNewsSubhead]   = useState(section?.newsletterData?.subheading || "");
  const [newsBtnLabel,  setNewsBtnLabel]  = useState(section?.newsletterData?.buttonLabel || "Subscribe");
  const [newsSuccess,   setNewsSuccess]   = useState(section?.newsletterData?.successMessage || "Thank you for subscribing!");

  // ── Add / remove item helpers ─────────────
  const addFeatItem = () => setFeatItems((p) => [...p, { icon: "", title: "", description: "", order: p.length }]);
  const removeFeatItem = (i) => setFeatItems((p) => p.filter((_, idx) => idx !== i));

  const addStatItem = () => setStatsItems((p) => [...p, { icon: "", value: "", label: "", order: p.length }]);
  const removeStatItem = (i) => setStatsItems((p) => p.filter((_, idx) => idx !== i));

  const addTestiItem = () => setTestiItems((p) => [...p, { name: "", role: "", content: "", rating: 5, order: p.length }]);
  const removeTestiItem = (i) => setTestiItems((p) => p.filter((_, idx) => idx !== i));

  const addFaqItem = () => setFaqItems((p) => [...p, { question: "", answer: "", order: p.length }]);
  const removeFaqItem = (i) => setFaqItems((p) => p.filter((_, idx) => idx !== i));

  // ── Save ──────────────────────────────────
  const handleSave = () => {
    const baseData = {
      name,
      isVisible: visible,
      page,
      backgroundColor: bgColor || undefined,
    };

    let typeData = {};

    if (section?.type === "hero") {
      typeData = {
        heroData: {
          heading:    heroHeading,
          subheading: heroSubheading,
          description: heroDesc,
          alignment:  heroAlignment,
          primaryCta:   { label: heroBtnLabel,  href: heroBtnHref },
          secondaryCta: { label: heroBtn2Label, href: heroBtn2Href },
        },
      };
    }

    if (section?.type === "banner") {
      typeData = {
        bannerData: {
          heading:         bannerHeading,
          subheading:      bannerSubtext,
          backgroundColor: bannerBgColor,
          badgeText:       bannerBadge,
          cta: { label: bannerBtnLabel, href: bannerBtnHref },
        },
      };
    }

    if (section?.type === "features") {
      typeData = {
        featuresData: {
          heading:    featHeading,
          subheading: featSubhead,
          description: featDesc,
          items:      featItems,
        },
      };
    }

    if (section?.type === "stats") {
      typeData = {
        statsData: {
          heading: statsHeading,
          items:   statsItems,
        },
      };
    }

    if (section?.type === "testimonials") {
      typeData = {
        testimonialsData: {
          heading: testiHeading,
          items:   testiItems,
        },
      };
    }

    if (section?.type === "faq") {
      typeData = {
        faqData: {
          heading: faqHeading,
          items:   faqItems,
        },
      };
    }

    if (section?.type === "newsletter") {
      typeData = {
        newsletterData: {
          heading:        newsHeading,
          subheading:     newsSubhead,
          buttonLabel:    newsBtnLabel,
          successMessage: newsSuccess,
        },
      };
    }

    onSave(section._id, baseData, typeData);
  };

  // ── Item editor row ───────────────────────
  const ItemRow = ({ children, onRemove }) => (
    <div style={{ padding: "0.875rem", background: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "0.625rem" }}>
      {children}
      <button
        type="button"
        onClick={onRemove}
        style={{ marginTop: "0.5rem", padding: "0.25rem 0.625rem", background: "var(--color-error)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}
      >
        Remove
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Edit — " + (section?.name || "")} size="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Base settings */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Input label="Section Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select
            label="Page"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            options={[
              { value: "home",     label: "Home" },
              { value: "about",    label: "About" },
              { value: "contact",  label: "Contact" },
              { value: "products", label: "Products" },
              { value: "custom",   label: "Custom" },
            ]}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
            <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
            Visible on website
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Background:</label>
            <input
              type="color"
              value={bgColor || "#ffffff"}
              onChange={(e) => setBgColor(e.target.value)}
              style={{ width: "2rem", height: "2rem", padding: "2px", border: "1px solid var(--color-border)", borderRadius: "4px", cursor: "pointer" }}
            />
            {bgColor && (
              <button
                onClick={() => setBgColor("")}
                style={{ fontSize: "0.75rem", color: "var(--color-error)", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── HERO ──────────────────────────── */}
        {section?.type === "hero" && (
          <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
              🦸 Hero Content
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Select
                label="Text Alignment"
                value={heroAlignment}
                onChange={(e) => setHeroAlignment(e.target.value)}
                options={[
                  { value: "left",   label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right",  label: "Right" },
                ]}
              />
              <Input label="Heading" placeholder="Your Game, Our Gear" value={heroHeading} onChange={(e) => setHeroHeading(e.target.value)} />
              <Input label="Subheading" placeholder="New Collection 2026" value={heroSubheading} onChange={(e) => setHeroSubheading(e.target.value)} />
              <Textarea label="Description" placeholder="Short description..." rows={2} value={heroDesc} onChange={(e) => setHeroDesc(e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Input label="Primary Button Label" placeholder="Shop Now" value={heroBtnLabel} onChange={(e) => setHeroBtnLabel(e.target.value)} />
                <Input label="Primary Button Link" placeholder="/products" value={heroBtnHref} onChange={(e) => setHeroBtnHref(e.target.value)} />
                <Input label="Secondary Button Label" placeholder="Learn More" value={heroBtn2Label} onChange={(e) => setHeroBtn2Label(e.target.value)} />
                <Input label="Secondary Button Link" placeholder="/about" value={heroBtn2Href} onChange={(e) => setHeroBtn2Href(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── BANNER ────────────────────────── */}
        {section?.type === "banner" && (
          <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
              📢 Banner Content
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Input label="Heading" placeholder="Mega Sports Sale — 40% Off" value={bannerHeading} onChange={(e) => setBannerHeading(e.target.value)} />
              <Input label="Subtext" placeholder="Limited time offer" value={bannerSubtext} onChange={(e) => setBannerSubtext(e.target.value)} />
              <Input label="Badge Text" placeholder="HOT DEAL" value={bannerBadge} onChange={(e) => setBannerBadge(e.target.value)} />
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Background Color:</label>
                <input type="color" value={bannerBgColor} onChange={(e) => setBannerBgColor(e.target.value)} style={{ width: "2.5rem", height: "2.5rem", padding: "2px", border: "1px solid var(--color-border)", borderRadius: "6px", cursor: "pointer" }} />
                <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--color-text-secondary)" }}>{bannerBgColor}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Input label="Button Label" placeholder="Grab Now" value={bannerBtnLabel} onChange={(e) => setBannerBtnLabel(e.target.value)} />
                <Input label="Button Link" placeholder="/products" value={bannerBtnHref} onChange={(e) => setBannerBtnHref(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── FEATURES ──────────────────────── */}
        {section?.type === "features" && (
          <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
              ✨ Features Content
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Input label="Section Heading" placeholder="Why Choose Us?" value={featHeading} onChange={(e) => setFeatHeading(e.target.value)} />
              <Input label="Subheading" placeholder="Our Promise" value={featSubhead} onChange={(e) => setFeatSubhead(e.target.value)} />
              <Textarea label="Description" rows={2} value={featDesc} onChange={(e) => setFeatDesc(e.target.value)} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                  Feature Items ({featItems.length})
                </p>
                <Button size="sm" variant="outline" type="button" onClick={addFeatItem}>+ Add Item</Button>
              </div>

              {featItems.map((item, i) => (
                <ItemRow key={i} onRemove={() => removeFeatItem(i)}>
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input
                      placeholder="Icon 🏆"
                      value={item.icon}
                      onChange={(e) => setFeatItems((p) => p.map((it, idx) => idx === i ? { ...it, icon: e.target.value } : it))}
                      style={{ padding: "0.4rem 0.5rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "1rem", textAlign: "center", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none" }}
                    />
                    <input
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => setFeatItems((p) => p.map((it, idx) => idx === i ? { ...it, title: e.target.value } : it))}
                      style={{ padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none" }}
                    />
                  </div>
                  <textarea
                    placeholder="Description"
                    value={item.description}
                    rows={2}
                    onChange={(e) => setFeatItems((p) => p.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it))}
                    style={{ width: "100%", padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </ItemRow>
              ))}
            </div>
          </div>
        )}

        {/* ── STATS ─────────────────────────── */}
        {section?.type === "stats" && (
          <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
              📊 Stats Content
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Input label="Section Heading" placeholder="Our Numbers" value={statsHeading} onChange={(e) => setStatsHeading(e.target.value)} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                  Stat Items ({statsItems.length})
                </p>
                <Button size="sm" variant="outline" type="button" onClick={addStatItem}>+ Add Item</Button>
              </div>

              {statsItems.map((item, i) => (
                <ItemRow key={i} onRemove={() => removeStatItem(i)}>
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: "0.5rem" }}>
                    <input
                      placeholder="Icon ⭐"
                      value={item.icon}
                      onChange={(e) => setStatsItems((p) => p.map((it, idx) => idx === i ? { ...it, icon: e.target.value } : it))}
                      style={{ padding: "0.4rem 0.5rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "1rem", textAlign: "center", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none" }}
                    />
                    <input
                      placeholder="Value (e.g. 10K+)"
                      value={item.value}
                      onChange={(e) => setStatsItems((p) => p.map((it, idx) => idx === i ? { ...it, value: e.target.value } : it))}
                      style={{ padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none" }}
                    />
                    <input
                      placeholder="Label (e.g. Happy Customers)"
                      value={item.label}
                      onChange={(e) => setStatsItems((p) => p.map((it, idx) => idx === i ? { ...it, label: e.target.value } : it))}
                      style={{ padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none" }}
                    />
                  </div>
                </ItemRow>
              ))}
            </div>
          </div>
        )}

        {/* ── TESTIMONIALS ──────────────────── */}
        {section?.type === "testimonials" && (
          <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
              💬 Testimonials Content
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Input label="Section Heading" placeholder="What Our Customers Say" value={testiHeading} onChange={(e) => setTestiHeading(e.target.value)} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                  Reviews ({testiItems.length})
                </p>
                <Button size="sm" variant="outline" type="button" onClick={addTestiItem}>+ Add Review</Button>
              </div>

              {testiItems.map((item, i) => (
                <ItemRow key={i} onRemove={() => removeTestiItem(i)}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input
                      placeholder="Customer Name"
                      value={item.name}
                      onChange={(e) => setTestiItems((p) => p.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it))}
                      style={{ padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none" }}
                    />
                    <input
                      placeholder="Role (e.g. Bride, Delhi)"
                      value={item.role}
                      onChange={(e) => setTestiItems((p) => p.map((it, idx) => idx === i ? { ...it, role: e.target.value } : it))}
                      style={{ padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none" }}
                    />
                  </div>
                  <textarea
                    placeholder="Review content..."
                    value={item.content}
                    rows={2}
                    onChange={(e) => setTestiItems((p) => p.map((it, idx) => idx === i ? { ...it, content: e.target.value } : it))}
                    style={{ width: "100%", padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: "0.5rem" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Rating:</label>
                    <select
                      value={item.rating}
                      onChange={(e) => setTestiItems((p) => p.map((it, idx) => idx === i ? { ...it, rating: parseInt(e.target.value) } : it))}
                      style={{ padding: "0.3rem 0.5rem", border: "1px solid var(--color-border)", borderRadius: "4px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.8rem", outline: "none" }}
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} ⭐</option>
                      ))}
                    </select>
                  </div>
                </ItemRow>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQ ───────────────────────────── */}
        {section?.type === "faq" && (
          <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
              ❓ FAQ Content
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Input label="Section Heading" placeholder="Frequently Asked Questions" value={faqHeading} onChange={(e) => setFaqHeading(e.target.value)} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                  Questions ({faqItems.length})
                </p>
                <Button size="sm" variant="outline" type="button" onClick={addFaqItem}>+ Add Question</Button>
              </div>

              {faqItems.map((item, i) => (
                <ItemRow key={i} onRemove={() => removeFaqItem(i)}>
                  <input
                    placeholder="Question"
                    value={item.question}
                    onChange={(e) => setFaqItems((p) => p.map((it, idx) => idx === i ? { ...it, question: e.target.value } : it))}
                    style={{ width: "100%", padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none", marginBottom: "0.5rem", boxSizing: "border-box" }}
                  />
                  <textarea
                    placeholder="Answer"
                    value={item.answer}
                    rows={2}
                    onChange={(e) => setFaqItems((p) => p.map((it, idx) => idx === i ? { ...it, answer: e.target.value } : it))}
                    style={{ width: "100%", padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.875rem", background: "var(--color-background)", color: "var(--color-text-primary)", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </ItemRow>
              ))}
            </div>
          </div>
        )}

        {/* ── NEWSLETTER ────────────────────── */}
        {section?.type === "newsletter" && (
          <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
              📧 Newsletter Content
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Input label="Heading" placeholder="Subscribe to our newsletter" value={newsHeading} onChange={(e) => setNewsHeading(e.target.value)} />
              <Input label="Subheading" placeholder="Get updates and offers..." value={newsSubhead} onChange={(e) => setNewsSubhead(e.target.value)} />
              <Input label="Button Label" placeholder="Subscribe" value={newsBtnLabel} onChange={(e) => setNewsBtnLabel(e.target.value)} />
              <Input label="Success Message" placeholder="Thank you for subscribing!" value={newsSuccess} onChange={(e) => setNewsSuccess(e.target.value)} />
            </div>
          </div>
        )}

        {/* ── PRODUCTS / GALLERY — info only ── */}
        {(section?.type === "products" || section?.type === "gallery") && (
          <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              ℹ️ <strong>{getSectionTypeLabel(section?.type)}</strong> section — base settings above are applied.
              {section?.type === "products" && " Featured products are automatically shown from your product catalog."}
            </p>
          </div>
        )}

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} isLoading={isSaving}>Save Section</Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────
// SECTION MANAGER MAIN
// ─────────────────────────────────────────

const SectionManager = () => {
  const queryClient              = useQueryClient();
  const { clientId }             = useClient();
  const { user, isAdminOrAbove } = useAuth();

  // ── Client selector for admin/superadmin ──
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  const activeClientId = user.role === "clientadmin"
    ? clientId
    : selectedClientId || clientId;

  const [activePage,  setActivePage]  = useState("home");
  const [editSection, setEditSection] = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection,  setNewSection]  = useState({
    name: "", type: "hero", page: "home",
  });

  // ── Fetch all clients for dropdown ───────
  const { data: clientsRes } = useQuery({
    queryKey: ["clients-list"],
    queryFn:  () => clientService.getAllClients({ limit: 100 }),
    enabled:  isAdminOrAbove,
  });
  const allClients = clientsRes?.data || [];

  // ── Fetch sections ───────────────────────
  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.SECTIONS(activeClientId), activePage],
    queryFn:  () => sectionService.getAllSections({ client: activeClientId }),
    enabled:  !!activeClientId,
  });

  const allSections = data?.data?.sections || [];
  const sections    = allSections
    .filter((s) => s.page === activePage)
    .sort((a, b) => a.order - b.order);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.SECTIONS(activeClientId),
    });
  };

  // ── Mutations ────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: sectionService.toggleVisibility,
    onSuccess:  () => {
      toast.success("Visibility updated!");
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sectionService.updateSection(id, data),
    onSuccess:  () => invalidate(),
    onError:    (err) => toast.error(err.message || "Failed to update."),
  });

  const updateDataMutation = useMutation({
    mutationFn: ({ id, dataKey, data }) =>
      sectionService.updateSectionData(id, dataKey, data),
    onSuccess: () => {
      toast.success("Section saved!");
      invalidate();
      setEditSection(null);
    },
    onError: (err) => toast.error(err.message || "Failed to save."),
  });

  const createMutation = useMutation({
    mutationFn: sectionService.createSection,
    onSuccess:  () => {
      toast.success("Section created!");
      invalidate();
      setShowAddForm(false);
      setNewSection({ name: "", type: "hero", page: "home" });
    },
    onError: (err) => toast.error(err.message || "Failed to create."),
  });

  const duplicateMutation = useMutation({
    mutationFn: sectionService.duplicateSection,
    onSuccess:  () => {
      toast.success("Section duplicated!");
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sectionService.deleteSection,
    onSuccess:  () => {
      toast.success("Section deleted!");
      invalidate();
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message || "Failed to delete."),
  });

  // ── Reorder ──────────────────────────────
  const handleMove = (index, direction) => {
    const newSections = [...sections];
    const swapIndex   = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;

    [newSections[index], newSections[swapIndex]] =
      [newSections[swapIndex], newSections[index]];

    const reorderData = newSections.map((s, i) => ({
      id:    s._id,
      order: i,
    }));

    sectionService
      .reorderSections(reorderData)
      .then(invalidate)
      .catch(() => toast.error("Reorder failed."));
  };

  // ── Handle save from editor ──────────────
  const handleSave = (id, baseData, typeData) => {
    updateMutation.mutate({ id, data: baseData });

    if (typeData && Object.keys(typeData).length > 0) {
      const [dataKey, data] = Object.entries(typeData)[0];
      updateDataMutation.mutate({ id, dataKey, data });
    } else {
      toast.success("Section updated!");
      invalidate();
      setEditSection(null);
    }
  };

  const pages = ["home", "about", "contact", "products", "custom"];

  const sectionTypes = [
    { value: "hero",         label: "Hero Banner" },
    { value: "features",     label: "Features" },
    { value: "testimonials", label: "Testimonials" },
    { value: "banner",       label: "Promo Banner" },
    { value: "stats",        label: "Stats / Numbers" },
    { value: "gallery",      label: "Gallery" },
    { value: "faq",          label: "FAQ" },
    { value: "newsletter",   label: "Newsletter" },
    { value: "products",     label: "Products Grid" },
    { value: "custom",       label: "Custom HTML" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            Section Manager
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Manage page sections — use ▲▼ to reorder
          </p>
        </div>

        {activeClientId && (
          <Button onClick={() => setShowAddForm(!showAddForm)} leftIcon="+">
            Add Section
          </Button>
        )}
      </div>

      {/* ── Client Selector — admin/superadmin ── */}
      {isAdminOrAbove && (
        <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Select Client
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={{ width: "100%", maxWidth: "350px", padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
          >
            <option value="">-- Select a client --</option>
            {allClients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>

          {!activeClientId && (
            <p style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.5rem" }}>
              Please select a client to manage sections.
            </p>
          )}
        </div>
      )}

      {/* No client state */}
      {!activeClientId && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-secondary)" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧩</p>
          <p style={{ fontSize: "1rem", fontWeight: "500" }}>Select a client above</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Choose a client to view and manage their page sections.
          </p>
        </div>
      )}

      {activeClientId && (
        <>
          {/* Page tabs */}
          <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
            {pages.map((p) => {
              const count = allSections.filter((s) => s.page === p).length;
              return (
                <button
                  key={p}
                  onClick={() => setActivePage(p)}
                  style={{ padding: "0.5rem 1rem", background: "none", border: "none", borderBottom: activePage === p ? "2px solid var(--color-primary)" : "2px solid transparent", color: activePage === p ? "var(--color-primary)" : "var(--color-text-secondary)", fontWeight: activePage === p ? "600" : "400", cursor: "pointer", fontSize: "0.875rem", textTransform: "capitalize", whiteSpace: "nowrap" }}
                >
                  {p} {count > 0 && "(" + count + ")"}
                </button>
              );
            })}
          </div>

          {/* Add section form */}
          {showAddForm && (
            <div style={{ padding: "1.25rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <Input
                label="Section Name"
                placeholder="e.g. Hero Banner"
                value={newSection.name}
                onChange={(e) => setNewSection((p) => ({ ...p, name: e.target.value }))}
                containerClass="flex-1"
              />
              <Select
                label="Type"
                value={newSection.type}
                onChange={(e) => setNewSection((p) => ({ ...p, type: e.target.value }))}
                options={sectionTypes}
              />
              <Select
                label="Page"
                value={newSection.page}
                onChange={(e) => setNewSection((p) => ({ ...p, page: e.target.value }))}
                options={pages.map((p) => ({
                  value: p,
                  label: p.charAt(0).toUpperCase() + p.slice(1),
                }))}
              />
              <Button
                onClick={() => createMutation.mutate({
                  ...newSection,
                  client: activeClientId,
                })}
                isLoading={createMutation.isPending}
                disabled={!newSection.name.trim()}
              >
                Create
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          )}

          {/* Sections list */}
          <div style={{ background: "var(--color-background)", borderRadius: "12px", border: "1px solid var(--color-border)", overflow: "hidden" }}>
            {isLoading ? (
              <SkeletonTable rows={4} />
            ) : sections.length === 0 ? (
              <EmptyState
                icon="🧩"
                title={"No sections on " + activePage + " page"}
                message="Add sections to build your page layout."
                action={() => setShowAddForm(true)}
                actionLabel="Add Section"
              />
            ) : (
              sections.map((section, index) => (
                <SectionRow
                  key={section._id}
                  section={section}
                  index={index}
                  total={sections.length}
                  onToggle={(id) => toggleMutation.mutate(id)}
                  onEdit={(s) => setEditSection(s)}
                  onDuplicate={(id) => duplicateMutation.mutate(id)}
                  onDelete={(id) => setDeleteId(id)}
                  onMoveUp={(i) => handleMove(i, "up")}
                  onMoveDown={(i) => handleMove(i, "down")}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Edit modal */}
      {editSection && (
        <SectionEditorModal
          section={editSection}
          isOpen={!!editSection}
          onClose={() => setEditSection(null)}
          onSave={handleSave}
          isSaving={
            updateMutation.isPending || updateDataMutation.isPending
          }
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
        title="Delete Section"
        message="Are you sure you want to delete this section? This cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default SectionManager;