# R-DataX

A React application for data management and synchronization built with TypeScript and Material-UI.

## Features

- Data management and synchronization
- Modern React 18 with TypeScript
- Material-UI components for consistent UI/UX
- Responsive design
- Authentication system (Login/Signup)

## Tech Stack

- **Frontend**: React 18, TypeScript
- **UI Library**: Material-UI (MUI)
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Emotion (CSS-in-JS)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

## Project Structure

```
src/
├── api/          # API services
├── components/   # Reusable components
├── contexts/     # React contexts
├── features/     # Feature-specific components
├── pages/        # Page components
├── styles/       # Global styles
├── theme/        # Material-UI theme
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

## License

MIT