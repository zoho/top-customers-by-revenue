# Top Customers by Revenue

A **Zoho Books dashboard widget** that shows the **top 10 customers by sales**, similar to the Sales by Customer report, in a simpler table and chart view.

This project is set up for **Zoho Books** (`plugin-manifest.json` → `"service": "FINANCE"` / Books org install). To use the same widget in another Zoho Finance app (for example Invoice, Inventory, or Expense), change the `service` value in `plugin-manifest.json` to the service that app expects, then pack and upload again for that app.

## What this widget shows

After you pick a date range and entities and click **Apply**, the widget loads sales-by-customer data and shows:

| View | What you see |
| --- | --- |
| **Table** | Customer name, invoice count, and sales for the top 10 customers |
| **Chart** | Same customers as a bar, line, or pie chart (customer name vs total sales) |

You can also filter by:

- **Date range** — Today, This Week, This Month, This Quarter, This Year, previous periods, Year/Month/Quarter To Date, or Custom
- **Entities** — Invoice, Retainer Invoice, Sales without invoice, Journal, Sales Receipt

A short summary (customer count and total sales) appears after a successful load.

The widget appears only on the **Dashboard** (location: `dashboard.widget`). Opening `widget.html` in a normal browser tab will not load live data.

## How to pack, upload, and view the widget

### 1. Prerequisites

- Node.js and npm
- [Zoho Extension Toolkit (ZET)](https://www.zoho.com/books/developer/) installed
- Access to a Zoho Books organization

### 2. Install dependencies and build

```bash
cd /path/to/TopCustomers
npm install
npm run build
```

`npm run build` writes the files Zoho Books loads into the `app/` folder. Always run this after you change anything under `src/`.

### 3. Create the connection (required before the widget can load data)

Create a connection for this widget with:

| Setting | Value |
| --- | --- |
| Connection link name | `get_reports` (must match `plugin-manifest.json` exactly) |
| Service | Zoho Books |
| Scope | `ZohoBooks.reports.READ` |
| User access | Yes |

Without this connection and scope, **Apply** will fail.

### 4. Pack the widget with ZET

From the project root:

```bash
zet pack
```

This creates a zip under the `dist/` folder (for example `dist/TopCustomers.zip`).

### 5. Upload in Zoho Books and view on the Dashboard

1. Open your **Zoho Books** organization.
2. Upload / install the widget zip from `dist/` in that organization (Settings → Developer Space / Widgets, or the widgets upload path used in your org).
3. Authorize the **`get_reports`** connection when prompted.
4. Open **Dashboard**.
5. Add the widget **Top 10 Customers by Revenue**.
6. Choose a date range and at least one entity, then click **Apply**.

You should then see the top 10 customers in table or chart view.

## Local testing with ZET

`npm start` alone is not enough for a working widget in Books. You need Zoho Books **developer / development mode** and ZET serving the project.

1. Rebuild after code changes:

```bash
npm run build
```

2. From the project root, start ZET:

```bash
zet run
```

3. In Zoho Books, turn on **development mode** for the widget / extension so the dashboard loads from your local ZET server (`https://127.0.0.1:<port>`).
4. Open the browser URL ZET prints and allow the self-signed certificate if prompted.
5. Open the **Dashboard** in Zoho Books and use the widget. Live data still needs the **`get_reports`** connection authorized.

## API used

```text
GET /reports/salesbycustomer
```

Called through `ZFAPPS.request` with the `get_reports` connection, organization id, date range, and entity list.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/` | React source — edit here |
| `src/App.jsx` | Zoho init, Apply, table/chart switch |
| `src/components/` | Filters, table, and chart |
| `app/` | Built files Zoho loads (`widget.html` + assets) |
| `plugin-manifest.json` | Dashboard widget location, service, and connection name |
| `widget.html` | Vite entry HTML (build input) |
| `vite.config.mjs` | Builds React into the `app` folder |
| `dist/` | Zip from `zet pack` (not committed) |

## Tech stack

- React
- Chart.js (bar, line, pie)
- Vite (build)
- Zoho Finance Widget SDK (`ZFAPPS`)

## Notes

- Only the **top 10** customers from the report response are shown.
- Data loads only when you click **Apply**.
- Chart empty messages match the table when there are no customers or no sales to plot.
