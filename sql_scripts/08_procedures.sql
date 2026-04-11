-- =============================================================================
-- Nexus Commerce — standalone procedures (4), cursors where required
-- Next: 09_package_nexus_commerce.sql
-- =============================================================================

CREATE OR REPLACE PROCEDURE sp_register_customer (
    p_email          IN CUSTOMERS.email%TYPE,
    p_password       IN CUSTOMERS.password%TYPE,
    p_first_name     IN CUSTOMERS.first_name%TYPE,
    p_last_name      IN CUSTOMERS.last_name%TYPE,
    p_phone          IN CUSTOMERS.phone%TYPE,
    p_address        IN CUSTOMERS.shipping_address%TYPE,
    p_city           IN CUSTOMERS.city%TYPE,
    p_postal_code    IN CUSTOMERS.postal_code%TYPE,
    p_country        IN CUSTOMERS.country%TYPE
) IS
BEGIN
    INSERT INTO customers (
        customer_id,
        email,
        password,
        first_name,
        last_name,
        phone,
        shipping_address,
        city,
        postal_code,
        country
    ) VALUES (
        seq_customer_id.NEXTVAL,
        p_email,
        p_password,
        p_first_name,
        p_last_name,
        p_phone,
        p_address,
        p_city,
        p_postal_code,
        p_country
    );

    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20002, 'Email already registered');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20009, 'sp_register_customer failed: ' || SQLERRM);
END sp_register_customer;
/

CREATE OR REPLACE PROCEDURE sp_place_order (
    p_customer_id IN ORDERS.customer_id%TYPE,
    p_product_id  IN PRODUCTS.product_id%TYPE,
    p_quantity    IN ORDER_ITEMS.quantity%TYPE
) IS
    CURSOR c_product IS
        SELECT pr.product_id,
               pr.price,
               pr.stock_quantity
        FROM products pr
        WHERE pr.product_id = p_product_id
          AND pr.is_active = 1
        FOR UPDATE OF pr.stock_quantity;

    r_prod   c_product%ROWTYPE;
    v_oid    ORDERS.order_id%TYPE;
    v_total  ORDERS.total_amount%TYPE;
BEGIN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE_APPLICATION_ERROR(-20010, 'Quantity must be positive');
    END IF;

    OPEN c_product;
    FETCH c_product INTO r_prod;
    IF c_product%NOTFOUND THEN
        CLOSE c_product;
        RAISE_APPLICATION_ERROR(-20003, 'Product not found or inactive');
    END IF;

    IF r_prod.stock_quantity < p_quantity THEN
        CLOSE c_product;
        RAISE_APPLICATION_ERROR(-20001, 'Insufficient stock');
    END IF;

    v_total := r_prod.price * p_quantity;

    INSERT INTO orders (order_id, customer_id, total_amount)
    VALUES (seq_order_id.NEXTVAL, p_customer_id, v_total)
    RETURNING order_id INTO v_oid;

    INSERT INTO order_items (
        order_item_id,
        order_id,
        product_id,
        quantity,
        unit_price
    ) VALUES (
        seq_order_item_id.NEXTVAL,
        v_oid,
        p_product_id,
        p_quantity,
        r_prod.price
    );

    UPDATE products p
    SET p.stock_quantity = p.stock_quantity - p_quantity
    WHERE p.product_id = p_product_id;

    CLOSE c_product;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        IF c_product%ISOPEN THEN
            CLOSE c_product;
        END IF;
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        END IF;
        RAISE_APPLICATION_ERROR(-20009, 'sp_place_order failed: ' || SQLERRM);
END sp_place_order;
/

CREATE OR REPLACE PROCEDURE sp_update_order_status (
    p_order_id   IN ORDERS.order_id%TYPE,
    p_new_status IN ORDER_STATUS_HISTORY.status_code%TYPE
) IS
    CURSOR c_order IS
        SELECT o.order_id
        FROM orders o
        WHERE o.order_id = p_order_id;

    r_order c_order%ROWTYPE;
BEGIN
    OPEN c_order;
    FETCH c_order INTO r_order;
    IF c_order%NOTFOUND THEN
        CLOSE c_order;
        RAISE_APPLICATION_ERROR(-20004, 'Order not found');
    END IF;
    CLOSE c_order;

    IF p_new_status NOT IN (
        'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    ) THEN
        RAISE_APPLICATION_ERROR(-20005, 'Invalid order status code');
    END IF;

    INSERT INTO order_status_history (
        history_id,
        order_id,
        status_code
    ) VALUES (
        seq_history_id.NEXTVAL,
        p_order_id,
        p_new_status
    );

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        IF c_order%ISOPEN THEN
            CLOSE c_order;
        END IF;
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        END IF;
        RAISE_APPLICATION_ERROR(-20009, 'sp_update_order_status failed: ' || SQLERRM);
END sp_update_order_status;
/

CREATE OR REPLACE PROCEDURE sp_deactivate_product (
    p_product_id IN PRODUCTS.product_id%TYPE,
    p_admin_id   IN ADMINS.admin_id%TYPE
) IS
    CURSOR c_prod IS
        SELECT p.product_id,
               p.is_active
        FROM products p
        WHERE p.product_id = p_product_id;

    r_prod c_prod%ROWTYPE;
    v_ok   NUMBER;
BEGIN
    SELECT 1 INTO v_ok FROM admins a WHERE a.admin_id = p_admin_id AND a.is_active = 1;

    OPEN c_prod;
    FETCH c_prod INTO r_prod;
    IF c_prod%NOTFOUND THEN
        CLOSE c_prod;
        RAISE_APPLICATION_ERROR(-20003, 'Product not found');
    END IF;

    IF r_prod.is_active = 0 THEN
        CLOSE c_prod;
        RAISE_APPLICATION_ERROR(-20006, 'Product already inactive');
    END IF;
    CLOSE c_prod;

    UPDATE products p
    SET p.is_active = 0
    WHERE p.product_id = p_product_id;

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20004, 'Admin not found or inactive');
    WHEN OTHERS THEN
        IF c_prod%ISOPEN THEN
            CLOSE c_prod;
        END IF;
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        END IF;
        RAISE_APPLICATION_ERROR(-20009, 'sp_deactivate_product failed: ' || SQLERRM);
END sp_deactivate_product;
/

PROMPT Standalone procedures created.
