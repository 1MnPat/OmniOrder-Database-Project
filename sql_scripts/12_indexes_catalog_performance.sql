-- Extra catalog indexes after 05_indexes.sql (active listings, category, price range).
-- Middle-of-string LIKE '%x%' stays slow unless you use Oracle Text (13).

CREATE INDEX idx_products_active_pid ON products (is_active, product_id);

CREATE INDEX idx_products_active_cat_pid ON products (is_active, category_id, product_id);

CREATE INDEX idx_products_active_price ON products (is_active, price);

PROMPT Catalog indexes created.
