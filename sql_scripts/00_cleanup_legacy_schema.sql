-- Drops leftover objects from an older course schema (users, brands, old packages, etc.).
-- Run once before a fresh install if those still exist.

-- Package first (references types)
DROP PACKAGE BODY pkg_order_management;
DROP PACKAGE pkg_order_management;

-- Types (list type after row type)
DROP TYPE t_order_item_list FORCE;
DROP TYPE t_order_item FORCE;

DROP TRIGGER trg_log_price_change;
DROP TRIGGER trg_status_timestamp;

-- Tables: children before parents
DROP TABLE ORDER_STATUS_HISTORY CASCADE CONSTRAINTS;
DROP TABLE PRICE_AUDIT_LOG CASCADE CONSTRAINTS;
DROP TABLE ORDER_ITEMS CASCADE CONSTRAINTS;
DROP TABLE ORDERS CASCADE CONSTRAINTS;
DROP TABLE PRODUCTS CASCADE CONSTRAINTS;
DROP TABLE BRANDS CASCADE CONSTRAINTS;
DROP TABLE USERS CASCADE CONSTRAINTS;
DROP TABLE CATEGORIES CASCADE CONSTRAINTS;
DROP TABLE USER_ROLES CASCADE CONSTRAINTS;

DROP SEQUENCE seq_order_id;
DROP SEQUENCE order_item_seq;
DROP SEQUENCE prod_seq;

PROMPT Legacy cleanup done.
