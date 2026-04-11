-- =============================================================================
-- Nexus Commerce — remove objects from the PREVIOUS course schema
-- (USER_ROLES, USERS, BRANDS, pkg_order_management, object types, etc.)
-- Run this ONCE before deploying nexus_commerce_complete.sql if those
-- objects still exist in your schema.
-- =============================================================================

-- Package (must drop before types that it may reference)
DROP PACKAGE BODY pkg_order_management;
DROP PACKAGE pkg_order_management;

-- Object types (list type first — depends on object type)
DROP TYPE t_order_item_list FORCE;
DROP TYPE t_order_item FORCE;

-- Triggers from older triggers.sql
DROP TRIGGER trg_log_price_change;
DROP TRIGGER trg_status_timestamp;

-- Child / dependent tables first (FK-safe reverse order)
DROP TABLE ORDER_STATUS_HISTORY CASCADE CONSTRAINTS;
DROP TABLE PRICE_AUDIT_LOG CASCADE CONSTRAINTS;
DROP TABLE ORDER_ITEMS CASCADE CONSTRAINTS;
DROP TABLE ORDERS CASCADE CONSTRAINTS;
DROP TABLE PRODUCTS CASCADE CONSTRAINTS;
DROP TABLE BRANDS CASCADE CONSTRAINTS;
DROP TABLE USERS CASCADE CONSTRAINTS;
DROP TABLE CATEGORIES CASCADE CONSTRAINTS;
DROP TABLE USER_ROLES CASCADE CONSTRAINTS;

-- Sequences from older table.sql / procedures.sql
DROP SEQUENCE seq_order_id;
DROP SEQUENCE order_item_seq;
DROP SEQUENCE prod_seq;

-- Indexes on dropped tables are removed automatically; listed here only
-- for documentation (idx_product_name, idx_order_status were on old tables).

PROMPT Legacy schema cleanup finished. You can now run nexus_commerce_complete.sql.
