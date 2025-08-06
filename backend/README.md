# Expense Tracker Backend

This is the backend part of the Expense Tracker application built using the MERN stack (MongoDB, Express, React, Node.js). 

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd expense-tracker/backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Set up your MongoDB database and update the connection string in `src/config/db.js`.

4. Start the server:
   ```
   npm start
   ```

## Usage

The backend server will run on `http://localhost:5000` by default. You can use tools like Postman or curl to interact with the API endpoints.

## API Endpoints

- `GET /api/expenses` - Retrieve all expenses
- `POST /api/expenses` - Add a new expense
- `PUT /api/expenses/:id` - Update an existing expense
- `DELETE /api/expenses/:id` - Delete an expense

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv (for environment variables)