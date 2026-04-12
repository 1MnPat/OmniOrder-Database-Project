-- Holds g_admin_id for price updates so the audit trigger knows who changed the price.
-- App sets it before UPDATE products ... price. Next: 05_indexes.sql

CREATE OR REPLACE PACKAGE pkg_nc_audit_ctx IS
    g_admin_id ADMINS.admin_id%TYPE;
END pkg_nc_audit_ctx;
/

CREATE OR REPLACE PACKAGE BODY pkg_nc_audit_ctx IS
BEGIN
    NULL;
END pkg_nc_audit_ctx;
/

PROMPT Audit context package OK.
