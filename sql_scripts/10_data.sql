-- Sample data. Run after triggers exist. Next: 11_test.sql
-- Stock: inserts into order_items do not decrement stock; fixes are in UPDATEs at the end.
-- Assumes product_id 1..10 and order_id 1..10 on a clean install (sequences from 1).
-- SET DEFINE OFF: in SQL*Plus, & in strings would otherwise prompt for substitution.

SET DEFINE OFF

-- Add image_url if the table was created before that column existed.
DECLARE
  c NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO c
  FROM user_tab_columns
  WHERE UPPER(table_name) = 'PRODUCTS'
    AND UPPER(column_name) = 'IMAGE_URL';
  IF c = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE products ADD image_url VARCHAR2(512)';
  END IF;
END;
/

-- admins
INSERT INTO admins (admin_id, email, password, first_name, last_name)
VALUES (seq_admin_id.NEXTVAL, 'yaksh@nexusgpu.com', '$2a$10$PcuDBcJ1lME9EEy6laiwJuJp5nU20c.VZ2i7Y7chGBCUIwbU7FSCu', 'Yaksh', 'Patel');

INSERT INTO admins (admin_id, email, password, first_name, last_name)
VALUES (seq_admin_id.NEXTVAL, 'naeem@nexusgpu.com', '$2a$10$.NwaZFmh/jJ7YI2VCdY7/O8SwQJ7XoMXifqFLt/D7IVKuNmjNcQTa', 'Mohammed', 'Patel');

INSERT INTO admins (admin_id, email, password, first_name, last_name)
VALUES (seq_admin_id.NEXTVAL, 'mn@nexusgpu.com', '$2a$10$h79k6ZFlKcTZZLHwH4VwXu83F9mVONrIvXGRxGe5ZTZxt4U/SY2Eu', 'Mn', 'Patel');

-- customers (emails must not match admins)
INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'sam.rivera@mail.com', '$2a$10$btJ3efCUuoP.Kn9gAaEeNux5cHxIt0qVOx/Whg2/d5itySbxFnNCG', 'Sam', 'Rivera', '416-555-0101', '120 Front St W', 'Toronto', 'M5J2T1', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'mei.ng@mail.com', '$2a$10$enwVn0fQUb5carDpYGpiUuRufHRcgMsN4ldsX3sq6tVZ19LQvgio.', 'Mei', 'Ng', '604-555-0102', '910 Granville St', 'Vancouver', 'V6Z1K7', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'omar.hassan@mail.com', '$2a$10$VpkyUxluQBSmr8xvDetC..C2HTQiqV4Hqbk9.SojNt0gFfg1rszDC', 'Omar', 'Hassan', '514-555-0103', '1455 Peel St', 'Montreal', 'H3A1T8', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'ava.martin@mail.com', '$2a$10$WHZkmeEUeJAPZFl8W4WA5uA39BhsU1Nmfki9za0tbYwu867astvhG', 'Ava', 'Martin', '403-555-0104', '200 8 Ave SW', 'Calgary', 'T2P1B5', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'li.wei@mail.com', '$2a$10$5FXJhN7MR1XroljdOxnPHOS.ZgfiHtJTMZAAsWQXlk4uVgMXbsZqK', 'Li', 'Wei', '780-555-0105', '10180 101 St NW', 'Edmonton', 'T5J3S4', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'noah.brown@mail.com', '$2a$10$FXR/sfd2.bGPUJdsO2edNez4/J3PhhiozvUgGMFJZZ3KCzFJoizka', 'Noah', 'Brown', '902-555-0106', '1969 Upper Water St', 'Halifax', 'B3J3R7', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'priya.khan@mail.com', '$2a$10$XA10p93G2yCfZ6ycECn4/OaXkgmU3FTkZ7x8nCtC.PdP5cu5odUH2', 'Priya', 'Khan', '204-555-0107', '450 Portage Ave', 'Winnipeg', 'R3C0E3', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'ethan.clark@mail.com', '$2a$10$q38oUE5Kusx8QgqvP07XQe0T.CxAUDViyi/1WLuCtNoaOzDYVrcIa', 'Ethan', 'Clark', '506-555-0108', '15 King St', 'Saint John', 'E2L1G4', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'sofia.garcia@mail.com', '$2a$10$U7RkSPM0S50rkY3a4/jN1ueqPC5r7PQYi7EDt3p.m6hSPCpdx2hqu', 'Sofia', 'Garcia', '867-555-0109', '5016 49 St', 'Yellowknife', 'X1A2P8', 'Canada');

INSERT INTO customers (customer_id, email, password, first_name, last_name, phone, shipping_address, city, postal_code, country)
VALUES (seq_customer_id.NEXTVAL, 'daniel.cho@mail.com', '$2a$10$71AnAT4j1N.Y0YJOp3dQN.Wq1/au8pNR3zPXoZKa3JqTfPdC5ybQO', 'Daniel', 'Cho', '709-555-0110', '100 New Gower St', 'St. John''s', 'A1C1B3', 'Canada');

-- categories
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Gaming');
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Workstation');
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Budget');
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Professional');
INSERT INTO categories (category_id, category_name) VALUES (seq_category_id.NEXTVAL, 'Mining');

-- products (stock reconciled after order_items)
INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce RTX 4090', 'Flagship Ada GPU, 24GB GDDR6X, DLSS 3', 'https://images.unsplash.com/photo-1591488320449-011701bb6704', 1999.99, 250, 1);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce RTX 4080 SUPER', 'High-end Ada, 16GB GDDR6X', 'https://images.unsplash.com/photo-1587825140708-dfaf2ae6942e', 1099.99, 250, 1);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'AMD Radeon RX 7900 XTX', 'RDNA 3 enthusiast, 24GB', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd17b', 999.99, 250, 1);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce RTX 4060 Ti', '1080p/1440p sweet spot, 8GB', 'https://images.unsplash.com/photo-1624707752800-e0dfc8790cc5', 449.99, 300, 3);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'Intel Arc A770 Limited Edition', 'Xe HPG, 16GB, ray tracing', 'https://images.unsplash.com/photo-1631037763483-f874a1fd9b9e', 349.99, 300, 3);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA RTX 5000 Ada Generation', 'Workstation 32GB ECC', 'https://images.unsplash.com/photo-1600869405200-e0df0c8e3a2a', 6999.99, 80, 2);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'AMD Radeon PRO W7800', 'Professional 32GB', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', 2499.99, 70, 4);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce GTX 1660 SUPER', 'Budget 1080p workhorse, 6GB', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5', 229.99, 400, 3);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'NVIDIA GeForce RTX 3060', 'Popular 12GB mainstream', 'https://images.unsplash.com/photo-1611186871348-b1ce697e52bf', 379.99, 350, 3);

INSERT INTO products (product_id, product_name, description, image_url, price, stock_quantity, category_id)
VALUES (seq_product_id.NEXTVAL, 'AMD Radeon RX 6600', 'Efficient 1080p, compact designs', 'https://images.unsplash.com/photo-1555616635-545de94b7e9c', 279.99, 220, 5);

-- orders (totals match order_items)
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

-- order_items
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

-- align stock with lines above
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

-- order_status_history (PENDING already added by trigger on each new order)
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

-- price_audit_log (sample rows; live price changes also go here via trigger)
INSERT INTO price_audit_log (log_id, product_id, old_price, new_price, changed_by, changed_at)
VALUES (seq_audit_id.NEXTVAL, 3, 999.99, 979.99, 1, SYSDATE - 3);

INSERT INTO price_audit_log (log_id, product_id, old_price, new_price, changed_by, changed_at)
VALUES (seq_audit_id.NEXTVAL, 4, 449.99, 429.99, 2, SYSDATE - 2);

INSERT INTO price_audit_log (log_id, product_id, old_price, new_price, changed_by, changed_at)
VALUES (seq_audit_id.NEXTVAL, 5, 349.99, 329.99, 1, SYSDATE - 1);

COMMIT;

SET DEFINE ON

PROMPT Data load done.
