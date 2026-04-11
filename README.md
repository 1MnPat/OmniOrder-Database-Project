# Nexus Commerce

Full-stack **GPU e-commerce** project for COMP214: an **Oracle** database (PL/SQL, triggers, procedures) plus a **Next.js** **REST API** and **web storefront** that consume it.

- **Seller:** Nexus Commerce (no marketplace). Roles are modeled as **`ADMINS`** and **`CUSTOMERS`** only (no generic roles table).
- **Schema (8 tables):** `ADMINS`, `CUSTOMERS`, `CATEGORIES`, `PRODUCTS`, `ORDERS`, `ORDER_ITEMS`, `ORDER_STATUS_HISTORY`, `PRICE_AUDIT_LOG`.

---

## Repository layout

| Path | Purpose |
|------|---------|
| `sql_scripts/` | Numbered DDL/DML, procedures, tests (run in order). |
| `app/api/` | Next.js Route Handlers — REST API (`/api/...`). |
| `app/` (pages) | Storefront UI: home, catalog, cart, checkout, account, orders, admin. |
| `components/` | Shared React UI (header, product cards, footer). |
| `contexts/` | Client auth and shopping cart (localStorage). |
| `lib/` | `db.js` (Oracle), `auth.js` (JWT), `middleware.js`, `response.js`, `api-client.js`. |
| `stitch_nexus_commerce_frontend/` | Original HTML/mock inspiration (reference only). |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (Windows supported) |
| App framework | Next.js 14+ (App Router) |
| Database | Oracle Database 21c / 23c / XE (via `oracledb`) |
| Auth | JWT (`jsonwebtoken`), passwords hashed with `bcryptjs` |
| UI | React 18, Tailwind CSS 3 |

---

## Prerequisites

- **Oracle Database** with a user/schema that can create tables, sequences, packages, triggers, and procedures.
- **Node.js 18+** and **npm**.
- **SQL\*Plus**, **SQLcl**, or **SQL Developer** to run `sql_scripts/`.
- Optional: **Oracle Instant Client** (Thick mode). If you do not install it, the app uses **node-oracledb Thin mode** (no client DLLs) by default.

---

## 1. Database setup

Run scripts **in order** from the `sql_scripts` folder.

### First-time install (empty schema)

| Order | File | Purpose |
|------:|------|---------|
| — | `00_cleanup_legacy_schema.sql` | Optional. Removes legacy objects if present. |
| — | `01_drop_nexus_commerce.sql` | Optional. Drops Nexus objects for a clean reinstall. |
| 1 | `02_tables.sql` | Tables |
| 2 | `03_sequences.sql` | Sequences |
| 3 | `04_package_audit_context.sql` | `pkg_nc_audit_ctx` (admin id for price audit trigger) |
| 4 | `05_indexes.sql` | Base indexes |
| 5 | `06_triggers.sql` | Triggers |
| 6 | `07_functions.sql` | Functions |
| 7 | `08_procedures.sql` | Standalone procedures (`sp_register_customer`, `sp_place_order`, etc.) |
| 8 | `09_package_nexus_commerce.sql` | Package `pkg_nexus_commerce` |
| 9 | `10_data.sql` | Sample data |
| 10 | `11_test.sql` | Demo / tests (`SET SERVEROUTPUT ON` in SQL\*Plus/SQLcl) |

**Minimum sequence for a new schema:** `02` → `03` → … → `11` (skip `00`/`01` if not needed).

### Optional performance scripts (after the above)

| File | Purpose |
|------|---------|
| `12_indexes_catalog_performance.sql` | Extra B-tree indexes for catalog filters and sorting. |
| `13_oracle_text_product_search.sql` | Oracle **CONTEXT** indexes for faster text search. Requires Text privileges; then set `ORACLE_TEXT_SEARCH=true` in `.env`. |

### Reinstall Nexus only

1. Run `01_drop_nexus_commerce.sql`
2. Run `02` through `11` again.

### Running scripts

**SQL\*Plus / SQLcl:**

```text
sqlplus your_user/your_password@your_connect_string
```

```sql
@sql_scripts/02_tables.sql
-- … continue through 11_test.sql
```

Use full Windows paths if needed, e.g. `@c:\path\to\Database_Project\sql_scripts\02_tables.sql`.

**SQL Developer:** Open each file, connect, run as script (**F5**). For `11_test.sql`, enable **Dbms Output**.

### Database rules for applications

- Prefer **`sp_*` procedures** (or package entry points) for registration, orders, status changes, and product deactivation so triggers and business rules stay consistent.
- **Price updates** that must log to `PRICE_AUDIT_LOG`: set `pkg_nc_audit_ctx.g_admin_id` to a valid `ADMINS.admin_id` **in the same database session** before `UPDATE products SET price = ...` (see `11_test.sql` and product `PUT` in the API).

---

## 2. Application environment

Create **`.env`** or **`.env.local`** in the project root (never commit real secrets). Example:

```env
# Oracle — use your real course/user credentials
DB_USER=your_schema_user
DB_PASSWORD=your_password

# Connect string: use ONE of the styles below (not both).

# (A) Easy Connect — service name (common for pluggable DBs, e.g. XEPDB1)
# DB_CONNECT_STRING=199.212.26.208:1521/XEPDB1

# (B) Full TNS descriptor — e.g. SID-based (no spaces; entire value after =)
DB_CONNECT_STRING=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=199.212.26.208)(PORT=1521))(CONNECT_DATA=(SID=SQLD)))

# JWT
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=24h

# App URL (browser + server fetches)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Oracle Instant Client folder (Thick mode). Omit to use Thin mode.
# ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient_23_0

# Optional: after running sql_scripts/13_oracle_text_product_search.sql
# ORACLE_TEXT_SEARCH=true
```

**`DB_CONNECT_STRING`:**

- **Easy Connect:** `host:port/SERVICE_NAME` — the piece after `/` must be a **service name** registered with the listener (wrong name → `NJS-518`).
- **TNS descriptor (recommended when your DBA gives SID):** a single line in parentheses, e.g. `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=...)(PORT=1521))(CONNECT_DATA=(SID=YOURSID)))`. node-oracledb accepts this as `connectString` unchanged.
- Put **only** the connect string after the first `=` on the line — do not repeat `DB_CONNECT_STRING=` inside the value.

---

## 3. Install and run

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (hot reload). |
| `npm run build` | Production build. |
| `npm start` | Serve production build (after `build`). |
| `npm run lint` | ESLint. |

If you see **`Cannot find module './<number>.js'`** or odd webpack errors, stop the dev server, delete the **`.next`** folder, and run `npm run dev` again.

---

## 4. REST API (summary)

Base URL: same origin as the app, e.g. `http://localhost:3000/api/...`.

**Public:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/products`, `GET /api/products/[id]`, `GET /api/categories`.

**Customer (Bearer JWT):** `GET|POST /api/orders`, `GET /api/orders/[id]`, `POST /api/orders/[id]/cancel`, `GET|PUT /api/customers/me`.

**Admin (Bearer JWT):** Product/category mutations, `PATCH /api/orders/[id]/status`, `/api/admin/*` (dashboard, reports, customers, audit, create admin).

Success responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": "..." }`.

---

## 5. Web storefront (UI)

| Route | Description |
|-------|-------------|
| `/` | Home, featured products |
| `/products` | Catalog, search, category filter, pagination |
| `/products/[id]` | Product detail, add to cart (customer) |
| `/cart` | Cart (local storage) |
| `/checkout` | Place order (`POST /api/orders`) |
| `/login`, `/register` | Authentication |
| `/account` | Profile (`/api/customers/me`) |
| `/orders`, `/orders/[id]` | Orders; customers can **Cancel order** when status allows |
| `/admin` | Admin dashboard (metrics) |

JWT is stored in **`localStorage`** (`nexus_token`) for the browser client.

---

## 6. Troubleshooting

| Symptom | What to try |
|--------|-------------|
| `DPI-1047` (Oracle Client not found) | Omit `ORACLE_CLIENT_LIB_DIR` to use **Thin** mode, or install Instant Client and set `ORACLE_CLIENT_LIB_DIR` to the folder containing `oci.dll`. |
| `NJS-518` service not registered | Easy Connect: use correct `host:port/SERVICE`. Or use a full TNS `DESCRIPTION=...` with correct `SID` / `SERVICE_NAME` from your DBA. |
| `NJS-515` invalid connect string | Easy Connect must look like `host:port/service` — no junk prefix. For TNS descriptors, use one line with parentheses; do not duplicate `DB_CONNECT_STRING=` inside the value. |
| `ORA-00955` / name already used | Run `01_drop_nexus_commerce.sql`, then `02`–`11`. |
| `ORA-02289` sequence missing | Rerun from `03_sequences.sql` upward. |
| `-20007` on price update | Set `pkg_nc_audit_ctx.g_admin_id` before updating `PRODUCTS.PRICE` (API does this in one transaction for admin price updates). |
| Webpack missing chunk / `948.js` | Delete **`.next`**, restart `npm run dev`. |
| Login 500 / bcrypt “undefined” | Oracle column names: API uses quoted aliases so `password` binds correctly. |

---

## 7. Course / collaboration note

Schema and script naming follow **`sql_scripts/`** execution order. For PL/SQL work, prefer `%TYPE`, `%ROWTYPE`, `EXCEPTION` sections, and `RAISE_APPLICATION_ERROR` per course rubric where applicable.

---

## License / academic use

Project structure intended for **educational submission** (COMP214). Do not commit `.env` files with real passwords.
