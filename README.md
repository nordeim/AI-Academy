# AI Academy - Production-Grade AI Training Platform

A modern, full-stack web application for an AI & Software Training Platform built with Next.js 16.1.4, React 19.2.3, Tailwind CSS 4.1.18, and Django 6.0.2.

## Design Philosophy: "Precision Futurism with Technologic Minimalism"

This platform differentiates from traditional IT certification sites through dynamic intelligence-forward visual metaphors while maintaining conversion-optimized clarity.

## Tech Stack

### Frontend
- **Next.js 16.1.4** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5.9.3** - Type safety
- **Tailwind CSS 4.1.18** - CSS-first styling
- **Framer Motion 12.29.0** - Animations
- **Zustand 5.0.3** - State management
- **Lucide React** - Icons
- **Radix UI** - Accessible primitives

### Backend
- **Django 6.0.2** - Python web framework
- **Django REST Framework** - API endpoints
- **PostgreSQL 16** - Database
- **Redis** - Caching
- **Stripe** - Payment processing

## Project Structure

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles & Tailwind v4 theme
│   ├── components/
│   │   ├── ui/                # UI components (Button, Badge, Card, etc.)
│   │   ├── layout/            # Layout components (Navigation, Footer)
│   │   └── sections/          # Page sections (Hero, Features, etc.)
│   ├── lib/
│   │   ├── utils.ts           # Utility functions (cn)
│   │   ├── animations.ts      # Framer Motion animations
│   │   └── hooks/             # Custom hooks (useReducedMotion)
│   └── types/
│       └── index.ts           # TypeScript types
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.js
```

## Key Features

### Design System
- **Color Palette**: Electric Indigo (#4f46e5), Neural Cyan (#06b6d4), Signal Amber (#f59e0b)
- **Typography**: Space Grotesk (display), Inter (body), JetBrains Mono (code)
- **Spacing**: 4px base grid, 80px section padding
- **Zero Border Radius**: Sharp, architectural edges

### Components
- **Button**: 6 variants (primary, secondary, ghost, urgency, outline, danger)
- **Course Card**: Accent-top pattern from iTrust Academy
- **Status Badge**: Pulse animation for urgency indicators
- **Navigation**: Glassmorphism effect with mobile menu
- **Reveal**: Scroll-triggered animations with reduced motion support

### Page Sections
1. **Hero**: Animated status badge, stats, abstract visualization
2. **Trust Signals**: Company logos with hover effects
3. **Course Categories**: 6 category cards with accent colors
4. **Features**: 6 feature cards with icons
5. **Featured Course**: AI Engineering Bootcamp showcase
6. **Training Schedule**: Upcoming cohorts with status indicators
7. **Consulting CTA**: Enterprise training call-to-action

### Accessibility (WCAG AAA)
- `useReducedMotion` hook for motion sensitivity
- Proper heading hierarchy
- ARIA labels on interactive elements
- Focus indicators on all buttons
- Color contrast compliance

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Python 3.12+ (for backend)
- PostgreSQL 16 (for backend)

### Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/base.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/academy_db
REDIS_URL=redis://localhost:6379/0
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 90+ |
| Lighthouse Accessibility | 100 |
| Largest Contentful Paint | < 2.5s |
| First Input Delay | < 100ms |
| Cumulative Layout Shift | < 0.1 |

## Anti-Generic Enforcement

### Prohibited Patterns
- Inter/Roboto default fonts
- Purple-to-pink gradients
- Generic card grids
- Stock photos
- Bootstrap-style components
- Hamburger menu on desktop

### Mandatory Distinctive Elements
- Custom typography pairing
- Asymmetric layouts
- Motion design
- Code-first aesthetic
- Zero border radius
- Accent-top cards

## License

MIT License - see LICENSE file for details.

## Credits

Design inspired by iTrust Academy's proven UX patterns, elevated for an AI/ML audience through "Precision Futurism with Technologic Minimalism."
