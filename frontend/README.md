# AutoPlac AI - Frontend

Modern React frontend for the AutoPlac AI car marketplace platform.

## 🚀 Features

- **Modern React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for beautiful, responsive design
- **React Router** for client-side routing
- **Lucide React** for beautiful icons
- **Responsive design** optimized for all devices

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL database (for the backend API)

## 🛠️ Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx      # Main navigation header
│   │   └── Footer.tsx      # Footer component
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page
│   │   ├── Cars.tsx        # Car listings page
│   │   ├── CarDetails.tsx  # Individual car details
│   │   └── Users.tsx       # User management page
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # React entry point
│   ├── index.css           # Global styles with Tailwind
│   └── App.css             # Additional app styles
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🎨 Design System

### Colors
- **Primary:** Blue gradient (#3b82f6 to #1e3a8a)
- **Secondary:** Gray scale for text and backgrounds
- **Accent:** Yellow for highlights (#fbbf24)

### Typography
- **Font Family:** Inter (Google Fonts)
- **Responsive text sizes** with mobile-first approach

### Components
- **Modern card layouts** with shadows and hover effects
- **Responsive navigation** with mobile menu
- **Interactive forms** with validation
- **Loading states** and animations

## 🔗 API Integration

The frontend connects to the FastAPI backend at:
- **Base URL:** `http://localhost:8000`
- **API Routes:**
  - `/api/users/` - User management
  - `/api/oglasi/` - Car advertisements
  - `/api/vozila/` - Vehicle listings

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints:**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME=AutoPlac AI
VITE_APP_VERSION=1.0.0
```

### Tailwind CSS
Customize the design system in `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

## 📄 License

This project is part of the AutoPlac AI platform.
