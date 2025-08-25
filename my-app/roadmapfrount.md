# 🛍️ Frontend Roadmap (Next.js + TypeScript)

A concise plan for building the e‑commerce frontend with performance, accessibility, and DX in mind.

---

## 1) Project Setup
- [ ] Create **Next.js 15.1.0** app (App Router) with **TypeScript**
- [ ] Add **Tailwind CSS** + base styles (colors, spacing, typography)
- [ ] Install UI kits (e.g., **shadcn/ui**, **lucide-react**)
- [ ] Configure **ESLint/Prettier** and **absolute imports** (`@/`)

---

## 2) App Structure & Routing
- [x] Layouts: `root`, `auth`, `dashboard`, `store`
- [x] Pages:
  - `/` (Home/Featured)
  - `/products` (Catalog + filters/sort)
  - `/cart` (Cart)
  - [x] `/products/[slug]` (PDP)
  - [x] `/checkout` (Checkout)
  - [x] `/orders/[id]` (Order details)
  - [x] `/admin`
- [x] Shared: header, footer, mobile nav, toasts, modals

---

## 3) State & Data Flow
- [x] Data fetching via **Next.js Server Components** (SSR) + **Route Handlers**
- [x] Client state: **Zustand** (or React Context) for cart/UI states
- [x] Persist mini-cart in `localStorage` with server sync
- [ ] SWR/React Query (optional) for client-side revalidation

---

## 4) Core Features
- [x] **Catalog**: search, category filters, price range, sort
- [ ] **PDP**: images gallery, variants (size/color), stock, add-to-cart
- [x] **Cart**: add/remove/update qty, promo codes, shipping estimate
- [ ] **Checkout**: address, shipping method, payment
- [ ] **Auth**: login, JWT session hydrate
- [ ] **Orders**: history, status

---

## 5) UI/UX & Accessibility
- [ ] Responsive breakpoints (xs–2xl), mobile-first nav & filters drawer
- [ ] Keyboard navigation & **WCAG AA** color contrast
- [ ] Form UX: inline validation, error states, loading/skeletons
- [ ] Image optimization (`next/image`) + blur placeholders
- [ ] Microinteractions (hover, focus rings, subtle motion)

---

## 6) Performance & SEO
- [ ] Route-level **loading** and **error** states
- [ ] **Static rendering** for stable pages, **SSR** for dynamic
- [ ] **Edge caching** for product/category pages
- [ ] **Metadata** API: titles, descriptions, OG/Twitter cards
- [ ] Structured data (Product, Breadcrumb, Offer)
- [ ] Lighthouse pass: LCP < 2.5s, CLS < 0.1

---

## 7) Payments & Checkout (TBD Gateway)
- [ ] **NOTTE** Integrate user input all info that required. And on that checkout page it should display a qrcode which is for scan in order to proceed the payment. and have another files upload route system for user to upload the payment proof of the payment. then when all info is proceed and complete it should send a recvied order info to a telegram group via telegram api.
- [ ] Tokenized payment + 3D Secure (if supported)
- [ ] Display taxes, shipping, and total cost transparently
- [ ] Order confirmation page

---

## 8) Integration with Backend
- [ ] Use secure API routes/handlers for:
  - Auth session retrieval (JWT)
  - Product/catalog queries (PostgreSQL via backend)
  - Cart sync (Redis-backed endpoints)
  - Orders create/read
- [ ] CSRF-safe forms for sensitive actions
- [ ] Standardized response schema + Zod parsing on client

---

## 9) Analytics, Observability, & Content
- [ ] Events: view_item, add_to_cart, begin_checkout, purchase
- [ ] Basic error reporting (Sentry) & web vitals
- [ ] CMS-ready product copy & content blocks (optional)

---

## 10) Testing & Quality
- [ ] **Unit**: React Testing Library (components, hooks)
- [ ] **E2E**: Playwright for checkout & auth flows
- [ ] Visual checks for responsive views
- [ ] Accessibility audits (axe/lighthouse)

---

## ✅ Milestones
1. **MVP Storefront**
   - Home, Catalog, PDP
   - Cart (client) + server sync
2. **Checkout & Auth**
   - Auth flows, profile
   - Payment gateway integration
3. **Polish & Scale**
   - SEO & structured data
   - Performance budgets, edge caching
   - Analytics & A/B test hooks

---

## 📌 Notes
- Keep components **server-first**, move client logic only when needed.
- Validate **all** API responses with **Zod** on the client boundary.
- Favor **progressive enhancement** and predictable UX on low-end devices.
