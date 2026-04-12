-- Full reset: drop this project's objects before reinstalling.
-- Run before 02_tables.sql. Ignore ORA-04043 / ORA-00942 if something is missing.
-- Optional: 00_cleanup_legacy_schema.sql first if you still have the old course schema.

DROP TRIGGER trg_order_status_default;
DROP TRIGGER trg_price_audit;
DROP TRIGGER trg_validate_order_stock;
DROP TRIGGER trg_no_shared_email;

DROP PACKAGE BODY pkg_nexus_commerce;
DROP PACKAGE pkg_nexus_commerce;

DROP PROCEDURE sp_register_customer;
DROP PROCEDURE sp_place_order;
DROP PROCEDURE sp_update_order_status;
DROP PROCEDURE sp_deactivate_product;

DROP FUNCTION fn_get_order_total;
DROP FUNCTION fn_get_customer_order_count;
DROP FUNCTION fn_is_product_in_stock;

DROP PACKAGE BODY pkg_nc_audit_ctx;
DROP PACKAGE pkg_nc_audit_ctx;

DROP TABLE PRICE_AUDIT_LOG CASCADE CONSTRAINTS;
DROP TABLE ORDER_STATUS_HISTORY CASCADE CONSTRAINTS;
DROP TABLE ORDER_ITEMS CASCADE CONSTRAINTS;
DROP TABLE ORDERS CASCADE CONSTRAINTS;
DROP TABLE PRODUCTS CASCADE CONSTRAINTS;
DROP TABLE CATEGORIES CASCADE CONSTRAINTS;
DROP TABLE CUSTOMERS CASCADE CONSTRAINTS;
DROP TABLE ADMINS CASCADE CONSTRAINTS;

DROP SEQUENCE seq_audit_id;
DROP SEQUENCE seq_history_id;
DROP SEQUENCE seq_order_item_id;
DROP SEQUENCE seq_order_id;
DROP SEQUENCE seq_product_id;
DROP SEQUENCE seq_category_id;
DROP SEQUENCE seq_customer_id;
DROP SEQUENCE seq_admin_id;

PROMPT Drop script finished.
