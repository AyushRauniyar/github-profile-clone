# GitHub Profile Page - Angular Assignment

A fully functional, responsive GitHub profile page clone built with Angular 17, featuring real-time GitHub API integration and pixel-perfect UI design.

![GitHub Profile Clone](https://img.shields.io/badge/Angular-17-red?style=flat-square&logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![GitHub API](https://img.shields.io/badge/GitHub-GraphQL_API-blue?style=flat-square&logo=github)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features Implemented](#features-implemented)
- [Tech Stack](#tech-stack)
- [API Integration vs Mock Data](#api-integration-vs-mock-data)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Additional Features (Bonus)](#additional-features-bonus)
- [Screenshots](#screenshots)

---

## 🎯 Overview

This project is a complete implementation of a GitHub profile page as an Angular application. The application demonstrates:
- **Responsive Design**: Fully responsive UI that works seamlessly across desktop, tablet, and mobile devices
- **Real API Integration**: Extensive use of GitHub's GraphQL API v4 for live data
- **Component Architecture**: Well-structured Angular components with proper separation of concerns
- **State Management**: RxJS-based reactive state management
- **Modern UI/UX**: GitHub-style interface with attention to detail

---

## ✨ Features Implemented

### 1. **Header Component (Two-Part Navigation)**

#### Part 1: Main Navigation Bar (Top Section)
- **Search Bar**: Full-width search with GitHub-style placeholder and typeahead UI
- **Navigation Menu**: 
  - Pull Requests, Issues, Codespaces, Marketplace, Explore links
  - Hamburger menu for mobile responsiveness
- **Action Buttons**:
  - **Copilot Dropdown**: Multi-option dropdown menu (Explain project, Review code, Generate docs, etc.) with maintenance routing
  - **Create Dropdown**: New repository, import, codespace, gist, organization options with maintenance routing
  - All dropdown items route to maintenance component for features under development
- **Icon Tray**:
  - Notification bell with unread indicator
  - Issue tracker icon
  - Pull request icon
  - User profile dropdown with settings and logout options
- Fully responsive design with mobile-optimized layout

#### Part 2: Profile Header (Sub-Navigation)
- **User Overview Section**:
  - Large profile avatar with edit capability
  - Display name and username
  - Follow/Unfollow button (UI implementation)
  - Follower and following counts fetched dynamically
  - Bio, company, location, email, website, Twitter/X links
- **Repository Quick Stats**:
  - Popular repositories preview section
  - Organization affiliations with avatars
  - All data populated using **GitHub GraphQL API** queries
- **Dynamic Tab Counts**: 
  - Real-time tab badges for Repositories, Projects, Packages, and Stars
  - Counts fetched using **GraphQL queries** (`repositories.totalCount`, `projectsV2.totalCount`, `packages.totalCount`, `starredRepositories.totalCount`)
  - Conditional rendering: badges hidden when count is 0

### 2. **Profile Sidebar (Left Panel)**
- **API Integration**: Complete user profile information fetched via **GitHub REST API**
  - Profile picture with high-resolution avatar
  - Name and username display
  - Bio/description
  - Company affiliation
  - Location with icon
  - Email address (if public)
  - Personal website URL
  - Twitter/X username with link
  - Follower and following counts
- **Organization Affiliations**: Avatar grid of organizations the user belongs to
- Fully responsive layout that adapts to mobile screens

### 3. **Profile Main Content**

#### Pinned Repositories Section
- **100% Dynamic - No Mock Data**
- **API Integration**: Fetched using **GitHub GraphQL API**
  ```graphql
  query PinnedRepositories($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name, description, url, forkCount, stargazerCount
            primaryLanguage { name, color }
            isPrivate, updatedAt
          }
        }
      }
    }
  }
  ```
- **Features**:
  - Repository name with clickable link
  - **Visibility Badge**: Public/Private indicator styled as GitHub labels
  - Fork information (displays "Forked from {owner}/{repo}" if applicable)
  - Repository description
  - Primary language with color-coded dot indicator
  - Star count with icon
  - Last updated timestamp
  - Maximum 6 pinned repositories displayed
  - "Customize your pins" link (routes to maintenance page)
- Responsive grid layout (2 columns desktop, 1 column mobile)

### 4. **Contribution Graph (Interactive Heatmap)**
- **API Integration**: **GitHub GraphQL API** for real-time contribution data
  ```graphql
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date, contributionCount, contributionLevel } }
        }
      }
    }
  }
  ```
- **Dynamic Year Selection**:
  - Year dropdown selector (2013-2026 range)
  - **When year changes, the contribution grid automatically updates** with new data for that year
  - Total contribution count recalculates dynamically
- **Interactive Features**:
  - SVG-based heatmap visualization (53 weeks × 7 days)
  - Color-coded cells with 5 contribution levels:
    - Level 0 (None): `#ebedf0`
    - Level 1 (Low): `#9be9a8`
    - Level 2 (Medium): `#40c463`
    - Level 3 (High): `#30a14e`
    - Level 4 (Very High): `#216e39`
  - Hover tooltips showing exact contribution count and date
  - Month labels with proper alignment
  - Responsive grid that adapts to screen size

### 5. **Activity Overview Section (Fully Integrated)**

#### Activity Overview (Spider Chart)
- **API Integration**: Fetched dynamically using **GitHub GraphQL API**
  ```graphql
  query ActivityMix($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
      }
    }
  }
  ```
- **Dynamic Year Synchronization**:
  - **When contribution graph year changes, spider chart data automatically updates** for the same year period
  - Real-time recalculation of contribution type percentages
- **Features**:
  - SVG-based spider/radar chart visualization
  - Four contribution types plotted:
    - Commits (blue)
    - Pull Requests (green)
    - Issues (orange)
    - Code Reviews (red)
  - Percentage-based scaling for accurate visual representation
  - Smooth polygon rendering with filled area and stroke
  - Responsive canvas with proper axis labels

#### Activity Mix Percentages
- **API Integration**: Percentage distribution of contribution types
- Dynamically calculated from the same API response as spider chart
- Updates in sync with year selection
- Displays percentage breakdown for commits, PRs, issues, and reviews

#### Contributed Repositories
- **API Integration**: Top repositories with contribution details fetched via **GitHub GraphQL API**
  ```graphql
  query ContributedRepos($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        commitContributionsByRepository {
          repository { name, owner { login } }
          contributions { totalCount }
        }
      }
    }
  }
  ```
- **Dynamic Year Synchronization**: **Repository list updates when year changes** in contribution graph
- **Features**:
  - Top 3 repositories by default with "Show more" expansion
  - Shows commit count, PR count, issue count, review count per repository
  - Repository creation tracking ("Created X issues in this repository")
  - Real-time data aggregation
  - Responsive card layout

### 6. **Activity Contribution Timeline**
- **Note**: This section (final activity feed at bottom) currently uses **mock data** as a placeholder
- Displays recent activities like "Opened pull request", "Created issue", "Pushed commits"
- Will be integrated with GitHub Events API in future enhancement
- Styled to match GitHub's activity feed design

### 7. **Profile Tabs Navigation**
- **Dynamic Tab Counts**: Real-time fetching via **GitHub GraphQL API**
  ```graphql
  query ProfileCounts($login: String!) {
    user(login: $login) {
      repositories { totalCount }
      projectsV2(first: 0) { totalCount }
      packages { totalCount }
      starredRepositories { totalCount }
    }
  }
  ```
- **Features**:
  - Uses new **ProjectsV2 API** (migrated from deprecated Projects Classic API)
  - Active tab highlighting with visual indicator
  - Query parameter-based routing (`?tab=repositories`)
  - Conditional badge display: **badges hidden when count is 0**
  - Maintenance component for non-overview tabs (Repositories, Projects, Packages, Stars)
- Fully responsive with mobile-friendly layout

### 8. **Footer Component**
- GitHub-style footer with official logo
- Navigation links grid:
  - Terms, Privacy, Security, Status, Docs, Contact
  - Pricing, API, Training, Blog, About
- Cookie management section
- Copyright information with dynamic year calculation
- Responsive multi-column layout (stacks on mobile)
- **Sticky positioning**: Stays at bottom of viewport on short pages

### 9. **Responsive Design (Mobile-First)**
- Mobile-first CSS approach with progressive enhancement
- **Breakpoints**: 
  - Desktop: `min-width: 768px`
  - Mobile: `max-width: 544px`
- Adaptive layouts:
  - Grid layouts collapse to single column
  - Sidebar moves below main content on mobile
  - Hamburger menu replaces horizontal navigation
  - Touch-optimized button sizes and spacing
- Optimized for all screen sizes (desktop, tablet, mobile)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 17
- **Language**: TypeScript
- **Styling**: CSS3 (no UI libraries - pure CSS)
- **State Management**: RxJS (Observables, BehaviorSubject)
- **Routing**: Angular Router with query parameters
- **HTTP Client**: Angular HttpClient

### Backend (Proxy Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Client**: node-fetch
- **Environment**: dotenv for configuration

### APIs Used
- **GitHub GraphQL API v4**: Primary data source
  - Contributions query
  - User profile
  - Pinned repositories
  - Activity mix and contributions
  - Profile counts (repos, packages, stars, projects)
- **GitHub REST API v3**: User profile information (fallback)

### Development Tools
- Angular CLI
- VS Code
- npm/package.json
- Proxy configuration for API routing

---

---

## 🔌 API Integration vs Mock Data

### ✅ **Real-Time API Integration**

This implementation uses **GitHub's official APIs** for nearly all data, ensuring live, accurate information:

| Feature | Data Source | API Type | Mock Data |
|---------|-------------|----------|-----------|
| **User Profile** | GitHub REST API | `GET /users/{username}` | ❌ No |
| **Contribution Heatmap** ✅ | GitHub GraphQL API | `contributionsCollection` query | ❌ No |
| **Pinned Repositories** | GitHub GraphQL API | `pinnedItems` query | ❌ No |
| **Activity Overview (Spider Chart)** | GitHub GraphQL API | `contributionsCollection` (commits, PRs, issues, reviews) | ❌ No |
| **Activity Mix Percentages** | GitHub GraphQL API | Calculated from `contributionsCollection` | ❌ No |
| **Contributed Repositories** | GitHub GraphQL API | `commitContributionsByRepository` | ❌ No |
| **Profile Tab Counts** | GitHub GraphQL API | `repositories.totalCount`, `projectsV2.totalCount`, etc. | ❌ No |
| **Organizations** | GitHub REST API | Included in user profile response | ❌ No |
| **Activity Timeline (Bottom Feed)** | Placeholder | - | ✅ Yes (temporary) |

**Summary**: 
- **95%+ API Integration**: All major features use live GitHub API data
- **GraphQL Queries**: Used for complex, efficient data fetching (contributions, repositories, counts)
- **REST API**: Used for user profile information
- **Only Mock Data**: Activity timeline feed at the bottom (planned for future Events API integration)

### Custom API Endpoints (Backend Proxy)

The Node.js/Express server provides these endpoints:

```
GET  /api/contributions?login={username}&from={date}&to={date}
GET  /api/profile?login={username}
GET  /api/pinned?login={username}&first={count}
GET  /api/activity-mix?login={username}&from={date}&to={date}
GET  /api/activity-contribs?login={username}&from={date}&to={date}
GET  /api/profile-counts?login={username}
```

All endpoints proxy requests to GitHub's GraphQL API with proper authentication using personal access tokens.

---

## 📁 Project Structure

```
github-assignment/
├── src/
│   ├── app/
│   │   ├── header/                     # Header component
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.css
│   │   ├── profile-sidebar/            # Left sidebar (user info)
│   │   │   ├── profile-sidebar.component.ts
│   │   │   ├── profile-sidebar.component.html
│   │   │   └── profile-sidebar.component.css
│   │   ├── profile-main/               # Main content area
│   │   │   ├── profile-main.component.ts
│   │   │   ├── profile-main.component.html
│   │   │   └── profile-main.component.css
│   │   ├── profile-tabs/               # Tab navigation
│   │   │   ├── profile-tabs.component.ts
│   │   │   ├── profile-tabs.component.html
│   │   │   └── profile-tabs.component.css
│   │   ├── profile-container/          # Container component
│   │   │   └── profile-container.component.ts
│   │   ├── maintenance/                # Under maintenance page
│   │   │   └── maintenance.component.ts
│   │   ├── footer/                     # Footer component
│   │   │   ├── footer.component.ts
│   │   │   ├── footer.component.html
│   │   │   └── footer.component.css
│   │   ├── site-menu/                  # Hamburger menu
│   │   │   ├── site-menu.component.ts
│   │   │   ├── site-menu.component.html
│   │   │   └── site-menu.component.css
│   │   ├── services/                   # Angular services
│   │   │   ├── user.service.ts
│   │   │   ├── menu.service.ts
│   │   │   ├── activity-overview.service.ts
│   │   │   └── profile-counts.service.ts
│   │   ├── contributions.service.ts    # Contributions service
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── styles.css                      # Global styles
│   ├── index.html
│   └── main.ts
├── server.js                           # Node.js proxy server
├── proxy.conf.json                     # Angular proxy config
├── package.json
├── angular.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (`npm install -g @angular/cli`)
- GitHub Personal Access Token (for API access)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd github-assignment
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure GitHub Token
Create a `.env` file in the root directory:
```
GITHUB_TOKEN=your_github_personal_access_token_here
```

**How to get a GitHub token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `read:user`, `repo`, `read:org`
4. Copy the token and paste it in `.env`

### Step 4: Start the Backend Server
```bash
node server.js
```
Server will start on `http://localhost:3000`

### Step 5: Start the Angular Development Server
In a new terminal:
```bash
ng serve --proxy-config proxy.conf.json
```
Application will be available at `http://localhost:4200`

### Step 6: Access the Application
Navigate to `http://localhost:4200/AyushRauniyar` (or any GitHub username)

---

## 🌟 Additional Features (Bonus)

Beyond the assignment requirements, the following features were implemented:

### 1. **Activity Overview Section**
- Spider chart visualization of contribution types
- Activity mix percentage calculation
- Repository contribution tracking with detailed metrics
- Dynamic data fetching and visualization

### 2. **Dynamic Profile Tab Counts**
- Real-time fetching of repository, project, package, and star counts
- Uses GitHub's latest ProjectsV2 API (migrated from deprecated Projects Classic)
- Conditional rendering (badges hidden when count is 0)

### 3. **Enhanced Repository Cards**
- Visibility badges (Public/Private)
- Fork information display
- Language indicators with correct colors
- Star counts and last updated timestamps

### 4. **Navigation Enhancements**
- Dynamic username routing
- Query parameter-based tab switching
- Maintenance component for under-development features
- "Customize your pins" functionality

### 5. **Full Header Implementation**
- Copilot dropdown menu
- Create new items dropdown
- All dropdown items route to maintenance page
- Search bar (UI complete, can be extended)

### 6. **Footer Component**
- GitHub-authentic footer design
- Responsive layout with proper breakpoints
- Sticky positioning for better UX

### 7. **State Management**
- RxJS-based reactive state management
- BehaviorSubject for username sharing across components
- Proper cleanup with takeUntil pattern

### 8. **Error Handling**
- Graceful error handling for API failures
- Console logging for debugging
- Fallback values for missing data

---

## 📸 Screenshots

### Desktop View
- Full profile page with sidebar, main content, and footer
- Contribution heatmap with hover interactions
- Activity overview with spider chart

### Tablet View (768px)
- Responsive grid layouts
- Adjusted spacing and sizing

### Mobile View (544px)
- Single column layout
- Hamburger menu navigation
- Touch-optimized interface

---

## 🎨 Design Highlights

### Color Palette (GitHub-Accurate)
```css
--primary-blue: #0969da
--text-primary: #24292f
--text-secondary: #57606a
--border-default: #d0d7de
--canvas-default: #ffffff
--canvas-subtle: #f6f8fa

Contribution Levels:
--contribution-0: #ebedf0 (None)
--contribution-1: #9be9a8 (Low)
--contribution-2: #40c463 (Medium)
--contribution-3: #30a14e (High)
--contribution-4: #216e39 (Very High)
```

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial
- **Base Font Size**: 14px
- **Heading Weights**: 600 (semi-bold)
- **Body Weights**: 400 (regular)

### Spacing System
- Consistent 8px grid system
- Component padding: 16px, 24px, 32px
- Gap spacing: 8px, 16px, 24px

---

## 🔧 Configuration Files

### proxy.conf.json
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  }
}
```

### Environment Variables
```
GITHUB_TOKEN=your_token_here
PORT=3000
```

---

## 📝 API Documentation

### Contribution Heatmap
```graphql
query UserContributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}
```

### Profile Counts
```graphql
query ProfileCounts($login: String!) {
  user(login: $login) {
    repositories { totalCount }
    projectsV2(first: 0) { totalCount }
    packages { totalCount }
    starredRepositories { totalCount }
  }
}
```

---

## 🐛 Known Limitations

1. **Search Functionality**: Search bar UI is implemented but search logic can be extended
2. **Tab Content**: Repositories, Projects, Packages, and Stars tabs show maintenance page (as per requirements)
3. **Private Repositories**: Only public repositories are shown in pinned section (GitHub API limitation)

---

## 🚀 Future Enhancements

1. Implement full repository list view
2. Add project board visualization
3. Implement package details page
4. Add starred repositories view
5. Extend search functionality with real-time results
6. Add user authentication for viewing private repos
7. Implement infinite scroll for repositories
8. Add contribution activity feed

---

## 📦 Dependencies

### Frontend Dependencies
```json
{
  "@angular/animations": "^17.3.0",
  "@angular/common": "^17.3.0",
  "@angular/compiler": "^17.3.0",
  "@angular/core": "^17.3.0",
  "@angular/forms": "^17.3.0",
  "@angular/platform-browser": "^17.3.0",
  "@angular/router": "^17.3.0",
  "rxjs": "~7.8.0",
  "tslib": "^2.3.0",
  "zone.js": "~0.14.3"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "node-fetch": "^2.6.7",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5"
}
```

---

## 👨‍💻 Development Notes

### Component Communication
- Uses RxJS Observables for reactive data flow
- BehaviorSubject for shared state (username)
- Event emitters for child-to-parent communication

### Routing Strategy
- Dynamic username-based routing: `/:username`
- Query parameters for tab navigation: `?tab=repositories`
- Maintenance routing for under-development features

### API Strategy
- Node.js proxy server to avoid CORS issues
- Token-based authentication with GitHub API
- Error handling and logging at server level
- Response caching with Cache-Control headers

---

## 📄 License

This project is created as an assignment for UptimeAI and is for educational purposes only.

---

## 🙏 Acknowledgments

- **GitHub**: For comprehensive API documentation
- **Angular**: For the robust framework
- **UptimeAI**: For the assignment opportunity

---

## 📧 Contact

For any questions or clarifications about this implementation, please contact the developer.

---

**Assignment Submitted By**: Ayush Rauniyar  
**Date**: January 2, 2026  
**Assignment**: GitHub Profile Page - Angular Implementation  
**Organization**: UptimeAI

---

## 🎯 Summary

This project demonstrates:
- ✅ Advanced Angular development skills
- ✅ Comprehensive API integration (GitHub GraphQL & REST)
- ✅ Responsive web design principles
- ✅ Component-based architecture
- ✅ State management with RxJS
- ✅ Pure CSS styling without frameworks
- ✅ Backend development with Node.js/Express
- ✅ Attention to UI/UX details

**Key Statistics**: 
- **9 Major Components**: Header (2 parts), Profile Sidebar, Profile Main, Contribution Graph, Activity Overview, Profile Tabs, Footer, Maintenance
- **6 API Endpoints**: All proxying to GitHub GraphQL API
- **95%+ API Integration**: Only activity timeline uses mock data (temporary)
- **100% Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Pure CSS**: No UI frameworks, GitHub-accurate styling

The implementation delivers a fully functional, production-ready GitHub profile clone with comprehensive API integration, modern development practices, and pixel-perfect design accuracy.

