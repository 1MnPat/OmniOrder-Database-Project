-- =============================================================================
-- Nexus Commerce — sample data (INSERT … seq_*.NEXTVAL)
-- Prerequisites: triggers on ORDERS / ORDER_ITEMS / CUSTOMERS active
-- Next: 11_test.sql
-- Note: Direct INSERT into ORDER_ITEMS does not reduce stock; this script ends
--       with UPDATE statements to align stock_quantity with sample orders.
-- =============================================================================

-- ADMINS (2)
INSERT INTO admins (admin_id, email, password, first_name, last_name)
VALUES (seq_admin_id.NEXTVAL, 'owner@nexusgpu.ca', 'HASH_OWNER_01', 'Alex', 'Chen');

INSERT INTO admins (admin_id, email, password, first_name, last_name)
VALUES (seq_admin_id.NEXTVAL, 'ops@nexusgpu.ca', 'HASH_OPS_02', 'Jordan', 'Patel');

-- CUSTOMERS (10) — emails must not match ADMINS
INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'sam.rivera@mail.com', 'cust01', 'Sam', 'Rivera', '416-555-0101', '120 Front St W', 'Toronto', 'M5J2T1', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'mei.ng@mail.com', 'cust02', 'Mei', 'Ng', '604-555-0102', '910 Granville St', 'Vancouver', 'V6Z1K7', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'omar.hassan@mail.com', 'cust03', 'Omar', 'Hassan', '514-555-0103', '1455 Peel St', 'Montreal', 'H3A1T8', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'ava.martin@mail.com', 'cust04', 'Ava', 'Martin', '403-555-0104', '200 8 Ave SW', 'Calgary', 'T2P1B5', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'li.wei@mail.com', 'cust05', 'Li', 'Wei', '780-555-0105', '10180 101 St NW', 'Edmonton', 'T5J3S4', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'noah.brown@mail.com', 'cust06', 'Noah', 'Brown', '902-555-0106', '1969 Upper Water St', 'Halifax', 'B3J3R7', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'priya.khan@mail.com', 'cust07', 'Priya', 'Khan', '204-555-0107', '450 Portage Ave', 'Winnipeg', 'R3C0E3', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'ethan.clark@mail.com', 'cust08', 'Ethan', 'Clark', '506-555-0108', '15 King St', 'Saint John', 'E2L1G4', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'sofia.garcia@mail.com', 'cust09', 'Sofia', 'Garcia', '867-555-0109', '5016 49 St', 'Yellowknife', 'X1A2P8', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'daniel.cho@mail.com', 'cust10', 'Daniel', 'Cho', '709-555-0110', '100 New Gower St', 'St. John''s', 'A1C1B3', 'Canada');

-- CATEGORIES (5)
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Gaming');
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Workstation');
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Budget');
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Professional');
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Mining');

-- PRODUCTS (10) — generous stock for trigger checks; reconciled below
INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce RTX 4090', 'Flagship Ada GPU, 24GB GDDR6X, DLSS 3', 1999.99, 250, 1);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce RTX 4080 SUPER', 'High-end Ada, 16GB GDDR6X', 1099.99, 250, 1);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'AMD Radeon RX 7900 XTX', 'RDNA 3 enthusiast, 24GB', 999.99, 250, 1);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce RTX 4060 Ti', '1080p/1440p sweet spot, 8GB', 449.99, 300, 3);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'Intel Arc A770 Limited Edition', 'Xe HPG, 16GB, ray tracing', 349.99, 300, 3);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA RTX 5000 Ada Generation', 'Workstation 32GB ECC', 6999.99, 80, 2);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'AMD Radeon PRO W7800', 'Professional 32GB', 2499.99, 70, 4);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce GTX 1660 SUPER', 'Budget 1080p workhorse, 6GB', 229.99, 400, 3);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce RTX 3060', 'Popular 12GB mainstream', 379.99, 350, 3);

INSERT INTO products (product_id, product_name, description, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'AMD Radeon RX 6600', 'Efficient 1080p, compact designs', 279.99, 220, 5);

-- ORDERS (10) — total_amount matches ORDER_ITEMS below
INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 1, 2999.98);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 2, 1859.97);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 3, 1999.98);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 4, 829.98);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 5, 349.99);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 6, 1139.96);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 7, 279.99);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 8, 6999.99);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 9, 2499.99);

INSERT INTO orders (order_id, customer_id, total_amount)
VALUES (seq_order_id.NEXTVAL, 10, 3099.98);

-- ORDER_ITEMS (15)
INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 1, 1, 1, 1999.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 1, 3, 1, 999.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 2, 2, 1, 1099.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 2, 9, 2, 379.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 3, 3, 2, 999.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 4, 4, 1, 449.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 4, 9, 1, 379.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 5, 5, 1, 349.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 6, 8, 3, 229.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 6, 4, 1, 449.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 7, 10, 1, 279.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 8, 6, 1, 6999.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 9, 7, 1, 2499.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 10, 1, 1, 1999.99);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
VALUES (seq_order_item_id.NEXTVAL, 10, 2, 1, 1099.99);

-- Align stock with sample orders (direct INSERT paths do not decrement stock)
UPDATE products SET stock_quantity = stock_quantity - 2 WHERE product_id = 1;
UPDATE products SET stock_quantity = stock_quantity - 2 WHERE product_id = 2;
UPDATE products SET stock_quantity = stock_quantity - 3 WHERE product_id = 3;
UPDATE products SET stock_quantity = stock_quantity - 2 WHERE product_id = 4;
UPDATE products SET stock_quantity = stock_quantity - 1 WHERE product_id = 5;
UPDATE products SET stock_quantity = stock_quantity - 1 WHERE product_id = 6;
UPDATE products SET stock_quantity = stock_quantity - 1 WHERE product_id = 7;
UPDATE products SET stock_quantity = stock_quantity - 3 WHERE product_id = 8;
UPDATE products SET stock_quantity = stock_quantity - 3 WHERE product_id = 9;
UPDATE products SET stock_quantity = stock_quantity - 1 WHERE product_id = 10;

-- ORDER_STATUS_HISTORY — 5 manual status rows (PENDING already inserted by trigger per order)
INSERT INTO order_status_history (history_id, order_id, status_code)
VALUES (seq_history_id.NEXTVAL, 1, 'PROCESSING');

INSERT INTO order_status_history (history_id, order_id, status_code)
VALUES (seq_history_id.NEXTVAL, 2, 'SHIPPED');

INSERT INTO order_status_history (history_id, order_id, status_code)
VALUES (seq_history_id.NEXTVAL, 3, 'DELIVERED');

INSERT INTO order_status_history (history_id, order_id, status_code)
VALUES (seq_history_id.NEXTVAL, 4, 'PROCESSING');

INSERT INTO order_status_history (history_id, order_id, status_code)
VALUES (seq_history_id.NEXTVAL, 5, 'CANCELLED');

-- PRICE_AUDIT_LOG — 3 manual rows (trigger-driven rows use demos / optional updates)
INSERT INTO price_audit_log (log_id, product_id, old_price, new_price, changed_by, changed_at)
VALUES (seq_audit_id.NEXTVAL, 3, 999.99, 979.99, 1, SYSDATE - 3);

INSERT INTO price_audit_log (log_id, product_id, old_price, new_price, changed_by, changed_at)
VALUES (seq_audit_id.NEXTVAL, 4, 449.99, 429.99, 2, SYSDATE - 2);

INSERT INTO price_audit_log (log_id, product_id, old_price, new_price, changed_by, changed_at)
VALUES (seq_audit_id.NEXTVAL, 5, 349.99, 329.99, 1, SYSDATE - 1);

COMMIT;

PROMPT Sample data loaded.
