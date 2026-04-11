-- =============================================================================
-- Nexus Commerce — Oracle Text CONTEXT indexes for product search
-- Prerequisites: Oracle Text installed (typical on XE/EE); schema may need
--   EXECUTE ON CTX_DDL granted (often granted via RESOURCE or custom grant).
-- After running: set ORACLE_TEXT_SEARCH=true in .env and restart Next.js
-- =============================================================================

-- Re-run safe: drop if exists (ignore errors on first run)
BEGIN EXECUTE IMMEDIATE 'DROP INDEX idx_products_ctx_name'; EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1418 THEN RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP INDEX idx_products_ctx_desc'; EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1418 THEN RAISE; END IF; END;
/

-- Search on product name (replaces slow LIKE for name matches when API uses CONTAINS)
CREATE INDEX idx_products_ctx_name
  ON products (product_name)
  INDEXTYPE IS CTXSYS.CONTEXT;

-- Search on description (nullable; empty strings still index)
CREATE INDEX idx_products_ctx_desc
  ON products (description)
  INDEXTYPE IS CTXSYS.CONTEXT;

PROMPT Oracle Text indexes created. Sync may take a moment; then enable ORACLE_TEXT_SEARCH in app .env.
