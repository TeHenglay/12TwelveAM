# TWELVE AM — Streetwear E‑Commerce

> **Where Today Meets Tomorrow.**  
> A sleek, fast, and secure web store for limited‑drop shirts and apparel.

<!-- Optional: replace with your own screenshot or remove -->
![Hero](./public/hero.png)

---

## ✨ Features

- **Modern Storefront** — dark cosmic UI, animated hero, logo‑loop marquee, fully responsive.
- **Product Catalog** — sizes, stock, price, badges (new/featured/low stock).
- **Cart & Checkout** — client‑side cart with Redis persistence, order summary, shipping info.
- **Auth** — email + password (JWT), secure cookies, bcrypt hashing.
- **Admin Dashboard** — add/edit/delete products, manage orders, basic analytics.
- **Performance** — Redis caching (Upstash/Memurai), Prisma optimized queries, route‑level caching.
- **Safety** — rate limits on auth & APIs, validation with Zod, security headers.
- **A11y & SEO** — semantic HTML, alt text, meta/OG tags.

---

## 🧱 Tech Stack

**Frontend**
- Next.js 15 (App Router) • TypeScript • Tailwind CSS • Framer Motion

**Backend & Data**
- PostgreSQL (products, orders, users)
- Prisma ORM 6.13
- Redis (Upstash or Memurai on Windows) for cache, cart, and rate‑limits

**Security**
- JWT (jose/jsonwebtoken) • bcrypt • CSRF protection • strict security headers
- @upstash/ratelimit for login/signup throttling

**Utilities**
- Zod (validation) • uuid • date‑fns • form-data • crypto (Node built‑in)
- Image uploads (local disk; 5 MB cap; hash‑based filenames)

---
