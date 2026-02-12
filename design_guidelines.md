# Design Guidelines: Time Tracking & Gantt Chart Web Application

## Design Approach

**Selected Approach**: Design System - Drawing from Linear, Asana, and modern project management tools
**Justification**: This is a utility-focused productivity application where efficiency, data clarity, and usability are paramount. The design should prioritize information hierarchy and workflow efficiency over visual flourish.

## Core Design Elements

### A. Typography
- **Primary Font**: Inter or Roboto (via Google Fonts CDN)
- **Headings**: 
  - H1: text-2xl font-semibold (App title)
  - H2: text-xl font-semibold (Section headers: "Projects", "Gantt Chart")
  - H3: text-lg font-medium (Project names, modal titles)
- **Body Text**: text-base (Default form labels, chart labels)
- **Secondary Text**: text-sm (Metadata: dates, task counts, helper text)
- **Micro Text**: text-xs (Timestamps, subtle hints)

### B. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, space-y-8)

**Application Structure**:
- **Header**: Fixed top bar (h-16) with app branding and primary actions
- **Main Content Area**: Two-column layout on desktop
  - **Left Sidebar** (w-80 on lg+): Scrollable project/task list with add buttons
  - **Right Panel** (flex-1): Gantt chart visualization area
  - Stack to single column on mobile/tablet
- **Spacing**: 
  - Container padding: px-4 md:px-6 lg:px-8
  - Section spacing: space-y-6
  - Card spacing: p-4 to p-6
  - Form field spacing: space-y-4

### C. Component Library

**Navigation & Structure**:
- **Header Bar**: App title (left), "Add Project" button (right)
- **Sidebar Panel**: Scrollable list with clear project hierarchy
  - Project cards showing project name, date range, task count
  - Expandable/collapsible task lists beneath each project
  - Action buttons (Edit, Delete) on hover
- **Empty States**: Centered icon + message when no projects exist

**Forms & Inputs**:
- **Add/Edit Modal**: Centered overlay (max-w-lg) with backdrop
  - Modal header with title and close button
  - Form fields with consistent spacing (space-y-4)
  - Action buttons: Cancel (secondary) and Save (primary) aligned right
- **Input Fields**:
  - Text inputs: Full-width with border, focus ring, rounded corners
  - Date pickers: Native input[type="date"] styled consistently
  - Labels: Above inputs with text-sm font-medium
  - Helper text: Below inputs with text-xs
- **Gap/Pause Input**: Number input with "days" suffix label

**Data Display**:
- **Project Cards**: 
  - Clear title with date range beneath
  - Task count badge
  - Hover state reveals edit/delete actions
- **Task List Items**:
  - Indented beneath parent project
  - Task name, date range, gap indicator (if applicable)
  - Compact design with clear hierarchy
- **Gantt Chart Container**:
  - Full-width chart area with padding
  - Chart controls (zoom, date range selector) above chart
  - Responsive scaling for different viewport sizes
  - Timeline grid with clear date markers
  - Distinct bars for projects vs tasks
  - Gap periods shown as dashed lines or lighter bars
  - Tooltips on hover showing detailed info

**Buttons**:
- **Primary**: "Add Project", "Save" - prominent treatment
- **Secondary**: "Cancel", "Edit" - subdued style
- **Destructive**: "Delete" - distinct warning treatment
- **Icon Buttons**: For compact actions in tight spaces

**Visual Feedback**:
- **Loading States**: Subtle spinner or skeleton screens during data updates
- **Success/Error Messages**: Toast notifications (top-right corner, auto-dismiss)
- **Validation**: Inline error messages beneath invalid fields with red accent

### D. Component Icons

**Icon Library**: Heroicons (via CDN)
- Plus icon: Add project/task buttons
- Pencil icon: Edit actions
- Trash icon: Delete actions
- Calendar icon: Date field indicators
- Chevron down/up: Expand/collapse project lists
- X icon: Close modal, dismiss notifications
- Clock icon: Gap/pause indicators in timeline

## Application-Specific Patterns

**Project Hierarchy Visualization**:
- Use indentation (pl-6) for tasks under projects
- Connecting lines (border-left) to show parent-child relationships
- Clear visual separation between project groups

**Gantt Chart Integration**:
- Use Plotly.js or similar for interactive chart rendering
- Chart should fill available width, maintain readable height (400-600px)
- Show time axis horizontally, projects/tasks vertically
- Color coding: Distinct hues for different projects, lighter shades for tasks
- Interactive features: Drag to pan, scroll to zoom, click for details

**Real-Time Updates**:
- Optimistic UI updates - show changes immediately
- Chart auto-refreshes when project/task data changes
- Smooth transitions when adding/removing elements

**Responsive Behavior**:
- Desktop: Side-by-side layout (list + chart)
- Tablet: Stacked layout with collapsible sidebar
- Mobile: Full-width views with tab navigation between list and chart

## Accessibility & Usability

- Keyboard navigation: Tab through all interactive elements
- Focus indicators: Clear visible focus states on all inputs and buttons
- Screen reader labels: Proper ARIA labels for icon-only buttons
- Color contrast: Ensure WCAG AA compliance for all text
- Form validation: Clear error messages, prevent submission until valid
- Date inputs: Validation to prevent end dates before start dates

**Critical Success Factors**:
- Data entry should be quick and intuitive
- Chart should update instantly without page refresh
- Clear visual hierarchy makes project/task relationships obvious
- Mobile experience remains fully functional despite smaller screen