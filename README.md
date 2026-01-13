### Voyage.IQ – Smart Travel Itinerary Planner

Voyage.IQ is a smart travel planning web application designed to help users create, manage, and optimize travel itineraries with real attractions, maps, weather updates, budget tracking, and collaboration features.

---

### Features

- **User Registration & Login** – Secure access to personal travel plans  
- **Trip Management** – Create, view, edit, and delete trips easily  
- **Auto Itinerary Generation** – Automatically build a schedule based on your destination  
- **Real Tourist Attractions Fetching** – Pulls real-time data for local points of interest  
- **Map & Location Display** – Visualizes your trip with interactive maps  
- **Distance & Travel Time Estimation** – Helps you plan your daily travel logistically  
- **Live Weather Forecast** – Real-time weather updates for your destination  
- **Budget Tracking & Charts** – Monitor expenses with visual data  
- **Packing Checklist** – Stay organized with a built-in trip checklist  
- **Currency Conversion** – Easily calculate costs in different currencies  
- **Trip Media & Notes** – Upload trip photos and keep personal notes  
- **Sharing & Permissions** – Share your itinerary with specific access levels  
- **Real-time Notifications** – Live updates for trip changes and time alerts  
- **Collaboration & Messaging** – Work together with fellow travelers in real-time  

---

### Tech Stack

- **Frontend** – Angular  
- **Backend** – Node.js (TypeScript), Express  
- **Database** – MySQL  
- **Real-time** – Socket.IO  
- **Maps & Places** – Mapbox, Geoapify  
- **Weather** – Open-Meteo  
- **Translation** – MyMemory API  

---

### Third-Party APIs Used

- **Geoapify API** – Used to fetch real tourist attractions and powers auto-itinerary generation  
- **Mapbox API** – Powers maps, geocoding, and converting coordinates to place names  
- **Open-Meteo API** – Provides live weather and forecasts (Public API)  
- **MyMemory API** – Handles the translation features (Public API)  
- **Socket.IO** – Manages real-time updates, notifications, and collaboration  

---

### API Keys & Tokens

- **Geoapify API Key** – Hardcoded for development  
- **Mapbox Access Token** – Hardcoded for development  
- **Public APIs** – Other services do not require keys for basic usage  

**Note:** For production use, ensure all API keys are moved to environment variables.

---

### Project Structure

frontend/   → Angular application  
backend/    → Node.js + Express API  
uploads/    → User-uploaded images  
How to Run the Project
Backend
Navigate to the backend folder: cd backend

Install dependencies: npm install

Run the development server: npm run dev

Frontend
Navigate to the frontend folder: cd frontend

Install dependencies: npm install

Start the Angular application: ng serve
---
## Note
This project is built for academic and learning purposes using free and public APIs.
---
### Developed By
Team Project – Voyage.IQ

