// Prisma Schema for P-E-commerce (E-commerce + Social + Video)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  BUYER
  SELLER
  AFFILIATE
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPING
  COMPLETED
  CANCELLED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  fbId          String?   @unique
  role          Role      @default(BUYER)
  
  // Social
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  following     Follow[]  @relation("Following")
  followers     Follow[]  @relation("Followers")
  
  // E-commerce
  products      Product[] // As Seller
  orders        Order[]   // As Buyer
  cart          Cart?
  
  // Interactions (for Recommendation)
  interactions  UserInteraction[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Follow {
  followerId    String
  followingId   String
  follower      User      @relation("Following", fields: [followerId], references: [id])
  following     User      @relation("Followers", fields: [followingId], references: [id])

  @@id([followerId, followingId])
}

model Post {
  id          String    @id @default(cuid())
  content     String?
  mediaUrl    String?   // Cloudinary URL
  type        String    @default("SOCIAL") // SOCIAL, VIDEO
  
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  
  comments    Comment[]
  likes       Like[]
  
  // Product tag for Video Commerce
  productId   String?
  product     Product?  @relation(fields: [productId], references: [id])

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([authorId])
  @@index([type])
}

model Product {
  id          String    @id @default(cuid())
  name        String
  description String
  price       Float
  stock       Int       @default(0)
  images      String[]  // Cloudinary URLs
  
  sellerId    String
  seller      User      @relation(fields: [sellerId], references: [id])
  
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  
  posts       Post[]    // Videos/Posts tagging this product
  orderItems  OrderItem[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([categoryId])
  @@index([sellerId])
  @@index([price])
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  products    Product[]
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  
  items       OrderItem[]
  total       Float
  status      OrderStatus @default(PENDING)
  
  address     String
  createdAt   DateTime    @default(now())
}

model OrderItem {
  id          String    @id @default(cuid())
  orderId     String
  order       Order     @relation(fields: [orderId], references: [id])
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  quantity    Int
  price       Float     // Price at time of purchase
}

model Cart {
  id          String    @id @default(cuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  items       Json      // Store as JSON for simplicity in MVP or separate model
}

model Comment {
  id          String    @id @default(cuid())
  content     String
  postId      String
  post        Post      @relation(fields: [postId], references: [id])
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  createdAt   DateTime  @default(now())
}

model Like {
  postId      String
  userId      String
  post        Post      @relation(fields: [postId], references: [id])
  user        User      @relation(fields: [userId], references: [id])

  @@id([postId, userId])
}

model UserInteraction {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  targetId    String    // Could be ProductId or PostId
  type        String    // VIEW, LIKE, COMMENT, PURCHASE
  weight      Int
  
  createdAt   DateTime  @default(now())

  @@index([userId, type])
}
