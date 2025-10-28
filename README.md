# HireLens Local - Offline HR Matching Dashboard

<div align="center">

**An intelligent, privacy-first HR recruitment platform that runs entirely in your browser**

[![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat)](LICENSE)

[Features](#features) • [Getting Started](#getting-started) • [Architecture](#architecture) • [Documentation](#documentation)

</div>

---

## Overview

HireLens Local is a **fully offline, browser-based HR matching dashboard** that helps recruiters find the best candidates for open positions. Built with privacy and performance in mind, it requires no backend servers, API keys, or internet connection after the initial load.

### Why HireLens Local?

- **🔒 Privacy First**: All data stays in your browser. No servers, no tracking, no data leaks
- **⚡ Lightning Fast**: IndexedDB storage means instant access to thousands of candidates
- **📱 Cross-Platform**: Works seamlessly on desktop, tablet, and mobile devices
- **🌐 Fully Offline**: Continue working even without internet connection
- **🎯 Smart Matching**: BM25 algorithm + rule-based scoring for accurate candidate ranking
- **🎨 Beautiful UI**: Modern, responsive design with drag-and-drop Kanban board

---

## Features

### 📄 Intelligent CV Parsing
- Drag-and-drop PDF resume upload
- Automatic extraction of:
  - Name, email, phone number
  - Skills with synonym recognition (React.js → React)
  - Years of experience
  - Location
- Support for multiple CV formats
- Real-time parsing feedback

### 🎯 Smart Candidate Scoring
- **BM25 text relevance algorithm** for semantic matching
- **Rule-based scoring system**:
  - Must-have skills: -15 points per missing skill (cap -50)
  - Nice-to-have skills: +3 points each (cap +15)
  - Experience requirements: -10 points if below minimum
  - Location matching: -5 points for mismatch
  - Keyword density bonus: +0 to +10 points
- Score explanations with detailed breakdown
- Skill gap analysis
- Keyword heatmap visualization

### 📊 Visual Candidate Pipeline
- **Kanban board** with drag-and-drop functionality
- Three stages: New → Shortlist → Interview
- Real-time statistics dashboard:
  - Total candidates in pipeline
  - Active job openings
  - Average match score across all candidates
- Filter and sort candidates by score

### 💼 Job Management
- Create and edit job postings
- Define must-have and nice-to-have skills
- Set minimum experience requirements
- Location preferences
- Active/inactive job toggling
- 45 pre-seeded sample jobs for testing

### 🎨 Advanced UI Components
- **Match Gauge**: Circular progress indicator with color-coded scores
- **Skill Gap List**: Visual display of missing required skills
- **Keyword Heatmap**: Skills overlap visualization using Recharts
- **Responsive Design**: Optimized layouts for all screen sizes
- **Dark Mode**: System-aware theme with manual toggle

### ⚙️ Customization
- Skill dictionary editor with synonym management
- Theme preferences (Light/Dark/System)
- Reduced motion support for accessibility
- Data export/import (JSON format)
- Clear all data option

---

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn**
- Modern browser with IndexedDB support

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd hirelens-local
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

### Quick Start Guide

1. **Upload a Resume**
   - On the dashboard, drag and drop a PDF CV onto the upload area
   - Wait for automatic parsing (usually takes 2-5 seconds)
   - Candidate appears in the "New" column

2. **Create a Job** (Optional - 45 sample jobs pre-loaded)
   - Click "Jobs" in the top navigation
   - Click "Create Job" button
   - Fill in job details and required skills
   - Save the job

3. **View Match Score**
   - Click on any candidate card in the pipeline
   - See automatic match scores for all active jobs
   - Review score breakdown, skill gaps, and keyword overlap

4. **Manage Pipeline**
   - Drag candidates between Kanban columns
   - Move promising candidates to "Shortlist"
   - Move final candidates to "Interview"

---

## Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 13.5 (App Router) | React framework with SSR/SSG |
| **Language** | TypeScript 5.2 | Type safety and developer experience |
| **State** | Zustand 5.0 | Lightweight state management |
| **Storage** | IndexedDB (via idb 8.0) | Client-side persistent storage |
| **Styling** | Tailwind CSS 3.3 + shadcn/ui | Utility-first CSS + component library |
| **PDF** | PDF.js 3.11 (CDN) | Resume parsing and text extraction |
| **Charts** | Recharts 2.12 | Data visualization |
| **Forms** | React Hook Form + Zod | Form handling and validation |
| **Icons** | Lucide React | Beautiful, consistent icons |

### Key Design Patterns

- **Offline-First**: All functionality works without internet after initial load
- **Progressive Web App**: Installable with service worker caching
- **State-Driven UI**: Zustand stores for candidates, jobs, matches, and settings
- **Component Composition**: Reusable, atomic components with shadcn/ui
- **Type Safety**: Full TypeScript coverage with strict mode
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Project Structure

```
hirelens-local/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Dashboard with Kanban board
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── candidates/[id]/         # Candidate detail page
│   ├── jobs/                    # Job listing and management
│   │   ├── page.tsx            # Jobs list
│   │   └── [id]/page.tsx       # Job create/edit
│   └── settings/                # Settings page
│
├── components/                   # React components
│   ├── CandidateCard.tsx        # Candidate summary card
│   ├── MatchGauge.tsx           # Circular match score display
│   ├── GapList.tsx              # Missing skills visualization
│   ├── KeywordHeatmap.tsx       # Skills overlap heatmap
│   ├── FileDropzone.tsx         # Drag-and-drop upload
│   ├── KanbanColumn.tsx         # Pipeline column
│   ├── Logo.tsx                 # Brand logo component
│   └── ui/                      # shadcn/ui components (40+ components)
│
├── lib/                          # Core business logic
│   ├── db/                      # IndexedDB layer
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── idb.ts              # Database operations
│   ├── parse/                   # CV parsing
│   │   ├── pdfClient.ts        # PDF.js loader and text extraction
│   │   └── cvParser.ts         # CV field extraction logic
│   ├── nlp/                     # Natural language processing
│   │   ├── skills.json         # 200+ skills with synonyms
│   │   └── normalize.ts        # Skill normalization utilities
│   ├── rank/                    # Scoring engine
│   │   ├── bm25.ts            # BM25 relevance algorithm
│   │   └── score.ts           # Candidate scoring logic
│   ├── embeddings/             # Semantic search (future)
│   │   └── loader.ts          # Stub for transformers.js
│   ├── seed.ts                 # Sample data (45 jobs)
│   ├── sw-register.ts          # Service worker registration
│   └── utils.ts                # Utility functions
│
├── store/                        # Zustand state stores
│   ├── candidates.ts            # Candidate CRUD operations
│   ├── jobs.ts                  # Job CRUD operations
│   ├── matches.ts               # Match calculations
│   └── settings.ts              # User preferences
│
├── hooks/                        # Custom React hooks
│   └── use-toast.ts             # Toast notifications
│
├── public/                       # Static assets
│   ├── manifest.webmanifest     # PWA manifest
│   ├── sw.js                    # Service worker
│   ├── icon-192.svg             # App icon (192x192)
│   └── icon-512.svg             # App icon (512x512)
│
└── workers/                      # Web Workers (future)
    └── worker.ts                # Background processing stub
```

---

## Data Models

### Candidate

```typescript
interface Candidate {
  id: string;                    // UUID
  name: string;                  // Full name
  email: string;                 // Contact email
  phone: string;                 // Phone number
  skills: string[];              // Normalized skills
  yearsExperience: number;       // Total years of experience
  location?: string;             // Current location
  rawText: string;               // Full CV text
  stage: 'new' | 'shortlist' | 'interview';  // Pipeline stage
  createdAt: number;             // Timestamp
  updatedAt: number;             // Timestamp
}
```

### Job

```typescript
interface Job {
  id: string;                    // UUID
  title: string;                 // Job title
  description: string;           // Job description
  mustHaveSkills: string[];      // Required skills
  niceToHaveSkills: string[];    // Preferred skills
  minYears: number;              // Minimum experience
  location?: string;             // Job location
  isActive: boolean;             // Active status
  createdAt: number;             // Timestamp
  updatedAt: number;             // Timestamp
}
```

### Match

```typescript
interface Match {
  id: string;                    // UUID
  candidateId: string;           // Reference to candidate
  jobId: string;                 // Reference to job
  score: number;                 // 0-100 match score
  explanations: string[];        // Score breakdown
  gaps: string[];                // Missing skills
  matchedSkills: string[];       // Skills found
  missingMustHave: string[];     // Critical missing skills
  createdAt: number;             // Timestamp
}
```

---

## Scoring Algorithm

### Formula

```
Base Score: 50 points

+ BM25 Text Relevance:     0 to +30 points
- Missing Must-Have:       -15 per skill (cap -50)
+ Nice-to-Have Match:      +3 per skill (cap +15)
- Experience Gap:          -10 if below minimum
- Location Mismatch:       -5 if different
+ Keyword Density:         0 to +10 based on frequency

Final Score: Normalized to 0-100 range
```

### BM25 Parameters

- **k1**: 1.5 (term saturation parameter)
- **b**: 0.75 (length normalization)

### Skill Normalization

The system uses a comprehensive skill dictionary with 200+ skills and their synonyms:

```json
{
  "react": ["react.js", "reactjs", "react framework"],
  "typescript": ["ts", "type script"],
  "node.js": ["nodejs", "node", "node js"],
  "python": ["py"],
  "javascript": ["js", "ecmascript", "es6", "es2015"]
}
```

Skills are normalized before comparison, ensuring "React.js" and "ReactJS" both match "react".

---

## Performance

### Metrics

- **Bundle Size**: ~121KB initial load (gzipped)
- **First Contentful Paint**: < 1.5s on 3G
- **Time to Interactive**: < 3s on 3G
- **Lighthouse Scores**: All 95+ (Performance, Accessibility, Best Practices, SEO)
- **CV Parsing**: 2-5 seconds per PDF (depends on page count)
- **Match Calculation**: < 100ms per job

### Optimization Techniques

- Next.js automatic code splitting
- React Server Components for static content
- IndexedDB for instant data access
- Service Worker for offline caching
- Lazy loading for PDF.js (CDN)
- useMemo/useCallback for expensive computations
- Optimized re-renders with Zustand

---

## Browser Support

### Minimum Requirements

| Browser | Version |
|---------|---------|
| Chrome/Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Opera | 76+ |

### Required Features

- IndexedDB API
- Service Worker API
- File API with drag-and-drop
- ES6+ JavaScript
- CSS Grid and Flexbox

---

## Troubleshooting

### PDF Upload Issues

**Problem**: PDF fails to parse or shows error message

**Solutions**:
1. Ensure PDF is not password-protected
2. Check PDF is not corrupted (open in another viewer)
3. Verify file size is under 10MB
4. Check browser console for `[PDF Extract]` logs
5. Try a different PDF file

### Data Not Persisting

**Problem**: Data disappears after browser restart

**Solutions**:
1. Ensure you're not in Private/Incognito mode
2. Check browser storage quota (Settings → Site Settings → Storage)
3. Disable aggressive privacy extensions that block IndexedDB
4. Clear browser cache and try again

### Match Scores Showing 0%

**Problem**: Average match score stays at 0% after uploading CVs

**Solutions**:
1. Open browser console (F12) and check for errors
2. Look for `[Mobile Debug]` logs showing match creation
3. Verify active jobs exist (at least one job should be active)
4. Wait 1-2 seconds after upload for state to update
5. Refresh the page

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Ensure Node.js version is 18+
node --version

# Run type check separately
npm run typecheck
```

### Mobile Safari Issues

**Problem**: File upload doesn't work on iOS

**Solutions**:
1. Update iOS to latest version (Safari 14+)
2. Use the "Click to upload" button instead of drag-and-drop
3. Check Safari settings allow file uploads
4. Try in a different browser (Chrome for iOS)

---

## Advanced Usage

### Customizing Skill Dictionary

1. Go to **Settings** page
2. Scroll to **Skill Dictionary** section
3. Add new skill mappings in JSON format:

```json
{
  "machine learning": ["ml", "machine-learning", "deep learning"],
  "artificial intelligence": ["ai", "a.i."],
  "docker": ["containerization", "containers"]
}
```

4. Click **Save** to apply changes

### Exporting Data

Export all candidates, jobs, and matches to JSON:

1. Go to **Settings** page
2. Scroll to **Data Management** section
3. Click **Export Data**
4. Save the JSON file to your computer

### Importing Data

Import previously exported data:

1. Go to **Settings** page
2. Click **Import Data**
3. Select a valid JSON export file
4. Data will be merged with existing records

### Clearing All Data

**Warning**: This action cannot be undone!

1. Go to **Settings** page
2. Scroll to **Danger Zone**
3. Click **Clear All Data**
4. Confirm the action

---

## Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# ESLint code linting
npm run lint

# TypeScript type checking
npm run typecheck
```

### Environment Setup

No environment variables required! The app runs entirely client-side.

Optional: For future Supabase integration, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Code Style

- **TypeScript Strict Mode** enabled
- **ESLint** with Next.js recommended config
- **Prettier** (optional) for consistent formatting
- **Component naming**: PascalCase for components, camelCase for utilities
- **File organization**: One component per file, co-locate related files

### Adding New Components

```bash
# shadcn/ui component (automatic install)
npx shadcn-ui@latest add <component-name>

# Custom component (manual creation)
touch components/MyComponent.tsx
```

---

## Roadmap

### Version 1.1 (Q1 2026)

- [ ] Semantic search with transformers.js
- [ ] Bulk CSV import for candidates
- [ ] Email template generator
- [ ] Interview scheduling
- [ ] Notes and comments on candidates

### Version 1.2 (Q2 2026)

- [ ] Multi-language CV support
- [ ] PDF generation for candidate reports
- [ ] Advanced filtering and search
- [ ] Team collaboration features
- [ ] Analytics dashboard

### Version 2.0 (Q3 2026)

- [ ] Optional cloud sync (self-hosted)
- [ ] AI-powered candidate summaries
- [ ] Video interview integration
- [ ] ATS integration (API)
- [ ] Mobile native apps

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write TypeScript with strict type checking
- Follow existing code style and patterns
- Add comments for complex logic
- Test on desktop, tablet, and mobile
- Ensure offline functionality works
- Update documentation for new features

---

## License

MIT License - See [LICENSE](LICENSE) file for details

---

## Acknowledgments

- **Next.js** - The React framework for production
- **shadcn/ui** - Beautiful, accessible component library
- **PDF.js** - Mozilla's PDF rendering library
- **Zustand** - Elegant state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library

---

## Support

- **Documentation**: See [IMPLEMENTATION.md](IMPLEMENTATION.md) for technical details
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

---

<div align="center">

**Built with ❤️ for recruiters who value privacy and speed**

[⬆ Back to Top](#hirelens-local---offline-hr-matching-dashboard)

</div>
