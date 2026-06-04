# CodeReview AI — Backend

Node.js + Express REST API.

## Setup

```bash
cp .env.example .env
npm install
```

## Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start server with hot reload   |
| `npm start`     | Start server in production     |

## Folder Structure

```
backend/
├── controllers/   # Request handlers
├── routes/        # Route definitions
├── services/      # Business logic
├── middleware/    # Express middleware
└── server.js      # Application entry point
```
