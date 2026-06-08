"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Plus,
  X,
  Upload,
  Loader2,
  ImageIcon,
  Star,
  Zap,
  ChevronDown,
  Check,
  Info,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";

// ─── Shared types (exported so pages can import) ──────────────────────────────

export interface ProductImage {
  url: string;
  publicId: string;
  alt: string;
}

export interface Specification {
  key: string;
  value: string;
}

export interface ProductPayload {
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  sku: string;
  stock: number;
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  images: ProductImage[];
  benefits: string[];
  specifications: Specification[];
  usageGuide: string;
  volume: string;
  ingredients: string;
  metaTitle: string;
  metaDescription: string;
}

/** Shape returned by GET /api/admin/products/[id] */
export interface InitialProduct {
  _id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: { _id: string; name: string } | string;
  sku: string;
  stock: number;
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  images: ProductImage[];
  benefits: string[];
  specifications: Specification[];
  usageGuide: string;
  volume?: string;
  ingredients?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: InitialProduct;
  onSubmit: (data: ProductPayload) => Promise<void>;
}

// ─── Internal form state ──────────────────────────────────────────────────────

interface FormState {
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  comparePrice: string;
  category: string;
  sku: string;
  stock: string;
  tags: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  images: ProductImage[];
  benefits: string[];
  specifications: Specification[];
  usageGuide: string;
  volume: string;
  ingredients: string;
  metaTitle: string;
  metaDescription: string;
}

interface FormErrors {
  name?: string;
  shortDescription?: string;
  description?: string;
  price?: string;
  category?: string;
  sku?: string;
  stock?: string;
  images?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductForm({
  mode,
  initialData,
  onSubmit,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugPreview, setSlugPreview] = useState("");

  // Resolve initial category _id whether it arrives as object or plain string
  const initialCategoryId =
    initialData?.category && typeof initialData.category === "object"
      ? (initialData.category as { _id: string; name: string })._id
      : (initialData?.category as string | undefined) ?? "";

  const [form, setFormState] = useState<FormState>({
    name: initialData?.name ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price?.toString() ?? "",
    comparePrice: initialData?.comparePrice?.toString() ?? "",
    category: initialCategoryId,
    sku: initialData?.sku ?? "",
    stock: initialData?.stock?.toString() ?? "0",
    tags: initialData?.tags?.join(", ") ?? "",
    isFeatured: initialData?.isFeatured ?? false,
    isBestSeller: initialData?.isBestSeller ?? false,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    images: initialData?.images ?? [],
    benefits:
      initialData?.benefits && initialData.benefits.length > 0
        ? initialData.benefits
        : [""],
    specifications:
      initialData?.specifications && initialData.specifications.length > 0
        ? initialData.specifications
        : [{ key: "", value: "" }],
    usageGuide: initialData?.usageGuide ?? "",
    volume: initialData?.volume ?? "",
    ingredients: initialData?.ingredients ?? "",
    metaTitle: initialData?.metaTitle ?? "",
    metaDescription: initialData?.metaDescription ?? "",
  });

  // ── Load categories from DB ──────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
        else toast.error("Could not load categories");
      })
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoadingCategories(false));
  }, []);

  // ── Slug preview ─────────────────────────────────────────────────────────

  useEffect(() => {
    setSlugPreview(slugify(form.name));
  }, [form.name]);

  // ── Generic field setter (generic to keep TypeScript happy) ───────────────

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof FormErrors]: undefined,
      }));
    }
  }

  // ── Image upload ─────────────────────────────────────────────────────────

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    // Reset so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";

    setUploadingImage(true);
    const newImages: ProductImage[] = [];

    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "cleanora/products");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.success) {
          newImages.push({
            url: data.url,
            publicId: data.publicId,
            alt: form.name || file.name,
          });
        } else {
          toast.error(data.message ?? "Upload failed");
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setFormState((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
    if (newImages.length > 0 && errors.images) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
    setUploadingImage(false);
  };

  const removeImage = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // ── Benefits ─────────────────────────────────────────────────────────────

  const addBenefit = () =>
    setFormState((prev) => ({ ...prev, benefits: [...prev.benefits, ""] }));

  const removeBenefit = (i: number) =>
    setFormState((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, idx) => idx !== i),
    }));

  const setBenefit = (i: number, val: string) =>
    setFormState((prev) => {
      const b = [...prev.benefits];
      b[i] = val;
      return { ...prev, benefits: b };
    });

  // ── Specifications ────────────────────────────────────────────────────────

  const addSpec = () =>
    setFormState((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));

  const removeSpec = (i: number) =>
    setFormState((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, idx) => idx !== i),
    }));

  const setSpec = (i: number, field: "key" | "value", val: string) =>
    setFormState((prev) => {
      const s = [...prev.specifications];
      s[i] = { ...s[i], [field]: val };
      return { ...prev, specifications: s };
    });

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (
      !form.shortDescription.trim() ||
      form.shortDescription.trim().length < 10
    )
      errs.shortDescription =
        "Short description must be at least 10 characters";
    if (!form.description.trim() || form.description.trim().length < 10)
      errs.description = "Description must be at least 10 characters";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = "Price must be a positive number";
    if (!form.category) errs.category = "Please select a category";
    if (!form.sku.trim()) errs.sku = "SKU is required";
    if (
      form.stock === "" ||
      isNaN(Number(form.stock)) ||
      Number(form.stock) < 0
    )
      errs.stock = "Stock must be 0 or more";
    if (form.images.length === 0)
      errs.images = "At least one product image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before saving");
      // Scroll to first error
      document
        .querySelector("[data-field-error]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const payload: ProductPayload = {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        ...(form.comparePrice &&
        !isNaN(Number(form.comparePrice)) &&
        Number(form.comparePrice) > 0
          ? { comparePrice: Number(form.comparePrice) }
          : {}),
        category: form.category,
        sku: form.sku.trim().toUpperCase(),
        stock: Number(form.stock),
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean)
          : [],
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isActive: form.isActive,
        images: form.images,
        benefits: form.benefits.filter((b) => b.trim()),
        specifications: form.specifications.filter(
          (s) => s.key.trim() && s.value.trim()
        ),
        usageGuide: form.usageGuide.trim(),
        volume: form.volume.trim(),
        ingredients: form.ingredients.trim(),
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
      };
      await onSubmit(payload);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Slim sidebar — matches existing admin/products/page.tsx pattern */}
      <aside className="w-16 bg-[#0F172A] flex-shrink-0 flex flex-col items-center py-4 gap-4">
        <Link
          href="/admin/products"
          className="text-white/60 hover:text-white transition-colors"
          title="Back to Products"
        >
          <ArrowLeft size={20} />
        </Link>
        <Link
          href="/admin/products"
          className="text-[#00A86B]"
          title="Products"
        >
          <Package size={20} />
        </Link>
      </aside>

      {/* Main scroll area */}
      <div className="flex-1 overflow-auto">
        {/* Sticky header */}
        <div className="bg-white h-16 flex items-center px-6 border-b border-[var(--color-border)] sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#0F172A]">
              {mode === "create" ? "Add New Product" : "Edit Product"}
            </h1>
            {form.name && (
              <p className="text-xs text-[#64748B] truncate">
                Slug:{" "}
                <span className="font-mono text-[#00A86B]">{slugPreview}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/admin/products"
              className="btn-outline text-sm py-2 px-4"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="product-form"
              disabled={submitting || uploadingImage}
              className="btn-primary text-sm py-2 px-5 flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {mode === "create" ? "Create Product" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Form */}
        <form id="product-form" onSubmit={handleSubmit} noValidate>
          <div className="p-6 max-w-5xl mx-auto space-y-6 pb-16">
            {/* ── 1. Basic Information ── */}
            <FormSection title="Basic Information" icon={<Package size={15} />}>
              <div className="space-y-4">
                <Field label="Product Name *" error={errors.name}>
                  <input
                    id="field-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Ultra Clean Multi-Surface Spray"
                    className={`input-field ${errors.name ? "border-red-400 focus:border-red-400 focus:shadow-none" : ""}`}
                  />
                </Field>

                <Field
                  label="Short Description *"
                  error={errors.shortDescription}
                  hint={`${form.shortDescription.length}/300`}
                >
                  <textarea
                    id="field-shortdesc"
                    value={form.shortDescription}
                    onChange={(e) => set("shortDescription", e.target.value)}
                    placeholder="A brief, compelling description shown on product cards (max 300 chars)"
                    maxLength={300}
                    rows={2}
                    className={`input-field resize-none ${errors.shortDescription ? "border-red-400" : ""}`}
                  />
                </Field>

                <Field label="Full Description *" error={errors.description}>
                  <textarea
                    id="field-desc"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Full product description with details, features, and benefits..."
                    rows={6}
                    className={`input-field resize-y ${errors.description ? "border-red-400" : ""}`}
                  />
                </Field>
              </div>
            </FormSection>

            {/* ── 2. Pricing & Inventory ── */}
            <FormSection
              title="Pricing & Inventory"
              icon={<Zap size={15} />}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Price (₹) *" error={errors.price}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="299"
                    className={`input-field ${errors.price ? "border-red-400" : ""}`}
                  />
                </Field>
                <Field
                  label="Compare Price (₹)"
                  hint="Crossed-out original price"
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.comparePrice}
                    onChange={(e) => set("comparePrice", e.target.value)}
                    placeholder="399"
                    className="input-field"
                  />
                </Field>
                <Field label="SKU *" error={errors.sku}>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value.toUpperCase())}
                    placeholder="CLN-001"
                    className={`input-field font-mono tracking-wide ${errors.sku ? "border-red-400" : ""}`}
                  />
                </Field>
                <Field label="Stock *" error={errors.stock}>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    placeholder="100"
                    className={`input-field ${errors.stock ? "border-red-400" : ""}`}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-1">
                  <Field label="Category *" error={errors.category}>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => set("category", e.target.value)}
                        disabled={loadingCategories}
                        className={`input-field appearance-none pr-9 ${errors.category ? "border-red-400" : ""} ${loadingCategories ? "opacity-60" : ""}`}
                      >
                        <option value="">
                          {loadingCategories
                            ? "Loading categories…"
                            : "Select category"}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {loadingCategories ? (
                        <Loader2
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] animate-spin pointer-events-none"
                        />
                      ) : (
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                        />
                      )}
                    </div>
                  </Field>
                </div>
                <div className="md:col-span-1">
                  <Field label="Volume / Size" hint="e.g. 500ml, 1L">
                    <input
                      type="text"
                      value={form.volume}
                      onChange={(e) => set("volume", e.target.value)}
                      placeholder="500ml"
                      className="input-field"
                    />
                  </Field>
                </div>
                <div className="md:col-span-1">
                  <Field
                    label="Tags"
                    hint="Comma-separated"
                  >
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => set("tags", e.target.value)}
                      placeholder="cleaning, kitchen, eco-friendly"
                      className="input-field"
                    />
                  </Field>
                </div>
              </div>

              {/* Status toggles */}
              <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-[var(--color-border)]">
                <StatusToggle
                  label="Active"
                  description="Visible in store"
                  checked={form.isActive}
                  onChange={(v) => set("isActive", v)}
                  color="green"
                />
                <StatusToggle
                  label="Featured"
                  description="Show on homepage"
                  checked={form.isFeatured}
                  onChange={(v) => set("isFeatured", v)}
                  color="amber"
                />
                <StatusToggle
                  label="Best Seller"
                  description="Mark as bestseller"
                  checked={form.isBestSeller}
                  onChange={(v) => set("isBestSeller", v)}
                  color="blue"
                />
              </div>
            </FormSection>

            {/* ── 3. Product Images ── */}
            <FormSection
              title="Product Images"
              icon={<ImageIcon size={15} />}
            >
              {errors.images && (
                <div
                  data-field-error
                  className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl"
                >
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {errors.images}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {form.images.map((img, i) => (
                  <motion.div
                    key={img.publicId + i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-[var(--color-border)] group bg-gray-50"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || "Product image"}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#00A86B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
                        MAIN
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow"
                      title="Remove image"
                    >
                      <X size={11} />
                    </button>
                  </motion.div>
                ))}

                {/* Upload trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[#00A86B] hover:bg-[#E6FFF5] transition-all flex flex-col items-center justify-center gap-2 text-[#94A3B8] hover:text-[#00A86B] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      <span className="text-[10px] font-medium">
                        Uploading…
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span className="text-[10px] font-medium text-center px-1">
                        Add Image
                      </span>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs text-[#94A3B8]">
                JPEG · PNG · WebP · GIF &nbsp;|&nbsp; Max 5 MB per file
                &nbsp;|&nbsp; First image becomes the main display image
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </FormSection>

            {/* ── 4. Benefits ── */}
            <FormSection title="Key Benefits" icon={<Star size={15} />}>
              <div className="space-y-2">
                {form.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <GripVertical
                      size={14}
                      className="text-[#CBD5E1] flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => setBenefit(i, e.target.value)}
                      placeholder={`Benefit ${i + 1} — e.g. "Kills 99.9% of germs"`}
                      className="input-field flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeBenefit(i)}
                      disabled={form.benefits.length === 1}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addBenefit}
                className="mt-3 flex items-center gap-1.5 text-sm text-[#00A86B] font-semibold hover:underline"
              >
                <Plus size={14} /> Add Benefit
              </button>
            </FormSection>

            {/* ── 5. Specifications ── */}
            <FormSection
              title="Specifications"
              icon={<Info size={15} />}
            >
              <div className="space-y-2">
                {form.specifications.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => setSpec(i, "key", e.target.value)}
                      placeholder="Property (e.g. Weight)"
                      className="input-field flex-1 text-sm"
                    />
                    <span className="text-[#94A3B8] font-bold">:</span>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => setSpec(i, "value", e.target.value)}
                      placeholder="Value (e.g. 500g)"
                      className="input-field flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(i)}
                      disabled={form.specifications.length === 1}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSpec}
                className="mt-3 flex items-center gap-1.5 text-sm text-[#00A86B] font-semibold hover:underline"
              >
                <Plus size={14} /> Add Specification
              </button>
            </FormSection>

            {/* ── 6. Additional Details ── */}
            <FormSection
              title="Additional Details"
              icon={<Info size={15} />}
            >
              <div className="space-y-4">
                <Field label="Usage Guide">
                  <textarea
                    value={form.usageGuide}
                    onChange={(e) => set("usageGuide", e.target.value)}
                    placeholder="Step-by-step instructions on how to use this product..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </Field>
                <Field label="Ingredients" hint="Optional">
                  <input
                    type="text"
                    value={form.ingredients}
                    onChange={(e) => set("ingredients", e.target.value)}
                    placeholder="e.g. Sodium Hypochlorite 3.5%, Water, Surfactants"
                    className="input-field"
                  />
                </Field>
              </div>
            </FormSection>

            {/* ── 7. SEO ── */}
            <FormSection title="SEO (Optional)" icon={<Info size={15} />}>
              <div className="space-y-4">
                <Field
                  label="Meta Title"
                  hint={`${form.metaTitle.length}/60`}
                >
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => set("metaTitle", e.target.value)}
                    maxLength={60}
                    placeholder="SEO title — defaults to product name if left blank"
                    className="input-field"
                  />
                </Field>
                <Field
                  label="Meta Description"
                  hint={`${form.metaDescription.length}/160`}
                >
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => set("metaDescription", e.target.value)}
                    maxLength={160}
                    placeholder="Brief SEO description for search engines..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </Field>
              </div>
            </FormSection>

            {/* ── Bottom action bar ── */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/admin/products"
                className="btn-outline py-2.5 px-6 text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="btn-primary py-2.5 px-8 text-sm flex items-center gap-2"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {mode === "create" ? "Create Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-7 h-7 bg-[#E6FFF5] rounded-lg flex items-center justify-center text-[#00A86B] flex-shrink-0">
          {icon}
        </span>
        <h2 className="font-semibold text-[#0F172A] text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div data-field-error={error ? true : undefined}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-[#0F172A]">{label}</label>
        {hint && <span className="text-xs text-[#94A3B8]">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

type ToggleColor = "green" | "amber" | "blue";

const TOGGLE_STYLES: Record<
  ToggleColor,
  { border: string; bg: string; dot: string }
> = {
  green: {
    border: "border-[#00A86B]",
    bg: "bg-[#E6FFF5]",
    dot: "border-[#00A86B] bg-[#00A86B]",
  },
  amber: {
    border: "border-amber-400",
    bg: "bg-amber-50",
    dot: "border-amber-500 bg-amber-500",
  },
  blue: {
    border: "border-blue-400",
    bg: "bg-blue-50",
    dot: "border-blue-500 bg-blue-500",
  },
};

function StatusToggle({
  label,
  description,
  checked,
  onChange,
  color = "green",
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: ToggleColor;
}) {
  const s = TOGGLE_STYLES[color];
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
        checked
          ? `${s.border} ${s.bg}`
          : "border-[var(--color-border)] bg-white hover:border-[#94A3B8]"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          checked ? s.dot : "border-[#94A3B8]"
        }`}
      >
        {checked && <Check size={10} className="text-white" />}
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
        <p className="text-xs text-[#64748B]">{description}</p>
      </div>
    </button>
  );
}
