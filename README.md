# POLARIS Frontend

React frontend application for POLARIS - Planning Operations & Legal Analysis for Revenue & International Structures.

## Description

POLARIS is an AI-powered wealth planning tool that automates the creation of complex legal documents for tax attorneys. This frontend provides an intuitive chat interface for interacting with the AI assistant and managing clients and documents.

## Technologies

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Features

### 🤖 AI Chat Interface
- Interactive chat with POLARIS AI assistant
- Simulated responses for wealth planning queries
- Real-time message display with timestamps
- Professional chat UI with user/assistant message distinction

### 👥 Client Management
- Real-time connection to backend API
- Display of client information (name, email, assets)
- Refresh functionality to sync with backend
- Client count display in header

### 📄 Document Viewer
- Placeholder for generated legal documents
- Ready for PDF/DOCX document preview
- Download functionality (future implementation)

### ⚡ Quick Actions
- New Trust Document creation
- Add Client functionality
- Tax Analysis tools
- Professional action buttons with icons

## Project Structure

```
polaris_frontend/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── assets/             # Images and static files
│   ├── App.jsx             # Main application component
│   ├── App.css             # Application styles
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/carlossilvatbh/polaris_frontend.git
cd polaris_frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

## Backend Integration

The frontend connects to the POLARIS backend API:

- **Backend Repository**: https://github.com/carlossilvatbh/polaris_backend
- **API Endpoint**: `http://localhost:5000/api/clientes`
- **Authentication**: Uses user_id parameter for demo purposes

### API Integration Features

- Automatic client data fetching on component mount
- Error handling with fallback to demo data
- Loading states for better UX
- Refresh functionality to sync with backend

## Layout

### Two-Column Design

**Left Column (2/3 width):**
- AI Chat Interface
- Message history
- Input field with send button

**Right Column (1/3 width):**
- Recent Clients section
- Document Viewer
- Quick Actions panel

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive grid layout
- Optimized for desktop and tablet usage
- Professional color scheme with dark mode support

## Development

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

### Key Components

1. **App.jsx** - Main application with chat and client management
2. **UI Components** - Pre-built shadcn/ui components
3. **Axios Integration** - HTTP client for backend communication

### Styling

- Tailwind CSS for utility-first styling
- Custom CSS variables for theming
- shadcn/ui design system
- Professional gradient backgrounds

## Features Implemented

✅ **Chat Interface**
- Real-time messaging
- Simulated AI responses
- Professional chat bubbles
- Timestamp display

✅ **Backend Connection**
- Client data fetching
- Error handling
- Loading states
- Refresh functionality

✅ **Responsive Design**
- Two-column layout
- Mobile optimization
- Professional styling

✅ **UI Components**
- Cards and buttons
- Input fields
- Scroll areas
- Icons and badges

## Future Enhancements

- [ ] Real AI integration (Claude/OpenAI)
- [ ] Document generation and preview
- [ ] User authentication
- [ ] Real-time notifications
- [ ] Advanced client management
- [ ] Document templates
- [ ] Export functionality

## Contributing

This project was developed with Manus AI as an autonomous engineering team.

## License

Private property - All rights reserved.

