import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trash2,
  Sparkles,
  FileDown,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Check,
  Calendar as CalendarIconLucide,
  LayoutDashboard,
  BookOpen,
  Users as UsersIcon,
  Home as HomeIcon,
  Bell,
} from "lucide-react"
import { api, getApiErrorMessage } from "@/lib/api"

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:15-12:15",
  "12:15-13:15",
  "14:15-15:15",
  "15:15-16:15",
  "16:30-17:30",
]

function getDefaultFormState() {
  return {
    department: "Computer Science",
    semester: "5",
    academicYear: new Date().getFullYear(),
    scheduleType: "weekly",
    activeDays: WEEKDAYS,
    specialDay: "Saturday",
    constraintsText: "",
  }
}

function getVisibleDays(timetable) {
  const metadataDays = Array.isArray(timetable?.metadata?.activeDays) ? timetable.metadata.activeDays : []
  const scheduleDays = Array.from(new Set((timetable?.schedule || []).map((entry) => entry.day).filter(Boolean)))
  const days = metadataDays.length ? metadataDays : scheduleDays.length ? scheduleDays : WEEKDAYS

  return days.filter((day) => ALL_DAYS.includes(day)).sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b))
}

function TimetableGrid({ timetable, courses, faculty, rooms }) {
  const visibleDays = getVisibleDays(timetable)

  const getEntry = (day, slot) => {
    if (!timetable || !timetable.schedule) return null
    return (
      timetable.schedule.find(
        (e) => e.day.toLowerCase() === day.toLowerCase() && `${e.startTime}-${e.endTime}` === slot,
      ) || null
    )
  }

  const findCourse = (id) => courses.find((c) => c._id === id) || null
  const findFaculty = (id) => faculty.find((f) => f._id === id) || null
  const findRoom = (id) => rooms.find((r) => r._id === id) || null

  const typeColor = (t) => {
    switch (t) {
      case "lecture":
        return "bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-200 border border-indigo-500/30"
      case "lab":
        return "bg-gradient-to-br from-emerald-500/20 to-green-600/20 text-emerald-200 border border-emerald-500/30"
      case "tutorial":
        return "bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-200 border border-indigo-500/30"
      case "exam":
        return "bg-gradient-to-br from-red-500/20 to-rose-600/20 text-red-200 border border-red-500/30"
      default:
        return "bg-gradient-to-br from-slate-600/20 to-gray-700/20 text-slate-200 border border-slate-500/30"
    }
  }

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-indigo-500/10">
      <CardHeader className="border-b border-slate-700/50 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-indigo-100">{timetable.name}</CardTitle>
            <div className="text-sm text-slate-400">
              {timetable.department} • Semester {timetable.semester} • {timetable.year}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              className={
                timetable.status === "published"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0"
                  : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
              }
            >
              {timetable.status}
            </Badge>
            {timetable.conflicts && timetable.conflicts.length > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
                {timetable.conflicts.length} conflicts
              </Badge>
            )}
            <Badge className="bg-slate-700/50 text-slate-300 border border-slate-600/50">
              {timetable.metadata?.utilizationRate || 0}% utilized
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <div
            className="grid gap-3 min-w-[760px]"
            style={{ gridTemplateColumns: `120px repeat(${visibleDays.length}, minmax(140px, 1fr))` }}
          >
            <div className="font-semibold text-center p-3 bg-slate-700/30 backdrop-blur-sm rounded-xl text-indigo-200 border border-slate-600/50">
              Time
            </div>
            {visibleDays.map((d) => (
              <div
                key={d}
                className="font-semibold text-center p-3 bg-slate-700/30 backdrop-blur-sm rounded-xl text-indigo-200 border border-slate-600/50"
              >
                {d}
              </div>
            ))}

            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="contents">
                <div className="text-sm text-center p-3 bg-slate-800/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-400 border border-slate-700/50">
                  <Clock className="h-3 w-3 mr-1" />
                  {slot}
                </div>

                {visibleDays.map((day) => {
                  const entry = getEntry(day, slot)
                  if (!entry) {
                    return (
                      <div key={`${day}-${slot}`} className="min-h-[80px] p-1">
                        <div className="h-full bg-slate-800/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300" />
                      </div>
                    )
                  }

                  const course = findCourse(entry.courseId)
                  const prof = findFaculty(entry.facultyId)
                  const room = findRoom(entry.roomId)

                  return (
                    <div key={`${day}-${slot}`} className="min-h-[80px] p-1">
                      <div
                        className={`p-3 rounded-xl text-xs h-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm ${typeColor(
                          course?.type || "lecture",
                        )}`}
                      >
                        <div className="font-semibold leading-tight mb-2 line-clamp-2 text-base">
                          {course ? `${course.name} (${course.code})` : entry.courseId}
                        </div>
                        <div className="space-y-1 text-xs opacity-90">
                          <div className="flex items-center gap-1 truncate">
                            <User className="h-3 w-3" />
                            <span className="truncate">{prof ? prof.name : entry.facultyId}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{room ? room.name : entry.roomId}</span>
                          </div>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs px-1 py-0  text-white backdrop-blur-sm">
                              {course?.type || entry.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {timetable.conflicts && timetable.conflicts.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Conflicts Detected
            </h4>
            {timetable.conflicts.map((c, i) => (
              <div key={i} className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-red-400">{(c.type || "CONFLICT").replace("_", " ")}</span>
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 text-xs">High</Badge>
                </div>
                <p className="text-sm text-red-300">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getTimetablePdfGrid(timetable, courses, faculty, rooms) {
  const schedule = Array.isArray(timetable?.schedule) ? [...timetable.schedule] : []
  const visibleDays = getVisibleDays(timetable)

  const findCourse = (id) => courses.find((course) => course._id === id) || null
  const findFaculty = (id) => faculty.find((person) => person._id === id) || null
  const findRoom = (id) => rooms.find((room) => room._id === id) || null

  return TIME_SLOTS.map((slot) => {
    const [startTime, endTime] = slot.split("-")

    return {
      slot,
      entries: visibleDays.map((day) => {
        const entry =
          schedule.find(
            (item) =>
              item.day?.toLowerCase() === day.toLowerCase() &&
              `${item.startTime}-${item.endTime}` === slot,
          ) || null

        if (!entry) return null

        const course = findCourse(entry.courseId)
        const prof = findFaculty(entry.facultyId)
        const room = findRoom(entry.roomId)

        return {
          course: course ? `${course.name} (${course.code})` : entry.courseId || "N/A",
          faculty: prof ? prof.name : entry.facultyId || "N/A",
          room: room ? room.name : entry.roomId || "N/A",
          type: course?.type || entry.type || "lecture",
          time: `${entry.startTime || startTime} - ${entry.endTime || endTime}`,
        }
      }),
    }
  })
}

function sanitizePdfText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function escapePdfText(value) {
  return sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function pdfNumber(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/, "")
}

function pdfColor(hex) {
  const normalized = hex.replace("#", "")
  const rgb = [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16) / 255)
  return rgb.map((value) => pdfNumber(value)).join(" ")
}

function addRect(commands, x, y, width, height, fill, stroke = null) {
  if (fill) commands.push(`${pdfColor(fill)} rg`)
  if (stroke) commands.push(`${pdfColor(stroke)} RG`)
  commands.push(`${pdfNumber(x)} ${pdfNumber(y)} ${pdfNumber(width)} ${pdfNumber(height)} re ${fill && stroke ? "B" : fill ? "f" : "S"}`)
}

function addLine(commands, x1, y1, x2, y2, color = "#e2e8f0") {
  commands.push(`${pdfColor(color)} RG`)
  commands.push(`${pdfNumber(x1)} ${pdfNumber(y1)} m ${pdfNumber(x2)} ${pdfNumber(y2)} l S`)
}

function addText(commands, text, x, y, size = 10, color = "#0f172a") {
  commands.push(`${pdfColor(color)} rg`)
  commands.push(`BT /F1 ${pdfNumber(size)} Tf 1 0 0 1 ${pdfNumber(x)} ${pdfNumber(y)} Tm (${escapePdfText(text)}) Tj ET`)
}

function wrapPdfText(text, maxWidth, fontSize, maxLines = 3) {
  const safeText = sanitizePdfText(text) || "N/A"
  const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * 0.52)))
  const words = safeText.split(" ")
  const lines = []
  let line = ""

  words.forEach((word) => {
    const chunks = []
    for (let index = 0; index < word.length; index += maxChars) {
      chunks.push(word.slice(index, index + maxChars))
    }

    chunks.forEach((chunk) => {
      const nextLine = line ? `${line} ${chunk}` : chunk
      if (nextLine.length <= maxChars) {
        line = nextLine
      } else {
        if (line) lines.push(line)
        line = chunk
      }
    })
  })

  if (line) lines.push(line)

  if (lines.length > maxLines) {
    const visibleLines = lines.slice(0, maxLines)
    visibleLines[maxLines - 1] = `${visibleLines[maxLines - 1].slice(0, Math.max(0, maxChars - 3))}...`
    return visibleLines
  }

  return lines
}

function createPdfBlob(pages) {
  const encoder = new TextEncoder()
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${4 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]

  pages.forEach((content, index) => {
    const pageObject = 4 + index * 2
    const streamObject = pageObject + 1
    const streamBytes = encoder.encode(content)

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamObject} 0 R >>`,
    )
    objects.push(`<< /Length ${streamBytes.length} >>\nstream\n${content}\nendstream`)
  })

  let pdf = "%PDF-1.4\n"
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefStart = encoder.encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new Blob([encoder.encode(pdf)], { type: "application/pdf" })
}

function buildTimetablePdfBlob(timetable, courses, faculty, rooms) {
  const pageWidth = 841.89
  const pageHeight = 595.28
  const margin = 30
  const tableWidth = pageWidth - margin * 2
  const timeColumnWidth = 92
  const visibleDays = getVisibleDays(timetable)
  const dayColumnWidth = (tableWidth - timeColumnWidth) / visibleDays.length
  const tableHeaderHeight = 24
  const rowHeight = 50
  const gridRows = getTimetablePdfGrid(timetable, courses, faculty, rooms)
  const entryCount = gridRows.reduce((total, row) => total + row.entries.filter(Boolean).length, 0)
  const commands = []
  let y = pageHeight - margin

  addRect(commands, margin, y - 62, tableWidth, 62, "#0f172a", "#1e293b")
  addText(commands, "ACADEMIC TIMETABLE REPORT", margin + 18, y - 20, 9, "#93c5fd")
  addText(commands, timetable?.name || "Timetable", margin + 18, y - 40, 20, "#ffffff")
  addText(
    commands,
    `${timetable?.department || "Department"} | Semester ${timetable?.semester || ""} | ${timetable?.year || ""}`,
    margin + 18,
    y - 56,
    10,
    "#cbd5e1",
  )
  y -= 74

  const meta = [
    ["Status", timetable?.status || "draft"],
    ["Classes", entryCount],
    ["Conflicts", Array.isArray(timetable?.conflicts) ? timetable.conflicts.length : 0],
    ["Generated", new Date().toLocaleString()],
  ]
  const gap = 8
  const cardWidth = (tableWidth - gap * 3) / 4

  meta.forEach(([label, value], index) => {
    const x = margin + index * (cardWidth + gap)
    addRect(commands, x, y - 36, cardWidth, 36, "#ffffff", "#e2e8f0")
    addText(commands, label.toUpperCase(), x + 10, y - 14, 7.5, "#64748b")
    addText(commands, value, x + 10, y - 28, 11, "#0f172a")
  })
  y -= 50

  addText(commands, "Weekly Timetable", margin, y, 14, "#0f172a")
  y -= 16

  addRect(commands, margin, y - tableHeaderHeight, tableWidth, tableHeaderHeight, "#e0e7ff", "#c7d2fe")
  addText(commands, "TIME", margin + 10, y - 16, 8.5, "#334155")
  visibleDays.forEach((day, index) => {
    const x = margin + timeColumnWidth + index * dayColumnWidth
    addLine(commands, x, y - tableHeaderHeight, x, y, "#c7d2fe")
    addText(commands, day.toUpperCase(), x + 8, y - 16, 8.5, "#334155")
  })
  addLine(commands, margin + tableWidth, y - tableHeaderHeight, margin + tableWidth, y, "#c7d2fe")
  y -= tableHeaderHeight

  gridRows.forEach((row, rowIndex) => {
    addRect(commands, margin, y - rowHeight, tableWidth, rowHeight, rowIndex % 2 === 0 ? "#ffffff" : "#f8fafc", "#e2e8f0")
    addText(commands, row.slot, margin + 10, y - 23, 9.5, "#475569")
    addLine(commands, margin + timeColumnWidth, y - rowHeight, margin + timeColumnWidth, y, "#e2e8f0")

    row.entries.forEach((entry, index) => {
      const x = margin + timeColumnWidth + index * dayColumnWidth
      addLine(commands, x, y - rowHeight, x, y, "#e2e8f0")

      if (!entry) {
        addText(commands, "Free", x + 8, y - 25, 8.5, "#94a3b8")
        return
      }

      addRect(commands, x + 5, y - rowHeight + 5, dayColumnWidth - 10, rowHeight - 10, "#eef2ff", "#c7d2fe")
      wrapPdfText(entry.course, dayColumnWidth - 20, 8.5, 2).forEach((line, lineIndex) => {
        addText(commands, line, x + 10, y - 14 - lineIndex * 9, 8.5, "#1e1b4b")
      })
      addText(commands, entry.faculty, x + 10, y - 32, 7.5, "#475569")
      addText(commands, entry.room, x + 10, y - 42, 7.5, "#475569")
      addText(commands, entry.type, x + dayColumnWidth - 45, y - 42, 7, "#4f46e5")
    })

    addLine(commands, margin + tableWidth, y - rowHeight, margin + tableWidth, y, "#e2e8f0")
    y -= rowHeight
  })

  addLine(commands, margin, 30, pageWidth - margin, 30, "#cbd5e1")
  addText(commands, "Generated by Smart Classroom Scheduler", margin, 16, 9, "#64748b")

  return createPdfBlob([commands.join("\n")])
}

function getTimetablePdfFilename(timetable) {
  const name = sanitizePdfText(timetable?.name || "timetable")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return `${name || "timetable"}-${new Date().toISOString().slice(0, 10)}.pdf`
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30000)
}

export default function TimetablePage() {
  const [timetables, setTimetables] = useState([])
  const [selected, setSelected] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [rooms, setRooms] = useState([])
  const [error, setError] = useState(null)
  const [activeNavItem, setActiveNavItem] = useState("timetables")
  const [form, setForm] = useState(getDefaultFormState)

  useEffect(() => {
    fetchTimetables()
    fetchSupportingData()
  }, [])

  // All async data fetching and handler functions remain the same...
  async function fetchTimetables() {
    setLoadingList(true)
    setError(null)
    try {
      const response = await api.get("/api/timetables")
      const data = response.data
      setTimetables(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(
        `Failed to load timetables: ${getApiErrorMessage(err, "Failed to load timetables")}. Please check your backend connection.`,
      )
      setTimetables([])
    } finally {
      setLoadingList(false)
    }
  }

  async function fetchSupportingData() {
    try {
      const [coursesRes, facultyRes, roomsRes] = await Promise.all([
        api.get("/api/courses"),
        api.get("/api/faculty"),
        api.get("/api/rooms"),
      ])
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
      setFaculty(Array.isArray(facultyRes.data) ? facultyRes.data : [])
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : [])
    } catch (err) {
      setError(`Failed to load courses, faculty, or rooms data: ${getApiErrorMessage(err, "Unknown error")}`)
    }
  }

  async function viewTimetable(id) {
    setLoadingDetail(true)
    setSelected(null)
    setError(null)
    try {
      const response = await api.get(`/api/timetables/${id}`)
      setSelected(response.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Timetable not found.")
      } else {
        setError(`Failed to load timetable details: ${getApiErrorMessage(err, "Unknown error")}`)
      }
    } finally {
      setLoadingDetail(false)
    }
  }

  function toggleActiveDay(day) {
    setForm((current) => {
      const nextDays = current.activeDays.includes(day)
        ? current.activeDays.filter((item) => item !== day)
        : [...current.activeDays, day].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b))

      return {
        ...current,
        activeDays: nextDays.length ? nextDays : [day],
      }
    })
  }

  async function generateTimetable(e) {
    e.preventDefault()
    if (!form.department || !form.semester) {
      setError("Please fill in department and semester")
      return
    }
    setGenerating(true)
    setError(null)
    try {
      let constraints = {}
      if (form.constraintsText.trim()) {
        try {
          constraints = JSON.parse(form.constraintsText)
        } catch {
          constraints = { notes: form.constraintsText }
        }
      }
      const activeDays = form.scheduleType === "special" ? [form.specialDay] : form.activeDays
      const payload = {
        department: form.department,
        semester: Number.parseInt(form.semester),
        academicYear: Number.parseInt(form.academicYear),
        activeDays,
        constraints: {
          ...constraints,
          scheduleType: form.scheduleType,
          activeDays,
        },
      }
      const response = await api.post("/api/timetables/generate", payload)
      const newTimetable = response.data
      await fetchTimetables()
      if (newTimetable._id) {
        await viewTimetable(newTimetable._id)
      }
      setError(null)
      alert("Timetable generated successfully!")
    } catch (err) {
      setError(`Failed to generate timetable: ${getApiErrorMessage(err, "Unknown error")}`)
    } finally {
      setGenerating(false)
    }
  }

  async function optimizeSelected() {
    if (!selected) return
    setOptimizing(true)
    setError(null)
    try {
      const response = await api.post(`/api/timetables/${selected._id}/optimize`)
      const result = response.data
      await viewTimetable(selected._id)
      if (result.suggestions && result.suggestions.length > 0) {
        alert("Optimization complete!\n\nSuggestions:\n• " + result.suggestions.join("\n• "))
      } else {
        alert("Optimization completed successfully!")
      }
    } catch (err) {
      setError(`Optimization failed: ${getApiErrorMessage(err, "Unknown error")}`)
    } finally {
      setOptimizing(false)
    }
  }

  async function togglePublish(timetable) {
    setError(null)
    try {
      const newStatus = timetable.status === "published" ? "draft" : "published"
      const updatedData = { ...timetable, status: newStatus }
      await api.put(`/api/timetables/${timetable._id}`, updatedData)
      await fetchTimetables()
      if (selected && selected._id === timetable._id) {
        await viewTimetable(timetable._id)
      }
    } catch (err) {
      setError(`Failed to change timetable status: ${getApiErrorMessage(err, "Unknown error")}`)
    }
  }

  async function deleteTimetable(timetable) {
    if (!confirm(`Delete timetable "${timetable.name}"? This cannot be undone.`)) return
    setError(null)
    try {
      await api.delete(`/api/timetables/${timetable._id}`)
      await fetchTimetables()
      if (selected && selected._id === timetable._id) {
        setSelected(null)
      }
      alert("Timetable deleted successfully")
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Timetable not found.")
      } else {
        setError(`Failed to delete timetable: ${getApiErrorMessage(err, "Unknown error")}`)
      }
    }
  }

  function downloadTimetablePdf() {
    if (!selected) return
    setExportingPdf(true)
    setError(null)

    try {
      const blob = buildTimetablePdfBlob(selected, courses, faculty, rooms)
      downloadBlob(blob, getTimetablePdfFilename(selected))
    } catch (err) {
      console.error("PDF export failed:", err)
      setError("Unable to prepare the PDF download. Please try again.")
    } finally {
      setExportingPdf(false)
    }
  }

  function resetForm() {
    setForm(getDefaultFormState())
    setError(null)
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "faculty", label: "Faculty", icon: UsersIcon, path: "/faculty" },
    { id: "rooms", label: "Rooms", icon: HomeIcon, path: "/rooms" },
    { id: "timetables", label: "Timetables", icon: CalendarIconLucide, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden lg:flex-row">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <aside className="relative z-10 w-full bg-slate-800/40 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl p-4 lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
        <div className="space-y-4 lg:space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <CalendarIconLucide className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-indigo-100">Scheduler</h2>
              <p className="text-xs text-slate-400">Smart Classroom</p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeNavItem === item.id
              return (
                <Link key={item.id} to={item.path} onClick={() => setActiveNavItem(item.id)}>
                  <div
                    className={`flex min-w-max items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer lg:min-w-0 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600/30 to-indigo-600/30 text-indigo-100 shadow-lg shadow-indigo-600/20 border border-indigo-500/30 backdrop-blur-sm"
                        : "text-slate-300 hover:bg-slate-700/30 hover:text-indigo-200 backdrop-blur-sm border border-transparent hover:border-slate-600/30"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-all duration-300 ${
                        isActive ? "text-indigo-300" : "text-slate-400 group-hover:text-indigo-400"
                      } group-hover:scale-110`}
                    />
                    <span className={`font-medium transition-colors duration-300 ${isActive ? "text-indigo-100" : ""}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-4 relative z-10 overflow-auto sm:p-5 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.35fr)]">
            <div className="flex-1 space-y-4">
              <div className="mb-5 text-left sm:mb-7 lg:text-center">
                <h1 className="text-3xl font-bold leading-tight bg-gradient-to-r from-indigo-400 via-indigo-400 to-indigo-400 bg-clip-text text-transparent mb-2 sm:text-4xl xl:text-5xl">
                  Timetable Generator
                </h1>
                <p className="max-w-2xl text-indigo-200 text-sm leading-6 sm:text-lg lg:mx-auto">
                  Generate, optimize and manage academic timetables with AI assistance
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-indigo-500/10">
                <CardHeader>
                  <div className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5  text-indigo-300" />
                      Generate New Timetable
                    </CardTitle>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
                      AI Powered
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <form onSubmit={generateTimetable} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(90px,0.65fr)_minmax(130px,1fr)]">
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-2">Department</label>
                        <Input
                          value={form.department}
                          onChange={(e) => setForm({ ...form, department: e.target.value })}
                          placeholder="e.g., Computer Science"
                          required
                          className="bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-2">Semester</label>
                        <Select value={form.semester} onValueChange={(value) => setForm({ ...form, semester: value })}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 text-slate-200">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <SelectItem key={sem} value={sem.toString()} className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                                {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-2">Academic Year</label>
                        <Input
                          type="number"
                          value={form.academicYear}
                          onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                          min="2020"
                          max="2030"
                          className="bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70"
                        />
                      </div>
                    </div>
                    <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-900/30 p-3 sm:p-4">
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div>
                          <label className="block text-sm font-medium text-indigo-200">Schedule Days</label>
                          <p className="mt-1 text-xs text-slate-400">
                            Choose weekdays, include weekends, or create a one-day special class timetable.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ["weekly", "Weekly"],
                            ["special", "Special Day"],
                          ].map(([value, label]) => (
                            <Button
                              key={value}
                              type="button"
                              variant="outline"
                              onClick={() => setForm({ ...form, scheduleType: value })}
                              className={`h-11 justify-center border-slate-600/50 ${
                                form.scheduleType === value
                                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/60"
                              }`}
                            >
                              {form.scheduleType === value && <Check className="mr-2 h-4 w-4" />}
                              {label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {form.scheduleType === "weekly" ? (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                          {ALL_DAYS.map((day) => {
                            const active = form.activeDays.includes(day)
                            return (
                              <Button
                                key={day}
                                type="button"
                                variant="outline"
                                onClick={() => toggleActiveDay(day)}
                                className={`h-10 justify-center border-slate-600/50 px-2 text-sm ${
                                  active
                                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/60"
                                }`}
                              >
                                {day.slice(0, 3)}
                              </Button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="max-w-xs">
                          <label className="block text-sm font-medium text-indigo-200 mb-2">Special Class Day</label>
                          <Select
                            value={form.specialDay}
                            onValueChange={(value) => setForm({ ...form, specialDay: value })}
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 text-slate-200">
                              {ALL_DAYS.map((day) => (
                                <SelectItem key={day} value={day} className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-200 mb-2">
                        Constraints (Optional JSON or Notes)
                      </label>
                      <Textarea
                        value={form.constraintsText}
                        onChange={(e) => setForm({ ...form, constraintsText: e.target.value })}
                        placeholder='e.g., {"avoidFriday": true} or "No classes after 4 PM"'
                        rows={3}
                        className="bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-300 border border-indigo-500/30 backdrop-blur-sm"
                        disabled={generating}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {generating ? "Generating..." : "Generate Timetable"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/70 backdrop-blur-sm transition-all duration-300"
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-indigo-500/10">
                <CardHeader className="border-b border-slate-700/50 p-4 sm:p-6">
                  <CardTitle className="text-indigo-100">Existing Timetables ({timetables.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {loadingList ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-indigo-200">Loading timetables...</p>
                    </div>
                  ) : timetables.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No timetables found. Generate your first timetable above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {timetables.map((t) => (
                        <div
                          key={t._id}
                          className="flex flex-col gap-4 p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm hover:bg-slate-700/40 transition-all duration-300 border border-slate-700/50 hover:border-indigo-500/30 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-white">{t.name}</div>
                            <div className="text-sm text-slate-400">
                              {t.department} • Semester {t.semester} • {t.year}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                className={
                                  t.status === "published"
                                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0"
                                    : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                                }
                              >
                                {t.status}
                              </Badge>
                              <Badge className="bg-slate-700/50 text-slate-300 border border-slate-600/50 text-xs">
                                {t.metadata?.totalHours || 0} hours
                              </Badge>
                              {t.conflicts && t.conflicts.length > 0 && (
                                <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 text-xs">
                                  {t.conflicts.length} conflicts
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 md:flex md:items-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewTimetable(t._id)}
                              className="justify-center text-indigo-300 hover:text-white hover:bg-indigo-500/20"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePublish(t)}
                              className="justify-center bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600/50"
                            >
                              {t.status === "published" ? "Unpublish" : "Publish"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTimetable(t)}
                              className="justify-center bg-red-600/90 text-white hover:bg-red-500 border-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="w-full min-w-0 space-y-4">
              {loadingDetail ? (
                <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
                  <CardContent className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-indigo-200">Loading timetable details...</p>
                  </CardContent>
                </Card>
              ) : !selected ? (
                <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-indigo-100">Timetable Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-12">
                    <div className="text-slate-500">
                      <CalendarIconLucide className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2 text-slate-300">No Timetable Selected</p>
                      <p className="text-sm">
                        Select a timetable from the list to view details, grid, and management options.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
                    <Button
                      type="button"
                      onClick={optimizeSelected}
                      disabled={optimizing}
                      className="border border-indigo-500/30 bg-gradient-to-r from-slate-900 to-indigo-700 text-white shadow-lg shadow-indigo-950/20 transition-all duration-300 hover:from-slate-950 hover:to-indigo-600"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {optimizing ? "Optimizing..." : "Optimize Timetable"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadTimetablePdf}
                      disabled={exportingPdf}
                      className="border-slate-600/50 bg-slate-800/40 text-slate-200 transition-all duration-300 hover:border-slate-500/70 hover:bg-slate-700/50"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      {exportingPdf ? "Preparing PDF..." : "Download PDF"}
                    </Button>
                  </div>
                  <TimetableGrid timetable={selected} courses={courses} faculty={faculty} rooms={rooms} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



