-- Oracle Text CONTEXT indexes on product name/description.
-- Needs Oracle Text; may need EXECUTE on CTX_DDL. Then set ORACLE_TEXT_SEARCH=true in .env.

BEGIN EXECUTE IMMEDIATE 'DROP INDEX idx_products_ctx_name'; EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1418 THEN RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP INDEX idx_products_ctx_desc'; EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1418 THEN RAISE; END IF; END;
/

CREATE INDEX idx_products_ctx_name
  ON products (product_name)
  INDEXTYPE IS CTXSYS.CONTEXT;

CREATE INDEX idx_products_ctx_desc
  ON products (description)
  INDEXTYPE IS CTXSYS.CONTEXT;

PROMPT Text indexes created (sync can take a moment).
