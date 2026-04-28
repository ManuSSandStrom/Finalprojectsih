"use client"

import { createElement, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Home,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"

import { Chatbot } from "@/components/Chatbot"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api, getApiErrorMessage } from "@/lib/api"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [rooms, setRooms] = useState([])
  const [timetables, setTimetables] = useState([])
  const [notifications, setNotifications] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, facultyRes, roomsRes, timetablesRes, notificationsRes] = await Promise.allSettled([
          api.get("/api/courses"),
          api.get("/api/faculty"),
          api.get("/api/rooms"),
          api.get("/api/timetables"),
          api.get("/api/notifications"),
        ])

        const firstError = [coursesRes, facultyRes, roomsRes, timetablesRes, notificationsRes].find(
          (result) => result.status === "rejected",
        )

        setErrorMessage(firstError ? getApiErrorMessage(firstError.reason, "Unable to load dashboard data.") : "")
        setCourses(coursesRes.status === "fulfilled" ? coursesRes.value.data : [])
        setFaculty(facultyRes.status === "fulfilled" ? facultyRes.value.data : [])
        setRooms(roomsRes.status === "fulfilled" ? roomsRes.value.data : [])
        setTimetables(timetablesRes.status === "fulfilled" ? timetablesRes.value.data : [])
        setNotifications(notificationsRes.status === "fulfilled" ? notificationsRes.value.data : [])
      } catch (err) {
        setErrorMessage(getApiErrorMessage(err, "Unable to load dashboard data."))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = {
    totalCourses: courses.length,
    totalFaculty: faculty.length,
    totalRooms: rooms.length,
    totalTimetables: timetables.length,
    activeConflicts: timetables.reduce((acc, timetable) => acc + (timetable.conflicts?.length || 0), 0),
    completedSchedules: timetables.filter((timetable) => timetable.status === "published").length,
    utilizationRate: timetables.length
      ? Math.round((timetables.filter((timetable) => timetable.schedule?.length).length / timetables.length) * 100)
      : 0,
    pendingTasks: notifications.filter((notification) => !notification.isRead).length,
  }

  const chatContext = {
    timetables: timetables.map((tt) => ({
      name: tt.name,
      department: tt.department,
      semester: tt.semester,
      status: tt.status,
      schedule:
        tt.schedule?.map((slot) => ({
          day: slot.day,
          time: slot.timeSlot,
          course: courses.find((course) => course._id === slot.courseId)?.name,
          faculty: faculty.find((person) => person._id === slot.facultyId)?.name,
          room: rooms.find((room) => room._id === slot.roomId)?.name,
        })) || [],
    })),
    totalCourses: courses.length,
    totalFaculty: faculty.length,
  }

  const statCards = [
    { title: "Courses", value: stats.totalCourses, icon: BookOpen, tone: "text-blue-900", bg: "bg-blue-100" },
    { title: "Faculty", value: stats.totalFaculty, icon: Users, tone: "text-sky-800", bg: "bg-sky-100" },
    { title: "Rooms", value: stats.totalRooms, icon: Home, tone: "text-indigo-800", bg: "bg-indigo-100" },
    { title: "Timetables", value: stats.totalTimetables, icon: Calendar, tone: "text-blue-900", bg: "bg-blue-100" },
    { title: "Published", value: stats.completedSchedules, icon: CheckCircle, tone: "text-cyan-800", bg: "bg-cyan-100" },
    { title: "Conflicts", value: stats.activeConflicts, icon: AlertTriangle, tone: "text-red-700", bg: "bg-red-50" },
    { title: "Utilization", value: `${stats.utilizationRate}%`, icon: TrendingUp, tone: "text-indigo-800", bg: "bg-indigo-100" },
    { title: "Unread", value: stats.pendingTasks, icon: Bell, tone: "text-blue-900", bg: "bg-blue-100" },
  ]

  const recentTimetables = timetables.slice(0, 4)
  const recentNotifications = notifications.slice(0, 4)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eaf3ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1680px] space-y-5">
          <div className="h-44 animate-pulse rounded-[28px] bg-white/80" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-3xl bg-white/80" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eaf3ff] text-slate-950">
      <main className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="mb-5 rounded-[28px] border border-blue-100 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-5 py-5 shadow-sm shadow-blue-200/40 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-900">
                <Sparkles className="h-4 w-4" />
                Smart Classroom Console
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Platform Overview</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Monitor academic resources, manage schedules, review alerts, and jump into the workflows your team uses most.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link to="/timetables">
                <Button className="h-12 w-full bg-blue-950 px-5 text-white hover:bg-blue-900">
                  <Calendar className="mr-2 h-4 w-4" />
                  Open Timetables
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline" className="h-12 w-full border-blue-200 bg-white/80 text-blue-950 hover:bg-blue-50">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        <section className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="border border-blue-100 bg-white/90 shadow-sm shadow-blue-200/30">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-900/70">{stat.title}</p>
                      <p className="mt-3 text-3xl font-bold text-slate-950">{stat.value}</p>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.bg} ${stat.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_430px]">
          <Card className="border border-blue-100 bg-white/90 shadow-sm shadow-blue-200/30">
            <CardHeader className="border-b border-blue-100/80 bg-blue-50/60 px-5 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-slate-950">Recent Timetables</CardTitle>
                  <CardDescription>Latest generated schedules and publication status.</CardDescription>
                </div>
                <Link to="/timetables">
                  <Button variant="outline" size="sm" className="border-blue-200 bg-white text-blue-950 hover:bg-blue-50">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {recentTimetables.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 px-6 py-12 text-center">
                  <Calendar className="mx-auto mb-4 h-10 w-10 text-blue-900" />
                  <h3 className="text-lg font-bold text-slate-950">No timetables yet</h3>
                  <p className="mt-2 text-sm text-blue-900/60">Generate a timetable to start reviewing schedules here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTimetables.map((timetable) => (
                    <div key={timetable._id} className="rounded-2xl border border-blue-100 bg-gradient-to-r from-white to-blue-50/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="truncate font-bold text-slate-950">{timetable.name}</div>
                          <div className="mt-1 text-sm text-blue-900/60">
                            {timetable.department} / Semester {timetable.semester} / {timetable.schedule?.length || 0} classes
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="border border-blue-200 bg-blue-50 text-blue-900">{timetable.status}</Badge>
                          {timetable.conflicts?.length > 0 && (
                            <Badge className="border-0 bg-red-100 text-red-700">{timetable.conflicts.length} conflicts</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="border border-blue-100 bg-white/90 shadow-sm shadow-blue-200/30">
              <CardHeader className="border-b border-blue-100/80 bg-blue-50/60 px-5 py-5">
                <CardTitle className="text-slate-950">Quick Actions</CardTitle>
                <CardDescription>Common setup and scheduling tasks.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-4">
                {[
                  ["/courses", "Add Course", BookOpen],
                  ["/faculty", "Add Faculty", Users],
                  ["/rooms", "Add Room", Home],
                  ["/timetables", "Generate Timetable", Sparkles],
                ].map(([path, label, ActionIcon]) => (
                  <Link key={path} to={path}>
                    <Button variant="outline" className="h-12 w-full justify-start border-blue-200 bg-white text-blue-950 hover:bg-blue-50">
                      {createElement(ActionIcon, { className: "mr-3 h-4 w-4 text-blue-900" })}
                      {label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-blue-100 bg-white/90 shadow-sm shadow-blue-200/30">
              <CardHeader className="border-b border-blue-100/80 bg-blue-50/60 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-slate-950">Notifications</CardTitle>
                    <CardDescription>Recent system alerts</CardDescription>
                  </div>
                  <Link to="/notifications">
                    <Button variant="outline" size="sm" className="border-blue-200 bg-white text-blue-950 hover:bg-blue-50">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {recentNotifications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-8 text-center text-sm text-blue-900/60">
                    No notifications yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentNotifications.map((notification) => (
                      <div key={notification._id} className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                              ["error", "warning"].includes(notification.type)
                                ? "bg-red-100 text-red-700"
                                : notification.type === "success"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {["error", "warning"].includes(notification.type) ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-950">{notification.title}</p>
                            <p className="mt-1 text-sm leading-5 text-blue-900/60">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <div className="fixed bottom-5 right-5 z-40 sm:bottom-8 sm:right-8">
        <Button
          onClick={() => setIsChatOpen(true)}
          className="h-14 w-14 rounded-full bg-blue-950 text-white shadow-2xl shadow-blue-950/20 hover:bg-blue-900 sm:h-16 sm:w-16"
        >
          <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8" />
        </Button>
      </div>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} context={chatContext} />
    </div>
  )
}
