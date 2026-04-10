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
    -- Global Variables (Requirement: 1.5 Marks)
    gv_tax_rate CONSTANT NUMBER := 0.13;

    -- Existing Procedures
    PROCEDURE sp_create_order (
        p_user_id IN USERS.user_id%TYPE,
        p_items   IN t_order_item_list
    );

    PROCEDURE sp_cancel_order (
        p_order_id IN ORDERS.order_id%TYPE
    );

    -- NEW: Manager-specific product management
    PROCEDURE sp_add_product_by_manager (
        p_manager_id   IN USERS.user_id%TYPE,
        p_product_name IN PRODUCTS.product_name%TYPE,
        p_price        IN PRODUCTS.price%TYPE,
        p_stock        IN PRODUCTS.stock_quantity%TYPE,
        p_category_id  IN PRODUCTS.category_id%TYPE
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

    -- =========================================
    -- NEW: MANAGER ADD PRODUCT (Autofill Brand)
    -- =========================================
    PROCEDURE sp_add_product_by_manager (
        p_manager_id   IN USERS.user_id%TYPE,
        p_product_name IN PRODUCTS.product_name%TYPE,
        p_price        IN PRODUCTS.price%TYPE,
        p_stock        IN PRODUCTS.stock_quantity%TYPE,
        p_category_id  IN PRODUCTS.category_id%TYPE
    ) IS
        v_brand_id BRANDS.brand_id%TYPE;
        v_role     USER_ROLES.role_name%TYPE;
    BEGIN
        -- Security: Verify user is a Manager
        SELECT r.role_name INTO v_role 
        FROM USERS u JOIN USER_ROLES r ON u.role_id = r.role_id 
        WHERE u.user_id = p_manager_id;

        IF v_role <> 'Manager' THEN
            RAISE_APPLICATION_ERROR(-20010, 'Access Denied: Only Managers can list products.');
        END IF;

        -- Autofill: Find brand owned by this manager
        SELECT brand_id INTO v_brand_id 
        FROM BRANDS 
        WHERE owner_id = p_manager_id;

        -- Insert Product using the Architecture Sequence
        INSERT INTO PRODUCTS (product_id, product_name, price, stock_quantity, category_id, brand_id)
        VALUES (prod_seq.NEXTVAL, p_product_name, p_price, p_stock, p_category_id, v_brand_id);
        
        COMMIT;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20011, 'Profile Error: Manager has no associated Brand.');
    END;

    -- =========================================
    -- EXISTING: CREATE ORDER
    -- =========================================
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

    -- =========================================
    -- EXISTING: CANCEL ORDER
    -- =========================================
    PROCEDURE sp_cancel_order (p_order_id IN ORDERS.order_id%TYPE) IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1 INTO v_dummy FROM orders WHERE order_id = p_order_id;

        FOR item IN (SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id) LOOP
            UPDATE products SET stock_quantity = stock_quantity + item.quantity
            WHERE product_id = item.product_id;
        END LOOP;

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