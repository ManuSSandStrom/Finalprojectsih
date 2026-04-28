// backend/controllers/timetableGenerator.js
import Course from '../models/course.js';
import Faculty from '../models/Faculty.js';
import Room from '../models/Room.js';
import Timetable from '../models/Timetable.js';
import Notification from '../models/Notification.js';
import dotenv from 'dotenv';
import { chatCompletionText, isAiConfigured } from './openAIClient.js';

dotenv.config({ quiet: true });

if (isAiConfigured()) {
  console.log('OpenAI-compatible AI initialized successfully');
} else {
  console.warn('AI is disabled: OPENAI_API_KEY is not set in environment variables.');
}

// --- Configuration ---
const WEEKS = 13;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:15', end: '12:15' },
  { start: '14:15', end: '15:15' },
  { start: '15:15', end: '16:15' },
  { start: '16:30', end: '17:30' },
];
const BREAK_SLOT = { start: '12:15', end: '13:15' };

/**
 * Calculates the number of weekly 1-hour sessions a course requires.
 */
function getWeeklySessions(course) {
  if (course.totalHours && Number(course.totalHours) > 0) {
    return Math.ceil(Number(course.totalHours) / WEEKS);
  }
  return Number(course.hoursPerWeek) || 3;
}

/**
 * Cleans and parses the JSON response from the AI.
 */
function parseAIResponse(text) {
  if (!text || typeof text !== 'string') return [];
  const clean = text.replace(/```(?:json)?\n?/gi, '').replace(/```\n?/g, '');
  try {
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse AI JSON response:', e);
    return [];
  }
}

/**
 * Generates a timetable using an OpenAI-compatible chat completion API.
 * request: { department, semester, academicYear }
 */
export async function generateTimetableWithAI(request) {
  console.log('=== STARTING AI TIMETABLE GENERATION ===');
  console.log('Request:', request);

  if (!isAiConfigured()) {
    throw new Error('AI client is not initialized. Check OPENAI_API_KEY in backend/.env.');
  }

  try {
    const { department, semester, academicYear } = request;
    if (!department || !semester || !academicYear) {
      throw new Error('Department, semester, and academic year are required.');
    }

    const requestedDays = Array.isArray(request.activeDays) ? request.activeDays : [];
    const activeDays = requestedDays.filter(day => ALL_DAYS.includes(day));
    const scheduleDays = activeDays.length ? activeDays : DAYS;
    const timetableType = scheduleDays.length === 1 ? 'special' : 'weekly';

    // 1. Fetch all necessary data from the database
    console.log('Fetching DB data...');
    const allCourses = await Course.find({});
    const allFaculty = await Faculty.find({});
    const allRooms = await Room.find({});

    // Filter data for the specific request
    const relevantCourses = allCourses.filter(c =>
      (c.department || '').toLowerCase() === department.toLowerCase() &&
      Number(c.semester) === Number(semester)
    );

    if (relevantCourses.length === 0) {
      throw new Error(`No courses found for ${department}, Semester ${semester}. Please check your database.`);
    }

    const relevantFaculty = allFaculty.filter(f => (f.department || '').toLowerCase() === department.toLowerCase());

    // 2. Engineer the detailed prompt for the AI model
     const prompt = `
      You are an expert university timetable scheduler. Your task is to generate a complete, conflict-free timetable for the selected days.

      **Input Data:**
      - Department: "${department}"
      - Semester: ${semester}
      - Available Days: ${JSON.stringify(scheduleDays)}
      - Available Time Slots: ${JSON.stringify(TIME_SLOTS)}
      - Mandatory Daily Break (DO NOT schedule classes here): ${BREAK_SLOT.start}-${BREAK_SLOT.end}

      - Courses to Schedule (with required weekly hours):
        ${relevantCourses.map(c => `- Course Name: "${c.name}", ID: "${c._id}", Weekly Sessions: ${getWeeklySessions(c)}`).join('\n        ')}

      - Available Faculty (with their IDs and Specializations):
        ${relevantFaculty.map(f => `- Faculty Name: "${f.name}", ID: "${f._id}", Specializations: ${JSON.stringify(f.specialization || [])}`).join('\n        ')}

      - Available Rooms (with their IDs):
        ${allRooms.map(r => `- Room Name: "${r.name}", ID: "${r._id}"`).join('\n        ')}

      **Strict Rules You Must Follow:**
      1.  **Match Specializations:** You MUST assign a faculty member to a course ONLY if the course name or subject matter aligns with one of their listed specializations. This is a critical requirement.
      2.  **Assign One Faculty Per Course:** Each course must be assigned to exactly ONE faculty member for all its weekly sessions.
      3.  **Schedule All Sessions:** Ensure every course is scheduled for its required number of weekly sessions.
      4.  **No Conflicts:** A faculty member or a room cannot be in two places at once. Each time slot for a specific resource can only be used once.
      5.  **Use Provided IDs:** You MUST use the exact 'courseId', 'facultyId', and 'roomId' strings provided in the data above.
      6.  **Strictly Adhere to Format:** Return ONLY a valid JSON array of schedule entry objects. Do not include any other text, markdown, or explanations.
      7.  **Respect Selected Days:** Every "day" value must be one of these exact selected days: ${JSON.stringify(scheduleDays)}.

      **Output JSON Object Structure:**
      {
        "courseId": "string",
        "facultyId": "string",
        "roomId": "string",
        "day": "string (e.g., 'Monday')",
        "startTime": "string (e.g., '09:00')",
        "endTime": "string (e.g., '10:00')"
      }

      Generate the full timetable now.
    `;

    // 3. Call the AI API
    console.log('Sending request to AI...');
    const responseText = await chatCompletionText([
      {
        role: 'system',
        content: 'You are a strict JSON generator. Return only valid JSON with no markdown or explanation.',
      },
      { role: 'user', content: prompt },
    ], { temperature: 0.2 });
    
    console.log('AI Response received:', responseText ? 'Success' : 'Empty response');
    
    const schedule = parseAIResponse(responseText);

    if (schedule.length === 0) {
      console.error("AI Response Text:", responseText);
      throw new Error('AI failed to generate a valid schedule. The response was empty or invalid JSON.');
    }
    console.log(`AI generated ${schedule.length} schedule entries.`);

    // 4. Enrich and Save the Timetable
    const enrichedSchedule = schedule
      .filter(entry => scheduleDays.includes(entry.day))
      .map(entry => {
      const course = relevantCourses.find(c => String(c._id) === entry.courseId);
      const faculty = relevantFaculty.find(f => String(f._id) === entry.facultyId);
      const room = allRooms.find(r => String(r._id) === entry.roomId);
      return {
        ...entry,
        courseName: course ? course.name : 'Unknown',
        facultyName: faculty ? faculty.name : 'Unknown',
        roomName: room ? room.name : 'Unknown',
        timeSlot: `${entry.startTime}-${entry.endTime}`
      };
    });

    if (enrichedSchedule.length === 0) {
      throw new Error('AI did not return schedule entries for the selected day configuration.');
    }

    const totalHours = enrichedSchedule.length;
    const availableSlots = scheduleDays.length * TIME_SLOTS.length;
    const utilizationRate = Math.round((totalHours / availableSlots) * 100);

    const timetableData = {
      name: `${department} - Semester ${semester} ${academicYear}`,
      department,
      semester: String(semester),
      year: parseInt(academicYear),
      schedule: enrichedSchedule,
      conflicts: [], // AI is expected to return a conflict-free schedule
      status: 'draft',
      metadata: {
        totalHours,
        utilizationRate,
        conflictCount: 0,
        activeDays: scheduleDays,
        timetableType
      }
    };

    const timetable = new Timetable(timetableData);
    const created = await timetable.save();
    console.log(`Timetable saved successfully! ID: ${created._id}`);

    // Create a success notification
    await new Notification({
      title: 'AI Timetable Generated',
      message: `Generated timetable "${created.name}" with ${totalHours} entries.`,
      type: 'success',
    }).save();

    return created;

  } catch (err) {
    console.error('Error in generateTimetableWithAI:', err);
    // Create an error notification
    await new Notification({
      title: 'Timetable Generation Failed',
      message: err.message || 'An unknown error occurred.',
      type: 'error',
    }).save();
    throw err; // Re-throw the error to be caught by the route handler
  }
}
