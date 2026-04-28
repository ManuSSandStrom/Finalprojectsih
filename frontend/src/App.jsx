import { useEffect, useMemo, useState } from "react"
import { BrowserRouter as Router, Link, NavLink, Route, Routes, useLocation } from "react-router-dom"
import {
  Bell,
  BookOpen,
  Calendar,
  Home,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react"

import Dashboard from "./pages/Dashboard"
import CoursesPage from "./pages/Courses"
import FacultyPage from "./pages/Faculty"
import RoomPage from "./pages/Rooms"
import TimetablePage from "./pages/Timetable"
import NotificationsPage from "./pages/Notifications"

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Courses", icon: BookOpen, path: "/courses" },
  { label: "Faculty", icon: Users, path: "/faculty" },
  { label: "Rooms", icon: Home, path: "/rooms" },
  { label: "Timetables", icon: Calendar, path: "/timetables" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
]

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const readableDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  )

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <header className="app-topbar">
        <button type="button" className="app-icon-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="min-w-0 flex-1">
          <div className="text-lg font-bold leading-tight text-slate-950 sm:text-xl">Smart Scheduler</div>
          <div className="text-xs font-medium text-slate-500 sm:hidden">Smart Classroom</div>
        </Link>
        <div className="hidden rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">
          Smart Classroom
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="app-drawer-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <aside className={`app-drawer ${menuOpen ? "app-drawer-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-950">Smart Scheduler</div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Admin Console</div>
            </div>
          </Link>
          <button type="button" className="app-icon-button app-icon-button-plain" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-blue-950">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-slate-950">Smart Classroom</div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-900">Deployment Ready</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {readableDate}
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `app-drawer-link ${isActive ? "app-drawer-link-active" : "app-drawer-link-idle"}`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </aside>

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/rooms" element={<RoomPage />} />
          <Route path="/timetables" element={<TimetablePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
