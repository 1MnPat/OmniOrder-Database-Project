-- =============================================================================
-- Nexus Commerce — CREATE TABLE (FK-safe order)
-- Prerequisites: none. Next: 03_sequences.sql
-- =============================================================================

CREATE TABLE ADMINS (
    admin_id      NUMBER        CONSTRAINT pk_admins PRIMARY KEY,
    email         VARCHAR2(100) NOT NULL,
    password      VARCHAR2(100) NOT NULL,
    first_name    VARCHAR2(50)  NOT NULL,
    last_name     VARCHAR2(50)  NOT NULL,
    created_at    DATE          DEFAULT SYSDATE,
    is_active     NUMBER(1)     DEFAULT 1,
    CONSTRAINT uk_admins_email UNIQUE (email),
    CONSTRAINT chk_admins_active CHECK (is_active IN (0, 1))
);

CREATE TABLE CUSTOMERS (
    customer_id      NUMBER        CONSTRAINT pk_customers PRIMARY KEY,
    email            VARCHAR2(100) NOT NULL,
    password         VARCHAR2(100) NOT NULL,
    first_name       VARCHAR2(50)  NOT NULL,
    last_name        VARCHAR2(50)  NOT NULL,
    phone            VARCHAR2(20),
    shipping_address VARCHAR2(255) NOT NULL,
    city             VARCHAR2(100) NOT NULL,
    postal_code      VARCHAR2(20)  NOT NULL,
    country          VARCHAR2(100) NOT NULL,
    created_at       DATE          DEFAULT SYSDATE,
    is_active        NUMBER(1)     DEFAULT 1,
    CONSTRAINT uk_customers_email UNIQUE (email),
    CONSTRAINT chk_customers_active CHECK (is_active IN (0, 1)),
    CONSTRAINT chk_cust_email CHECK (email LIKE '%@%')
);

CREATE TABLE CATEGORIES (
    category_id   NUMBER       CONSTRAINT pk_categories PRIMARY KEY,
    category_name VARCHAR2(50) NOT NULL
);

CREATE TABLE PRODUCTS (
    product_id      NUMBER        CONSTRAINT pk_products PRIMARY KEY,
    product_name    VARCHAR2(100) NOT NULL,
    description     VARCHAR2(500),
    price           NUMBER(10, 2) NOT NULL,
    stock_quantity  NUMBER        NOT NULL,
    category_id     NUMBER,
    is_active       NUMBER(1)     DEFAULT 1,
    created_at      DATE          DEFAULT SYSDATE,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES CATEGORIES (category_id),
    CONSTRAINT chk_price CHECK (price > 0),
    CONSTRAINT chk_stock CHECK (stock_quantity >= 0)
);

CREATE TABLE ORDERS (
    order_id     NUMBER        CONSTRAINT pk_orders PRIMARY KEY,
    customer_id  NUMBER        NOT NULL,
    order_date   DATE          DEFAULT SYSDATE,
    total_amount NUMBER(10, 2) NOT NULL,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES CUSTOMERS (customer_id),
    CONSTRAINT chk_total CHECK (total_amount > 0)
);

CREATE TABLE ORDER_ITEMS (
    order_item_id NUMBER        CONSTRAINT pk_order_items PRIMARY KEY,
    order_id      NUMBER        NOT NULL,
    product_id    NUMBER        NOT NULL,
    quantity      NUMBER        NOT NULL,
    unit_price    NUMBER(10, 2) NOT NULL,
    CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES ORDERS (order_id),
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES PRODUCTS (product_id),
    CONSTRAINT chk_qty CHECK (quantity > 0),
    CONSTRAINT chk_unit_price CHECK (unit_price > 0)
);

CREATE TABLE ORDER_STATUS_HISTORY (
    history_id       NUMBER       CONSTRAINT pk_osh PRIMARY KEY,
    order_id         NUMBER       NOT NULL,
    status_code      VARCHAR2(20) NOT NULL,
    update_timestamp TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES ORDERS (order_id),
    CONSTRAINT chk_status CHECK (status_code IN (
        'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    ))
);

CREATE TABLE PRICE_AUDIT_LOG (
    log_id     NUMBER        CONSTRAINT pk_pal PRIMARY KEY,
    product_id NUMBER        NOT NULL,
    old_price  NUMBER(10, 2) NOT NULL,
    new_price  NUMBER(10, 2) NOT NULL,
    changed_by NUMBER        NOT NULL,
    changed_at DATE          DEFAULT SYSDATE,
    CONSTRAINT fk_pal_product FOREIGN KEY (product_id) REFERENCES PRODUCTS (product_id),
    CONSTRAINT fk_pal_admin FOREIGN KEY (changed_by) REFERENCES ADMINS (admin_id)
);

PROMPT Tables created.
