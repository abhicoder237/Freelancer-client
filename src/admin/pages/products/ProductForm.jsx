import { useState, useEffect }    from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm }                from "react-hook-form";
import { useQuery, useMutation }  from "@tanstack/react-query";
import toast                      from "react-hot-toast";
import productService             from "@services/productService.js";
import clientService              from "@services/clientService.js";
import { useClient }              from "@context/ClientContext.jsx";
import { useAuth }                from "@context/AuthContext.jsx";
import { ROUTES }                 from "@constants/api.js";
import { Button, Input, Textarea, Select } from "@components/index.js";
import { Spinner }                from "@components/Loader.jsx";

const ProductForm = () => {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const isEdit      = !!id;
  const { clientId } = useClient();
  const { user }    = useAuth();

  const [images,         setImages]         = useState([]);
  const [uploadingImgs,  setUploadingImgs]  = useState(false);
  const [tags,           setTags]           = useState([]);
  const [tagInput,       setTagInput]       = useState("");
  const [selectedClient, setSelectedClient] = useState(clientId || "");

  // ── Fetch clients for admin/superadmin ───
  const { data: clientsRes } = useQuery({
    queryKey: ["clients-list"],
    queryFn:  () => clientService.getAllClients({ limit: 100 }),
    enabled:  user?.role !== "clientadmin",
  });
  const allClients = clientsRes?.data || [];

  // ── Form ─────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name:             "",
      description:      "",
      shortDescription: "",
      category:         "",
      subcategory:      "",
      price:            "",
      compareAtPrice:   "",
      sku:              "",
      stock:            0,
      status:           "draft",
      isFeatured:       false,
      trackInventory:   true,
      isFreeShipping:   false,
      currency:         "INR",
    },
  });

  // ── Fetch product if editing ─────────────
  const { isLoading: isFetching } = useQuery({
    queryKey: ["product", id],
    queryFn:  () => productService.getProduct(id),
    enabled:  isEdit,
    onSuccess: (res) => {
      if (res?.data) {
        const p = res.data;
        reset({
          name:             p.name             || "",
          description:      p.description      || "",
          shortDescription: p.shortDescription || "",
          category:         p.category         || "",
          subcategory:      p.subcategory       || "",
          price:            p.price             || "",
          compareAtPrice:   p.compareAtPrice    || "",
          sku:              p.sku               || "",
          stock:            p.stock             || 0,
          status:           p.status            || "draft",
          isFeatured:       p.isFeatured        || false,
          trackInventory:   p.trackInventory    ?? true,
          isFreeShipping:   p.isFreeShipping    || false,
          currency:         p.currency          || "INR",
        });
        setImages(p.images   || []);
        setTags(p.tags       || []);
        setSelectedClient(p.client?.toString() || clientId || "");
      }
    },
  });

  // ── Create mutation ──────────────────────
  const createMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      toast.success("Product created successfully!");
      navigate(ROUTES.ADMIN_PRODUCTS);
    },
    onError: (err) => toast.error(err.message || "Failed to create product."),
  });

  // ── Update mutation ──────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      navigate(ROUTES.ADMIN_PRODUCTS);
    },
    onError: (err) => toast.error(err.message || "Failed to update product."),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ── Submit ───────────────────────────────
  const onSubmit = (data) => {
    // Validate client selection for admin
    if (user?.role !== "clientadmin" && !selectedClient) {
      toast.error("Please select a client for this product.");
      return;
    }

    const payload = {
      name:             data.name,
      description:      data.description,
      shortDescription: data.shortDescription || undefined,
      category:         data.category,
      subcategory:      data.subcategory      || undefined,
      price:            parseFloat(data.price),
      compareAtPrice:   data.compareAtPrice
                          ? parseFloat(data.compareAtPrice)
                          : undefined,
      stock:            parseInt(data.stock)  || 0,
      sku:              data.sku              || undefined,
      status:           data.status           || "draft",
      isFeatured:       data.isFeatured       || false,
      trackInventory:   data.trackInventory   ?? true,
      isFreeShipping:   data.isFreeShipping   || false,
      currency:         data.currency         || "INR",
      tags,
      // ✅ Client ID explicitly bhejo
      ...(user?.role !== "clientadmin" && selectedClient
        ? { client: selectedClient }
        : {}),
    };

    if (isEdit) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // ── Image upload ─────────────────────────
  const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  // ── Client side validation ───────────────
  if (images.length + files.length > 10) {
    toast.error("Maximum 10 images allowed.");
    return;
  }

  // ── File type check on frontend ──────────
  const allowedTypes = [
    "image/jpeg", "image/jpg", "image/png",
    "image/webp", "image/svg+xml", "image/avif",
    "image/heic", "image/heif",
  ];

  const invalidFiles = files.filter(
    (f) => !allowedTypes.includes(f.type)
  );

  if (invalidFiles.length > 0) {
    toast.error(
      `Invalid file type: ${invalidFiles[0].name}. Use JPG, PNG, WEBP, or AVIF.`
    );
    return;
  }

  // ── Size check ───────────────────────────
  const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    toast.error("File too large. Maximum 10MB per image.");
    return;
  }

  setUploadingImgs(true);

  try {
    if (isEdit) {
      // ── Upload to server ─────────────────
      const res = await productService.addImages(id, files);
      if (res?.data?.images) {
        setImages(res.data.images);
        toast.success(`${files.length} image(s) uploaded successfully!`);
      }
    } else {
      // ── Local preview before save ────────
      const previews = files.map((file, index) => ({
        url:       URL.createObjectURL(file),
        publicId:  "",
        file,
        isPrimary: images.length === 0 && index === 0,
      }));
      setImages((prev) => [...prev, ...previews]);
      toast.success(`${files.length} image(s) added. Save product to upload.`);
    }
  } catch (err) {
    console.error("Image upload error:", err);
    toast.error(
      err?.message || "Image upload failed. Please try again."
    );
  } finally {
    setUploadingImgs(false);
    // ── Reset file input ─────────────────
    e.target.value = "";
  }
};
  // ── Tags ─────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 20) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  if (isEdit && isFetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--color-text-secondary)" }}
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            {isEdit ? "Update product details" : "Fill in the details to create a new product"}
          </p>
        </div>
      </div>

      {/* ── Client Selector — admin/superadmin only ── */}
      {user?.role !== "clientadmin" && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Select Client *
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            style={{ width: "100%", maxWidth: "350px", padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
          >
            <option value="">-- Select Client --</option>
            {allClients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
          {!selectedClient && (
            <p style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.375rem" }}>
              Please select a client for this product.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>

          {/* ── Left Column ─────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Basic Info */}
            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Basic Information
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Input
                  label="Product Name"
                  placeholder="e.g. Nike Air Zoom Running Shoes"
                  required
                  error={errors.name?.message}
                  {...register("name", {
                    required: "Product name is required",
                    minLength: { value: 2, message: "Min 2 characters" },
                  })}
                />
                <Textarea
                  label="Description"
                  placeholder="Detailed product description..."
                  rows={4}
                  required
                  error={errors.description?.message}
                  {...register("description", {
                    required: "Description is required",
                  })}
                />
                <Textarea
                  label="Short Description"
                  placeholder="Brief summary shown in product cards..."
                  rows={2}
                  hint="Max 300 characters"
                  {...register("shortDescription")}
                />
              </div>
            </div>

            {/* Category */}
            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Category
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Category"
                  placeholder="e.g. footwear"
                  required
                  error={errors.category?.message}
                  {...register("category", { required: "Category is required" })}
                />
                <Input
                  label="Subcategory"
                  placeholder="e.g. running shoes"
                  {...register("subcategory")}
                />
              </div>
            </div>

            {/* Pricing */}
            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Pricing
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Price"
                  type="number"
                  placeholder="0.00"
                  required
                  error={errors.price?.message}
                  leftIcon="₹"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" },
                  })}
                />
                <Input
                  label="Compare At Price"
                  type="number"
                  placeholder="0.00"
                  hint="Original price (for discount)"
                  leftIcon="₹"
                  {...register("compareAtPrice")}
                />
                <Select
                  label="Currency"
                  options={[
                    { value: "INR", label: "INR ₹" },
                    { value: "USD", label: "USD $" },
                    { value: "EUR", label: "EUR €" },
                  ]}
                  {...register("currency")}
                />
              </div>
            </div>

            {/* Inventory */}
            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Inventory
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="SKU"
                  placeholder="e.g. SZ-SHOE-001"
                  hint="Stock Keeping Unit"
                  {...register("sku")}
                />
                <Input
                  label="Stock Quantity"
                  type="number"
                  placeholder="0"
                  {...register("stock", {
                    min: { value: 0, message: "Stock cannot be negative" },
                  })}
                />
              </div>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                  <input type="checkbox" {...register("trackInventory")} />
                  Track Inventory
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                  <input type="checkbox" {...register("isFreeShipping")} />
                  Free Shipping
                </label>
              </div>
            </div>

            {/* Tags */}
            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Tags
              </h2>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag and press Enter"
                  style={{ flex: 1, padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
                />
                <Button size="sm" variant="outline" onClick={addTag} type="button">
                  Add
                </Button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.6rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "9999px", fontSize: "0.8rem", color: "var(--color-text-primary)" }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "0.75rem", lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column ────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Status */}
            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Status
              </h2>
              <Select
                label="Product Status"
                options={[
                  { value: "draft",    label: "Draft" },
                  { value: "active",   label: "Active" },
                  { value: "archived", label: "Archived" },
                ]}
                {...register("status")}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                <input type="checkbox" {...register("isFeatured")} />
                <span>⭐ Mark as Featured</span>
              </label>
            </div>

            {/* Images */}
            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Images
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: "normal", marginLeft: "0.5rem" }}>
                  ({images.length}/10)
                </span>
              </h2>

              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", border: "2px dashed var(--color-border)", borderRadius: "10px", cursor: "pointer", marginBottom: "1rem" }}>
                {uploadingImgs ? (
                  <Spinner size="md" />
                ) : (
                  <>
                    <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📸</span>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", textAlign: "center" }}>
                      Click to upload images
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                      JPG, PNG, WEBP — Max 5MB each
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  disabled={uploadingImgs || images.length >= 10}
                />
              </label>

              {images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {images.map((img, index) => (
                    <div
                      key={index}
                      style={{ position: "relative", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", border: img.isPrimary ? "2px solid var(--color-primary)" : "1px solid var(--color-border)" }}
                    >
                      <img
                        src={img.url}
                        alt={"Product " + (index + 1)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {img.isPrimary && (
                        <div style={{ position: "absolute", top: "4px", left: "4px", background: "var(--color-primary)", color: "#fff", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                          Primary
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img, index)}
                        style={{ position: "absolute", top: "4px", right: "4px", width: "1.5rem", height: "1.5rem", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", color: "#fff", cursor: "pointer", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                size="lg"
                disabled={user?.role !== "clientadmin" && !selectedClient}
              >
                {isSubmitting
                  ? (isEdit ? "Updating..." : "Creating...")
                  : (isEdit ? "Update Product" : "Create Product")
                }
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;