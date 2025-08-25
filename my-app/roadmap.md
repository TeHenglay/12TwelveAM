# 🛒 E-Commerce Project Roadmap

A concise roadmap for building the backend of the e-commerce platform.

---

## 1. Core Setup ✅
- [x] Initialize **Next.js 15.1.0** with **TypeScript**
- [x] Configure **Node.js** runtime & **Turbopack**
- [x] Setup project structure (API routes, services, utils, middleware)

---

## 2. Database & ORM ✅
- [x] Install & configure **PostgreSQL**
- [x] Setup **Prisma 6.13.0**
- [x] Define schema for:
  - Users
  - Products
  - Orders
  - Cart
  - Payments
- [x] Run migrations & seed initial data
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AdminSession {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  expires      DateTime
  createdAt    DateTime @default(now())
}

model Product {
  id           String         @id @default(cuid())
  slug         String         @unique
  name         String
  description  String
  price        Decimal        @db.Decimal(10, 2)
  inStock      Boolean        @default(true)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  categoryId   String
  collectionId String?
  displayOrder Int?
  archivedAt   DateTime?
  isArchived   Boolean        @default(false)
  discount     Discount?
  orderItems   OrderItem[]
  category     Category       @relation(fields: [categoryId], references: [id])
  collection   Collection?    @relation(fields: [collectionId], references: [id])
  images       ProductImage[]
  sizes        ProductSize[]
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  imageUrl  String?
  products  Product[]
}

model Collection {
  id               String         @id @default(cuid())
  name             String
  description      String
  available        Boolean        @default(true)
  collectionType   CollectionType @default(CURRENT)
  discontinuedDate DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  products         Product[]
}

model ProductImage {
  id        String   @id @default(cuid())
  url       String
  order     Int
  productId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model ProductSize {
  id            String   @id @default(cuid())
  size          String
  price         Decimal  @db.Decimal(10, 2)
  stock         Int      @default(0)
  reservedStock Int      @default(0) // Stock reserved for pending orders
  productId     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, size])
}

model Discount {
  id         String   @id @default(cuid())
  percentage Decimal  @db.Decimal(5, 2)
  enabled    Boolean  @default(false)
  productId  String   @unique
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  total           Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING)
  customerName    String
  customerEmail   String?
  customerPhone   String
  shippingAddress String
  paymentProofUrl String?
  receiptId       String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  items           OrderItem[]
}

model OrderItem {
  id        String   @id @default(cuid())
  productId String
  orderId   String
  name      String
  price     Decimal  @db.Decimal(10, 2)
  size      String
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])
}

enum CollectionType {
  CURRENT
  DISCONTINUED
}

enum OrderStatus {
  PENDING
  APPROVED

}
---

## 3. Authentication & Security ✅
- [x] Implement **JWT** with `jsonwebtoken`
- [x] Hash passwords with **bcrypt.js**
- [x] Build **Custom Admin Auth System**
- [x] Add **CSRF protection**
- [x] Configure **Security Headers**

---

## 4. Caching & Performance ✅
- [x] Setup **Upstash Redis**
- [x] Integrate with `@upstash/redis`
- [x] Add request limiting using `@upstash/ratelimit`

---

## 5. Rate Limiting & Protection ✅
- [x] Implement **Redis-based rate limiting**
- [x] Add **IP-based protection**
- [x] Setup **login attempt lockouts**
- [x] Define **session-based limits**

---

## 6. File Upload & Storage ✅
- [x] Enable uploads via **Local File System**
- [x] Use **hash-based naming** for files
- [x] Add **image validation** (limit: 5MB)

---

## 7. Data Validation ✅
- [x] Setup **Zod** schemas for:
  - User input
  - API requests/responses
  - Product & order validation

---

## 8. Utility Libraries
- [ ] Integrate **UUID** for unique identifiers
- [ ] Use **crypto** (Node.js built-in) for hashing/encryption
- [ ] Use **jose** for JWT handling
- [ ] Use **date-fns** for date formatting
- [ ] Use **form-data** for handling file uploads

---

## ✅ Milestones
1. **MVP Launch**
   - User registration & login
   - Product listing & cart
   - Order placement
2. **Admin Dashboard**
   - Manage products, orders, and users
   - View analytics
3. **Scaling & Optimization**
   - Rate limiting
   - Performance tuning with Redis
   - Security hardening

---

## 📌 Notes
- Keep the codebase modular & type-safe with **TypeScript**
- Enforce **secure defaults** (headers, tokens, rate limits)
- Optimize for **scalability & maintainability**
