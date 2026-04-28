import { useEffect, useState } from "react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const createDefaultData = () => ({
  code: "",
  name: "",
  department: "",
  credits: 3,
  semester: 1,
  year: new Date().getFullYear(),
  description: "",
  prerequisites: [],
  type: "lecture",
  hoursPerWeek: 3,
})

export function CourseForm({ initialData = null, onSubmit, loading }) {
  const [formData, setFormData] = useState(() => createDefaultData())
  const [prerequisiteInput, setPrerequisiteInput] = useState("")

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || "",
        name: initialData.name || "",
        department: initialData.department || "",
        credits: initialData.credits ?? 3,
        semester: initialData.semester ?? 1,
        year: initialData.year ?? new Date().getFullYear(),
        description: initialData.description || "",
        prerequisites: initialData.prerequisites || [],
        type: initialData.type || "lecture",
        hoursPerWeek: initialData.hoursPerWeek ?? 3,
      })
    } else {
      setFormData(createDefaultData())
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "credits" || name === "semester" || name === "year" || name === "hoursPerWeek"
          ? Number(value)
          : value,
    }))
  }

  const addPrerequisite = () => {
    if (prerequisiteInput.trim() && !formData.prerequisites.includes(prerequisiteInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput.trim()],
      }))
      setPrerequisiteInput("")
    }
  }

  const removePrerequisite = (prerequisite) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((p) => p !== prerequisite),
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addPrerequisite()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-950/40 via-slate-900/20 to-indigo-950/30" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/5 to-slate-200/5" />

      <div className="relative rounded-2xl border border-slate-700/60 bg-slate-950/75 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Course Code *</label>
              <Input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., CS101"
                required
                className="w-full rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div className="space-y-3">
              <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Department *</label>
              <Input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                required
                className="w-full rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Course Name *</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Introduction to Programming"
              required
              className="w-full rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-3">
              <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Credits *</label>
              <Input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                required
                min="1"
                max="10"
                className="w-full rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div className="space-y-3">
              <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Semester *</label>
              <Input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                min="1"
                max="8"
                className="w-full rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div className="space-y-3">
              <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Academic Year *</label>
              <Input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="2020"
                max="2030"
                className="w-full rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div className="space-y-3">
              <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Hours / Week *</label>
              <Input
                type="number"
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                onChange={handleChange}
                required
                min="1"
                max="40"
                className="w-full rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              required
            >
              <option value="lecture" className="bg-slate-950 text-white">
                Lecture
              </option>
              <option value="lab" className="bg-slate-950 text-white">
                Lab
              </option>
              <option value="tutorial" className="bg-slate-950 text-white">
                Seminar
              </option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter course description..."
              rows={4}
              className="w-full resize-none rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>

          <div className="space-y-4">
            <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-200">Prerequisites</label>
            <div className="flex gap-3">
              <Input
                type="text"
                value={prerequisiteInput}
                onChange={(e) => setPrerequisiteInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter prerequisite course code"
                className="w-full rounded-xl border-slate-700/70 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-300 hover:border-slate-500/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addPrerequisite}
                className="rounded-xl border-slate-700/70 bg-slate-900/75 px-6 text-slate-100 transition-all duration-300 hover:border-slate-500/80 hover:bg-slate-800/80"
              >
                Add
              </Button>
            </div>

            {formData.prerequisites.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {formData.prerequisites.map((prerequisite, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 rounded-xl border border-slate-600/60 bg-slate-800/80 px-4 py-2 text-slate-100 transition-all duration-300 hover:bg-slate-700/80"
                  >
                    {prerequisite}
                    <button
                      type="button"
                      onClick={() => removePrerequisite(prerequisite)}
                      className="ml-1 rounded-full p-1 transition-colors duration-200 hover:bg-white/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-slate-900 to-indigo-700 px-8 py-3 font-semibold tracking-wide text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-slate-950 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </div>
              ) : initialData ? (
                "Update Course"
              ) : (
                "Add Course"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


