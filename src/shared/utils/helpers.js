// ─────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────

// ── Format currency ──────────────────────
export const formatCurrency = (
  amount,
  currency = "INR",
  locale   = "en-IN"
) => {
  return new Intl.NumberFormat(locale, {
    style:    "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ── Format date ───────────────────────────
export const formatDate = (
  date,
  options = { day: "numeric", month: "short", year: "numeric" }
) => {
  return new Intl.DateTimeFormat("en-IN", options).format(
    new Date(date)
  );
};

// ── Truncate text ─────────────────────────
export const truncate = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// ── Slugify string ────────────────────────
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ── Capitalize first letter ───────────────
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ── Get initials ──────────────────────────
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

// ── Discount percentage ───────────────────
export const getDiscountPercent = (price, compareAtPrice) => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

// ── File size formatter ───────────────────
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k    = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i    = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ── Check image file ──────────────────────
export const isImageFile = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];
  return allowedTypes.includes(file?.type);
};

// ── Debounce ──────────────────────────────
export const debounce = (fn, delay = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// ── Deep clone ────────────────────────────
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// ── Get primary image ─────────────────────
export const getPrimaryImage = (images = []) => {
  if (!images.length) return null;
  return (
    images.find((img) => img.isPrimary) || images[0]
  );
};

// ── Class names helper ────────────────────
export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// ── Stock status label ────────────────────
export const getStockLabel = (product) => {
  if (!product.trackInventory) return { label: "In Stock",   color: "success" };
  if (product.stock === 0)     return { label: "Out of Stock", color: "error" };
  if (product.stock <= product.lowStockThreshold) {
    return { label: `Low Stock (${product.stock})`, color: "warning" };
  }
  return { label: "In Stock", color: "success" };
};

// ── Role label ────────────────────────────
export const getRoleLabel = (role) => {
  const labels = {
    superadmin:  "Super Admin",
    admin:       "Admin",
    clientadmin: "Client Admin",
  };
  return labels[role] || role;
};

// ── Plan label ────────────────────────────
export const getPlanLabel = (plan) => {
  const labels = {
    free:         "Free",
    basic:        "Basic",
    professional: "Professional",
    enterprise:   "Enterprise",
  };
  return labels[plan] || plan;
};

// ── Section type label ────────────────────
export const getSectionTypeLabel = (type) => {
  const labels = {
    hero:         "Hero Banner",
    features:     "Features",
    testimonials: "Testimonials",
    banner:       "Promo Banner",
    stats:        "Stats / Numbers",
    gallery:      "Gallery",
    faq:          "FAQ",
    newsletter:   "Newsletter",
    products:     "Products Grid",
    custom:       "Custom HTML",
  };
  return labels[type] || type;
};