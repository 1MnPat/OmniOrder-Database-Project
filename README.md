# Nexus Commerce — Database Project (COMP214)

Oracle PL/SQL backend for **Nexus Commerce**, a company-owned GPU store: **customers** buy **products**; **admins** manage catalog and orders. No marketplace, no roles table—only `ADMINS` and `CUSTOMERS`.

**Schema (8 tables):** `ADMINS`, `CUSTOMERS`, `CATEGORIES`, `PRODUCTS`, `ORDERS`, `ORDER_ITEMS`, `ORDER_STATUS_HISTORY`, `PRICE_AUDIT_LOG`.

Scripts live in **`sql_scripts/`** and are numbered so you run them in order.

---

## Prerequisites

- **Oracle Database** (e.g. 21c, 23c, or XE) with a schema/user where you can create tables, sequences, indexes, triggers, procedures, functions, and packages.
- A client that can run scripts: **SQL\*Plus**, **SQLcl**, or **SQL Developer** (see notes below).
- For demos that print messages: **`SET SERVEROUTPUT ON`** before running `11_test.sql`.

---

## First-time setup (empty schema)

Run these files **in order** from the `sql_scripts` folder:

| Order | File | What it does |
|------:|------|----------------|
| — | `00_cleanup_legacy_schema.sql` | **Optional.** Only if an older project (e.g. `USERS`, `BRANDS`, `pkg_order_management`) still exists in this schema. |
| 1 | `01_drop_nexus_commerce.sql` | **Optional on first install.** Safe to run; drops Nexus objects if they already exist (clean slate). |
| 2 | `02_tables.sql` | Creates all tables. |
| 3 | `03_sequences.sql` | Creates all sequences. |
| 4 | `04_package_audit_context.sql` | `pkg_nc_audit_ctx` (admin id for price-change auditing). |
| 5 | `05_indexes.sql` | Creates indexes. |
| 6 | `06_triggers.sql` | Creates triggers. |
| 7 | `07_functions.sql` | Standalone functions. |
| 8 | `08_procedures.sql` | Standalone procedures. |
| 9 | `09_package_nexus_commerce.sql` | `pkg_nexus_commerce` spec and body. |
| 10 | `10_data.sql` | Sample data (`COMMIT` at end). |
| 11 | `11_test.sql` | Demo calls (uses `SERVEROUTPUT`). |

**Minimum path for a brand-new schema:** `02` → `03` → `04` → … → `11` (skip `00` and `01` if nothing conflicts).

---

## Reinstall / reset Nexus only

If you already deployed Nexus and want to wipe **only** Nexus Commerce objects, run:

1. `01_drop_nexus_commerce.sql`
2. Then **`02` through `11`** again (do not skip `02` after a drop).

---

## How to run the scripts

### SQL\*Plus or SQLcl (recommended for full scripts)

From a terminal, connect, then use `@` with the path to each file:

```text
sqlplus your_user/your_password@your_connect_string
```

```sql
@sql_scripts/02_tables.sql
@sql_scripts/03_sequences.sql
-- ... continue through 11_test.sql
```

On **Windows**, use a path SQL\*Plus accepts, for example:

```text
@c:\Users\yourname\OneDrive\Desktop\Database_Project\sql_scripts\02_tables.sql
```

Scripts use **`PROMPT`** lines (SQL\*Plus/SQLcl). Those print progress; they are **not** plain SQL—ignore errors only if your tool does not support `PROMPT` (then remove those lines or use SQLcl/SQL\*Plus).

### SQL Developer

- Open each `.sql` file, connect to your schema, run the script (**F5** “Run Script” runs the whole file as a script).
- If **`PROMPT`** causes issues, delete the `PROMPT ...` lines or run in **SQL\*Plus/SQLcl** instead.
- For `11_test.sql`, enable **View → Dbms Output** and turn output on, or the `DBMS_OUTPUT` lines will not appear.

---

## After installation

- **Application code** should prefer **`sp_*` procedures** or **`pkg_nexus_commerce.*`** for orders and registration so stock and totals stay consistent with the design.
- **Admin price updates** that must write `PRICE_AUDIT_LOG` via trigger: set **`pkg_nc_audit_ctx.g_admin_id`** to a valid `ADMINS.admin_id` in the **same session** before `UPDATE products ... SET price = ...`, then `COMMIT` (see `11_test.sql`).

---

## Troubleshooting

| Symptom | What to try |
|--------|-------------|
| `ORA-00955` / name already used | Run `01_drop_nexus_commerce.sql`, then rerun `02`–`11`. |
| `ORA-02289` / sequence does not exist | You skipped `03_sequences.sql` or drop removed sequences; rerun from `03` upward. |
| `ORA-02291` / integrity constraint violated | Run scripts in order; ensure `10_data.sql` runs after all DDL. |
| `-20007` on price update | Set `pkg_nc_audit_ctx.g_admin_id` before updating `PRODUCTS.PRICE`. |
| No output from tests | `SET SERVEROUTPUT ON` (SQL\*Plus/SQLcl) or enable DBMS Output in SQL Developer. |

---

## Group collaboration — AI session prompt (optional)

You can paste the block below into a new chat so the model uses the **current** schema names.

```text
Role: Senior Oracle PL/SQL developer for COMP214.

Project: Nexus Commerce — GPU e-commerce; seller is us (no marketplace).

Schema tables: ADMINS, CUSTOMERS, CATEGORIES, PRODUCTS, ORDERS, ORDER_ITEMS, ORDER_STATUS_HISTORY, PRICE_AUDIT_LOG.

Sequences include: seq_admin_id, seq_customer_id, seq_category_id, seq_product_id, seq_order_id, seq_order_item_id, seq_history_id, seq_audit_id.

Use %TYPE / %ROWTYPE, EXCEPTION blocks per course rubric, and RAISE_APPLICATION_ERROR for business rules. Scripts are under sql_scripts/ (run 02–11 in order).

Do not change table designs unless the user explicitly asks.
```
