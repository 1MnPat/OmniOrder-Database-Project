-- =========================
-- 1. SEQUENCES
-- =========================
CREATE SEQUENCE order_item_seq;
/

-- =========================
-- 2. TYPES
-- =========================
CREATE OR REPLACE TYPE t_order_item AS OBJECT (
    product_id NUMBER,
    quantity   NUMBER
);
/

CREATE OR REPLACE TYPE t_order_item_list AS TABLE OF t_order_item;
/

-- =========================
-- 3. PACKAGE SPEC
-- =========================
CREATE OR REPLACE PACKAGE pkg_order_management AS

    PROCEDURE sp_create_order (
        p_user_id IN NUMBER,
        p_items   IN t_order_item_list
    );

    PROCEDURE sp_cancel_order (
        p_order_id IN NUMBER
    );

    FUNCTION fn_calculate_order_total (
        p_order_id IN NUMBER
    ) RETURN NUMBER;

    FUNCTION fn_calculate_discount (
        p_user_id IN NUMBER,
        p_total   IN NUMBER
    ) RETURN NUMBER;

END pkg_order_management;
/

-- =========================
-- 4. PACKAGE BODY
-- =========================
CREATE OR REPLACE PACKAGE BODY pkg_order_management AS

    -- =========================================
    -- CREATE ORDER
    -- =========================================
    PROCEDURE sp_create_order (
        p_user_id IN NUMBER,
        p_items   IN t_order_item_list
    )
    IS
        v_order_id NUMBER;
        v_stock    NUMBER;
        v_price    NUMBER;
        v_total    NUMBER := 0;
        v_dummy    NUMBER;
    BEGIN
        -- Validate input
        IF p_items IS NULL OR p_items.COUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'Order must contain at least one item');
        END IF;

        -- Validate user
        SELECT 1 INTO v_dummy FROM users WHERE user_id = p_user_id;

        -- Create order
        SELECT seq_order_id.NEXTVAL INTO v_order_id FROM dual;

        INSERT INTO orders (order_id, user_id, total_amount)
        VALUES (v_order_id, p_user_id, 0);

        -- Process items
        FOR i IN 1 .. p_items.COUNT LOOP

            BEGIN
                SELECT stock_quantity, price
                INTO v_stock, v_price
                FROM products
                WHERE product_id = p_items(i).product_id
                FOR UPDATE NOWAIT;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    RAISE_APPLICATION_ERROR(-20003,
                        'Product not found: ' || p_items(i).product_id);
            END;

            IF v_stock < p_items(i).quantity THEN
                RAISE_APPLICATION_ERROR(-20001,
                    'Not enough stock for product ' || p_items(i).product_id);
            END IF;

            INSERT INTO order_items (
                order_item_id,
                order_id,
                product_id,
                quantity,
                unit_price
            )
            VALUES (
                order_item_seq.NEXTVAL,
                v_order_id,
                p_items(i).product_id,
                p_items(i).quantity,
                v_price
            );

            UPDATE products
            SET stock_quantity = stock_quantity - p_items(i).quantity
            WHERE product_id = p_items(i).product_id;

            v_total := v_total + (p_items(i).quantity * v_price);

        END LOOP;

        UPDATE orders
        SET total_amount = v_total
        WHERE order_id = v_order_id;

        COMMIT;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'User not found');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;


    -- =========================================
    -- CANCEL ORDER (NEW)
    -- =========================================
    PROCEDURE sp_cancel_order (
        p_order_id IN NUMBER
    )
    IS
        v_dummy NUMBER;
    BEGIN
        -- Validate order exists
        SELECT 1 INTO v_dummy FROM orders WHERE order_id = p_order_id;

        -- Restore stock
        FOR item IN (
            SELECT product_id, quantity
            FROM order_items
            WHERE order_id = p_order_id
        ) LOOP

            UPDATE products
            SET stock_quantity = stock_quantity + item.quantity
            WHERE product_id = item.product_id;

        END LOOP;

        -- Update order status
        UPDATE orders
        SET status = 'CANCELLED'
        WHERE order_id = p_order_id;

        -- Log status history
        INSERT INTO order_status_history (
            order_id,
            status_code,
            update_timestamp
        )
        VALUES (
            p_order_id,
            'CANCELLED',
            SYSTIMESTAMP
        );

        COMMIT;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20005, 'Order not found');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;


    -- =========================================
    -- FUNCTION: ORDER TOTAL
    -- =========================================
    FUNCTION fn_calculate_order_total (
        p_order_id IN NUMBER
    ) RETURN NUMBER
    IS
        v_total NUMBER;
    BEGIN
        SELECT SUM(quantity * unit_price)
        INTO v_total
        FROM order_items
        WHERE order_id = p_order_id;

        RETURN NVL(v_total, 0);
    END;


    -- =========================================
    -- FUNCTION: DISCOUNT
    -- =========================================
    FUNCTION fn_calculate_discount (
        p_user_id IN NUMBER,
        p_total   IN NUMBER
    ) RETURN NUMBER
    IS
        v_role VARCHAR2(20);
        v_discount NUMBER := 0;
    BEGIN
        SELECT ur.role_name
        INTO v_role
        FROM users u
        JOIN user_roles ur ON u.role_id = ur.role_id
        WHERE u.user_id = p_user_id;

        IF v_role = 'ADMIN' THEN
            v_discount := p_total * 0.15;
        ELSIF p_total > 300 THEN
            v_discount := p_total * 0.1;
        END IF;

        RETURN v_discount;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 0;
    END;

END pkg_order_management;
/

-- =========================
-- 5. TEST CREATE ORDER
-- =========================
DECLARE
    v_items t_order_item_list := t_order_item_list(
        t_order_item(1, 2),
        t_order_item(2, 1)
    );
BEGIN
    pkg_order_management.sp_create_order(1, v_items);
END;
/

-- =========================
-- 6. TEST CANCEL ORDER
-- =========================
BEGIN
    pkg_order_management.sp_cancel_order(100); -- use a valid order_id
END;
/





























































































































































































