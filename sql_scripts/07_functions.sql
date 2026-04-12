-- Three standalone functions. Next: 08_procedures.sql

CREATE OR REPLACE FUNCTION fn_get_order_total (
    p_order_id IN ORDERS.order_id%TYPE
) RETURN NUMBER IS
    v_sum ORDER_ITEMS.unit_price%TYPE;
BEGIN
    SELECT SUM(oi.quantity * oi.unit_price)
    INTO v_sum
    FROM order_items oi
    WHERE oi.order_id = p_order_id;

    IF v_sum IS NULL THEN
        RAISE NO_DATA_FOUND;
    END IF;

    RETURN v_sum;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20009, 'fn_get_order_total failed: ' || SQLERRM);
END fn_get_order_total;
/

CREATE OR REPLACE FUNCTION fn_get_customer_order_count (
    p_customer_id IN CUSTOMERS.customer_id%TYPE
) RETURN NUMBER IS
    v_dummy NUMBER;
    v_cnt   NUMBER;
BEGIN
    SELECT 1
    INTO v_dummy
    FROM customers c
    WHERE c.customer_id = p_customer_id
      AND c.is_active = 1;

    SELECT COUNT(*)
    INTO v_cnt
    FROM orders o
    WHERE o.customer_id = p_customer_id;

    RETURN v_cnt;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20004, 'Customer not found or inactive');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20009, 'fn_get_customer_order_count failed: ' || SQLERRM);
END fn_get_customer_order_count;
/

CREATE OR REPLACE FUNCTION fn_is_product_in_stock (
    p_product_id IN PRODUCTS.product_id%TYPE,
    p_quantity   IN NUMBER
) RETURN VARCHAR2 IS
    v_stock PRODUCTS.stock_quantity%TYPE;
BEGIN
    SELECT p.stock_quantity
    INTO v_stock
    FROM products p
    WHERE p.product_id = p_product_id
      AND p.is_active = 1;

    IF v_stock >= p_quantity THEN
        RETURN 'YES';
    ELSE
        RETURN 'NO';
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20003, 'Product not found or inactive');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20009, 'fn_is_product_in_stock failed: ' || SQLERRM);
END fn_is_product_in_stock;
/

PROMPT Functions OK.
