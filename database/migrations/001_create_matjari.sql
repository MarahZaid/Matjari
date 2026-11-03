-- MATJARI: initial shared-schema multi-tenant design
-- Target: MySQL 8.4, InnoDB. NEW database only; does not touch matjari_test or shopdb.
-- Review with the entire team before first execution. Do not run as a recurring migration.
CREATE DATABASE IF NOT EXISTS matjari_shared CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE matjari_shared;

-- Identity and tenant administration
CREATE TABLE tenants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  plan ENUM('starter','business','enterprise') NOT NULL DEFAULT 'starter',
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id), UNIQUE KEY uq_tenants_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  platform_role ENUM('customer','platform_admin') NOT NULL DEFAULT 'customer',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id), UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE tenant_memberships (
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('owner','seller') NOT NULL DEFAULT 'seller',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (tenant_id, user_id),
  KEY ix_memberships_user (user_id),
  CONSTRAINT fk_memberships_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE stores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  description TEXT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_stores_slug (slug),
  UNIQUE KEY uq_stores_tenant_id (tenant_id,id),
  KEY ix_stores_tenant_status (tenant_id,status),
  CONSTRAINT fk_stores_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Per-store catalog. Each product belongs to exactly one store.
CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_scope_id (tenant_id,store_id,id),
  UNIQUE KEY uq_categories_store_slug (store_id,slug),
  CONSTRAINT fk_categories_store FOREIGN KEY (tenant_id,store_id)
    REFERENCES stores(tenant_id,id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  sku VARCHAR(80) NOT NULL,
  name VARCHAR(220) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(1000) NULL,
  price DECIMAL(13,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_scope_id (tenant_id,store_id,id),
  UNIQUE KEY uq_products_store_sku (store_id,sku),
  KEY ix_products_store_active (tenant_id,store_id,active),
  KEY ix_products_category (tenant_id,store_id,category_id),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT fk_products_store FOREIGN KEY (tenant_id,store_id)
    REFERENCES stores(tenant_id,id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_category FOREIGN KEY (tenant_id,store_id,category_id)
    REFERENCES categories(tenant_id,store_id,id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE inventory (
  product_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  quantity_on_hand INT UNSIGNED NOT NULL DEFAULT 0,
  reserved_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (product_id),
  KEY ix_inventory_scope (tenant_id,store_id,product_id),
  CONSTRAINT chk_inventory_reserved CHECK (reserved_quantity <= quantity_on_hand),
  CONSTRAINT fk_inventory_product FOREIGN KEY (tenant_id,store_id,product_id)
    REFERENCES products(tenant_id,store_id,id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE inventory_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  actor_user_id BIGINT UNSIGNED NULL,
  movement_type ENUM('restock','sale','adjustment','return') NOT NULL,
  quantity_delta INT NOT NULL,
  note VARCHAR(500) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_movements_product_time (product_id,created_at),
  KEY ix_movements_scope_time (tenant_id,store_id,created_at),
  CONSTRAINT chk_movements_nonzero CHECK (quantity_delta <> 0),
  CONSTRAINT fk_movements_product FOREIGN KEY (tenant_id,store_id,product_id)
    REFERENCES products(tenant_id,store_id,id) ON DELETE RESTRICT,
  CONSTRAINT fk_movements_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Customers are global identities and may shop from different tenants.
CREATE TABLE customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  phone VARCHAR(30) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id), UNIQUE KEY uq_customers_user (user_id),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE customer_addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(60) NULL,
  recipient_name VARCHAR(160) NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255) NULL,
  city VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL,
  postal_code VARCHAR(30) NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id), KEY ix_addresses_customer (customer_id),
  CONSTRAINT fk_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id), UNIQUE KEY uq_carts_customer (customer_id),
  CONSTRAINT fk_carts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_product (cart_id,product_id),
  KEY ix_cart_items_product_scope (tenant_id,store_id,product_id),
  CONSTRAINT chk_cart_quantity CHECK (quantity > 0),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (tenant_id,store_id,product_id)
    REFERENCES products(tenant_id,store_id,id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- One checkout reference may contain multiple orders (one per store/currency group).
CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  checkout_reference CHAR(36) NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  payment_status ENUM('unpaid','paid','failed','refunded') NOT NULL DEFAULT 'unpaid',
  currency CHAR(3) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  shipping_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  shipping_name VARCHAR(160) NULL,
  shipping_address TEXT NULL,
  placed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_scope_id (tenant_id,store_id,id),
  KEY ix_orders_customer_time (customer_id,placed_at),
  KEY ix_orders_store_time (tenant_id,store_id,placed_at),
  KEY ix_orders_checkout_ref (checkout_reference),
  CONSTRAINT chk_orders_totals CHECK (subtotal >= 0 AND shipping_amount >= 0 AND total_amount >= 0),
  CONSTRAINT fk_orders_store FOREIGN KEY (tenant_id,store_id)
    REFERENCES stores(tenant_id,id) ON DELETE RESTRICT,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name_snapshot VARCHAR(220) NOT NULL,
  sku_snapshot VARCHAR(80) NOT NULL,
  unit_price DECIMAL(13,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (id),
  KEY ix_order_items_order (tenant_id,store_id,order_id),
  KEY ix_order_items_product (tenant_id,store_id,product_id),
  CONSTRAINT chk_order_items_values CHECK (unit_price >= 0 AND quantity > 0 AND line_total >= 0),
  CONSTRAINT fk_order_items_order FOREIGN KEY (tenant_id,store_id,order_id)
    REFERENCES orders(tenant_id,store_id,id) ON DELETE RESTRICT,
  CONSTRAINT fk_order_items_product FOREIGN KEY (tenant_id,store_id,product_id)
    REFERENCES products(tenant_id,store_id,id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Educational payment records only; do not store card details.
CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  method ENUM('demo','cash_on_delivery','manual') NOT NULL DEFAULT 'demo',
  status ENUM('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
  amount DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  reference_code VARCHAR(120) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_payments_order (order_id),
  CONSTRAINT chk_payments_amount CHECK (amount >= 0),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Append-only events are useful for large-scale analytics benchmarks.
CREATE TABLE events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NULL,
  store_id BIGINT UNSIGNED NULL,
  customer_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(70) NOT NULL,
  event_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  metadata JSON NULL,
  PRIMARY KEY (id),
  KEY ix_events_time (event_time),
  KEY ix_events_tenant_time (tenant_id,event_time),
  KEY ix_events_store_time (tenant_id,store_id,event_time),
  KEY ix_events_customer_time (customer_id,event_time),
  CONSTRAINT fk_events_store FOREIGN KEY (tenant_id,store_id)
    REFERENCES stores(tenant_id,id) ON DELETE RESTRICT,
  CONSTRAINT fk_events_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT chk_events_store_tenant CHECK (store_id IS NULL OR tenant_id IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_user_id BIGINT UNSIGNED NULL,
  tenant_id BIGINT UNSIGNED NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  action VARCHAR(70) NOT NULL,
  details JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_audit_tenant_time (tenant_id,created_at),
  KEY ix_audit_actor_time (actor_user_id,created_at),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Initial validation (should list 17 tables)
SHOW TABLES;
SELECT COUNT(*) AS created_tables
FROM information_schema.tables WHERE table_schema = 'matjari_shared' AND table_type = 'BASE TABLE';
