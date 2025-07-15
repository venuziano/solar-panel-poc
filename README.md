# Solar Panel POC Backend

the backend provides the core API and business logic for managing solar panel installations, user authentication, and permission controls for a solar panel proof-of-concept (POC) system.

## Project Goals

- **Manage solar panel installations**: Create, view, and track the status of solar panel installations.
- **Role-based access control (RBAC)**: Enforce permissions for different user roles (admin, technician).
- **Cost Savings Calculation**: Estimate annual cost savings for each solar panel installation using a specific calculation + open weather API details.
- **Authentication**: Secure endpoints using JWT-based authentication.

---

## Features

### 1. Authentication & User Roles

- **JWT Authentication**: Users log in with a username and password to receive a JWT token.
- **User Roles**:
  - **Admin**: Can create new installations and view all installations.
  - **Technician**: Can only view installations (typically those that are pending or assigned).

User roles are defined in `backend/helpers/rbac.js` and seeded in `backend/seeds/users.js`.

### 2. Permission Controls (RBAC)

- **Permissions** are mapped to roles:
  - `admin`: `create_installation`, `view_installations`
  - `technician`: `view_installations`
- **Enforcement**: Each protected route uses middleware to check the user's role and permissions before allowing access.
- **Example**: Only admins can create new installations; both admins and technicians can view installations.

### 3. Installations Management

- **Endpoints**:
  - `POST /api/installations`: Create a new installation (admin only).
  - `GET /api/installations`: List installations, with optional status filtering and pagination (admin and technician).
- **Statuses**: Installations can be `scheduled`, `completed`, or `cancelled`.

### 4. Energy Cost Calculation

- **Business Rule**: The estimated annual cost savings for a solar installation is calculated as:
  
  ```
  estimated_savings = panel_capacity_kW × average_sun_hours_per_day × 365 × efficiency × electricity_rate
  ```
  - `panel_capacity_kW`: The installed solar panel capacity in kilowatts.
  - `average_sun_hours_per_day`: Derived from weather data (sunrise/sunset) for the installation address.
  - `efficiency`: The system's efficiency (0–1).
  - `electricity_rate`: The local electricity rate per kWh.

- **Weather Integration**: The backend fetches weather data (including sunrise/sunset) from the OpenWeatherMap API to determine sun hours for each installation's location.

### 5. Additional Details

- **Validation**: All input data is validated using `express-validator`.
- **Error Handling**: Centralized error handler middleware.
- **Health Check**: `GET /health` endpoint for service monitoring.
- **Seed Data**: Users and installations are seeded for demo/testing purposes.

---

## Tech Stack

- **Node.js** with **Express**
- **JWT** for authentication
- **OpenWeatherMap API** for weather data
- **express-validator** for input validation
- **Jest** for testing


# Solar Panel POC Frontend

It provides a modern, responsive web interface for managing solar panel installations, with role-based access and real-time feedback.

## Features

- **Role-based UI**: Admins can schedule new installations; technicians can view and filter installations by status.
- **Authentication**: Secure login with JWT; session management and automatic logout on token expiry.
- **Installation Scheduler**: Admins can create new installation appointments with validation for date, location, panel specs, and rates.
- **Installations List**: Paginated, filterable table of all installations, with real-time updates and notifications for changes in estimated cost savings.
- **Responsive Design**: Built with React Bootstrap for a clean, mobile-friendly experience.
- **Notifications**: Toasts for session expiry, errors, and real-time updates.

## Main Components

- **Login**: User authentication and session management.
- **Scheduler**: (Admin only) Form to schedule new installations, with validation and feedback.
- **InstallationList**: Table view of installations, with status filter, pagination, and weather/cost info.
- **ToastContainer**: Reusable notification system for user feedback.

## Architecture & Tech Stack

- **React 18** with functional components and hooks
- **React Router v7** for navigation
- **React Bootstrap** for UI
- **@tanstack/react-query** for data fetching, caching, and polling
- **Axios** for API requests
- **JWT-based role detection** via a custom `useAuth` hook
- **Country-state-city** for US state selection in scheduling

## User Experience

- **Admins**: After login, can schedule new installations and view all appointments.
- **Technicians**: After login, can view and filter installations, but cannot schedule new ones.
- **Session Expiry**: Users are automatically logged out and notified if their session expires.
- **Real-time Updates**: Installation list auto-refreshes every 10 seconds; users are notified of changes in estimated costsavings.