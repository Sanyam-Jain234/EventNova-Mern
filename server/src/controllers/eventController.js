import Event from "../models/Event.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import slugify from "../utils/slugify.js";
import Registration from "../models/Registration.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    slug: slugify(req.body.title),
    organizer: req.user._id,
  });
  res.status(201).json({ event });
});

export const getEvents = asyncHandler(async (req, res) => {
  const { q, category, city, mode, upcoming = "true" } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }
  if (category) filter.category = category;
  if (mode) filter.mode = mode;
  if (city) filter["location.city"] = new RegExp(`^${escapeRegex(city)}$`, "i");
  if (upcoming === "true") filter.startDate = { $gte: new Date() };

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("organizer", "name"),
    Event.countDocuments(filter),
  ]);

  res.json({
    events,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug }).populate(
    "organizer",
    "name"
  );
  if (!event) throw new ApiError(404, "Event nahi mila");
  res.json({ event });
});

export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
  res.json({ events });
});

// owner ya admin hi change kar sakta hai
async function findOwnedEvent(id, user) {
  const event = await Event.findById(id);
  if (!event) throw new ApiError(404, "Event nahi mila");
  const isOwner = event.organizer.equals(user._id);
  if (!isOwner && user.role !== "admin") {
    throw new ApiError(403, "Ye event tumhara nahi hai");
  }
  return event;
}

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await findOwnedEvent(req.params.id, req.user);

  // capacity registered logon se kam nahi ho sakti
  if (req.body.capacity && req.body.capacity < event.registeredCount) {
    throw new ApiError(400, "Capacity registered logon se kam nahi ho sakti");
  }

  Object.assign(event, req.body);
  if (event.endDate <= event.startDate) {
    throw new ApiError(400, "End date, start date ke baad honi chahiye");
  }
  await event.save();
  res.json({ event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await findOwnedEvent(req.params.id, req.user);
  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();
  res.json({ message: "Event delete ho gaya" });
});