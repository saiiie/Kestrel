# Technical Debt & Development Mocking

This file tracks hardcoded logic and temporary workarounds that must be removed or refactored before moving to production.

## Current Items

### 1. Hardcoded User ID (Frontend)
- **Location**: `frontend/src/pages/Dashboard.jsx`, `frontend/src/pages/Settings.jsx`
- **Logic**: `const userId = 1;`
- **Reason**: We haven't implemented the Login/Auth system yet. The Settings screen endpoints are built to expect a dynamic user ID, but the frontend currently mocks it.
- **Action Required**: Replace with the ID of the currently authenticated user (from JWT or Context) once the Auth module is built.

### 2. Automatic User Seeding (Backend)
- **Location**: `sentinel/src/main/java/com/kestrel/sentinel/config/DataInitializer.java`
- **Logic**: Automatically creates a user with email `dev@kestrel.ai` if the database is empty.
- **Reason**: To prevent Foreign Key violations when saving alerts for the hardcoded User ID 1.
- **Action Required**: Delete this file once the Account Creation / Registration flow is implemented.

---
*Created on 2026-04-25*
