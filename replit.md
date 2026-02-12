# TimeTracker - Project Timeline Management

## Overview

TimeTracker is a web-based project management application that provides time tracking capabilities and interactive Gantt chart visualizations for managing projects, tasks, and timelines. The application enables users to create projects with associated tasks, track date ranges, and visualize project schedules through an interactive Gantt chart interface with multiple view modes (day, week, month, year).

## Recent Changes (November 2025)

### Features Implemented
1. **View Mode Selector**: Added dropdown selector to switch between Day, Week, Month, and Year timeline views with proper timeline calculations for each mode
2. **Collapse/Expand Functionality**: Added chevron icons to project rows allowing users to collapse/expand task lists for better organization
3. **Project Details Dialog**: Project bars in the Gantt chart are now clickable and open a dialog showing project details including dates and notes
4. **Task Edit Dialog**: Task bars in the Gantt chart are now clickable and open an edit modal pre-filled with task information (name, dates, project, gap days)
5. **Notes Field**: Added optional notes field to projects for additional context and documentation
6. **Drag vs Click Guard**: Implemented 3px movement threshold to differentiate between resize operations and clicks, preventing accidental dialog opening during resizes
7. **Day View Header Enhancement**: Day view now displays a two-row header - full month name(s) on top (e.g., "January") spanning all days in that month, with day numbers only (e.g., "15", "16", "17") in the bottom row
8. **Capacity Settings**: Added clickable capacity display in header (e.g., "Capacity: 8 hrs/day • 5 days/week") that opens a settings dialog allowing users to configure hours per day (1-24) and days per week (1-7)
9. **Holiday Tracking**: Added holiday date management in capacity settings dialog - users can add/remove holiday dates that are visualized as greyed-out vertical columns across the Gantt timeline in all view modes
10. **Holiday Visualization**: Holiday columns render as semi-transparent overlays (bg-muted/60) with minimum 0.3% width to ensure visibility even in Year view spanning multiple years

### Technical Improvements
- Timeline calculations support inclusive date handling (+1 for duration)
- Consistent width calculations across all view modes
- Proper state management for isDragging to restore click handling after resize operations
- Conditional rendering of notes section in project details dialog (hidden when empty)
- Month headers grouped by calendar month in Day view for improved readability
- Holiday columns use Math.max() to enforce minimum 0.3% width for visibility in Year view with 365+ day timelines
- Holiday date input uses ref-based value checking for reliable automated testing compatibility
- Settings stored in local state alongside projects and tasks (no backend API required)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing

**UI Component System**
- shadcn/ui component library (New York style) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Design philosophy draws from Linear and Asana for productivity-focused workflows

**State Management**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod for form validation and type-safe schema validation
- Local React state for UI-specific concerns (modals, collapsible states, view modes)

**Key Design Patterns**
- Component-based architecture with reusable UI primitives
- Controlled form components with validation schemas
- Query-based data fetching with aggressive caching (staleTime: Infinity)
- Path alias system (@/ for client, @shared for shared code, @assets for assets)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the HTTP server
- ESM module system throughout the codebase
- Custom middleware for request logging and JSON body parsing with raw buffer capture

**Data Layer**
- In-memory storage implementation (MemStorage) using Map data structures
- Interface-based storage abstraction (IStorage) allowing for future database implementations
- UUID-based primary keys generated server-side

**API Structure**
- RESTful API design pattern with `/api` prefix for all routes
- Route registration system separates routing logic from server setup
- Logging middleware captures request/response cycles for API endpoints

### Data Storage Solutions

**Current Implementation**
- In-memory Map-based storage for projects and tasks
- No persistent database currently connected
- Data models defined using Drizzle ORM schemas for PostgreSQL compatibility

**Schema Design**
- **Projects Table**: id (UUID), name, startDate, endDate, color, notes
- **Tasks Table**: id (UUID), projectId (foreign key), name, startDate, endDate, gapDays
- Cascade deletion: removing a project deletes all associated tasks
- Default values: color defaults to blue (#3b82f6), gapDays defaults to 0

**Future Database Integration**
- Drizzle ORM configured for PostgreSQL dialect
- Neon Database serverless driver ready for integration
- Migration system configured (output to ./migrations directory)
- Connection expects DATABASE_URL environment variable

### External Dependencies

**UI Component Libraries**
- Radix UI: Comprehensive suite of unstyled, accessible components (accordion, alert-dialog, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, tooltip)
- Embla Carousel: Carousel/slider functionality
- cmdk: Command menu interface component
- Lucide React: Icon library for consistent iconography

**Form & Validation**
- React Hook Form: Form state management
- Zod: Runtime type validation and schema definition
- @hookform/resolvers: Integration between React Hook Form and Zod
- Drizzle-Zod: Generate Zod schemas from Drizzle ORM table definitions

**Data Fetching & State**
- TanStack React Query: Server state management, caching, and synchronization

**Date Handling**
- date-fns: Date manipulation and formatting utilities

**Styling & Utilities**
- Tailwind CSS: Utility-first CSS framework
- class-variance-authority: Type-safe variant management
- clsx & tailwind-merge: Conditional class name composition

**Database & ORM**
- Drizzle ORM: Type-safe SQL query builder
- @neondatabase/serverless: Serverless PostgreSQL driver for Neon Database
- connect-pg-simple: PostgreSQL session store (configured but not actively used)

**Development Tools**
- Vite: Build tool and dev server
- TypeScript: Type checking and compilation
- ESBuild: Production bundling for server code
- Replit-specific plugins: Runtime error overlay, cartographer, dev banner

**Typography**
- Google Fonts CDN: Inter font family (weights 300-700)