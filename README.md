# MapLeads

MapLeads is a powerful web application designed to streamline the process of collecting and analyzing business data from Google Maps. It enables users to search for businesses by type and location, store the results, and interact with the data through an AI-powered chat interface.

## Features

- **Business Data Collection**: Search and scrape detailed business information from Google Maps
  - Business names and descriptions
  - Contact information (phone, email, website)
  - Physical addresses
  - Ratings and reviews
  
- **Advanced Filtering**:
  - Filter by business name, street, or city
  - Filter by precise rating ranges (e.g., 4.2–4.8 stars)
  - Filter by available contact methods (phone, email, website)
  - Filter by keywords in descriptions

- **Data Export**:
  - Export filtered results to CSV
  - Export includes all available business details
  - Filtered data reflects current view state

- **AI Chat Interface**:
  - Interact with your data using natural language
  - Ask questions about your search results
  - Get intelligent insights and analysis
  - Powered by Claude 3.5 Sonnet

- **Search History**:
  - View past searches in the sidebar
  - Quick access to previous results
  - Manage and organize search history

## Tech Stack

- **Frontend**:
  - React (Next.js)
  - Tailwind CSS
  - Shadcn UI Components
  
- **Backend**:
  - Supabase (Database & Authentication)
  - Google Maps API
  - Anthropic API (Claude 3.5 Sonnet)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PNPM package manager
- Git

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MapLeads-v2
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The application uses Supabase for data storage and authentication. The following tables are required:

- `users`: Managed by Supabase Auth
- `searches`: Stores search history and metadata
- `results`: Stores scraped business data

## Usage

1. **Authentication**:
   - Sign up for a new account or log in
   - Use email/password or OAuth providers

2. **Searching**:
   - Enter a business type (e.g., "plumbers")
   - Enter a location (e.g., "Austin, TX")
   - Click "Search" to fetch results

3. **Filtering Results**:
   - Use the filter panel to refine results
   - Filters update in real-time
   - Export filtered data as needed

4. **Using AI Chat**:
   - Click "Show Chat" to open the chat panel
   - Ask questions about your data
   - Get instant analysis and insights

## Development

### Project Structure

```
MapLeads-v2/
├── app/                  # Next.js app directory
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   └── pages/          # Page-specific components
├── lib/                # Utility functions
├── styles/             # Global styles
└── public/             # Static assets
```

### Contributing

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git commit -m "Description of changes"
   ```

3. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support or inquiries, please contact [support@mapleads.com](mailto:support@mapleads.com) 