"use client";

import { useState, useEffect } from "react";
import {
  BarChart2, TrendingUp, DollarSign, ShoppingCart, Users, Package
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

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
}

const PIE_COLORS = ["#00A86B", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = data ? [
    { label: "Total Revenue", value: formatPrice(data.stats.totalRevenue), sub: `${formatPrice(data.stats.monthRevenue)} this month`, trend: data.stats.revenueGrowth, icon: DollarSign, color: "bg-primary-500", lightColor: "bg-primary-50", textColor: "text-primary-600" },
    { label: "Total Orders", value: data.stats.totalOrders.toLocaleString(), sub: `${data.stats.monthOrders} this month`, trend: 12, icon: ShoppingCart, color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600" },
    { label: "Total Customers", value: data.stats.totalUsers.toLocaleString(), sub: `+${data.stats.monthUsers} this month`, trend: 8, icon: Users, color: "bg-violet-500", lightColor: "bg-violet-50", textColor: "text-violet-600" },
    { label: "Active Products", value: data.stats.totalProducts.toLocaleString(), sub: `${data.stats.lowStockProducts} low stock`, trend: -2, icon: Package, color: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-600" },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Analytics</h1>
          <p className="text-sm text-muted-foreground">Business performance overview</p>
        </div>
        <Link href="/admin" className="btn-outline text-sm py-2">← Dashboard</Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.lightColor} flex items-center justify-center`}>
                  <card.icon size={20} className={card.textColor} />
                </div>
                <span className={`text-sm font-semibold ${card.trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {card.trend >= 0 ? "+" : ""}{Math.abs(card.trend)}%
                </span>
              </div>
              <p className="text-xl font-black text-navy-700">{card.value}</p>
              <p className="text-sm font-semibold text-navy-600 mt-0.5">{card.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-border shadow-sm">
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
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00A86B" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders By Status Pie */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
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

      {/* Orders per day bar chart */}
      <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
        <div className="mb-6">
          <h2 className="font-bold text-navy-700">Orders Per Day</h2>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>
        {loading ? (
          <div className="skeleton h-48 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.revenueByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px" }} />
              <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* KPI Summary */}
      {data && (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white">
            <BarChart2 size={24} className="opacity-70 mb-3" />
            <p className="text-2xl font-black">{formatPrice(data.stats.totalRevenue)}</p>
            <p className="text-primary-100 text-sm mt-1">Total All-time Revenue</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
            <ShoppingCart size={24} className="opacity-70 mb-3" />
            <p className="text-2xl font-black">{data.stats.totalOrders}</p>
            <p className="text-blue-100 text-sm mt-1">Total Orders Placed</p>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white">
            <DollarSign size={24} className="opacity-70 mb-3" />
            <p className="text-2xl font-black">
              {data.stats.totalOrders > 0
                ? formatPrice(Math.round(data.stats.totalRevenue / data.stats.totalOrders))
                : "₹0"}
            </p>
            <p className="text-violet-100 text-sm mt-1">Average Order Value</p>
          </div>
        </div>
      )}
    </div>
  );
}
