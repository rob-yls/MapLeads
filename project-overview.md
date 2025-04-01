Project Name: MapLeads
Project Overview: Business Search and Data Scraping Web App with AI Chat

Introduction
I’m developing a web application designed to streamline the process of gathering business or occupation-related data from Google Maps and enabling users to interact with that data in meaningful ways. The app targets users who need to collect contact information and descriptions for specific business types (e.g., "plumbers," "restaurants") in a given location (e.g., "Austin, TX"). Beyond simple data collection, the app will offer an AI-powered chat interface to allow users to explore and analyze their results conversationally. The goal is to create a user-friendly tool that combines web scraping, data storage, and AI interaction, all within a modern, responsive interface.

Purpose and Value
The primary purpose of this app is to automate the tedious task of searching for and compiling business data from Google Maps. Users—such as marketers, researchers, or small business owners—can submit a business type and location, and the app will scrape relevant details (names, contact info, descriptions) and store them in a database. The app then presents the data in an accessible table format, offers a .csv export option, and provides an AI chat interface (powered by a model like Claude 3.5 Sonnet) for deeper interaction with the data. This combination of scraping and AI functionality sets the app apart, offering both practical data collection and intelligent insights.

Tech Stack

Frontend:
React (using v0 for rapid UI prototyping and generation)
Tailwind CSS (for styling)
Shadcn (for pre-built UI components like buttons, tables, and forms)

Backend:
Cursor (you, Cursor AI, will help me build and optimize the backend logic)
Supabase (for database storage and user authentication)

External Integrations:
Google Maps API (to search for businesses and scrape data)
AI Model API (e.g., Anthropic’s Claude 3.5 Sonnet for the chat interface)

Core Functionality

User Authentication:
Users log in using Supabase Auth to access the app.
A logout option is available to end sessions securely.

Search Input and Processing:
Users input a business/occupation type (e.g., "coffee shops") and a location (e.g., "Seattle, WA") via a form.
The backend queries the Google Maps API, scrapes names, contact information (phone, email, website), and descriptions, and stores the results in Supabase.

Data Presentation:
Results are displayed in a table with columns for name, contact info, and description.
Users can export the table as a .csv file with a dedicated button.

Search History:
A sidebar lists the user’s previous searches, allowing them to revisit past results by clicking an entry.

AI Chat Interface:
A toggleable chat panel (shown/hidden via a button) connects to an AI model (e.g., Claude 3.5 Sonnet).
The AI has access to the current search results and can answer questions, summarize data, or assist with analysis (e.g., “Which businesses have emails?” or “Summarize the descriptions”).

Detailed Workflow

User Logs In:
Authentication is handled via Supabase, ensuring only authorized users access the app.

Main Interface:
The UI features a sidebar with past searches and a main area with a form (business type + location) and a "Submit" button.

Search Execution:
On submission, the backend uses the Google Maps API to fetch results based on the query.
Data is scraped (name, contact info, description) and saved to Supabase, tagged with the user’s ID and search details.

Results Display:
A confirmation message (e.g., “Search completed”) appears.
A table shows the scraped data, with a “Download as CSV” button for export.

Chat Interaction:
A “Show/Hide Chat” button reveals a chat panel.
The AI, connected via its API, uses the current search data as context to respond to user queries.

Session Management:
Users can revisit past searches via the sidebar or log out when done.

Database Structure (Supabase)
Users Table: Stores user authentication data (handled by Supabase Auth).
Searches Table: Stores search metadata (e.g., user ID, business type, location, timestamp).
Results Table: Stores scraped data (e.g., search ID, business name, contact info, description).

Key Challenges and Considerations

Google Maps API:
Requires secure API key management and handling of rate limits.
Scraping must extract consistent fields (name, contact, description) despite variable Google Maps data.

AI Chat Integration:
The chat interface needs real-time access to the current search results as context.
API calls to the AI model (e.g., Claude) must be efficient and secure.

Performance:
Searches and scraping should be fast and scalable for multiple users.
Data storage in Supabase should be optimized for quick retrieval (e.g., for sidebar history).

UI Responsiveness:
The frontend (built with React, Tailwind, Shadcn) must handle dynamic updates (e.g., table data, chat toggling) smoothly.

User Journey Example:
User logs in and sees an empty sidebar (no past searches yet) and a form.
They enter “dentists” and “Portland, OR,” then click "Submit."
The backend scrapes Google Maps, saves 20 dentist listings to Supabase, and displays them in a table.
User downloads the data as a .csv and clicks “Show Chat.”
In the chat, they ask, “Which dentists have websites?” The AI responds with a list based on the data.
Later, they log out, and upon returning, they see “dentists in Portland, OR” in the sidebar for quick access.