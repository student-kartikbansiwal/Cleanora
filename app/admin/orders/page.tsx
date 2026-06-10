"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag, Search, ChevronLeft, ChevronRight,
  Eye, CheckCircle, Truck, XCircle, Clock, Package
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Order {
  _id: string;
  orderId: string;
  user: { name: string; email: string };
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: { name: string; quantity: number }[];
  createdAt: string;
}

const STATUS_OPTIONS = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  cod: "bg-gray-100 text-gray-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  placed: <Package size={14} />,
  confirmed: <CheckCircle size={14} />,
  processing: <Clock size={14} />,
  shipped: <Truck size={14} />,
  delivered: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        toast.success("Order status updated");
      }
    } catch {
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white h-16 flex items-center px-6 border-b border-[var(--color-border)] sticky top-0 z-10">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#0F172A]">Orders</h1>
            <p className="text-xs text-[#64748B]">{total} total orders</p>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 mb-5 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by Order ID, customer..."
                className="input-field pl-9 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-2 pr-8 w-auto"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-[#00A86B] border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag size={48} className="mx-auto text-[#94A3B8] mb-4" />
                <h3 className="text-lg font-semibold text-[#0F172A]">No orders found</h3>
                <p className="text-[#64748B]">Try changing your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Order</th>
                      <th className="px-5 py-3 text-left">Customer</th>
                      <th className="px-5 py-3 text-left">Items</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Payment</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {orders.map((order, i) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <span className="font-mono text-sm font-semibold text-[#00A86B]">
                            #{order.orderId}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">{order.user?.name}</p>
                            <p className="text-xs text-[#64748B]">{order.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-[#64748B]">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-sm text-[#0F172A]">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`badge text-[10px] capitalize ${STATUS_COLORS[order.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-700"}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          <span className="sr-only">{STATUS_ICONS[order.orderStatus]}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#64748B]">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/orders/${order._id}`}
                              className="p-1.5 rounded-lg text-[#64748B] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="View Order"
                            >
                              <Eye size={15} />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[#64748B]">
                      Page {page} of {totalPages} · {total} orders
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-gray-50 disabled:opacity-40"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-medium">{page} / {totalPages}</span>
                      <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-gray-50 disabled:opacity-40"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
