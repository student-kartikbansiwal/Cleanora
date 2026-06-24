"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Plus, Search, Trash2, Edit2, Check, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  description?: string;
}

const EMPTY_FORM = {
  code: "",
  type: "percentage" as "percentage" | "flat",
  value: 10,
  minOrderAmount: 0,
  maxDiscountAmount: undefined as number | undefined,
  usageLimit: 100,
  validFrom: new Date().toISOString().slice(0, 16),
  validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true,
  description: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/coupons?${params}`);
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          validFrom: new Date(form.validFrom).toISOString(),
          validTo: new Date(form.validTo).toISOString(),
          value: Number(form.value),
          minOrderAmount: Number(form.minOrderAmount),
          maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
          usageLimit: Number(form.usageLimit),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Coupon updated!" : "Coupon created!");
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to save coupon");
      }
    } catch {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Coupon deleted");
      fetchCoupons();
    } else {
      toast.error("Failed to delete");
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    const data = await res.json();
    if (data.success) {
      fetchCoupons();
      toast.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}`);
    }
  };

  const now = new Date();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Coupons</h1>
          <p className="text-sm text-muted-foreground">{total} total coupons</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="btn-outline text-sm py-2">← Dashboard</Link>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Create Coupon
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-primary-200 p-6">
          <h2 className="font-bold text-navy-700 mb-5">
            {editingId ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE20"
                className="input-field"
                required
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "percentage" | "flat" }))}
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">
                Value * {form.type === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: parseFloat(e.target.value) }))}
                min={1}
                max={form.type === "percentage" ? 100 : undefined}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: parseFloat(e.target.value) }))}
                min={0}
                className="input-field"
              />
            </div>
            {form.type === "percentage" && (
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1">Max Discount (₹)</label>
                <input
                  type="number"
                  value={form.maxDiscountAmount || ""}
                  onChange={(e) => setForm((p) => ({ ...p, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="No limit"
                  min={1}
                  className="input-field"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm((p) => ({ ...p, usageLimit: parseInt(e.target.value) }))}
                min={1}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Valid From *</label>
              <input
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Valid To *</label>
              <input
                type="datetime-local"
                value={form.validTo}
                onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
                className="input-field"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-navy-700">Active</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editingId ? "Update" : "Create"} Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchCoupons()}
            placeholder="Search coupons..."
            className="input-field pl-9"
          />
        </div>
        <button onClick={fetchCoupons} className="btn-outline">Search</button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={48} className="text-primary-200 mx-auto mb-4" />
            <p className="text-muted-foreground">No coupons yet. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Code</th>
                  <th className="px-6 py-3 text-left">Discount</th>
                  <th className="px-6 py-3 text-left">Min Order</th>
                  <th className="px-6 py-3 text-left">Usage</th>
                  <th className="px-6 py-3 text-left">Validity</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.validTo) < now;
                  const isExhausted = coupon.usedCount >= coupon.usageLimit;
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-navy-700 bg-gray-100 px-2.5 py-1 rounded-lg text-sm">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-primary-600">
                          {coupon.type === "percentage" ? `${coupon.value}%` : formatPrice(coupon.value)}
                          {coupon.maxDiscountAmount && coupon.type === "percentage" && (
                            <span className="text-xs text-muted-foreground ml-1">
                              (max {formatPrice(coupon.maxDiscountAmount)})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-700">
                        {coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className={isExhausted ? "text-red-600 font-semibold" : "text-navy-700"}>
                            {coupon.usedCount}
                          </span>
                          <span className="text-muted-foreground">/{coupon.usageLimit}</span>
                        </div>
                        <div className="mt-1 w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isExhausted ? "bg-red-500" : "bg-primary-500"}`}
                            style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-muted-foreground">
                          {new Date(coupon.validFrom).toLocaleDateString("en-IN")} –
                        </p>
                        <p className={`text-xs font-medium ${isExpired ? "text-red-600" : "text-green-600"}`}>
                          {new Date(coupon.validTo).toLocaleDateString("en-IN")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleActive(coupon)}>
                          <span className={`badge text-xs ${coupon.isActive && !isExpired && !isExhausted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {isExpired ? "Expired" : isExhausted ? "Exhausted" : coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(coupon._id);
                              setForm({
                                code: coupon.code,
                                type: coupon.type,
                                value: coupon.value,
                                minOrderAmount: coupon.minOrderAmount,
                                maxDiscountAmount: coupon.maxDiscountAmount,
                                usageLimit: coupon.usageLimit,
                                validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
                                validTo: new Date(coupon.validTo).toISOString().slice(0, 16),
                                isActive: coupon.isActive,
                                description: coupon.description || "",
                              });
                              setShowForm(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id, coupon.code)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
