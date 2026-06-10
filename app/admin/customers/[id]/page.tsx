"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, Calendar, ShoppingBag, Loader2,
  ShieldCheck, CheckCircle, Package,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-purple-100 text-purple-700",
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ orderCount: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCustomer(data.customer);
          setOrders(data.orders);
          setStats(data.stats);
        } else {
          toast.error(data.message || "Customer not found");
        }
      })
      .catch(() => toast.error("Failed to load customer"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="bg-white h-16 flex items-center px-6 border-b border-[var(--color-border)] sticky top-0 z-10">
          <Link
            href="/admin/customers"
            className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] text-sm font-medium"
          >
            <ArrowLeft size={18} /> Back to Customers
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="animate-spin text-[#00A86B]" />
          </div>
        ) : !customer ? (
          <div className="text-center py-32">
            <p className="text-[#64748B]">Customer not found.</p>
          </div>
        ) : (
          <div className="p-6 grid lg:grid-cols-3 gap-6">
            {/* Profile */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-black flex items-center justify-center flex-shrink-0">
                    {customer.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-[#0F172A] truncate flex items-center gap-1.5">
                      {customer.name}
                      {customer.role === "admin" && (
                        <ShieldCheck size={16} className="text-primary-600" />
                      )}
                    </h2>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        customer.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {customer.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-[#475569]">
                    <Mail size={15} className="text-[#94A3B8]" /> {customer.email}
                    {customer.isVerified && (
                      <CheckCircle size={14} className="text-primary-600" />
                    )}
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-[#475569]">
                      <Phone size={15} className="text-[#94A3B8]" /> {customer.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#475569]">
                    <Calendar size={15} className="text-[#94A3B8]" /> Joined {formatDate(customer.createdAt)}
                  </div>
                  {customer.lastLogin && (
                    <div className="flex items-center gap-2 text-[#475569]">
                      <Calendar size={15} className="text-[#94A3B8]" /> Last login {formatDate(customer.lastLogin)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm">
                  <p className="text-2xl font-black text-[#0F172A]">{stats.orderCount}</p>
                  <p className="text-xs text-[#64748B] mt-1">Total Orders</p>
                </div>
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm">
                  <p className="text-2xl font-black text-[#0F172A]">{formatPrice(stats.totalSpent)}</p>
                  <p className="text-xs text-[#64748B] mt-1">Total Spent</p>
                </div>
              </div>
            </div>

            {/* Order history */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 p-5 border-b border-[var(--color-border)]">
                  <ShoppingBag size={18} className="text-primary-600" />
                  <h3 className="font-bold text-[#0F172A]">Order History</h3>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={40} className="mx-auto text-[#94A3B8] mb-3" />
                    <p className="text-[#64748B]">No orders yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] text-left text-[#64748B]">
                          <th className="px-5 py-3 font-semibold">Order ID</th>
                          <th className="px-5 py-3 font-semibold">Items</th>
                          <th className="px-5 py-3 font-semibold">Total</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Payment</th>
                          <th className="px-5 py-3 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr
                            key={o._id}
                            className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50"
                          >
                            <td className="px-5 py-3">
                              <Link
                                href={`/admin/orders/${o._id}`}
                                className="font-semibold text-primary-600 hover:text-primary-700"
                              >
                                {o.orderId}
                              </Link>
                            </td>
                            <td className="px-5 py-3 text-[#475569]">
                              {o.items.reduce((n, it) => n + it.quantity, 0)} item(s)
                            </td>
                            <td className="px-5 py-3 font-medium text-[#0F172A]">{formatPrice(o.totalAmount)}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[o.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                                {o.orderStatus.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[o.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                                {o.paymentStatus}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-[#64748B]">{formatDate(o.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
