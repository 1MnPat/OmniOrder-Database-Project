-- =============================================================================
-- Nexus Commerce — session context for price-change auditing (changed_by)
-- Set pkg_nc_audit_ctx.g_admin_id := <admin_id> before UPDATE PRODUCTS ... price
-- Next: 05_indexes.sql
-- =============================================================================

CREATE OR REPLACE PACKAGE pkg_nc_audit_ctx IS
    g_admin_id ADMINS.admin_id%TYPE;
END pkg_nc_audit_ctx;
/

CREATE OR REPLACE PACKAGE BODY pkg_nc_audit_ctx IS
BEGIN
    NULL;
END pkg_nc_audit_ctx;
/

PROMPT Package pkg_nc_audit_ctx created.
