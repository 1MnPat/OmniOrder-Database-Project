CREATE OR REPLACE TRIGGER trg_log_price_change
AFTER UPDATE OF price ON PRODUCTS
FOR EACH ROW
WHEN (NEW.price <> OLD.price) -- Ensures logging only occurs if the price value actually changes
DECLARE
    v_user_id USERS.user_id%TYPE;
BEGIN
    -- In a production environment, this would be captured from the application session.
    -- For this project, we default to the Admin ID (101) established in your Architect DML.
    v_user_id := 101; 

    INSERT INTO PRICE_AUDIT_LOG (
        product_id, 
        old_price, 
        new_price, 
        changed_by, 
        changed_at
    ) VALUES (
        :OLD.product_id,
        :OLD.price,
        :NEW.price,
        v_user_id,
        SYSDATE
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error in trg_log_price_change: ' || SQLERRM);
END;
/

CREATE OR REPLACE TRIGGER trg_status_timestamp
AFTER UPDATE OF status ON ORDERS
FOR EACH ROW
WHEN (NEW.status <> OLD.status) -- Only fire if the status string is different
BEGIN
    INSERT INTO ORDER_STATUS_HISTORY (
        order_id, 
        status_code, 
        update_timestamp
    ) VALUES (
        :NEW.order_id,
        :NEW.status,
        CURRENT_TIMESTAMP
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error in trg_status_timestamp: ' || SQLERRM);
END;
/


