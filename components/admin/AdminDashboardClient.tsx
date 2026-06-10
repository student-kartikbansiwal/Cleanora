"use client";

import { useState, useEffect } from "react";
import {
  Package, ShoppingBag, Users, Store,
  TrendingUp, DollarSign, ShoppingCart, UserPlus,
  ArrowUpRight, ArrowDownRight,
  Bell, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AnalyticsData {
  stats: {
    totalRevenue: number;
    monthRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    monthOrders: number;
    totalUsers: number;
    monthUsers: number;
    totalProducts: number;
    lowStockProducts: number;
  };
  revenueByDay: { _id: string; revenue: number; orders: number }[];
  ordersByStatus: { _id: string; count: number }[];
  recentOrders: {
    _id: string;
    orderId: string;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    user: { name: string; email: string };
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
};

const PIE_COLORS = ["#00A86B", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function AdminDashboardClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = data
    ? [
        {
          label: "Total Revenue",
          value: formatPrice(data.stats.totalRevenue),
          sub: `${formatPrice(data.stats.monthRevenue)} this month`,
          trend: data.stats.revenueGrowth,
          icon: DollarSign,
          color: "bg-primary-500",
          lightColor: "bg-primary-50",
          textColor: "text-primary-600",
        },
        {
          label: "Total Orders",
          value: data.stats.totalOrders.toLocaleString(),
          sub: `${data.stats.monthOrders} this month`,
          trend: 12,
          icon: ShoppingCart,
          color: "bg-blue-500",
          lightColor: "bg-blue-50",
          textColor: "text-blue-600",
        },
        {
          label: "Total Customers",
          value: data.stats.totalUsers.toLocaleString(),
          sub: `+${data.stats.monthUsers} this month`,
          trend: 8,
          icon: UserPlus,
          color: "bg-violet-500",
          lightColor: "bg-violet-50",
          textColor: "text-violet-600",
        },
        {
          label: "Active Products",
          value: data.stats.totalProducts.toLocaleString(),
          sub: `${data.stats.lowStockProducts} low stock`,
          trend: -2,
          icon: Package,
          color: "bg-amber-500",
          lightColor: "bg-amber-50",
          textColor: "text-amber-600",
        },
      ]
    : [];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white h-16 flex items-center px-6 border-b border-border sticky top-0 z-10">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-navy-700">Dashboard Overview</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-muted-foreground">
              <Bell size={20} />
              {(data?.stats.lowStockProducts ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {data?.stats.lowStockProducts}
                </span>
              )}
            </button>
            <Link href="/" className="btn-outline text-sm py-1.5 px-4">
              View Store
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 skeleton h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${card.lightColor} flex items-center justify-center`}>
                      <card.icon size={22} className={card.textColor} />
                    </div>
                    <span
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        card.trend >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {card.trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {Math.abs(card.trend)}%
                    </span>
                  </div>
                  <p className="text-2xl font-black text-navy-700">{card.value}</p>
                  <p className="text-sm font-semibold text-navy-600 mt-0.5">{card.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-navy-700">Revenue Overview</h2>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <TrendingUp size={20} className="text-primary-500" />
              </div>
              {loading ? (
                <div className="skeleton h-64 rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data?.revenueByDay || []}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00A86B" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [formatPrice(Number(value)), "Revenue"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#00A86B" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Orders by Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <div className="mb-6">
                <h2 className="font-bold text-navy-700">Orders by Status</h2>
                <p className="text-sm text-muted-foreground">Current distribution</p>
              </div>
              {loading ? (
                <div className="skeleton h-64 rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data?.ordersByStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {data?.ordersByStatus.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, name: any) => [value, name]}
                      contentStyle={{ borderRadius: "12px" }}
                    />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="font-bold text-navy-700">Recent Orders</h2>
                <p className="text-sm text-muted-foreground">Latest 5 orders</p>
              </div>
              <Link href="/admin/orders" className="text-primary-600 text-sm font-semibold flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Order ID</th>
                      <th className="px-6 py-3 text-left">Customer</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Payment</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(data?.recentOrders || []).map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order._id}`} className="font-mono text-sm text-primary-600 font-semibold hover:underline">
                            #{order.orderId}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-navy-700">{order.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-navy-700">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-700"} capitalize text-xs`}>
                            {order.orderStatus.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${STATUS_COLORS[order.paymentStatus] || "bg-gray-100 text-gray-700"} capitalize text-xs`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(data?.recentOrders?.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    No orders yet. Start selling!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Add Product", href: "/admin/products/new", icon: Package, color: "bg-primary-500" },
              { label: "Manage Orders", href: "/admin/orders", icon: ShoppingBag, color: "bg-blue-500" },
              { label: "View Customers", href: "/admin/customers", icon: Users, color: "bg-violet-500" },
              { label: "View Store", href: "/", icon: Store, color: "bg-amber-500" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-border hover:shadow-card transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  <action.icon size={22} />
                </div>
                <span className="text-sm font-semibold text-navy-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
