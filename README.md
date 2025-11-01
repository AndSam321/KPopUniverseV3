# K-Pop Universe

A full-stack web application for K-Pop fans featuring artist profiles, group information, music content, and social features.

Read the Docs in Backend/docs for more information
## 📋 Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup (Rails)](#backend-setup-rails)
- [Frontend Setup (React)](#frontend-setup-react)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)

## 🗂️ Project Structure

```
KPopUniverseV3/
├── backend/          # Rails API backend
│   ├── app/
│   ├── config/
│   ├── db/
│   ├── docs/        # Project documentation (PRD, checklist)
│   └── ...
└── frontend/        # React + Vite frontend
    ├── src/
    ├── public/
    └── ...
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Backend Requirements
- **Ruby**: 3.3.x (check with `ruby -v`)
- **Rails**: 8.0+ (check with `rails -v`)
- **PostgreSQL**: Latest version
- **Bundler**: Latest version (install with `gem install bundler`)

### Frontend Requirements
- **Node.js**: 20.19.0+ or 22.12.0+ (check with `node -v`)
  - ⚠️ Current system has Node v18.0.0 - consider upgrading to avoid warnings
- **npm**: 8.6.0+ (check with `npm -v`)

### Optional but Recommended
- **Redis**: For background jobs (Sidekiq)
- **Git**: For version control

## 🚀 Backend Setup (Rails)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Ruby Dependencies
```bash
bundle install
```

### 3. Setup Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
# Database
DATABASE_URL=postgresql://localhost/kpop_universe_development

# Rails
RAILS_ENV=development

# Add other environment variables as needed
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# REDIS_URL=redis://localhost:6379/0
```

### 4. Setup Database
```bash
# Create the database
rails db:create

# Run migrations
rails db:migrate

# (Optional) Seed the database with sample data
rails db:seed
```

### 5. Verify Installation
```bash
# Check if Rails can boot
rails about

# Run tests (optional)
rails test
```

## ⚛️ Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the `frontend/` directory (use `.env.example` as reference):
```bash
VITE_API_URL=http://localhost:9000
```

### 4. Verify Installation
```bash
# Check if Vite can build
npm run build
```

## ▶️ Running the Application

### Development Mode

You'll need **two terminal windows/tabs** running simultaneously:

#### Terminal 1: Start Backend Server
```bash
cd backend
rails server -p 9000
```
The Rails API will run on **http://localhost:9000**

#### Terminal 2: Start Frontend Server
```bash
cd frontend
npm run dev
```
The React app will run on **http://localhost:5173**

### Accessing the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:9000
- API requests from frontend will automatically proxy to backend via `/api` prefix

### Alternative: Using Process Manager (Optional)
You can use a process manager like `foreman` or `overmind` to run both servers:

```bash
# Create a Procfile in the root directory
web: cd frontend && npm run dev
api: cd backend && rails server -p 9000
```

## 🔄 Development Workflow

### Backend Development
```bash
cd backend

# Create a new migration
rails generate migration MigrationName

# Run migrations
rails db:migrate

# Rollback last migration
rails db:rollback

# Generate a new model
rails generate model ModelName

# Generate a new controller
rails generate controller ControllerName

# Start Rails console
rails console

# Run tests
rails test
```

### Frontend Development
```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Making API Requests
The frontend is configured to proxy API requests to the backend:

```javascript
// In your React components, import the configured axios instance
import api from './api/axios';

// Make requests using the /api prefix
const response = await api.get('/artists');
// This will request: http://localhost:9000/api/artists
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Ruby on Rails 8.0
- **Database**: PostgreSQL
- **CSS Framework**: Tailwind CSS (for Rails views if needed)
- **Authentication**: Devise + OAuth/OmniAuth (to be implemented)
- **Authorization**: Pundit (to be implemented)
- **Background Jobs**: Sidekiq + Redis (to be implemented)
- **File Storage**: AWS S3 + Active Storage (to be implemented)

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.1
- **Styling**: Tailwind CSS 4.1.16
- **Linting**: ESLint 9.39.0

## 🐛 Troubleshooting

### Backend Issues

**"Could not connect to database"**
- Ensure PostgreSQL is running: `pg_ctl status` or `brew services list`
- Check database credentials in `config/database.yml`
- Try creating the database: `rails db:create`

**"Port already in use"**
- Kill the process using port 9000: `lsof -ti:9000 | xargs kill -9`
- Or use a different port: `rails server -p 3001`

**"Bundler version mismatch"**
- Update bundler: `gem install bundler`
- Or use the version specified: `gem install bundler -v 'X.X.X'`

### Frontend Issues

**"EBADENGINE Unsupported engine" warnings**
- These are warnings, not errors. The app should still work.
- Recommended: Upgrade Node.js to version 20.19.0+ or 22.12.0+
- Use `nvm` (Node Version Manager) for easy version switching

**"Cannot connect to backend"**
- Ensure backend is running on port 9000
- Check proxy configuration in `vite.config.js`
- Verify VITE_API_URL in `.env` file

**"Module not found" errors**
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Port Configuration

If you need to change ports:

**Backend Port (default: 9000)**
- Change in start command: `rails server -p YOUR_PORT`

**Frontend Port (default: 5173)**
- Change in `vite.config.js`:
  ```javascript
  server: {
    port: YOUR_PORT,
  }
  ```
- Update proxy target if backend port changed:
  ```javascript
  proxy: {
    '/api': {
      target: 'http://localhost:YOUR_BACKEND_PORT',
    }
  }
  ```

## 📚 Additional Resources

- [Project Requirements Document (PRD)](backend/docs/K-Pop_Universe_PRD.md)
- [Development Checklist](backend/docs/development_checklist.txt)
- [Rails Guides](https://guides.rubyonrails.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 Notes

- The backend serves as a REST API
- The frontend consumes the API and handles all UI/UX
- CORS is configured to allow frontend-backend communication
- Authentication will use JWT tokens stored in localStorage
- Follow the development checklist in `backend/docs/` for feature implementation

---

**Happy Coding! 🎵✨**
