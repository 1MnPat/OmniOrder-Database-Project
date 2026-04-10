-- This should create ONE history record via the trigger, not two.
BEGIN
    pkg_order_management.sp_cancel_order(100); 
END;
/
SELECT * FROM ORDER_STATUS_HISTORY WHERE order_id = 100;

//test1 trigger
UPDATE PRODUCTS SET price = 1100.00 WHERE product_id = 501;
SELECT * FROM PRICE_AUDIT_LOG WHERE product_id = 501;

//test2 trigger
UPDATE ORDERS SET status = 'Shipped' WHERE order_id = 101;
SELECT * FROM ORDER_STATUS_HISTORY WHERE order_id = 101;