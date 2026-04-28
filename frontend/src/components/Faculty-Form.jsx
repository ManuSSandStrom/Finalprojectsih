import { useEffect, useState } from "react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const createDefaultFormData = () => ({
  name: "",
  email: "",
  department: "",
  specialization: [],
  maxHoursPerWeek: 20,
  availability: daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: [] }), {}),
  preferences: { preferredTimeSlots: [], avoidTimeSlots: [] },
})

export function FacultyForm({ initialData = {}, onSubmit, loading = false }) {
  const [formData, setFormData] = useState(() => createDefaultFormData())
  const [specializationInput, setSpecializationInput] = useState("")
  const [timeSlotInput, setTimeSlotInput] = useState({ day: "", start: "", end: "" })
  const [preferredInput, setPreferredInput] = useState("")
  const [avoidInput, setAvoidInput] = useState("")

  useEffect(() => {
    if (initialData?._id) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        department: initialData.department || "",
        specialization: initialData.specialization || [],
        maxHoursPerWeek: initialData.maxHoursPerWeek || 20,
        availability: daysOfWeek.reduce(
          (acc, day) => ({ ...acc, [day]: initialData.availability?.[day] || [] }),
          {},
        ),
        preferences: initialData.preferences || { preferredTimeSlots: [], avoidTimeSlots: [] },
      })
    } else {
      setFormData(createDefaultFormData())
    }
  }, [initialData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const addSpecialization = () => {
    const spec = specializationInput.trim()
    if (spec && !formData.specialization.includes(spec)) {
      setFormData((prev) => ({ ...prev, specialization: [...prev.specialization, spec] }))
      setSpecializationInput("")
    }
  }

  const removeSpecialization = (spec) => {
    setFormData((prev) => ({ ...prev, specialization: prev.specialization.filter((s) => s !== spec) }))
  }

  const addTimeSlot = () => {
    const { day, start, end } = timeSlotInput
    if (!day || !start || !end) return

    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: [...prev.availability[day], { start, end }],
      },
    }))
    setTimeSlotInput({ day: "", start: "", end: "" })
  }

  const removeTimeSlot = (day, index) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].filter((_, i) => i !== index),
      },
    }))
  }

  const addPreference = (type, value) => {
    const nextValue = value.trim()
    if (!nextValue) return

    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: [...prev.preferences[type], nextValue],
      },
    }))

    if (type === "preferredTimeSlots") {
      setPreferredInput("")
    } else {
      setAvoidInput("")
    }
  }

  const removePreference = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: prev.preferences[type].filter((_, i) => i !== index),
      },
    }))
  }

  return (
    <Card className="border-slate-700/60 bg-slate-950/75 text-slate-100 shadow-2xl backdrop-blur-xl">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle>{initialData?._id ? "Edit Faculty" : "Add New Faculty"}</CardTitle>
        <CardDescription className="text-slate-400">Fill in faculty details</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
              className="border-slate-700/70 bg-slate-900/75 text-slate-100 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>

          <div className="space-y-2">
            <Label>Max Hours/Week</Label>
            <Input
              type="number"
              value={formData.maxHoursPerWeek}
              onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })}
              min={1}
              max={40}
              required
              className="border-slate-700/70 bg-slate-900/75 text-slate-100 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label>Specialization</Label>
            <div className="flex gap-2">
              <Input
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())}
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
              <Button
                type="button"
                onClick={addSpecialization}
                variant="outline"
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 hover:bg-slate-800/80 hover:text-white"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specialization.map((spec) => (
                <Badge
                  key={spec}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-600/60 bg-slate-800/80 px-3 py-1.5 text-slate-100"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(spec)}
                    className="rounded-full p-0.5 transition-colors duration-200 hover:bg-white/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Availability</Label>
            <div className="grid grid-cols-1 items-end gap-2 md:grid-cols-4">
              <select
                value={timeSlotInput.day}
                onChange={(e) => setTimeSlotInput({ ...timeSlotInput, day: e.target.value })}
                className="h-10 rounded-md border border-slate-700/70 bg-slate-900/75 p-2 text-slate-100"
              >
                <option value="">Select Day</option>
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
              <Input
                type="time"
                value={timeSlotInput.start}
                onChange={(e) => setTimeSlotInput({ ...timeSlotInput, start: e.target.value })}
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
              <Input
                type="time"
                value={timeSlotInput.end}
                onChange={(e) => setTimeSlotInput({ ...timeSlotInput, end: e.target.value })}
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
              <Button
                type="button"
                onClick={addTimeSlot}
                variant="outline"
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 hover:bg-slate-800/80 hover:text-white"
              >
                Add Slot
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.flatMap((day) =>
                formData.availability[day]?.map((slot, idx) => (
                  <Badge
                    key={`${day}-${idx}`}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-600/60 bg-slate-800/80 px-3 py-1.5 text-slate-100"
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}: {slot.start}-{slot.end}
                    <button
                      type="button"
                      className="rounded-full p-0.5 transition-colors duration-200 hover:bg-white/10"
                      onClick={() => removeTimeSlot(day, idx)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )),
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Preferred Time Slots (e.g., "Morning", "Afternoon")</Label>
            <div className="flex gap-2">
              <Input
                value={preferredInput}
                onChange={(e) => setPreferredInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addPreference("preferredTimeSlots", preferredInput))
                }
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
              <Button
                type="button"
                onClick={() => addPreference("preferredTimeSlots", preferredInput)}
                variant="outline"
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 hover:bg-slate-800/80 hover:text-white"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferences.preferredTimeSlots.map((slot, idx) => (
                <Badge
                  key={idx}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-600/60 bg-slate-800/80 px-3 py-1.5 text-slate-100"
                >
                  {slot}
                  <button
                    type="button"
                    className="rounded-full p-0.5 transition-colors duration-200 hover:bg-white/10"
                    onClick={() => removePreference("preferredTimeSlots", idx)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Avoid Time Slots (e.g., "Friday Afternoon")</Label>
            <div className="flex gap-2">
              <Input
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreference("avoidTimeSlots", avoidInput))}
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
              <Button
                type="button"
                onClick={() => addPreference("avoidTimeSlots", avoidInput)}
                variant="outline"
                className="border-slate-700/70 bg-slate-900/75 text-slate-100 hover:bg-slate-800/80 hover:text-white"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferences.avoidTimeSlots.map((slot, idx) => (
                <Badge
                  key={idx}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-600/60 bg-slate-800/80 px-3 py-1.5 text-slate-100"
                >
                  {slot}
                  <button
                    type="button"
                    className="rounded-full p-0.5 transition-colors duration-200 hover:bg-white/10"
                    onClick={() => removePreference("avoidTimeSlots", idx)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-slate-900 to-indigo-700 py-3 font-semibold text-white shadow-2xl transition-all duration-300 hover:from-slate-950 hover:to-indigo-600"
          >
            {loading ? "Saving..." : "Save Faculty"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


