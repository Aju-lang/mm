# 🎭 RENDEZVOUS 2025 - Festival Management System

A comprehensive, modern web application for managing college festivals built with React, TailwindCSS, and LocalStorage. No backend required!

## ✨ Features

### 🎯 Public Student Dashboard
- **Festival Information**: Display festival name, logo, dates, and countdown timer
- **Competition Listings**: Browse all competitions by category with detailed information
- **Student Search**: Search students by their auto-generated codes to view registrations and results
- **Live Leaderboard**: Individual and department-wise rankings with points
- **Gallery**: Beautiful image gallery with categorized festival photos
- **Live Announcements**: Scrolling ticker with important updates

### 🔐 Admin Dashboard (Login Required)
- **Secure Authentication**: Username/password login with localStorage
- **Competition Management**: Create, edit, delete competitions with full details
- **Student Registration**: Add students and register them for events
- **Results Management**: Update competition results and automatically calculate points
- **Announcement System**: Create, edit, and manage announcements
- **Poster Creator**: Generate beautiful posters with 10 customizable templates
- **Auto-generated Student Codes**: Unique codes for easy student identification

### 🎨 Design & UX
- **Modern UI**: Clean, responsive design with TailwindCSS
- **Mobile-First**: Fully responsive across all devices
- **Smooth Animations**: Engaging transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader friendly
- **Dark/Light Elements**: Beautiful gradient backgrounds and card layouts

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd campus-festival-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Demo Credentials

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`

Alternative admin account:
- **Username**: `festival`
- **Password**: `festival2024`

## 📊 Data Structure

All data is stored in localStorage with the following structure:

```javascript
{
  students: [
    {
      id: 1,
      name: "Student Name",
      code: "TF2024001", // Auto-generated
      department: "Computer Science",
      year: "3rd",
      events: [1, 2], // Competition IDs
      results: [
        {
          competitionId: 1,
          competitionName: "Coding Challenge",
          position: 1,
          points: 100,
          date: "2024-10-15"
        }
      ],
      points: 100 // Total points
    }
  ],
  competitions: [
    {
      id: 1,
      name: "Coding Challenge",
      description: "Competitive programming contest",
      category: "Technical",
      date: "2024-10-15",
      time: "10:00 AM",
      venue: "Computer Lab 1",
      maxParticipants: 50,
      participants: [...],
      results: [...],
      status: "upcoming" // upcoming, ongoing, completed
    }
  ],
  announcements: [
    {
      id: 1,
      title: "Registration Open",
      message: "Registration for TechFest 2024 is now open!",
      type: "info", // info, warning, success, error
      active: true,
      createdAt: "2024-10-01T10:00:00Z"
    }
  ]
}
```

## 🎨 Poster Templates

The poster creator includes 10 beautiful templates:

1. **Classic Gold** - Traditional golden theme
2. **Modern Blue** - Contemporary blue gradient
3. **Elegant Purple** - Sophisticated purple design
4. **Vibrant Red** - Bold red styling
5. **Fresh Green** - Nature-inspired green
6. **Sunset Orange** - Warm orange-red gradient
7. **Ocean Teal** - Cool teal-cyan blend
8. **Royal Indigo** - Rich indigo-purple-pink
9. **Monochrome** - Professional black-gray
10. **Minimalist White** - Clean white background

## 🛠️ Tech Stack

- **Frontend**: React 18 with functional components and hooks
- **Styling**: TailwindCSS with custom configurations
- **State Management**: React Context API
- **Data Storage**: Browser localStorage
- **PDF Generation**: jsPDF
- **Image Capture**: html2canvas
- **Icons**: Unicode emojis for universal compatibility

## 📁 Project Structure

```
src/
├── components/
│   ├── Admin/
│   │   ├── AdminDashboard.js
│   │   ├── CompetitionManager.js
│   │   ├── StudentManager.js
│   │   └── PosterCreator.js
│   ├── Auth/
│   │   └── Login.js
│   ├── Dashboard/
│   │   ├── StudentDashboard.js
│   │   ├── CountdownTimer.js
│   │   ├── AnnouncementTicker.js
│   │   ├── StudentSearch.js
│   │   ├── Leaderboard.js
│   │   ├── CompetitionsList.js
│   │   └── Gallery.js
│   └── Layout/
│       └── Navbar.js
├── contexts/
│   └── AuthContext.js
├── utils/
│   └── localStorage.js
├── App.js
├── index.js
└── index.css
```

## 🔧 Configuration

### Festival Settings
Edit `src/utils/localStorage.js` to customize:
- Festival name and dates
- Default admin credentials
- Student code prefix
- Competition categories

### Styling
Customize colors and themes in `tailwind.config.js`:
- Primary and secondary color palettes
- Custom animations
- Font families

## 📱 Features in Detail

### Student Dashboard
- **Countdown Timer**: Real-time countdown to festival start
- **Search Functionality**: Find any student by their unique code
- **Competition Browser**: Filter competitions by category
- **Live Results**: Real-time leaderboard updates
- **Gallery**: Responsive image grid with modal previews

### Admin Panel
- **Dashboard Analytics**: Overview of all festival statistics
- **Competition Management**: Full CRUD operations for events
- **Student Registration**: Bulk or individual student management
- **Results Entry**: Drag-and-drop result ordering
- **Poster Generation**: Professional poster creation with export options

### Data Management
- **Auto-backup**: All data persists in localStorage
- **Import/Export**: Easy data migration capabilities
- **Validation**: Form validation and error handling
- **Real-time Updates**: Instant UI updates across all components

## 🌟 Key Benefits

- **No Backend Required**: Runs entirely in the browser
- **Offline Capable**: Works without internet connection
- **Easy Deployment**: Can be deployed to any static hosting service
- **Customizable**: Easy to modify colors, text, and features
- **Production Ready**: Includes error handling and validation
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in the `build` folder can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting
- Any static web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the browser console for any errors
2. Verify localStorage is enabled in your browser
3. Ensure all dependencies are properly installed
4. Clear browser cache if experiencing issues

---

**Built with ❤️ for educational institutions worldwide**
