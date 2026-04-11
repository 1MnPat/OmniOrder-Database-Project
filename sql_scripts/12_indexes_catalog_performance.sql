-- =============================================================================
-- Nexus Commerce — catalog performance indexes (run after 05_indexes.sql)
-- Speeds: active catalog, category filter, price range, ORDER BY product_id
-- Does NOT accelerate middle-substring LIKE '%term%' (see 13_oracle_text_product_search.sql)
-- =============================================================================

-- Home / default listing: WHERE is_active = 1 ORDER BY product_id
CREATE INDEX idx_products_active_pid ON products (is_active, product_id);

-- Filter by category on active products + sort
CREATE INDEX idx_products_active_cat_pid ON products (is_active, category_id, product_id);

-- Price range on active products
CREATE INDEX idx_products_active_price ON products (is_active, price);

PROMPT Catalog performance indexes created (see also 13 for text search).
