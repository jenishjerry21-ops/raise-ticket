# Raise Ticket

A full-stack ticket management application built with **React** and **ASP.NET Core Web API**. The application provides authentication, ticket management, JWT authorization, SQL Server persistence, BCrypt password hashing, and optional AI-based ticket classification using OpenAI.

---

## 📌 Project Overview

The project contains two applications in the same GitHub repository:

- **Frontend** — React application using Vite
- **Backend** — ASP.NET Core Web API using C#

The frontend communicates with the backend through REST APIs.

### Application Flow

```text
React Frontend
      │
      │ HTTP / REST API
      ▼
ASP.NET Core Web API
      │
      ├── JWT Authentication
      ├── Ticket Services
      ├── Repository Layer
      ├── AI Classification Service
      │
      ▼
Entity Framework Core
      │
      ▼
SQL Server
```

---

# 🚀 Features

### Authentication & Security

- User authentication
- JWT Bearer authentication
- JWT token validation
- BCrypt password hashing
- Protected API endpoints
- Authorization support

### Ticket Management

- Create tickets
- View tickets
- Update tickets
- Delete/manage tickets
- Ticket status handling
- Ticket priority/category handling
- Status history support

### AI Classification

- Optional AI-powered ticket classification
- OpenAI API integration
- Configurable AI model
- AI service can be enabled/disabled through configuration

### Backend

- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- Repository pattern
- Service layer
- Swagger / OpenAPI
- Automatic database migration on application startup
- Admin data seeding

### Frontend

- React
- Vite
- React Router
- Axios
- Client-side API integration

---

# 🛠️ Technology Stack

| Area | Technology |
|---|---|
| Frontend | React |
| Frontend Build Tool | Vite |
| HTTP Client | Axios |
| Routing | React Router |
| Backend | ASP.NET Core Web API |
| Language | C# |
| ORM | Entity Framework Core |
| Database | Microsoft SQL Server |
| Authentication | JWT Bearer |
| Password Hashing | BCrypt |
| AI Service | OpenAI API |
| API Documentation | Swagger / OpenAPI |
| Source Control | Git / GitHub |

---

# 📂 Repository Structure

```text
raise-ticket/
│
├── Tickets-sd/                    # ASP.NET Core backend
│   ├── Applications/
│   ├── Infrastructure/
│   ├── Controllers/
│   ├── Migrations/
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Tickets-sd.csproj
│   └── Tickets-sd.http
│
├── public/                        # React public assets
├── src/                           # React source code
│
├── package.json                   # Frontend dependencies/scripts
├── package-lock.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

# 💻 Prerequisites

Install the following before running the project:

- Git
- Node.js
- npm
- .NET 10 SDK
- Microsoft SQL Server
- SQL Server Management Studio (SSMS)
- Visual Studio 2022/Visual Studio or Visual Studio Code

### Verify installations

```bash
git --version
node --version
npm --version
dotnet --version
```

The backend project targets **.NET 10**.

---

# 📥 1. Clone the Repository

Open PowerShell, Command Prompt, or a terminal:

```bash
git clone https://github.com/jenishjerry21-ops/raise-ticket.git
```

Navigate into the repository:

```bash
cd raise-ticket
```

---

# 🗄️ 2. Database Configuration

The backend uses **SQL Server** through Entity Framework Core.

The application reads the database connection from:

```text
ConnectionStrings:DefaultConnection
```

## Recommended setup

Do **not** put a real database username/password in a public GitHub repository.

For local development, configure the connection string using **.NET User Secrets**.

Navigate to the backend:

```bash
cd Tickets-sd
```

Initialize User Secrets if it has not already been initialized:

```bash
dotnet user-secrets init
```

Set the database connection:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=YOUR_SERVER;Database=EMPLOYEE;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=True"
```

For Windows Integrated Security, an example is:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=.;Database=EMPLOYEE;Trusted_Connection=True;TrustServerCertificate=True"
```

Use the connection string appropriate for the client's SQL Server configuration.

---

# 🔐 3. JWT Configuration

The backend uses JWT Bearer authentication.

The configuration keys are:

```text
Jwt:Key
Jwt:Issuer
```

Set the JWT secret locally:

```bash
dotnet user-secrets set "Jwt:Key" "YOUR_SECURE_JWT_SECRET"
```

The issuer should match the backend configuration:

```bash
dotnet user-secrets set "Jwt:Issuer" "SmartDeskApi"
```

Use a long, random secret for production.

### Important

Never commit a real JWT secret to GitHub.

---

# 🤖 4. OpenAI / AI Configuration

The backend contains an AI service and uses the following configuration:

```text
AI:Enabled
AI:ApiKey
AI:Endpoint
AI:Model
```

The configured endpoint is:

```text
https://api.openai.com/v1/chat/completions
```

The configured model is:

```text
gpt-4o-mini
```

AI is currently disabled by default.

To enable it:

```bash
dotnet user-secrets set "AI:Enabled" "true"
```

Set the OpenAI API key:

```bash
dotnet user-secrets set "AI:ApiKey" "YOUR_OPENAI_API_KEY"
```

If the default endpoint/model is being used, no additional configuration is required.

### Security

**Never commit your OpenAI API key to GitHub.**

The API key should be stored only in local/secure configuration.

---

# 🔄 5. Database Migration

The backend is configured to apply Entity Framework Core migrations automatically when the application starts.

You can also update the database manually using:

```bash
dotnet ef database update
```

If `dotnet ef` is not installed:

```bash
dotnet tool install --global dotnet-ef
```

Then:

```bash
dotnet ef database update
```

The application also performs the database migration during startup.

---

# 👤 6. Admin Seeding

During backend startup, the application runs the database migration and invokes the admin seeding process.

Therefore, the required database schema and seeded admin data can be initialized when the backend starts.

If the application has an existing admin-login flow, use the credentials provided separately by the project owner/client administrator.

**Do not store real admin passwords in this README.**

---

# ⚙️ 7. Backend Setup

Open a terminal inside the backend folder:

```bash
cd raise-ticket/Tickets-sd
```

Restore NuGet packages:

```bash
dotnet restore
```

Build the project:

```bash
dotnet build
```

Run the backend:

```bash
dotnet run
```

The terminal will display the API URL.

The project uses an HTTPS development profile.

Example:

```text
https://localhost:xxxx
```

Use the exact port shown in your terminal.

---

# 📖 8. Swagger API Documentation

Swagger/OpenAPI is enabled in the backend.

After starting the backend, open:

```text
https://localhost:<PORT>/swagger
```

Replace `<PORT>` with the port displayed when the API starts.

Swagger can be used to:

- View API endpoints
- View request models
- View response models
- Test API endpoints
- Test authenticated endpoints
- Enter a JWT Bearer token

For authenticated requests, use:

```text
Bearer <JWT_TOKEN>
```

---

# 🎨 9. Frontend Setup

Open a new terminal from the repository root:

```bash
cd raise-ticket
```

Install frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the frontend URL in the terminal.

Normally:

```text
http://localhost:5173
```

Use the exact URL shown by Vite.

---

# 🔗 10. Frontend ↔ Backend API Configuration

The React frontend must use the URL of the running ASP.NET Core API.

Before starting the frontend, check the API configuration used by the frontend service/API files.

For Vite environment configuration, an example is:

```env
VITE_API_URL=https://localhost:<BACKEND_PORT>/api
```

Use the exact environment-variable name and API route structure implemented by the frontend.

Do not commit private credentials in `.env` files.

If an `.env` file is used, add it to `.gitignore`.

---

# ▶️ 11. Run the Complete Application

Run the backend and frontend in separate terminals.

## Terminal 1 — Backend

```bash
cd raise-ticket/Tickets-sd
dotnet restore
dotnet build
dotnet run
```

Keep the backend running.

## Terminal 2 — Frontend

```bash
cd raise-ticket
npm install
npm run dev
```

Open the frontend URL displayed by Vite.

---

# 🔁 Recommended Startup Order

For a new laptop:

```text
1. Install .NET 10 SDK
        ↓
2. Install Node.js and npm
        ↓
3. Install SQL Server
        ↓
4. Clone the GitHub repository
        ↓
5. Configure SQL Server
        ↓
6. Configure .NET User Secrets
        ↓
7. Configure OpenAI key if AI is required
        ↓
8. Start the ASP.NET Core backend
        ↓
9. Database migration runs
        ↓
10. Start React frontend
        ↓
11. Open the application
        ↓
12. Test login and ticket operations
```

---

# 🔐 Configuration Summary

| Configuration | Location/Key | Required |
|---|---|---|
| SQL Server | `ConnectionStrings:DefaultConnection` | Yes |
| JWT Secret | `Jwt:Key` | Yes |
| JWT Issuer | `Jwt:Issuer` | Yes |
| AI Enabled | `AI:Enabled` | Only if AI is required |
| OpenAI Key | `AI:ApiKey` | Only if AI is enabled |
| OpenAI Endpoint | `AI:Endpoint` | Yes for AI |
| AI Model | `AI:Model` | Yes for AI |

---

# 🚫 13. Do Not Commit Secrets

Never commit these values to a public GitHub repository:

```text
Database passwords
Database usernames
JWT secrets
OpenAI API keys
Production credentials
Admin passwords
.env files containing secrets
```

Use:

- .NET User Secrets
- Environment variables
- Deployment/platform secret stores

for sensitive configuration.

---

# 🧹 14. Files That Should Not Be Pushed

The following generated/local files should normally remain outside Git:

```text
.vs/
bin/
obj/
node_modules/
dist/
.env
.env.*
```

A typical `.gitignore` should include:

```gitignore
# Visual Studio
.vs/
*.user
*.suo

# .NET
bin/
obj/

# Node
node_modules/
dist/

# Environment files
.env
.env.*
!.env.example
```

---

# 🧪 15. Application Testing Checklist

After starting the application, verify:

### Authentication

- [ ] User registration works
- [ ] User login works
- [ ] JWT token is generated
- [ ] Protected endpoints require authentication
- [ ] Invalid login is rejected

### Tickets

- [ ] Create ticket
- [ ] View tickets
- [ ] View ticket details
- [ ] Update ticket
- [ ] Delete/manage ticket
- [ ] Ticket status works
- [ ] Ticket priority/category works
- [ ] Status history works

### AI

If AI is enabled:

- [ ] OpenAI API key is configured
- [ ] Ticket classification request works
- [ ] Classification result is returned/handled correctly

### Database

- [ ] SQL Server connection works
- [ ] Migrations apply successfully
- [ ] Ticket data is saved
- [ ] Data remains after restarting the API

---

# 🐛 16. Troubleshooting

## Frontend does not start

Run:

```bash
npm install
npm run dev
```

Check:

```bash
node --version
npm --version
```

---

## Backend does not start

Run:

```bash
dotnet restore
dotnet build
dotnet run
```

Check that the required .NET SDK is installed.

---

## Database connection error

Check:

- SQL Server is running.
- Server/instance name is correct.
- Database name is correct.
- Username/password are correct if SQL authentication is used.
- The configured connection string is available to the application.
- The user has permission to access the database.

---

## Migration error

Run:

```bash
dotnet restore
dotnet build
dotnet ef database update
```

Then restart the API.

---

## Frontend cannot connect to backend

Check:

1. Backend is running.
2. Frontend API URL is correct.
3. Backend HTTPS certificate is trusted.
4. CORS configuration allows the frontend origin.
5. The API endpoint path is correct.

---

## CORS error

The backend currently has a CORS policy that allows any origin, header, and method for the configured policy.

For production, restrict CORS to the required frontend domain/origin.

---

## JWT authentication error

Check:

```text
Jwt:Key
Jwt:Issuer
```

Make sure the same expected issuer and signing key are used when generating and validating tokens.

---

## OpenAI / AI error

Check:

```text
AI:Enabled
AI:ApiKey
AI:Endpoint
AI:Model
```

Make sure the OpenAI API key is valid and is available to the backend process.

---

# 📦 17. Frontend Commands

From the repository root:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Preview production build:

```bash
npm run preview
```

---

# ⚙️ 18. Backend Commands

From `Tickets-sd`:

```bash
dotnet restore
dotnet build
dotnet run
```

Database migration:

```bash
dotnet ef database update
```

Install EF Core CLI if required:

```bash
dotnet tool install --global dotnet-ef
```

---

# 🔄 19. Git Workflow

Use meaningful commits while developing.

Example:

```bash
git status
git add .
git commit -m "Add ticket classification service"
git push
```

Recommended commit messages:

```text
Add JWT authentication
Add ticket CRUD API
Add ticket management UI
Add database migration
Add AI classification service
Fix ticket validation
Fix API integration
Update CORS configuration
Update README setup instructions
```

Avoid using only a vague final commit such as:

```text
final project
```

---

# 🔒 20. Production Security Notes

Before production deployment:

- Replace development JWT secrets.
- Use secure database credentials.
- Store OpenAI API keys in a secure secret store.
- Configure HTTPS.
- Restrict CORS to trusted frontend origins.
- Do not expose database credentials in GitHub.
- Do not expose API keys in frontend code.
- Use production-specific configuration.
- Review application logging for sensitive information.

---

# 📸 21. Screenshots

Add screenshots of the application here if required.

Recommended screenshots:

```text
Login
Dashboard
Ticket List
Create Ticket
Ticket Details
Admin/Management Screen
AI Classification Result
```

Example Markdown:

```markdown
![Login Screen](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)
![Ticket List](docs/screenshots/ticket-list.png)
```

---

# 📄 22. License

This project is provided for project/assignment/client use.

Add a formal open-source license if one is required for the project.

---

# 👤 Author

**Jenish S**

GitHub:

https://github.com/jenishjerry21-ops

Repository:

https://github.com/jenishjerry21-ops/raise-ticket

---

# ✅ Client Quick Start

For a client setting up the project on a new laptop:

```bash
# 1. Clone
git clone https://github.com/jenishjerry21-ops/raise-ticket.git

# 2. Backend
cd raise-ticket/Tickets-sd

# 3. Configure local secrets
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CONNECTION_STRING"
dotnet user-secrets set "Jwt:Key" "YOUR_SECURE_JWT_SECRET"
dotnet user-secrets set "Jwt:Issuer" "SmartDeskApi"

# Optional - enable AI
dotnet user-secrets set "AI:Enabled" "true"
dotnet user-secrets set "AI:ApiKey" "YOUR_OPENAI_API_KEY"

# 4. Run backend
dotnet restore
dotnet build
dotnet run
```

Open another terminal:

```bash
# 5. Frontend
cd raise-ticket
npm install
npm run dev
```

Then open the frontend URL shown by Vite.

---

## ⚠️ Important

The GitHub repository should contain **source code and safe example configuration only**.

Real:

- SQL Server credentials
- JWT secrets
- OpenAI API keys
- Admin passwords
- Production credentials

must be configured separately on the client's machine and must not be committed to the public repository.
