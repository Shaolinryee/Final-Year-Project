# Task Management Website - Backend Server

Backend server for the Task Management Website built with Node.js, Express, and PostgreSQL with Sequelize ORM.

## Project Structure

```
src/
├── config/          # Configuration files (database, CORS, etc.)
├── controllers/     # Business logic controllers
├── middleware/      # Custom middleware (auth, error handling, etc.)
├── models/          # Sequelize models
├── routes/          # API endpoints
├── services/        # External services
├── utils/           # Utility functions
└── index.js         # Main server file
```

## Installed Dependencies

### Production Dependencies
- **express** - Web framework
- **sequelize** - ORM for PostgreSQL
- **pg** & **pg-hstore** - PostgreSQL drivers
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email service
- **multer** - File uploads
- **uuid** - Unique ID generation

### Development Dependencies
- **nodemon** - Auto-reload during development

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure PostgreSQL

Ensure PostgreSQL is installed and running. Create a new database:

```sql
CREATE DATABASE task_management;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Client URL
CLIENT_URL=http://localhost:5173
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` by default. Sequelize will automatically sync models with the database on startup.

## Available API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### To Be Implemented
- `/api/users` - User management
- `/api/projects` - Project management
- `/api/tasks` - Task management
- `/api/activities` - Activity logging

## Database Models

### User
- UUID id, name, email, password, avatar, role, isVerified, verification/reset tokens

### Project
- UUID id, name, description, ownerId (FK), color, status, timestamps

### ProjectMember
- UUID id, userId (FK), projectId (FK), role, timestamps

### Task
- UUID id, title, description, projectId (FK), assigneeId (FK), creatorId (FK), status, priority, dueDate, tags, timestamps

### Comment
- UUID id, taskId (FK), userId (FK), text, timestamps

### Attachment
- UUID id, taskId (FK), name, url, timestamps

### Activity
- UUID id, projectId (FK), taskId (FK), userId (FK), action, details, timestamps

## Authentication

JWT tokens are used for authentication. Include the token in request headers:
```
Authorization: Bearer <your_token_here>
```

## Database Synchronization

Sequelize automatically syncs models with the database on startup. In development mode, it uses `alter: true` to update existing tables. For production, use `alter: false` and manage migrations manually.

## Contributing

1. Create feature branches
2. Follow the existing code structure
3. Test your changes before committing

## License

ISC
