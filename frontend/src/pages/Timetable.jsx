import React, { useEffect, useState } from "react"
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
  ClipboardList,
  Eye,
  RotateCcw,
  Calendar as CalendarIconLucide,
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
        return "bg-indigo-50 text-indigo-950 border border-indigo-200"
      case "lab":
        return "bg-emerald-50 text-emerald-950 border border-emerald-200"
      case "tutorial":
        return "bg-sky-50 text-sky-950 border border-sky-200"
      case "exam":
        return "bg-rose-50 text-rose-950 border border-rose-200"
      default:
        return "bg-slate-50 text-slate-950 border border-slate-200"
    }
  }

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-950">{timetable.name}</CardTitle>
            <div className="text-sm text-slate-500">
              {timetable.department} • Semester {timetable.semester} • {timetable.year}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              className={
                timetable.status === "published"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }
            >
              {timetable.status}
            </Badge>
            {timetable.conflicts && timetable.conflicts.length > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
                {timetable.conflicts.length} conflicts
              </Badge>
            )}
            <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
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
            <div className="font-semibold text-center p-3 bg-slate-100 rounded-xl text-slate-700 border border-slate-200">
              Time
            </div>
            {visibleDays.map((d) => (
              <div
                key={d}
                className="font-semibold text-center p-3 bg-slate-100 rounded-xl text-slate-700 border border-slate-200"
              >
                {d}
              </div>
            ))}

            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="contents">
                <div className="text-sm text-center p-3 bg-white rounded-xl flex items-center justify-center text-slate-500 border border-slate-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {slot}
                </div>

                {visibleDays.map((day) => {
                  const entry = getEntry(day, slot)
                  if (!entry) {
                    return (
                      <div key={`${day}-${slot}`} className="min-h-[80px] p-1">
                        <div className="h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200" />
                      </div>
                    )
                  }

                  const course = findCourse(entry.courseId)
                  const prof = findFaculty(entry.facultyId)
                  const room = findRoom(entry.roomId)

                  return (
                    <div key={`${day}-${slot}`} className="min-h-[80px] p-1">
                      <div
                        className={`p-3 rounded-xl text-xs h-full shadow-sm transition-all duration-300 ${typeColor(
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
                            <Badge variant="outline" className="text-xs px-1 py-0 bg-white/70 text-slate-700">
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

  const selectedFormDays = form.scheduleType === "special" ? [form.specialDay] : form.activeDays
  const totalScheduledClasses = timetables.reduce((total, timetable) => total + (timetable.schedule?.length || 0), 0)
  const publishedCount = timetables.filter((timetable) => timetable.status === "published").length
  const conflictCount = timetables.reduce((total, timetable) => total + (timetable.conflicts?.length || 0), 0)

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <main className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-900">
                <CalendarIconLucide className="h-4 w-4" />
                Timetable Workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Build, review, and publish schedules</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Generate AI-assisted weekly or special-day timetables, validate conflicts, and export the final grid as a PDF.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[520px] sm:grid-cols-4">
              {[
                ["Timetables", timetables.length],
                ["Published", publishedCount],
                ["Classes", totalScheduledClasses],
                ["Conflicts", conflictCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-2xl font-bold text-blue-950">{value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[430px_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Sparkles className="h-5 w-5 text-blue-900" />
                    Generator
                  </CardTitle>
                  <Badge className="border-0 bg-blue-50 text-blue-900">AI Powered</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={generateTimetable} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
                      <Input
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        placeholder="e.g., Computer Science"
                        required
                        className="h-12 border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-blue-900/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Semester</label>
                        <Select value={form.semester} onValueChange={(value) => setForm({ ...form, semester: value })}>
                          <SelectTrigger className="h-12 border-slate-200 bg-white text-slate-950 focus:ring-blue-900/20">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent className="border-slate-200 bg-white text-slate-950">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Academic Year</label>
                        <Input
                          type="number"
                          value={form.academicYear}
                          onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                          min="2020"
                          max="2030"
                          className="h-12 border-slate-200 bg-white text-slate-950 focus-visible:ring-blue-900/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800">Schedule Days</label>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Selected: {selectedFormDays.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {[
                        ["weekly", "Weekly"],
                        ["special", "Special Day"],
                      ].map(([value, label]) => (
                        <Button
                          key={value}
                          type="button"
                          variant="outline"
                          onClick={() => setForm({ ...form, scheduleType: value })}
                          className={`h-11 justify-center rounded-xl border-slate-200 ${
                            form.scheduleType === value
                              ? "bg-blue-950 text-white hover:bg-blue-900"
                              : "bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {form.scheduleType === value && <Check className="mr-2 h-4 w-4" />}
                          {label}
                        </Button>
                      ))}
                    </div>

                    {form.scheduleType === "weekly" ? (
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 xl:grid-cols-4">
                        {ALL_DAYS.map((day) => {
                          const active = form.activeDays.includes(day)
                          return (
                            <Button
                              key={day}
                              type="button"
                              variant="outline"
                              onClick={() => toggleActiveDay(day)}
                              className={`h-10 justify-center rounded-xl border-slate-200 px-2 text-sm ${
                                active
                                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                  : "bg-white text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {day.slice(0, 3)}
                            </Button>
                          )
                        })}
                      </div>
                    ) : (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Special Class Day</label>
                        <Select value={form.specialDay} onValueChange={(value) => setForm({ ...form, specialDay: value })}>
                          <SelectTrigger className="h-12 border-slate-200 bg-white text-slate-950">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent className="border-slate-200 bg-white text-slate-950">
                            {ALL_DAYS.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Constraints</label>
                    <Textarea
                      value={form.constraintsText}
                      onChange={(e) => setForm({ ...form, constraintsText: e.target.value })}
                      placeholder='Optional: {"avoidFriday": true} or "No classes after 4 PM"'
                      rows={3}
                      className="border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-blue-900/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Button
                      type="submit"
                      className="h-12 bg-blue-950 text-white shadow-sm hover:bg-blue-900"
                      disabled={generating}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {generating ? "Generating..." : "Generate Timetable"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="h-12 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <ClipboardList className="h-5 w-5 text-blue-900" />
                    Timetables
                  </CardTitle>
                  <Badge className="border border-slate-200 bg-slate-50 text-slate-700">{timetables.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {loadingList ? (
                  <div className="py-8 text-center text-slate-500">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
                    Loading timetables...
                  </div>
                ) : timetables.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
                    No timetables yet. Generate the first schedule above.
                  </div>
                ) : (
                  <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                    {timetables.map((timetable) => (
                      <div
                        key={timetable._id}
                        className={`rounded-2xl border p-4 transition ${
                          selected?._id === timetable._id
                            ? "border-blue-900 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-bold text-slate-950">{timetable.name}</div>
                            <div className="mt-1 text-sm text-slate-500">
                              {timetable.department} / Semester {timetable.semester} / {timetable.year}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge className="border border-slate-200 bg-slate-50 text-slate-700">{timetable.status}</Badge>
                              <Badge className="border border-slate-200 bg-slate-50 text-slate-700">
                                {timetable.metadata?.totalHours || 0} hours
                              </Badge>
                              {timetable.conflicts?.length > 0 && (
                                <Badge className="border-0 bg-red-100 text-red-700">{timetable.conflicts.length} conflicts</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewTimetable(timetable._id)}
                            className="justify-center border-slate-200 bg-white text-blue-900 hover:bg-blue-50"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePublish(timetable)}
                            className="justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          >
                            {timetable.status === "published" ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTimetable(timetable)}
                            className="justify-center bg-red-600 text-white hover:bg-red-500"
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

          <section className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-blue-900">Preview</div>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {selected ? selected.name : "Select a timetable"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selected
                    ? `${selected.department} / Semester ${selected.semester} / ${selected.schedule?.length || 0} scheduled classes`
                    : "Choose a timetable from the list to inspect, validate, publish, or export it."}
                </p>
              </div>

              {selected && (
                <div className="grid grid-cols-1 gap-2 sm:flex">
                  <Button
                    type="button"
                    onClick={optimizeSelected}
                    disabled={optimizing}
                    className="h-11 bg-blue-950 text-white hover:bg-blue-900"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {optimizing ? "Checking..." : "Check Conflicts"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadTimetablePdf}
                    disabled={exportingPdf}
                    className="h-11 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    {exportingPdf ? "Preparing..." : "Download PDF"}
                  </Button>
                </div>
              )}
            </div>

            {loadingDetail ? (
              <div className="grid min-h-[420px] place-items-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-500">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
                  Loading timetable details...
                </div>
              </div>
            ) : !selected ? (
              <div className="grid min-h-[520px] place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <div className="max-w-md">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-900 shadow-sm">
                    <CalendarIconLucide className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">No timetable selected</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Select an existing timetable or generate a new one. The weekly grid, conflicts, and PDF tools will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <TimetableGrid timetable={selected} courses={courses} faculty={faculty} rooms={rooms} />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

