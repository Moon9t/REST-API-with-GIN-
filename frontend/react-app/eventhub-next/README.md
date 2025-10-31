# EventHub Next.js App

A full-featured Next.js web app supporting authentication, event management, and admin functionality. Built with TypeScript, Tailwind CSS, React Query, and Axios.

## Features

- User authentication (login/register)
- Event listing and details
- Create new events
- Admin dashboard
- Responsive UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```
   Replace with your actual Go API base URL.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app/` - Next.js App Router pages
- `src/lib/` - API client and utilities
- `src/hooks/` - React Query hooks for data fetching
- `src/components/` - Reusable UI components (if any)

## API Integration

The app integrates with a Go backend API. Ensure your API server is running and accessible at the configured `NEXT_PUBLIC_API_BASE_URL`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
