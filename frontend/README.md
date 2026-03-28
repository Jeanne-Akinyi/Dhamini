# Dhamini Frontend

React/Vite frontend application for Dhamini loan repayment and credit intelligence platform.

## Overview

The frontend provides:
- Borrower portal for loan applications and mandate management
- Lender dashboard for loan management and approvals
- SACCO portal for SACCO-specific features
- Chama portal for Chama-specific features
- Authentication system (register, login, OTP verification)
- KYC submission workflow
- Credit score viewing
- Repayment tracking

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client for API communication

## Project Structure

\`\`\`
frontend/
├── src/
│   ├── api.js              # API client configuration (dhaminiApi, helpers)
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── KYCFlow.jsx
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       ├── Layout.jsx
│   │       └── Footer.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx  # Authentication context/state
│   └── pages/
│       ├── Home.jsx        # Landing page
│       ├── BorrowerPortal.jsx
│       ├── LenderPortal.jsx
│       ├── SaccoPortal.jsx
│       └── ChamaPortal.jsx
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json          # Vercel deployment config
└── .env.example          # Environment variables template
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- Dhamini backend API running (default: http://localhost:4000/api)

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

The app will be available at http://localhost:5173

### Build for Production

\`\`\`bash
npm run build
\`\`\`

Output will be in the \`dist/\` directory.

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Environment Variables

Create a \`.env\` file in frontend root (copy from \`.env.example\`):

\`\`\`env
# API Base URL for Dhamini Backend
# Development: http://localhost:4000/api
# Production: https://dhamini-backend.onrender.com/api
VITE_API_BASE_URL=http://localhost:4000/api
\`\`\`

## API Integration

The frontend connects to the backend via the configured \`api.js\` module:

### Using the API

\`\`\`jsx
import dhaminiApi from \'@/api\';

// Get user profile
const response = await dhaminiApi.get(\'/auth/profile\');
const user = response.data.user;
\`\`\`

### Authentication

\`\`\`jsx
import { useAuth } from \'@/api/contexts/AuthContext\';

const Login = () => {
  const { login, user, loading } = useAuth();

  const handleSubmit = async () => {
    const result = await login(phone, password);
    if (result.success) {
      // Navigate based on user role
    }
  };

  return (/* ... */);
};
\`\`\`

## Deployment

### Vercel (Recommended)

The app is configured for Vercel deployment with \`vercel.json\`:

1. Connect your GitHub repository to Vercel
2. Import \`dhamini/frontend\` directory
3. Set \`VITE_API_BASE_URL\` environment variable:
   - Production: \`https://dhamini-backend.onrender.com/api\`
   - Development: \`http://localhost:4000/api\`
4. Deploy - Vercel will automatically detect Vite and build the app

### Custom Server

\`\`\`bash
npm run build
# Serve the dist folder with any static server
npx serve dist
\`\`\`

## Key Features

### Authentication Flow

1. **Register**: User submits phone, name, password
2. **OTP Verification**: Backend sends OTP (MVP mode: logged to console)
3. **Login**: User logs in with phone and password
4. **Role-Based Navigation**:
   - Borrower → Borrower Portal
   - Lender → Lender Portal
   - Admin → Admin dashboard

### KYC Submission

Multi-tier KYC flow:
- **TIER 1**: Basic information (name, phone, ID, DOB, gender)
- **TIER 2**: KRA PIN and IPRS verification
- **TIER 3**: Bank and M-Pesa account verification
- **TIER 4**: Biometric and employer verification (future)

### Loan Application

Borrower can:
- Apply for new loans
- View loan applications status
- Sign digital mandates
- Track repayments
- View credit score history

### Lender Management

Lender can:
- View all loan applications
- Approve/reject loans
- Disburse approved loans
- Monitor repayment progress
- Generate reports

### Responsive Design

- Mobile-first approach
- Tailwind CSS for responsive layouts
- Works on all modern browsers
- Optimized for mobile devices (common in Kenya/East Africa)

## Troubleshooting

### API Connection Issues

If you see "unable to reach Dhamini API":

1. Verify backend is running: \`npm start\` in backend directory
2. Check backend URL in \`.env\` (default: http://localhost:4000/api)
3. Ensure CORS is enabled on backend
4. Check browser console for specific error messages

### Build Errors

If build fails:

1. Clear cache: \`rm -rf node_modules/.vite\`
2. Reinstall: \`rm -rf node_modules && npm install\`
3. Check Node.js version: \`node --version\` (should be 18+)

### Development Issues

If hot reload not working:

1. Stop dev server (Ctrl+C)
2. Clear browser cache
3. Restart: \`npm run dev\`

## Contributing

When making changes:

1. Create feature branch
2. Make changes with clear commit messages
3. Test thoroughly with backend
4. Submit PR for review

## MVP Mode Notes

When backend is in MVP mode:
- OTP codes are logged to backend console (check Render/backend logs)
- Payments are simulated (no actual M-Pesa transactions)
- KYC verification auto-approves
- Check backend logs for OTP: \`[MVP MODE] OTP for phone +254700000000: 123456\`

## License

Confidential & Proprietary
