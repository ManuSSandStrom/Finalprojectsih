import { Router } from "express";
import Timetable from "../models/Timetable.js";
import { generateTimetableWithAI} from "../utils/timetableGenerator.js";

export const timetablesRouter = Router();

// Get all timetables
timetablesRouter.get("/", async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.json(timetables);
  } catch (error) {
    console.error("Error fetching timetables:", error);
    res.status(500).json({ error: "Failed to fetch timetables" });
  }
});

// Generate timetable using AI
timetablesRouter.post("/generate", async (req, res) => {
  try {
    const createdTimetable = await generateTimetableWithAI(req.body);
    res.json(createdTimetable);
  } catch (error) {
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: "Failed to generate timetable" });
  }
});

// Create new timetable
timetablesRouter.post("/", async (req, res) => {
  try {
    const timetable = new Timetable(req.body);
    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    console.error("Error creating timetable:", error);
    res.status(500).json({ error: "Failed to create timetable" });
  }
});

// Update timetable
timetablesRouter.put("/:id", async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!timetable) return res.status(404).json({ error: "Timetable not found" });
    res.json(timetable);
  } catch (error) {
    console.error("Error updating timetable:", error);
    res.status(500).json({ error: "Failed to update timetable" });
  }
});

// Delete timetable
timetablesRouter.delete("/:id", async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) return res.status(404).json({ error: "Timetable not found" });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({ error: "Failed to delete timetable" });
  }
});

// Get timetable by ID
timetablesRouter.get("/:id", async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) return res.status(404).json({ error: "Timetable not found" });
    res.json(timetable);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({ error: "Failed to fetch timetable" });
  }
});

// Validate and optimize timetable health
timetablesRouter.post("/:id/optimize", async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) return res.status(404).json({ error: "Timetable not found" });

    const conflicts = [];
    const facultySlots = new Map();
    const roomSlots = new Map();

    timetable.schedule.forEach((entry, index) => {
      const slotKey = `${entry.day}-${entry.startTime}-${entry.endTime}`;
      const facultyKey = `${entry.facultyId}-${slotKey}`;
      const roomKey = `${entry.roomId}-${slotKey}`;

      if (facultySlots.has(facultyKey)) {
        conflicts.push({
          type: "faculty_conflict",
          message: `Faculty is double-booked on ${entry.day} at ${entry.startTime}-${entry.endTime}.`,
          entries: [String(facultySlots.get(facultyKey)), String(index)],
        });
      }

      if (roomSlots.has(roomKey)) {
        conflicts.push({
          type: "room_conflict",
          message: `Room is double-booked on ${entry.day} at ${entry.startTime}-${entry.endTime}.`,
          entries: [String(roomSlots.get(roomKey)), String(index)],
        });
      }

      facultySlots.set(facultyKey, index);
      roomSlots.set(roomKey, index);
    });

    timetable.conflicts = conflicts;
    timetable.metadata = {
      ...timetable.metadata,
      conflictCount: conflicts.length,
      totalHours: timetable.schedule.length,
    };
    await timetable.save();

    res.json({
      timetable,
      suggestions: conflicts.length
        ? conflicts.map((conflict) => conflict.message)
        : ["No faculty or room conflicts were found. The timetable is ready to publish."],
    });
  } catch (error) {
    console.error("Error optimizing timetable:", error);
    res.status(500).json({ error: "Failed to optimize timetable" });
  }
});
