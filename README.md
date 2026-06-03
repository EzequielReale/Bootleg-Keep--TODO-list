# Hirelens Notes App

A full-stack web application for taking notes, tagging, and filtering them. It implements a pure Single Page Application (SPA) architecture with a React frontend and a NestJS backend connected to a PostgreSQL database.

---

## 🌟 Key Features & Functionality

This application implements several core features to provide a modern, secure, and user-friendly experience:

### 🔑 Authentication & Security
- **Secure Cookie-Based Auth**: Implements JWT (JSON Web Token) authentication using secure, `HttpOnly` and `SameSite` cookies to prevent Cross-Site Scripting (XSS) attacks.
- **Multi-Tenant / Isolated User Data**: Every user’s notes and categories are strictly isolated. All backend database operations are scoped to the authenticated user ID (`user_id`), ensuring User A can never access or modify User B's data.

### 📝 Notes Management
- **Full CRUD Operations**: Create, view, edit, and delete notes.
- **Archive & Unarchive**: Easily archive notes to keep the dashboard tidy, with options to toggle between active and archived views.
- **Pin & Unpin**: Pin important notes so they always appear at the top of the feed.
- **Instant Global Search**: Search notes instantly by title or content directly from a global search bar.

### 🏷️ Category Tagging & Filtering
- **Many-to-Many Relationships**: Notes can have multiple categories, and categories can belong to multiple notes.
- **Interactive Sidebar**: Filter notes by selecting a category. The sidebar dynamically counts the number of notes associated with each category.
- **Inline Editing**: Double-click or click edit on any category in the sidebar to change its name inline.
- **On-the-Fly Category Detach**: Detach a category directly from a note card with a quick `x` button, without having to open the full edit modal.
- **Create & Remove Categories**: Add new categories or delete existing ones (deleting a category only removes the association on notes; it does not delete the notes themselves).

### 🖥️ High-Fidelity UI & Branding
- **Modern Responsive Design**: Built with React and Tailwind CSS, adapting smoothly to mobile, tablet, and desktop screens.
- **Custom Branding**: Fully customized favicon, logos, and coherent color palettes.

### 🛠️ Process Automation
- **`run.sh`**: Installs all backend & frontend dependencies, sets up local environment files, starts a local PostgreSQL Docker container, and launches both applications concurrently with a single command.
- **`stop.sh`**: Gracefully kills frontend and backend processes on their respective ports and tears down the PostgreSQL container.

---

## 🔐 Default Credentials / Test Users

For testing and verification, the application seeds two default accounts automatically upon startup.

| Email | Password | Role / Scope |
| :--- | :--- | :--- |
| `user1@test.com` | `Password1!` | Test User 1 (Isolated Notes & Categories) |
| `user2@test.com` | `Password1!` | Test User 2 (Isolated Notes & Categories) |

---

## 🏗️ Architectural Decisions & Limitations

To ensure a robust, production-ready mindset, the application was built with specific design trade-offs. Here is the rationale behind these decisions and current limitations:

### 1. Image Upload Limitation
* **Rationale**: The ability to upload images to notes was omitted from this version.
* **Why?**:
  * **Dedicated Hosting Required**: Storing and serving images in production requires a dedicated service (e.g., AWS S3, Cloudinary, or a dedicated static asset server).
  * **Base64 Storage Inefficiency**: Storing images as Base64 strings directly in PostgreSQL is highly discouraged. It increases file sizes by ~33%, bloats database page size, degrades query performance, and increases infrastructure storage costs.

### 2. Closed Self-Registration
* **Rationale**: There is currently no public "Sign Up" or "Register" form or API endpoint.
* **Why?**: The application is configured as a private, invitation-only system. For a production release, enabling self-registration would require adding security countermeasures such as Captcha (e.g., reCAPTCHA), email verification, and rate limiting on sign-ups to prevent malicious database flooding and spam accounts.

### 3. Symmetric JWT Secret & Session Scaling
* **Rationale**: Sessions are verified using a symmetric JWT secret stored in environment variables.
* **Why?**: This is optimal for single-instance containers or deployments. However, for a horizontally-scaled cluster environment, a distributed session blacklist or token revocation store (such as Redis) or an external auth provider (like Auth0 or Clerk) would be necessary to handle logout and session invalidation across instances.

### 4. No API Throttling
* **Rationale**: The API does not currently implement rate limiting.
* **Why?**: Since this is a developer challenge environment, rate limiting was omitted to ease testing. In a public production deployment, a module like `@nestjs/throttler` must be configured to protect login and note-creation endpoints from brute-force and Denial-of-Service (DoS) attacks.

### 5. TypeORM Schema Auto-Synchronization in Dev
* **Rationale**: The backend uses `synchronize: true` in non-production environments.
* **Why?**: This allows rapid prototyping by automatically updating the database schema to match TypeORM entities. However, for team development and production stability, auto-sync is disabled (`synchronize: false` when `NODE_ENV=production`) in favor of versioned TypeORM migrations. This prevents unintended data loss and ensures schema updates are repeatable and audited.

---

## ⚡ Technologies and Runtimes

- **Backend**:
  - Node.js (v18+ recommended)
  - NestJS v11
  - TypeORM with PostgreSQL Driver (`pg`)
  - TypeScript
- **Frontend**:
  - Node.js (v18+ recommended)
  - React v19
  - Vite v6
  - Tailwind CSS v3.4
  - Axios for API requests
  - Lucide React for icons
- **Database**:
  - PostgreSQL v15 (via Docker)

---

## 🚀 How to Run Locally

You can launch the database, backend, and frontend with a single command using the provided script.

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start

1. Make the setup script executable:
   ```bash
   chmod +x run.sh
   ```

2. Run the startup script:
   ```bash
   ./run.sh
   ```
   *Note: Ensure your Docker daemon is running. If you encounter permission errors, run `sudo ./run.sh` or add your user to the `docker` group.*

The script automatically handles:
- Starting the PostgreSQL container (`hirelens_notes_db`) mapping port `5432`.
- Creating the backend `.env` file from the example configuration.
- Installing backend and frontend node packages.
- Starting the NestJS API on `http://localhost:3000`.
- Starting the Vite React app on `http://localhost:5173`.

### Graceful Teardown

To stop all services and tear down the database container, run:
```bash
chmod +x stop.sh
./stop.sh
```

### Manual Start (Alternative)

If you prefer to start components step-by-step:

1. **Database:**
   ```bash
   docker compose up -d
   ```
2. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run start:dev
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🌐 Live Deployment (Render / Heroku)

The application has been deployed live and can be accessed at:
👉 **[Live Frontend Application](https://hirelens-frontend-1xf3.onrender.com/)**

This application is fully production-ready for deployment:
- The database configuration checks `NODE_ENV` and automatically disables schema sync, enabling SSL connections with `rejectUnauthorized: false` to comply with cloud databases (e.g., Render PostgreSQL, Supabase).
- Ensure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (or a single `DATABASE_URL`) are configured.
- The `FRONTEND_URL` environment variable must be set on the backend to allow cross-origin requests (CORS) from your hosted frontend.

---

## 📂 Project Structure

```
├── backend/            # NestJS application (Controllers, Services, Entities)
├── frontend/           # React application (Vite, Tailwind, Components)
├── docker-compose.yml  # Local PostgreSQL service definition
├── run.sh              # Unified orchestrator startup script
├── stop.sh             # Graceful orchestrator shutdown script
└── README.md           # Documentation
```
