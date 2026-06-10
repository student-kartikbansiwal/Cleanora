"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Search, ChevronLeft, ChevronRight, Eye, Loader2,
  Mail, Phone, ShieldCheck,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 15;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.message || "Failed to load customers");
      }
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white h-16 flex items-center px-6 border-b border-[var(--color-border)] sticky top-0 z-10">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#0F172A]">Customers</h1>
            <p className="text-xs text-[#64748B]">{total} total customers</p>
          </div>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 mb-5 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, phone..."
                className="input-field pl-9 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-[#00A86B]" />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-20">
                <Users size={48} className="mx-auto text-[#94A3B8] mb-4" />
                <p className="text-[#64748B]">No customers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-[#64748B]">
                      <th className="px-5 py-3 font-semibold">Customer</th>
                      <th className="px-5 py-3 font-semibold">Contact</th>
                      <th className="px-5 py-3 font-semibold">Orders</th>
                      <th className="px-5 py-3 font-semibold">Total Spent</th>
                      <th className="px-5 py-3 font-semibold">Joined</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <motion.tr
                        key={c._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center flex-shrink-0">
                              {c.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#0F172A] truncate flex items-center gap-1.5">
                                {c.name}
                                {c.role === "admin" && (
                                  <ShieldCheck size={14} className="text-primary-600" />
                                )}
                              </p>
                              {!c.isActive && (
                                <span className="text-[11px] text-red-600 font-medium">Disabled</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[#475569]">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Mail size={13} className="text-[#94A3B8]" /> {c.email}
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-1.5 text-xs mt-0.5">
                              <Phone size={13} className="text-[#94A3B8]" /> {c.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 font-medium text-[#0F172A]">{c.orderCount}</td>
                        <td className="px-5 py-3 font-medium text-[#0F172A]">{formatPrice(c.totalSpent)}</td>
                        <td className="px-5 py-3 text-[#64748B]">{formatDate(c.createdAt)}</td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/admin/customers/${c._id}`}
                            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                          >
                            <Eye size={16} /> View
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-sm text-[#64748B]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-[var(--color-border)] bg-white disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-[var(--color-border)] bg-white disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
