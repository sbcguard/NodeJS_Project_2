# Node.js Authentication and Authorization Project

## About

This Node.js project provides a robust authentication and authorization system using JWT (JSON Web Tokens). The project is designed to handle user signup, login, and role-based access control, ensuring that users have the appropriate permissions to access certain resources. The backend is built with Express.js and Prisma ORM for database interactions.

### Features

- User signup and login with JWT authentication.
- Role-based access control.
- Error handling with custom exception classes.
- Middleware for authentication and role checking.
- Default role assignment on user signup.
- Secure storage of environment variables.

## How to Run the Project Locally

### Prerequisites

- Node.js (v20 or higher)
- npm or pnpm or yarn
- MySQL (or any supported Prisma database)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sbcguard/NodeJS_Project_2.git
   cd nodejs-auth-project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   or

   ```bash
   pnpm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following:

   ```plaintext
   DATABASE_URL=mysql://username:password@localhost:5432/database_name
   JWT_SECRET=your_jwt_secret
   ```

4. **Set up the database:**

   Ensure that MySQL is running and a database is created. Then run:

   ```bash
   npx prisma migrate dev --name init
   ```

   This command will apply the migrations and set up the database schema.

5. **Seed the database with initial data:**

   ```bash
   npx prisma db seed
   ```

6. **Start the server:**

   ```bash
   npm start
   ```

   or

   ```bash
   pnpm start
   ```

   or

   ```bash
   yarn start
   ```

   The server will be running at `http://localhost:3000`.

### Usage

1. **Access the login page:**

   Open a web browser and go to `http://localhost:3000/login.html`.

2. **Signup a new user:**

   Click on the link to the signup page and create a new account.

3. **Login:**

   Use the credentials created during signup to log in. The application will handle authentication and redirect you based on your role.

### Project Structure

- `src/`
  - `controllers/`: Contains the controller functions for handling signup and login.
  - `exceptions/`: Custom exception classes for error handling.
  - `middleware/`: Middleware functions for authentication and role checking.
  - `routes/`: Express routes for authentication and other resources.
  - `schema/`: Prisma schema and Zod validation schemas.
  - `views/`: HTML files for login and signup pages.
- `.env`: Environment variables.
- `prisma/`: Prisma configuration and migrations.
