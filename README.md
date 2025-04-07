# ThemeChest Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Overview

ThemeChest Backend is a RESTful API built with NestJS that powers the ThemeChest platform. It provides endpoints for guide creation, user management, authentication, and AI-assisted content generation.

## Features

- **Authentication**: Secure JWT-based authentication system
- **User Management**: User registration, login, and profile management
- **Role-Based Access Control**: Different access levels for users and administrators
- **Guide Creation**: API endpoints for creating and managing guides
- **AI Integration**: AI-powered guide generation capabilities
- **MongoDB Integration**: Storage for guide content and metadata
- **MySQL Database**: User data and relational information storage
- **Swagger Documentation**: Interactive API documentation

## Tech Stack

- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe JavaScript
- **Sequelize**: ORM for MySQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Swagger**: API documentation
- **Docker**: Containerization

## Prerequisites

- Node.js (>=16.0.0)
- npm or yarn
- MySQL database
- MongoDB database

## Environment Setup

Create a `.development.env` file (for development) and/or a `.production.env` file (for production) in the root directory with the following variables:

```
PORT=3002
SECRET=your_jwt_secret_key
ADMIN_SECRET=your_admin_secret_key
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=theme_chest
MONGO_DB_URI=mongodb://localhost:27017/theme_chest
```

## Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode
npm run start

# Watch mode (development)
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3002/api/v1`.

## Docker Setup

You can run the entire application stack (frontend, backend, AI service, databases) using Docker:

```bash
# Navigate to the root directory of the project (where docker-compose.yml is located)

# Build and start all containers
docker-compose up -d

# Build and start only the backend and databases
docker-compose up -d backend mysql mongo

# View logs
docker-compose logs -f backend
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:3002/api/v1
- AI Service on http://localhost:5000
- MySQL database on port 3306
- MongoDB on port 27017
- phpMyAdmin on http://localhost:8080
- Mongo Express on http://localhost:8081

## API Documentation

Swagger documentation is available at `http://localhost:3002/api/docs` when the application is running.

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── admin-list/    # Admin management
│   ├── auth/          # Authentication
│   ├── creator/       # Guide creation
│   ├── guides/        # Guide retrieval and management
│   ├── profile/       # User profile
│   ├── roles/         # Role management
│   └── users/         # User management
├── app.module.ts      # Main application module
└── main.ts           # Application entry point
```

## Main Modules

- **Auth**: Handles user authentication and authorization
- **Users**: User management and data storage
- **Roles**: Role-based access control
- **Creator**: Guide creation and AI generation
- **Guides**: Guide retrieval and search functionality
- **Profile**: User profile management
- **Admin List**: Administrative functions

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
