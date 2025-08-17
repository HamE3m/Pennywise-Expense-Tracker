# Transaction API Documentation

## Base URL
```
http://localhost:5000/api/transactions
```

## Endpoints

### 1. Get All Transactions for a User
**GET** `/api/transactions/:userId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)  
- `type` (optional): Filter by 'income' or 'expense'
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Example:**
```
GET /api/transactions/64f1b2c3d4e5f6789abcdef0?page=1&limit=5&type=expense
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "64f1b2c3d4e5f6789abcdef1",
        "userId": "64f1b2c3d4e5f6789abcdef0",
        "amount": 25.50,
        "type": "expense",
        "category": "Food & Dining",
        "description": "Lunch at cafe",
        "date": "2025-08-16T12:00:00.000Z",
        "createdAt": "2025-08-16T12:00:00.000Z",
        "updatedAt": "2025-08-16T12:00:00.000Z"
      }
    ],
    "totalPages": 3,
    "currentPage": 1,
    "total": 15
  }
}
```

### 2. Get Transaction Statistics
**GET** `/api/transactions/:userId/stats`

**Query Parameters:**
- `startDate` (optional): Start date for stats
- `endDate` (optional): End date for stats

**Response:**
```json
{
  "success": true,
  "data": {
    "income": 2500.00,
    "expenses": 1750.50,
    "balance": 749.50,
    "totalTransactions": 12,
    "incomeTransactions": 4,
    "expenseTransactions": 8
  }
}
```

### 3. Get Single Transaction
**GET** `/api/transactions/:userId/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1b2c3d4e5f6789abcdef1",
    "userId": "64f1b2c3d4e5f6789abcdef0",
    "amount": 25.50,
    "type": "expense",
    "category": "Food & Dining",
    "description": "Lunch at cafe",
    "date": "2025-08-16T12:00:00.000Z"
  }
}
```

### 4. Create New Transaction
**POST** `/api/transactions/:userId`

**Request Body:**
```json
{
  "amount": 100.00,
  "type": "income",
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2025-08-16T10:00:00.000Z"
}
```

**Required Fields:**
- `amount`: Number (> 0)
- `type`: String ('income' or 'expense')
- `category`: String

**Optional Fields:**
- `description`: String
- `date`: Date (defaults to now)

**Response:**
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": {
    "transaction": {
      "_id": "64f1b2c3d4e5f6789abcdef2",
      "userId": "64f1b2c3d4e5f6789abcdef0",
      "amount": 100.00,
      "type": "income",
      "category": "Salary",
      "description": "Monthly salary",
      "date": "2025-08-16T10:00:00.000Z"
    },
    "newBalance": 849.50
  }
}
```

### 5. Update Transaction
**PUT** `/api/transactions/:userId/:id`

**Request Body:**
```json
{
  "amount": 120.00,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "transaction": {
      "_id": "64f1b2c3d4e5f6789abcdef2",
      "amount": 120.00,
      "description": "Updated description"
    },
    "newBalance": 869.50
  }
}
```

### 6. Delete Transaction
**DELETE** `/api/transactions/:userId/:id`

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": {
    "deletedTransaction": {
      "_id": "64f1b2c3d4e5f6789abcdef2",
      "amount": 120.00,
      "type": "income"
    },
    "newBalance": 749.50
  }
}
```

## Suggested Categories

### Income Categories:
- Salary
- Freelance
- Investment
- Gift
- Bonus
- Other Income

### Expense Categories:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Other Expense

## Error Responses

All errors follow the same format:
```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request (validation errors)
- `404`: Not Found (user/transaction not found)
- `500`: Internal Server Error
