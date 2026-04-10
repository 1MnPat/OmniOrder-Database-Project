-- Inserting 5 records for User Roles
INSERT INTO USER_ROLES (role_id, role_name) VALUES (1, 'Admin');
INSERT INTO USER_ROLES (role_id, role_name) VALUES (2, 'Customer');
INSERT INTO USER_ROLES (role_id, role_name) VALUES (3, 'Manager');
INSERT INTO USER_ROLES (role_id, role_name) VALUES (4, 'Sales_Rep');
INSERT INTO USER_ROLES (role_id, role_name) VALUES (5, 'IT_Support');


-- Inserting 5 records for Product Categories
INSERT INTO CATEGORIES (category_id, category_name, description) VALUES (10, 'Electronics', 'Smartphones, laptops, and hardware');
INSERT INTO CATEGORIES (category_id, category_name, description) VALUES (20, 'Digital Art', 'High-quality digital illustrations and prints');
INSERT INTO CATEGORIES (category_id, category_name, description) VALUES (30, 'Apparel', 'Branded clothing and accessories');
INSERT INTO CATEGORIES (category_id, category_name, description) VALUES (40, 'Home and Office', 'Furniture and stationery for workspace');
INSERT INTO CATEGORIES (category_id, category_name, description) VALUES (50, 'Services', 'Consulting and custom design services');

-- Run this to fix the Parent Key error for Users
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (101, 'Mohammednaeem', 'Patel', 'naeem@example.com', 'admin_pass', 1);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (102, 'Alice', 'Smith', 'alice@test.com', 'pass', 2);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (103, 'Bob', 'Jones', 'bob@test.com', 'pass', 2);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (104, 'Charlie', 'Brown', 'charlie@test.com', 'pass', 2);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (105, 'Diana', 'Prince', 'diana@test.com', 'pass', 2);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (106, 'Edward', 'Norton', 'edward@test.com', 'pass', 3);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (107, 'Fiona', 'Gallagher', 'fiona@test.com', 'pass', 2);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (108, 'George', 'Costanza', 'george@test.com', 'pass', 2);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (109, 'Hannah', 'Baker', 'hannah@test.com', 'pass', 2);
INSERT INTO USERS (user_id, first_name, last_name, email, password, role_id) 
VALUES (110, 'Ian', 'Curtis', 'ian@test.com', 'pass', 4);




INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (501, 'Smartphone Ultra', 999.99, 25, 10);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (502, 'Laptop Pro 16', 1500.00, 10, 10);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (503, 'Abstract Canvas Art', 75.50, 5, 20);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (504, 'Digital Portrait Comm', 120.00, 99, 20);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (505, 'Branded Hoodie', 45.00, 40, 30);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (506, 'Leather Office Chair', 250.00, 15, 40);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (507, 'Mechanical Keyboard', 85.00, 30, 10);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (508, 'Logo Design Service', 500.00, 99, 50);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (509, 'Wireless Earbuds', 129.99, 60, 10);

INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id) 
VALUES (510, 'Ergonomic Mouse', 55.00, 22, 40);



-- Using the sequence to insert orders for different users
INSERT INTO ORDERS (order_id, user_id, order_date, total_amount, status) 
VALUES (seq_order_id.NEXTVAL, 102, SYSDATE - 5, 1129.98, 'Shipped');

INSERT INTO ORDERS (order_id, user_id, order_date, total_amount, status) 
VALUES (seq_order_id.NEXTVAL, 103, SYSDATE - 3, 45.00, 'Paid');

INSERT INTO ORDERS (order_id, user_id, order_date, total_amount, status) 
VALUES (seq_order_id.NEXTVAL, 104, SYSDATE - 2, 1500.00, 'Pending');

INSERT INTO ORDERS (order_id, user_id, order_date, total_amount, status) 
VALUES (seq_order_id.NEXTVAL, 106, SYSDATE - 1, 155.00, 'Shipped');

INSERT INTO ORDERS (order_id, user_id, order_date, total_amount, status) 
VALUES (seq_order_id.NEXTVAL, 107, SYSDATE, 85.00, 'Processing');



-- Items for Order 100
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (1, 100, 501, 1, 999.99);
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (2, 100, 509, 1, 129.99);

-- Items for Order 101
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (3, 101, 505, 1, 45.00);

-- Items for Order 102
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (4, 102, 502, 1, 1500.00);

-- Items for Order 103
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (5, 103, 510, 1, 55.00);
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (6, 103, 504, 1, 100.00);

-- Items for Order 104
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (7, 104, 507, 1, 85.00);

-- Additional "meaningful data" to reach the 10-record requirement
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (8, 100, 510, 1, 55.00);
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (9, 102, 503, 2, 75.50);
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_id, quantity, unit_price) VALUES (10, 104, 506, 1, 250.00);




-- Initial History for Order 100
INSERT INTO ORDER_STATUS_HISTORY (order_id, status_code) VALUES (100, 'ORDER_PLACED');
INSERT INTO ORDER_STATUS_HISTORY (order_id, status_code) VALUES (100, 'PAYMENT_RECEIVED');

-- Initial Price Log (Pretend john smith updated a price)
INSERT INTO PRICE_AUDIT_LOG (product_id, old_price, new_price, changed_by) 
VALUES (501, 1050.00, 999.99, 101);

