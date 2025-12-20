# Budget Tracker Lite - Frontend

Angular frontend for Budget Tracker Lite with authentication.

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm start
```

The application will be available at http://localhost:4200

## Features

- **User Authentication**: Login, Register, Forgot Password, Reset Password
- **Protected Routes**: Auth guard prevents unauthorized access
- **JWT Token Management**: Automatic token injection and handling
- **Transaction Management**: Create, view, and delete transactions
- **Budget Tracking**: Track income and expenses with balance calculation

## Project Structure

```
src/app/
├── core/
│   ├── guards/          # Auth guard for route protection
│   ├── interceptors/    # HTTP interceptor for JWT tokens
│   └── services/        # Auth and transaction services
├── features/
│   ├── auth/           # Authentication components
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── transactions/   # Transaction management
└── shared/             # Shared components and utilities
```

## Authentication Flow

1. **Register**: Create new account with name, email, and password
2. **Login**: Authenticate and receive JWT token
3. **Protected Access**: Token automatically added to API requests
4. **Password Reset**: Request reset token and set new password
5. **Auto Logout**: Redirect to login on token expiration or 401 errors

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.
