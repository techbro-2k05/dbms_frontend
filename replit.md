# Overview

FactoryPro is a comprehensive work scheduling and employee management system designed for factory environments. The application provides a dashboard-based interface for managing shifts, attendance tracking, leave requests, and employee administration. It features role-based access control with separate views for administrators and regular employees, real-time attendance tracking, and comprehensive analytics for workforce management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes for authenticated users
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and customization
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Session Management**: Express sessions with configurable storage (memory store for development)
- **Password Security**: Scrypt-based password hashing with salt for secure credential storage
- **API Design**: RESTful API endpoints with role-based middleware for authorization
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Database**: PostgreSQL with Neon serverless integration
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Connection**: Connection pooling through Neon serverless driver
- **Data Validation**: Zod schemas shared between frontend and backend for consistent validation

## Authentication and Authorization
- **Strategy**: Session-based authentication with Passport.js local strategy
- **Role System**: Two-tier role system (admin/normal) with middleware-based access control
- **Password Security**: Scrypt hashing algorithm with random salt generation
- **Session Storage**: Configurable session store with PostgreSQL backend support
- **Route Protection**: Frontend route guards and backend middleware for API endpoint protection

## Component Architecture
- **Design System**: Modular component library with consistent theming
- **Composition**: Compound component patterns for complex UI elements
- **Accessibility**: ARIA-compliant components with keyboard navigation support
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Loading States**: Skeleton components and loading indicators for improved UX

# External Dependencies

## Database and Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database ORM and query builder
- **Connect PG Simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **Radix UI**: Headless UI component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography

## State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition

## Authentication and Security
- **Passport.js**: Authentication middleware with multiple strategy support
- **Express Session**: Session management middleware
- **Scrypt**: Cryptographic function for secure password hashing

## Development and Build Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Plugins**: Development environment enhancements for Replit deployment