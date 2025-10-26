<div align="center">

# Space Alone 🚀

An immersive space-themed web experience that takes you on a journey through the cosmos. Navigate through stunning celestial environments and experience the solitude and beauty of space exploration.

[![Space Alone Banner](https://i.postimg.cc/85nSNKrt/image.png)](https://space-alone.onrender.com)

## 🌐 LIVE DEMO

[![Visit Now](https://img.shields.io/badge/🚀_Visit_Now-Live_Demo-4CAF50?style=for-the-badge&logoColor=white)](https://space-alone.onrender.com)

**Experience Space Alone:** [space-alone.onrender.com](https://space-alone.onrender.com)

---

## 📊 PROJECT STATUS

![Stars](https://img.shields.io/github/stars/vmihiranga/space-alone?style=for-the-badge&logo=github&logoColor=white&color=yellow)
![Forks](https://img.shields.io/github/forks/vmihiranga/space-alone?style=for-the-badge&logo=github&logoColor=white&color=blue)
![Issues](https://img.shields.io/github/issues/vmihiranga/space-alone?style=for-the-badge&logo=github&logoColor=white&color=red)
![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)
![Visitors](https://api.visitorbadge.io/api/visitors?path=vmihiranga%2Fspace-alone&label=Visitors&countColor=%23263759&style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/vmihiranga/space-alone?style=for-the-badge&logo=git&logoColor=white&color=purple)

## 🛠️ TECH STACK

![Node.js](https://img.shields.io/badge/Node.js_v20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

---

## 📖 OVERVIEW

Space Alone is a full-stack cosmic blog platform that combines interactive 3D space visualizations with real-time astronomical data. Built with modern web technologies, it delivers an engaging experience for space enthusiasts, featuring a comprehensive admin dashboard, blog management system, and live space data integration from NASA and SpaceX APIs.

### What Makes Space Alone Special?

This isn't just another space website—it's an **immersive cosmic experience** that brings the wonders of space exploration directly to your browser. Whether you're a space enthusiast, educator, or developer, Space Alone offers a unique blend of education, entertainment, and cutting-edge web technology.

---

## ✨ KEY FEATURES

</div>

### 🌌 Immersive Space Environment
- **3D Solar System Visualization**: Interactive solar system with realistic planetary orbits
- **Dynamic Star Fields**: Procedurally generated particle systems for authentic space atmosphere
- **Ambient Soundscape**: Atmospheric audio that enhances the exploration experience
- **Smooth Animations**: Hardware-accelerated rendering for buttery-smooth performance

### 🛰️ Real-Time Space Data Integration
- **NASA APIs**: Live astronomical photography (APOD), Near-Earth Objects (NEO), Mars rover photos
- **SpaceX API**: Real-time rocket launch data and mission information
- **ISS Tracking**: Live International Space Station location via Open Notify API
- **Space News Feed**: Curated news from Spaceflight News API

### 📝 Cosmic Blog Platform
- **Content Management System**: Full CRUD operations for blog posts
- **Rich Text Editor**: Create engaging space-themed articles
- **Social Engagement**: Like, dislike, and share functionality for posts
- **User Authentication**: Secure session-based login system
- **File Uploads**: Support for images and media in blog posts

### 👨‍💼 Comprehensive Admin Dashboard
- **User Management**: 
  - View all registered users with detailed information
  - Create new users with customizable roles (admin/user)
  - Delete users (with self-deletion protection)
- **Blog Management**: Edit, delete, and moderate blog posts
- **Settings Configuration**: Customize site-wide settings
- **Navigation**: Quick access to main site via "Visit Site" button

### 📱 Modern Web Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Security Features**: Helmet.js protection, rate limiting, CORS configuration
- **Performance Optimized**: Lazy loading, efficient rendering, optimized assets

<div align="center">

---

## 🏗️ ARCHITECTURE

</div>

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  HTML/CSS   │  │ JavaScript  │  │   Canvas/WebGL      │ │
│  │   Pages     │  │   ES6+      │  │   Animations        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer (Express.js)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │   Auth   │  │  Posts   │  │   NASA   │  │   SpaceX   │ │
│  │  Routes  │  │  Routes  │  │    API   │  │    API     │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │   PostgreSQL DB      │  │   SQLite Sessions          │  │
│  │   (Koyeb Instance)   │  │   (Local Storage)          │  │
│  └──────────────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

**Core Tables:**
- `users` - User accounts and authentication
- `posts` - Blog posts with rich content
- `solar_config` - Solar system visualization settings
- `uploads` - File management for media assets
- `post_likes`, `post_dislikes`, `post_shares` - Social engagement tracking
- `app_settings` - Application configuration


### API Endpoints

#### Authentication (`/api/auth/*`)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/users` - Get all users (admin only)
- `POST /api/auth/users` - Create new user (admin only)
- `DELETE /api/auth/users/:id` - Delete user (admin only)

#### Blog Management (`/api/posts`)
- `GET /api/posts` - Retrieve all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

#### NASA Data (`/api/nasa/*`)
- `GET /api/nasa/apod` - Astronomy Picture of the Day
- `GET /api/nasa/neo` - Near-Earth Objects
- `GET /api/nasa/mars` - Mars rover photos
- `GET /api/nasa/iss` - ISS location

#### Space Data
- `GET /api/spacex` - SpaceX launch data
- `GET /api/news` - Space news feed
- `GET /api/health` - Health check

<div align="center">

---

## 🚀 INSTALLATION & SETUP

</div>

### Prerequisites

Before getting started, ensure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- A modern web browser (Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/vmihiranga/space-alone.git
cd space-alone
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Access the application**

Open your browser and navigate to:
- Main site: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`


### Default Admin Credentials

**⚠️ IMPORTANT: Change these immediately after first login!**

- **Username**: `admin`
- **Password**: `admin123`

### Troubleshooting


**Port already in use?**
```bash
# Change PORT in .env file
PORT=3001
```

**Database connection issues?**
```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -l | grep space_alone
```

**Missing dependencies?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```


---
<div align="center">
  
## 📁 PROJECT STRUCTURE
  
</div>

```
space-alone/
├── 📄 package.json              # Dependencies and scripts
├── 📄 .env                      # Environment configuration
├── 📄 README.md                 # This file
│
└── 📁 backend/
    ├── 📁 middleware/
    │   └── auth.js              # Authentication middleware
    │
    ├── 📁 models/
    │   ├── schema-postgres.sql  # Database schema
    │   └── user.sql             # User model queries
    │
    ├── 📁 routes/
    │   ├── auth.js              # Authentication routes
    │   ├── nasa.js              # NASA API integration
    │   ├── news.js              # Space news aggregation
    │   ├── posts.js             # Blog post management
    │   ├── solar.js             # Solar system data
    │   ├── space.js             # General space data
    │   └── uploads.js           # File upload handling
    │
    ├── 📁 frontend/
    │   ├── 📁 errors/
    │   │   ├── 403.html         # Forbidden page
    │   │   ├── 404.html         # Not found page
    │   │   └── 500.html         # Server error page
    │   │
    │   ├── 📁 src/
    │   │   ├── 📁 js/
    │   │   │   └── index.js     # Main JavaScript
    │   │   └── 📁 styles/
    │   │       └── main.css     # Main stylesheet
    │   │
    │   ├── 📁 assets/
    │   │   ├── 📁 images/       # Image assets
    │   │   ├── 📁 sounds/       # Audio files
    │   │   └── 📁 models/       # 3D models
    │   │
    │   ├── admin.html           # Admin dashboard
    │   ├── api.html             # API documentation
    │   ├── blog.html            # Blog listing page
    │   ├── index.html           # Main landing page
    │   ├── login.html           # Login page
    │   ├── news.html            # Space news page
    │   └── post.html            # Single post view
    │
    ├── db.js                    # Database connection
    ├── init-db-postgres.js      # Database initialization
    ├── server.js                # Express server setup
    └── sessions.sqlite          # Session storage
```

---

<div align="center">
  
## 🖼️ SCREENSHOTS & PREVIEW



### Main Space Environment
[![Space View](https://i.postimg.cc/85nSNKrt/image.png)](https://space-alone.onrender.com)
*Immersive 3D solar system with realistic planetary orbits - Click to explore live!*

### Interactive Dashboard
[![Interactive Features](https://i.postimg.cc/mDcbzWRx/image.png)](https://space-alone.onrender.com)
*Admin dashboard with user management and blog controls - Try it yourself!*

### Mobile-Responsive Design
[![Mobile View](https://i.postimg.cc/tTJKS3m6/image.png)](https://space-alone.onrender.com)
*Seamless experience across all devices - Visit on your phone!*

---

## 🌐 DEPLOYMENT

</div>

### Deployment on Replit

</div>

1. **Import from GitHub**
```bash
# In Replit, use "Import from GitHub"
# Repository: https://github.com/vmihiranga/space-alone
```

2. **Configure Secrets**
Add the following in Replit Secrets:
- `SESSION_SECRET`
- `NASA_API_KEY`
- Database credentials

3. **Run Setup**
```bash
npm install
node backend/init-db-postgres.js
npm start
```

<div align="center">

### Deployment on Render/Heroku

</div>

1. **Connect GitHub repository**
2. **Set environment variables** in dashboard
3. **Deploy command**: `npm start`
4. **Auto-deploy** on push to main branch

<div align="center">

### Configuration for Production

</div>

**Environment Variables:**
```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=<your-production-secret>
NASA_API_KEY=<your-api-key>
# Add database credentials
```

**Deployment Type:**
- Autoscale (stateless web application)
- Minimum instances: 1
- Maximum instances: Auto

<div align="center">

---

## 🔐 SECURITY FEATURES

</div>

- **Helmet.js**: Security headers protection
- **Rate Limiting**: API endpoint protection
- **CORS**: Configured cross-origin requests
- **Session-Based Auth**: Secure session management (no JWT)
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **HTTPS Ready**: SSL/TLS support

<div align="center">

---

## ⚡ PERFORMANCE METRICS

</div>

- **Load Time**: < 3 seconds (average)
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 4 seconds
- **Lighthouse Score**: 85+ (Performance)
- **Frame Rate**: Consistent 60fps for 3D visualizations

<div align="center">

---

## 🌍 BROWSER COMPATIBILITY

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |
| Opera | 76+ | ⚠️ Partial Support |

**Note**: WebGL support required for 3D visualizations

---

## 📜 LICENSE

![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)

Licensed under the **Apache License, Version 2.0** (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at:

```
http://www.apache.org/licenses/LICENSE-2.0
```

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

**© 2024 Vishwa Mihiranga**

---

## 🙏 CREDITS & ATTRIBUTIONS

### 🔊 Audio Assets

</div>

- Space ambient sound from **Pixabay**  
  Source: https://pixabay.com/sound-effects/ambient-soundscapes-007-space-atmosphere-304974/

<div align="center">

### 🖼️ Visual Assets

</div>

- Publicly available space imagery sourced from Google (subject to original copyrights)
- NASA image archives
- ESA public domain imagery

<div align="center">

### 🚀 APIs & Data Sources

</div>

- **NASA APIs** - Astronomy Picture of the Day, Near-Earth Objects, Mars photos
- **SpaceX API** - Launch data and mission information
- **Spaceflight News API** - Curated space news (https://spaceflightnewsapi.net/)
- **Open Notify API** - ISS location tracking

<div align="center">

### 🔤 Typography

</div>

- **Google Fonts** - Roboto family
- **CDNFonts** - Starcraft font

<div align="center">

### 🎨 Design Inspiration

</div>

- UI components and design elements inspired by **Universe.io**

<div align="center">

### 🤖 Development Tools

</div>

- Content generation assistance from **ChatGPT** (OpenAI)
- Code optimization with **GitHub Copilot**

<div align="center">

---

## 👨‍💻 AUTHOR

**Vishwa Mihiranga**

[![GitHub](https://img.shields.io/badge/GitHub-vmihiranga-181717?style=for-the-badge&logo=github)](https://github.com/vmihiranga)
[![Project](https://img.shields.io/badge/Project-Space_Alone-4CAF50?style=for-the-badge&logo=github)](https://github.com/vmihiranga/space-alone)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Now-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://space-alone.onrender.com)

---

## 🌟 ACKNOWLEDGMENTS

</div>

Special thanks to:
- The **open-source community** for incredible tools and libraries
- **NASA** and **ESA** for making space data publicly accessible
- **Contributors** who have helped improve this project
- **AI tools** that support modern development workflows
- All the **space enthusiasts** who inspired this project

<div align="center">

---

### 🚀 Ready to explore the cosmos?

[![Launch Space Alone](https://img.shields.io/badge/🌌_Launch_Space_Alone-Now-blue?style=for-the-badge&labelColor=000000)](https://space-alone.onrender.com)

---

⭐ **Star this repository** if you enjoyed exploring Space Alone!

</div>
