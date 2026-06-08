# 🧹 Cleanora — Enterprise E-Commerce Platform

> **Clean Living, Better Living** — A full-stack, production-grade e-commerce platform for household and commercial cleaning products.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 App Router, TypeScript, Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **State** | Zustand (Cart + Wishlist) |
| **Auth** | NextAuth v5 (Google OAuth + Credentials) |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Payments** | Razorpay (UPI / Cards / NetBanking) + COD |
| **Storage** | Cloudinary |
| **Deployment** | Vercel (Frontend) + MongoDB Atlas |

---

## 📁 Project Structure

```
cleanora/
├── app/
│   ├── (pages)/
│   │   ├── page.tsx              # Home page
│   │   ├── shop/page.tsx         # Product listing with filters
│   │   ├── shop/[slug]/page.tsx  # Product detail
│   │   ├── cart/page.tsx         # Shopping cart
│   │   ├── checkout/page.tsx     # Multi-step checkout + Razorpay
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── track/[orderId]/      # Order tracking
│   │   ├── about/page.tsx        # About Us
│   │   └── contact/page.tsx      # Contact Us
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard (analytics + charts)
│   │   ├── products/page.tsx     # Product management (CRUD)
│   │   └── orders/page.tsx       # Order management
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   ├── auth/register/        # User registration
│   │   ├── auth/validate/        # JWT validation (Edge-safe)
│   │   ├── products/             # Public product listing + detail
│   │   ├── orders/               # Order creation + tracking
│   │   ├── cart/                 # Cart CRUD
│   │   ├── payment/              # Razorpay create + verify
│   │   ├── upload/               # Cloudinary upload
│   │   └── admin/                # Admin-only APIs
│   └── globals.css               # Tailwind v4 design tokens
├── components/
│   ├── layout/Header.tsx         # Sticky nav with cart + search
│   ├── layout/Footer.tsx         # Full footer with newsletter
│   ├── cart/CartDrawer.tsx       # Slide-out cart drawer
│   ├── shop/ProductCard.tsx      # Animated product card
│   ├── dashboard/                # User + Admin dashboard UIs
│   └── ui/WhatsAppButton.tsx     # Floating WhatsApp CTA
├── models/                       # 11 Mongoose schemas
├── lib/
│   ├── auth.ts                   # NextAuth config (Edge-safe)
│   ├── db.ts                     # MongoDB connection cache
│   ├── razorpay.ts               # Payment utilities
│   ├── cloudinary.ts             # Image upload helpers
│   └── utils.ts                  # formatPrice, slugify, etc.
├── store/
│   ├── cartStore.ts              # Zustand cart store
│   └── wishlistStore.ts          # Zustand wishlist store
└── middleware.ts                 # Route protection (JWT)
```

---

## ⚡ Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd cleanora
npm install --legacy-peer-deps
```

### 2. Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_char_random_secret
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cleanora
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
ADMIN_EMAIL=admin@yoursite.com
```

### 3. Run Development Server

```bash
npm run dev
# or on Windows:
"C:\Program Files\nodejs\node.exe" ".\node_modules\next\dist\bin\next" dev
```

App runs at **http://localhost:3000**

### 4. Production Build

```bash
npm run build
npm run start
```

---

## 🗄️ Database Setup

The app uses **MongoDB Atlas**. Collections are auto-created by Mongoose:

| Model | Collection | Description |
|-------|-----------|-------------|
| User | users | Customers + admin accounts |
| Product | products | Product catalog with images, stock |
| Order | orders | Orders with items, status, payment |
| Cart | carts | User shopping carts |
| Wishlist | wishlists | Saved products |
| Address | addresses | Delivery addresses |
| Review | reviews | Product ratings/reviews |
| Category | categories | Product categories |
| Coupon | coupons | Discount codes |
| Notification | notifications | User alerts |
| Analytics | analytics | Aggregated metrics |

---

## 🔐 Authentication

- **Email/Password** — Credentials provider with bcrypt hashing
- **Google OAuth** — One-click Google login
- **JWT Sessions** — Edge-compatible, no DB calls in middleware
- **Role-based** — `user` and `admin` roles

**First Admin:** Set `ADMIN_EMAIL` in `.env.local`. When that email registers, they get `role: "admin"` automatically.

---

## 💳 Payment Integration

### Razorpay Flow
1. User places order → API creates Razorpay order
2. Razorpay checkout opens in browser
3. Payment verified via webhook signature
4. Order status updated to `paid`

### Supported Methods
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Cards
- Net Banking
- Cash on Delivery

---

## 🛡️ Admin Dashboard

Access at `/admin` (requires admin account):

- **Analytics** — Revenue charts, order stats, user growth
- **Products** — Add/edit/delete products, toggle active status
- **Orders** — View all orders, update status (placed → shipped → delivered)

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
vercel --prod
```
Set all environment variables in Vercel dashboard.

### Required Vercel Config
```json
{
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

---

## 📦 Product Categories

1. Bathroom Cleaner
2. Toilet Cleaner  
3. Floor Cleaner
4. Phenyl
5. Hand Wash
6. Dish Wash Liquid
7. Glass Cleaner
8. Kitchen Cleaner
9. Multi-Purpose Cleaner
10. Sanitizer

---

## 🤝 B2B Support

Bulk ordering and wholesale accounts available. Contact: `sales@cleanora.in`

---

*Built with ❤️ by Antigravity AI*
