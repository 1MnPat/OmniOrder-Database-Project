-- =============================================================================
-- Nexus Commerce — demo / test execution (run after 10_data.sql)
-- =============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;

PROMPT --- Test 1: Register a new customer (standalone procedure) ---
BEGIN
    sp_register_customer(
        p_email          => 'new.buyer@mail.com',
        p_password       => 'demo_register',
        p_first_name     => 'Taylor',
        p_last_name      => 'Brooks',
        p_phone          => '613-555-0199',
        p_address        => '99 Bank St',
        p_city           => 'Ottawa',
        p_postal_code    => 'K1P1A2',
        p_country        => 'Canada'
    );
    DBMS_OUTPUT.PUT_LINE('Test 1 OK: customer registered.');
END;
/

PROMPT --- Test 2: Place an order (standalone procedure) ---
BEGIN
    sp_place_order(
        p_customer_id => 1,
        p_product_id  => 9,
        p_quantity    => 1
    );
    DBMS_OUTPUT.PUT_LINE('Test 2 OK: order placed.');
END;
/

PROMPT --- Test 3: Update order status ---
BEGIN
    sp_update_order_status(
        p_order_id   => 1,
        p_new_status => 'SHIPPED'
    );
    DBMS_OUTPUT.PUT_LINE('Test 3 OK: status updated.');
END;
/

PROMPT --- Test 4: Price change fires audit trigger (set admin context first) ---
BEGIN
    pkg_nc_audit_ctx.g_admin_id := 1;
    UPDATE products
    SET price = 1899.99
    WHERE product_id = 1;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Test 4 OK: price updated; audit row should exist.');
END;
/

PROMPT --- Test 4b: Example using seq_order_id.CURRVAL in UPDATE (same session) ---
BEGIN
    sp_place_order(p_customer_id => 2, p_product_id => 8, p_quantity => 1);
    UPDATE orders
    SET total_amount = total_amount
    WHERE order_id = seq_order_id.CURRVAL;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Test 4b OK: noop update using seq_order_id.CURRVAL.');
END;
/

PROMPT --- Test 5: Standalone functions ---
SELECT fn_get_order_total(1) AS order_1_total FROM dual;
SELECT fn_get_customer_order_count(1) AS cust_1_orders FROM dual;
SELECT fn_is_product_in_stock(1, 5) AS rtx4090_5_units FROM dual;

PROMPT --- Test 6: Package procedures and functions ---
BEGIN
    pkg_nexus_commerce.sp_register_customer(
        p_email       => 'pkg.user@mail.com',
        p_password    => 'pkg_demo',
        p_first_name  => 'Riley',
        p_last_name   => 'Nguyen',
        p_phone       => '250-555-0177',
        p_address     => '780 Douglas St',
        p_city        => 'Victoria',
        p_postal_code => 'V8W1B6',
        p_country     => 'Canada'
    );
END;
/

BEGIN
    pkg_nexus_commerce.sp_place_order(
        p_customer_id => 3,
        p_product_id  => 10,
        p_quantity    => 2
    );
    DBMS_OUTPUT.PUT_LINE('Last package order_id = ' || NVL(TO_CHAR(pkg_nexus_commerce.g_last_order_id), 'NULL'));
END;
/

SELECT pkg_nexus_commerce.fn_get_order_total(3) AS pkg_order_3_total FROM dual;

PROMPT --- Tests finished ---
