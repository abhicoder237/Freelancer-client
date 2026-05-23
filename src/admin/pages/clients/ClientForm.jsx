import { useState }              from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm }               from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast                     from "react-hot-toast";
import clientService             from "@services/clientService.js";
import { ROUTES }                from "@constants/api.js";
import { Button, Input, Textarea, Select } from "@components/index.js";
import { Spinner }               from "@components/Loader.jsx";

// ─────────────────────────────────────────
// TAB COMPONENT
// ─────────────────────────────────────────

const Tab = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: active ? "600" : "400", color: active ? "var(--color-primary)" : "var(--color-text-secondary)", background: "none", border: "none", borderBottom: active ? "2px solid var(--color-primary)" : "2px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
  >
    {label}
  </button>
);

// ─────────────────────────────────────────
// CLIENT FORM PAGE
// ─────────────────────────────────────────

const ClientForm = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEdit    = !!id;
  const [activeTab, setActiveTab] = useState("basic");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name:               "",
      tagline:            "",
      description:        "",
      businessType:       "other",
      plan:               "free",
      customDomain:       "",
      subdomain:          "",
      contactEmail:       "",
      contactPhone:       "",
      contactWhatsapp:    "",
      addressStreet:      "",
      addressCity:        "",
      addressState:       "",
      addressCountry:     "India",
      socialFacebook:     "",
      socialInstagram:    "",
      socialTwitter:      "",
      socialLinkedin:     "",
      socialYoutube:      "",
      seoMetaTitle:       "",
      seoMetaDescription: "",
    },
  });

  // ── Fetch if editing ─────────────────────
  const { isLoading: isFetching } = useQuery({
    queryKey: ["client", id],
    queryFn:  () => clientService.getClient(id),
    enabled:  isEdit,
    onSuccess: (res) => {
      if (res?.data) {
        const c = res.data;
        reset({
          name:               c.name || "",
          tagline:            c.tagline || "",
          description:        c.description || "",
          businessType:       c.businessType || "other",
          plan:               c.plan || "free",
          customDomain:       c.customDomain || "",
          subdomain:          c.subdomain || "",
          contactEmail:       c.contact?.email || "",
          contactPhone:       c.contact?.phone || "",
          contactWhatsapp:    c.contact?.whatsapp || "",
          addressStreet:      c.contact?.address?.street || "",
          addressCity:        c.contact?.address?.city || "",
          addressState:       c.contact?.address?.state || "",
          addressCountry:     c.contact?.address?.country || "India",
          socialFacebook:     c.social?.facebook || "",
          socialInstagram:    c.social?.instagram || "",
          socialTwitter:      c.social?.twitter || "",
          socialLinkedin:     c.social?.linkedin || "",
          socialYoutube:      c.social?.youtube || "",
          seoMetaTitle:       c.seo?.metaTitle || "",
          seoMetaDescription: c.seo?.metaDescription || "",
        });
      }
    },
  });

  // ── Create mutation ──────────────────────
  const createMutation = useMutation({
    mutationFn: clientService.createClient,
    onSuccess: () => {
      toast.success("Client created successfully!");
      navigate(ROUTES.ADMIN_CLIENTS);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create client.");
    },
  });

  // ── Update mutation ──────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => clientService.updateClient(id, data),
    onSuccess: () => {
      toast.success("Client updated successfully!");
      navigate(ROUTES.ADMIN_CLIENTS);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update client.");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ── Submit ───────────────────────────────
   const onSubmit = (data) => {
  const payload = {
    name:         data.name,
    tagline:      data.tagline?.trim()      || undefined,
    description:  data.description?.trim() || undefined,
    businessType: data.businessType || "other",
    plan:         data.plan         || "free",

    // ✅ Empty string → undefined
    customDomain: data.customDomain?.trim() || undefined,
    subdomain:    data.subdomain?.trim()    || undefined,

    contact: {
      email:    data.contactEmail?.trim()    || undefined,
      phone:    data.contactPhone?.trim()    || undefined,
      whatsapp: data.contactWhatsapp?.trim() || undefined,
      address: {
        street:  data.addressStreet?.trim()  || undefined,
        city:    data.addressCity?.trim()    || undefined,
        state:   data.addressState?.trim()   || undefined,
        country: data.addressCountry?.trim() || "India",
      },
    },

    social: {
      facebook:  data.socialFacebook?.trim()  || undefined,
      instagram: data.socialInstagram?.trim() || undefined,
      twitter:   data.socialTwitter?.trim()   || undefined,
      linkedin:  data.socialLinkedin?.trim()  || undefined,
      youtube:   data.socialYoutube?.trim()   || undefined,
    },

    seo: {
      metaTitle:       data.seoMetaTitle?.trim()       || undefined,
      metaDescription: data.seoMetaDescription?.trim() || undefined,
    },
  };

  if (isEdit) {
    updateMutation.mutate({ id, data: payload });
  } else {
    createMutation.mutate(payload);
  }
};

  if (isEdit && isFetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Tab sections ─────────────────────────
  const tabs = [
    { id: "basic",   label: "Basic Info" },
    { id: "contact", label: "Contact" },
    { id: "social",  label: "Social" },
    { id: "seo",     label: "SEO" },
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => navigate(ROUTES.ADMIN_CLIENTS)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--color-text-secondary)" }}
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            {isEdit ? "Edit Client" : "Add New Client"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            {isEdit ? "Update client configuration" : "Set up a new client website"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "1.5rem", overflowX: "auto" }}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>

          {/* ── Basic Info Tab ───────────── */}
          {activeTab === "basic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                Basic Information
              </h2>

              <Input
                label="Business Name"
                placeholder="e.g. Acme Corporation"
                required
                error={errors.name?.message}
                {...register("name", {
                  required: "Business name is required",
                  minLength: { value: 2, message: "Min 2 characters" },
                })}
              />

              <Input
                label="Tagline"
                placeholder="e.g. Your trusted technology partner"
                hint="Short description shown in header"
                {...register("tagline")}
              />

              <Textarea
                label="Description"
                placeholder="About the business..."
                rows={3}
                {...register("description")}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Select
                  label="Business Type"
                  options={[
                    { value: "ecommerce",   label: "E-Commerce" },
                    { value: "restaurant",  label: "Restaurant" },
                    { value: "portfolio",   label: "Portfolio" },
                    { value: "services",    label: "Services" },
                    { value: "healthcare",  label: "Healthcare" },
                    { value: "education",   label: "Education" },
                    { value: "realestate",  label: "Real Estate" },
                    { value: "other",       label: "Other" },
                  ]}
                  {...register("businessType")}
                />

                <Select
                  label="Plan"
                  options={[
                    { value: "free",         label: "Free" },
                    { value: "basic",        label: "Basic" },
                    { value: "professional", label: "Professional" },
                    { value: "enterprise",   label: "Enterprise" },
                  ]}
                  {...register("plan")}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Custom Domain"
                  placeholder="e.g. www.acmecorp.com"
                  hint="Leave empty to use platform subdomain"
                  {...register("customDomain")}
                />

                <Input
                  label="Subdomain"
                  placeholder="e.g. acme"
                  hint="acme.youragency.com"
                  {...register("subdomain")}
                />
              </div>
            </div>
          )}

          {/* ── Contact Tab ──────────────── */}
          {activeTab === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                Contact Information
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="contact@business.com"
                  {...register("contactEmail")}
                />

                <Input
                  label="Phone"
                  placeholder="+91 98765 43210"
                  {...register("contactPhone")}
                />
              </div>

              <Input
                label="WhatsApp"
                placeholder="+91 98765 43210"
                {...register("contactWhatsapp")}
              />

              <h3 style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-text-primary)", marginTop: "0.5rem" }}>
                Address
              </h3>

              <Input
                label="Street"
                placeholder="123 Main Street"
                {...register("addressStreet")}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input label="City"  placeholder="Mumbai" {...register("addressCity")} />
                <Input label="State" placeholder="Maharashtra" {...register("addressState")} />
              </div>

              <Input
                label="Country"
                placeholder="India"
                {...register("addressCountry")}
              />
            </div>
          )}

          {/* ── Social Tab ───────────────── */}
          {activeTab === "social" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                Social Media Links
              </h2>

              <Input
                label="Facebook"
                placeholder="https://facebook.com/yourpage"
                leftIcon="📘"
                {...register("socialFacebook")}
              />

              <Input
                label="Instagram"
                placeholder="https://instagram.com/yourhandle"
                leftIcon="📸"
                {...register("socialInstagram")}
              />

              <Input
                label="Twitter / X"
                placeholder="https://twitter.com/yourhandle"
                leftIcon="🐦"
                {...register("socialTwitter")}
              />

              <Input
                label="LinkedIn"
                placeholder="https://linkedin.com/company/yourcompany"
                leftIcon="💼"
                {...register("socialLinkedin")}
              />

              <Input
                label="YouTube"
                placeholder="https://youtube.com/yourchannel"
                leftIcon="▶️"
                {...register("socialYoutube")}
              />
            </div>
          )}

          {/* ── SEO Tab ──────────────────── */}
          {activeTab === "seo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                SEO Settings
              </h2>

              <Input
                label="Meta Title"
                placeholder="Your Business — Best Services in India"
                hint="Max 60 characters recommended"
                {...register("seoMetaTitle")}
              />

              <Textarea
                label="Meta Description"
                placeholder="Brief description of your business for search engines..."
                rows={3}
                hint="Max 160 characters recommended"
                {...register("seoMetaDescription")}
              />

              <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                  Google Search Preview
                </p>
                <p style={{ fontSize: "1rem", color: "#1a0dab", fontWeight: "500" }}>
                  {/* show meta title preview */}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#006621", marginTop: "2px" }}>
                  youragency.com/client/your-slug
                </p>
                <p style={{ fontSize: "0.85rem", color: "#545454", marginTop: "4px" }}>
                  Meta description will appear here...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(ROUTES.ADMIN_CLIENTS)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            isLoading={isSubmitting}
            size="lg"
          >
            {isSubmitting
              ? (isEdit ? "Updating..." : "Creating...")
              : (isEdit ? "Update Client" : "Create Client")
            }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;