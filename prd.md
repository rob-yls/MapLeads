Product Requirements Document (PRD)
Project: MapLeads

1. Overview

1.1 Product Name
MapLeads

1.2 Purpose
MapLeads is a web application designed to streamline the process of collecting and interacting with business or occupation data from Google Maps. Users can input a business type (e.g., “plumbers”) and location (e.g., “Austin, TX”), and the app will scrape detailed data—business names, contact information, addresses, ratings, and descriptions—store it in a database, and present it in a highly filterable table format. An AI-powered chat interface allows users to analyze and explore their data conversationally. The app aims to save time, provide actionable insights, and serve professionals like marketers, researchers, or small business owners seeking localized business information.

1.3 Target Audience
Marketers looking for lead generation.
Researchers studying local industries or occupations.
Small business owners or individuals needing detailed contact lists or competitive analysis.

1.4 Key Value Proposition
Automates detailed business data collection from Google Maps.
Organizes results into a customizable, filterable, and downloadable table with search history.
Offers an AI chat interface for interactive data exploration.

2. Features and Functionality

2.1 User Authentication
Description: Users must log in to access MapLeads and their data.
Requirements:
Login via email/password or OAuth (e.g., Google) using Supabase Auth.
Logout button available in the UI.
User Story: As a user, I want to securely log in and out so my data is protected and accessible only to me.

2.2 Search Input and Processing
Description: Users submit a business/occupation type and location to initiate a Google Maps search.
Requirements:
Form with two fields:
Business/Occupation Type (text input, e.g., “dentists”).
Location (text input, formatted as “city, state,” e.g., “Portland, OR”).
“Submit” button triggers the search.
Backend queries Google Maps API, scrapes data (name, address [street, city], rating, contact info [phone, email, website], description), and stores it in Supabase.
User Story: As a user, I want to enter a business type and location so the app can find and collect detailed data for me.

2.3 Results Display
Description: After a search, users see a table of results with extensive filtering and export options, where filters affect the exported data.
Requirements:
Confirmation message (e.g., “Search completed successfully”).
Table displaying columns: Business Name, Street, City, Rating, Phone, Email, Website, Description.
Filters:
Filter controls above or beside the table, including:
Name (text input): Filter by keyword in the business name (e.g., “Joe’s”).
Street (text input): Filter by keyword in the street address (e.g., “Main St”).
City (text input): Filter by city name (e.g., “Austin”).
Rating (range input): Filter by precise star rating range (e.g., “4.2–4.8”), with a slider or dual numeric inputs allowing 0.1 increments from 0 to 5.
Has Phone Number (checkbox): Show only businesses with a phone number.
Has Email (checkbox): Show only businesses with an email.
Has Website (checkbox): Show only businesses with a website.
Description (text input): Filter by keyword in the description (e.g., “family-owned”).
Filters dynamically update the table in real-time as they are applied.
“Clear Filters” button resets the table to show all results for the current search.
“Download as CSV” button exports the currently filtered table data; if no filters are applied, it exports all results.
User Story: As a user, I want to filter my search results by name, address, precise rating ranges, or the presence of contact info, and export only the filtered data as a .csv file, or export all data by clearing filters.

2.4 Search History
Description: A sidebar shows past searches for quick access.
Requirements:
Sidebar lists previous searches (e.g., “coffee shops in Seattle, WA”) tied to the user’s account.
Clicking a past search reloads its results in the main table, with filters reset.
User Story: As a user, I want to revisit my previous searches without re-entering the details.

2.5 AI Chat Interface
Description: A toggleable chat panel allows users to interact with their data using AI.
Requirements:
“Show/Hide Chat” button to toggle the chat panel visibility.
Chat powered by an AI model (e.g., Claude 3.5 Sonnet via Anthropic API).
AI has access to the current (filtered or unfiltered) search results as context.
Examples of queries: “Which businesses in the 4.5–5 range have websites?” or “Summarize filtered results.”
User Story: As a user, I want to ask questions about my data—including filtered results—and get smart answers from an AI assistant.

3. Technical Requirements

3.1 Tech Stack
Frontend:
React (via v0 for UI generation).
Tailwind CSS (styling).
Shadcn (UI components: buttons, tables, forms, chat UI, filters).
Backend:
Cursor (AI-assisted backend development).
Supabase (database and authentication).
External Integrations:
Google Maps API (search and scraping).
Anthropic API (Claude 3.5 Sonnet for AI chat).

3.2 Database Schema (Supabase)
Users Table:
Fields: id, email, created_at (managed by Supabase Auth).
Searches Table:
Fields: id, user_id, business_type, location, timestamp.
Results Table:
Fields: id, search_id, business_name, address (JSON: street, city), rating (float), contact_info (JSON: phone, email, website), description.

3.3 API Integrations
Google Maps API:
Endpoint: Places API for searching businesses by type and location.
Data to scrape: name, address (street, city), rating (star rating), phone, email, website, description.
Secure API key storage and rate limit handling.
Anthropic API (Claude 3.5 Sonnet):
Real-time connection for chat functionality.
Pass current (filtered or unfiltered) search results as context for AI responses.

3.4 Performance and Scalability
Optimize backend for quick search and scraping (e.g., caching frequent queries).
Table filtering and .csv export implemented client-side for responsiveness, using pre-fetched data from Supabase.
Ensure .csv generation reflects the current filtered state efficiently.
Supabase queries scale with multiple users and large datasets.
Handle Google Maps API rate limits gracefully (e.g., queueing or user notifications).

3.5 Security
Secure user authentication with Supabase Auth.
Encrypt sensitive data (e.g., API keys) in environment variables.
Validate and sanitize user inputs (including filter text and rating ranges) to prevent injection attacks.

4. User Interface (UI) Design

4.1 Layout
Sidebar: Left panel with scrollable list of past searches.
Main Area:
Top: Form with Business Type and Location fields, “Submit” button.
Middle:
Filter controls (text inputs for name/street/city/description, range slider or dual inputs for rating, checkboxes for phone/email/website, “Clear Filters” button).
Results table (post-search), “Download as CSV” button, “Show/Hide Chat” button.
Bottom (optional): Chat panel (when toggled on).

4.2 Components (Shadcn)
Form inputs for search fields.
Table for displaying results with sortable/filterable columns.
Filter UI:
Text inputs (name, street, city, description).
Rating filter: Range slider or dual numeric inputs (e.g., min: 4.2, max: 4.8) with 0.1 increments from 0–5.
Checkboxes (phone, email, website).
“Clear Filters” button.
Buttons for submission, CSV export, and chat toggle.
Chat UI with message input and response display.

4.3 Styling (Tailwind)
Clean, modern design with responsive layouts.
Consistent color scheme (e.g., neutral tones with accent colors for buttons and active filters).
Mobile-friendly adjustments (e.g., sidebar collapses, filters stack vertically on small screens).

5. Success Criteria

5.1 Functional Goals
Users can log in, submit a search, apply precise rating filters (e.g., 4.2–4.8), and export filtered data within 1 minute.
Past searches load instantly from the sidebar.
Filters update the table in under 1 second.
AI chat responds to data-related queries (filtered or unfiltered) in under 5 seconds.

5.2 User Satisfaction
90% of beta testers report the app (including filters) is easy to use.
80% of users utilize the AI chat or filters at least once per session.

5.3 Technical Metrics
Backend handles 100 concurrent searches without errors.
Google Maps API integration stays within rate limits and budget.
Supabase database supports up to 10,000 search results per user with efficient filtering.

6. Assumptions and Constraints

6.1 Assumptions
Users have stable internet access for API calls.
Google Maps provides consistent data (e.g., ratings, addresses) for scraping and filtering.
Anthropic API (or similar) supports real-time chat with reasonable latency.

6.2 Constraints
Limited by Google Maps API rate limits and costs.
AI chat functionality depends on third-party API availability and pricing.
Initial version focuses on U.S.-based searches (city, state format).

7. Milestones and Deliverables

7.1 Phase 1: Core Functionality (MVP)
User authentication with Supabase.
Search form and Google Maps integration with expanded data (address, rating).
Results table with .csv export (reflecting filters) and basic filters (e.g., “Has Website,” “Has Phone”).
Sidebar for search history.

7.2 Phase 2: Enhanced Features
Full filter implementation (name, street, city, precise rating range, phone, email, website, description).
AI chat integration with “Show/Hide Chat” button and Anthropic API.

7.3 Phase 3: Polish and Scale
UI refinements (Tailwind, Shadcn) for filters and chat.
Performance optimizations and error handling.
Beta testing and feedback iteration.