-- =============================================================================
-- Nexus Commerce — triggers (4), each with EXCEPTION section
-- Prerequisites: tables, sequences, pkg_nc_audit_ctx. Next: 07_functions.sql
-- =============================================================================

CREATE OR REPLACE TRIGGER trg_order_status_default
    AFTER INSERT ON ORDERS
    FOR EACH ROW
BEGIN
    INSERT INTO order_status_history (
        history_id,
        order_id,
        status_code
    ) VALUES (
        seq_history_id.NEXTVAL,
        :NEW.order_id,
        'PENDING'
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('trg_order_status_default error: ' || SQLERRM);
        RAISE;
END;
/

CREATE OR REPLACE TRIGGER trg_price_audit
    AFTER UPDATE OF price ON PRODUCTS
    FOR EACH ROW
    WHEN (NVL(NEW.price, 0) <> NVL(OLD.price, 0))
DECLARE
    v_admin_id ADMINS.admin_id%TYPE;
BEGIN
    v_admin_id := pkg_nc_audit_ctx.g_admin_id;
    IF v_admin_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20007, 'Set pkg_nc_audit_ctx.g_admin_id before changing price');
    END IF;

    INSERT INTO price_audit_log (
        log_id,
        product_id,
        old_price,
        new_price,
        changed_by,
        changed_at
    ) VALUES (
        seq_audit_id.NEXTVAL,
        :OLD.product_id,
        :OLD.price,
        :NEW.price,
        v_admin_id,
        SYSDATE
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('trg_price_audit error: ' || SQLERRM);
        RAISE;
END;
/

CREATE OR REPLACE TRIGGER trg_validate_order_stock
    BEFORE INSERT ON ORDER_ITEMS
    FOR EACH ROW
DECLARE
    v_stock PRODUCTS.stock_quantity%TYPE;
BEGIN
    SELECT p.stock_quantity
    INTO v_stock
    FROM products p
    WHERE p.product_id = :NEW.product_id
    FOR UPDATE;

    IF v_stock < :NEW.quantity THEN
        RAISE_APPLICATION_ERROR(-20001, 'Insufficient stock');
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20003, 'Product not found for order line');
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        END IF;
        DBMS_OUTPUT.PUT_LINE('trg_validate_order_stock error: ' || SQLERRM);
        RAISE_APPLICATION_ERROR(-20008, 'Stock validation failed: ' || SQLERRM);
END;
/

CREATE OR REPLACE TRIGGER trg_no_shared_email
    BEFORE INSERT ON CUSTOMERS
    FOR EACH ROW
DECLARE
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_cnt
    FROM admins a
    WHERE LOWER(a.email) = LOWER(:NEW.email);

    IF v_cnt > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Email already in use');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- For any unhandled exception, log and raise a general application error.
        DBMS_OUTPUT.PUT_LINE('trg_no_shared_email error (unexpected): ' || SQLERRM);
        RAISE_APPLICATION_ERROR(-20998, 'Unexpected error during customer email validation: ' || SQLERRM);

        RAISE_APPLICATION_ERROR(-20008, 'Customer email validation failed: ' || SQLERRM);
END;
/

PROMPT Triggers created.
