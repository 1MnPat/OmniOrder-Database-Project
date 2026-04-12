-- Basic indexes: customer email, products by category, orders by customer. Next: 06_triggers.sql

CREATE INDEX idx_customers_email   ON CUSTOMERS (email);
CREATE INDEX idx_products_category ON PRODUCTS (category_id);
CREATE INDEX idx_orders_customer   ON ORDERS (customer_id);

PROMPT Indexes OK.
