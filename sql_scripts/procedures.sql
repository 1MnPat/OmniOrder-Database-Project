-- =========================
-- 1. SEQUENCES & TYPES
-- =========================
-- Dropping to ensure clean re-runability
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE order_item_seq';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
CREATE SEQUENCE order_item_seq START WITH 1;
/

CREATE OR REPLACE TYPE t_order_item AS OBJECT (
    product_id NUMBER,
    quantity   NUMBER
);
/
CREATE OR REPLACE TYPE t_order_item_list AS TABLE OF t_order_item;
/

-- =========================
-- 3. PACKAGE SPECIFICATION
-- =========================
CREATE OR REPLACE PACKAGE pkg_order_management AS
    -- GLOBAL VARIABLE (Required for 1.5 Marks)
    gv_tax_rate CONSTANT NUMBER := 0.13;

    PROCEDURE sp_create_order (
        p_user_id IN USERS.user_id%TYPE,
        p_items   IN t_order_item_list
    );

    PROCEDURE sp_cancel_order (
        p_order_id IN ORDERS.order_id%TYPE
    );

    FUNCTION fn_calculate_order_total (
        p_order_id IN ORDERS.order_id%TYPE
    ) RETURN NUMBER;

END pkg_order_management;
/

-- =========================
-- 4. PACKAGE BODY
-- =========================
CREATE OR REPLACE PACKAGE BODY pkg_order_management AS

    PROCEDURE sp_create_order (
        p_user_id IN USERS.user_id%TYPE,
        p_items   IN t_order_item_list
    ) IS
        v_order_id ORDERS.order_id%TYPE;
        v_stock    PRODUCTS.stock_quantity%TYPE;
        v_price    PRODUCTS.price%TYPE;
        v_total    NUMBER := 0;
        v_dummy    NUMBER;
    BEGIN
        IF p_items IS NULL OR p_items.COUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'Order must contain at least one item');
        END IF;

        SELECT 1 INTO v_dummy FROM users WHERE user_id = p_user_id;

        -- Use your Architect Sequence
        SELECT seq_order_id.NEXTVAL INTO v_order_id FROM dual;

        INSERT INTO orders (order_id, user_id, total_amount, status)
        VALUES (v_order_id, p_user_id, 0, 'Pending');

        FOR i IN 1 .. p_items.COUNT LOOP
            BEGIN
                SELECT stock_quantity, price INTO v_stock, v_price
                FROM products WHERE product_id = p_items(i).product_id
                FOR UPDATE;

                IF v_stock < p_items(i).quantity THEN
                    RAISE_APPLICATION_ERROR(-20001, 'Insufficient stock for product ' || p_items(i).product_id);
                END IF;

                INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
                VALUES (order_item_seq.NEXTVAL, v_order_id, p_items(i).product_id, p_items(i).quantity, v_price);

                UPDATE products SET stock_quantity = stock_quantity - p_items(i).quantity
                WHERE product_id = p_items(i).product_id;

                v_total := v_total + (p_items(i).quantity * v_price);
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    RAISE_APPLICATION_ERROR(-20003, 'Product not found: ' || p_items(i).product_id);
            END;
        END LOOP;

        UPDATE orders SET total_amount = v_total WHERE order_id = v_order_id;
        COMMIT;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'User not found');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;

    PROCEDURE sp_cancel_order (p_order_id IN ORDERS.order_id%TYPE) IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1 INTO v_dummy FROM orders WHERE order_id = p_order_id;

        FOR item IN (SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id) LOOP
            UPDATE products SET stock_quantity = stock_quantity + item.quantity
            WHERE product_id = item.product_id;
        END LOOP;

        -- This UPDATE will trigger your trg_status_timestamp automatically.
        -- Manual INSERT removed to avoid duplication.
        UPDATE orders SET status = 'CANCELLED' WHERE order_id = p_order_id;
        COMMIT;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20005, 'Order not found');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;

    FUNCTION fn_calculate_order_total (p_order_id IN ORDERS.order_id%TYPE) RETURN NUMBER IS
        v_total NUMBER;
    BEGIN
        SELECT SUM(quantity * unit_price) INTO v_total FROM order_items WHERE order_id = p_order_id;
        RETURN NVL(v_total, 0);
    END;

END pkg_order_management;
/