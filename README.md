# GVMC Open Data Portal for Researchers and Startups (SW61)

A full-stack, modern, responsive civic open data portal designed for urban researchers, university scholars, data journalists, and civic startups in Visakhapatnam.

> **DEMO DATA DISCLAIMER:** This platform is an independent academic and software engineering demonstration prototype (SW61). All records, statistics, and API responses are **DEMO DATA — NOT VERIFIED OFFICIAL GVMC DATA**. It does not represent an officially authorized municipal service of the Greater Visakhapatnam Municipal Corporation unless formal authorization is obtained.

---

## 🚀 Key Highlights & Capabilities

- **Modern Civic UI/UX:** Professional blue, white, and light-gray palette inspired by national and state open-data portals, fully responsive across desktop, tablet, and mobile.
- **Dynamic Data Discovery:** Real-time search by keyword, filter by department, thematic category (8 civic domains), file format (CSV, JSON, XLSX), and year.
- **In-Browser Tabular Preview:** Interactive preview table powered by server-side parsing of real CSV and JSON files with in-table filtering and pagination.
- **Direct File Downloads:** Real file downloads with server-side download count incrementing.
- **Developer REST APIs:** Direct endpoints for querying datasets, metadata, and JSON previews with ready-to-copy code snippets (cURL, Fetch, Python).
- **Secure Administrator Console:** Protected JWT-based admin dashboard with full CRUD capabilities:
  - Add new datasets with real file uploads (.csv, .json, .xlsx)
  - Edit dataset metadata & replace attached files
  - Delete datasets with confirmation and safe file cleanup
  - Real-time audit logs tracking administrative actions (CREATE, UPDATE, DELETE, LOGIN)
- **Zero-Friction Database:** Connects to any standard MongoDB instance (`MONGODB_URI`). If local MongoDB is not running, the backend seamlessly initializes an embedded in-memory MongoDB instance with pre-seeded datasets, ensuring it works out-of-the-box on any system without extra setup!

---

## 🛠️ Technology Stack

- **Frontend:** React.js 18 with Vite
- **Styling:** Tailwind CSS with Lucide React icons
- **Charts:** Recharts for dynamic visual insights
- **Backend:** Node.js & Express.js
- **Database:** MongoDB with Mongoose (with automated embedded fallback)
- **Authentication:** JWT with bcrypt password hashing
- **File Processing:** Multer, csv-parser, xlsx
- **Security:** Helmet, CORS, Rate Limiting on authentication

---

## 📋 Initial Civic Categories

1. **Water Supply:** Reservoir storage (Mudharasarlova, Raiwada, Thatipudi, Gambhiram, Meghadrigedda), MLD outflows, water quality TDS.
2. **Waste Management:** Daily wet, dry, and domestic hazardous waste collection, segregation rates, Kapuluppada waste-to-energy processing.
3. **Roads and Infrastructure:** Arterial corridors, Beach Road, BRTS routes, pothole repairs register, asphalt materials.
4. **Public Health:** Urban Primary Health Centres (UPHCs), OPD footfall, maternal care (ANC), immunization metrics.
5. **Transportation:** Visakhapatnam city bus transit network, BRTS express corridors, fleet electrification, ridership.
6. **Revenue and Taxation:** Ward-wise property tax demand, collection efficiency, digital payment penetration.
7. **Environment:** Continuous Ambient Air Quality (AQI), PM2.5, PM10, noise telemetry across zones.
8. **Urban Planning:** Master Plan 2030 spatial land-use zoning, permitted uses, FAR limits, CRZ regulations.

---

## ⚙️ Prerequisites & Setup

- **Node.js:** v18.0.0 or higher (v24.x tested)
- **npm:** v9.0.0 or higher

### 1. Installation

Clone or open the repository root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

The backend is pre-configured with default development values. You can customize them in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/gvmc_opendata
JWT_SECRET=gvmc_open_data_super_secret_jwt_key_2025_vizag
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
DEFAULT_ADMIN_EMAIL=admin@gvmc.gov.in
DEFAULT_ADMIN_PASSWORD=Admin@12345
```

### 3. Demo Data Seeding

The database auto-seeds on initial launch, or you can run the seed script directly:

```bash
cd backend
npm run seed
```

This populates 8 comprehensive demonstration datasets with genuine CSV and JSON files in `backend/uploads/` and provisions the default administrator account.

---

## 🏃‍♂️ Running the Application

### Option A: Running Backend and Frontend

1. **Start Backend Server (Port 5000):**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Dev Server (Port 5173):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open in Browser:**
   - Public Portal: [http://localhost:5173](http://localhost:5173)
   - Admin Login: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
   - Backend Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Administrative Credentials

- **Email:** `admin@gvmc.gov.in`
- **Password:** `Admin@12345`

*(A one-click "Autofill Demo Credentials" button is also provided on the login page for testing convenience).*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | No |
| `POST` | `/api/auth/login` | Admin login & token generation | No (Rate Limited) |
| `GET` | `/api/auth/me` | Current authenticated admin profile | Yes (Bearer Token) |
| `GET` | `/api/datasets` | List, search, filter & paginate datasets | No (Public: published) |
| `GET` | `/api/datasets/featured` | Curated featured datasets | No |
| `GET` | `/api/datasets/:id` | Get dataset details & related records | No |
| `GET` | `/api/datasets/:id/preview`| Parse actual CSV/JSON file into table rows | No |
| `GET` | `/api/datasets/:id/download`| Download physical file & increment counter | No |
| `POST` | `/api/datasets` | Create dataset with file upload | Yes (Admin) |
| `PUT` | `/api/datasets/:id` | Update metadata / replace file | Yes (Admin) |
| `DELETE` | `/api/datasets/:id` | Delete dataset & remove file from disk | Yes (Admin) |
| `GET` | `/api/categories` | Thematic categories with dataset counts | No |
| `GET` | `/api/categories/departments` | Department listing with dataset counts | No |
| `GET` | `/api/stats` | KPI statistics & chart distribution data | No |
| `GET` | `/api/activity` | Recent administrative audit trail | Yes (Admin) |

---

## 🛡️ Security Features

- **JWT Authentication:** Strict token verification for administrative routes.
- **Password Protection:** Cryptographically hashed passwords via bcryptjs.
- **Upload Validation:** Strict extension (`.csv`, `.json`, `.xlsx`) and MIME checking.
- **Path Traversal Shield:** Server-side filename sanitization preventing directory escape.
- **Safe File Cleanup:** Deleting a dataset safely removes its corresponding physical file on disk.
- **Brute Force Protection:** Rate-limiting middleware on authentication endpoints.
- **Security Headers:** Enforced via Helmet and configured CORS policies.
