import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid id");
};

export const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  checkId(id);

  const event = await Event.findById(id);
  if (!event) throw new ApiError(404, "Event nahi mila");
  if (event.organizer.equals(req.user._id)) {
    throw new ApiError(400, "Apne hi event par register nahi kar sakte");
  }
  if (event.startDate <= new Date()) {
    throw new ApiError(400, "Ye event shuru ho chuka hai ya khatam ho gaya");
  }
  // payment abhi bana nahi hai, isliye paid event par free ticket nahi dena
  if (event.ticketPrice > 0) {
    throw new ApiError(400, "Paid events ke liye payment abhi supported nahi hai");
  }

  const already = await Registration.findOne({
    event: id,
    user: req.user._id,
    status: "confirmed",
  });
  if (already) throw new ApiError(409, "Tum is event par pehle se registered ho");

  // ATOMIC seat reservation: check + increment ek hi operation me
  const reserved = await Event.findOneAndUpdate(
    { _id: id, $expr: { $lt: ["$registeredCount", "$capacity"] } },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );
  if (!reserved) throw new ApiError(409, "Sorry, event full ho gaya");

  try {
    const registration = await Registration.create({
      event: id,
      user: req.user._id,
    });
    res.status(201).json({
      registration,
      seatsLeft: reserved.capacity - reserved.registeredCount,
    });
  } catch (err) {
    // registration fail hui to reserve kiya hua seat wapas do
    await Event.updateOne({ _id: id }, { $inc: { registeredCount: -1 } });
    if (err.code === 11000) {
      // do tabs se ek saath click: unique index ne dusri ko roka
      throw new ApiError(409, "Tum is event par pehle se registered ho");
    }
    throw err;
  }
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    user: req.user._id,
    status: "confirmed",
  })
    .sort({ createdAt: -1 })
    .populate("event", "title slug startDate endDate location mode coverImage");
  res.json({ registrations });
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  checkId(id);

  // sirf apni, sirf confirmed wali. Atomic hai, isliye double-cancel se seat do baar wapas nahi aayegi
  const registration = await Registration.findOneAndUpdate(
    { _id: id, user: req.user._id, status: "confirmed" },
    { status: "cancelled", cancelledAt: new Date() },
    { new: true }
  );
  if (!registration) throw new ApiError(404, "Active registration nahi mili");

  await Event.updateOne(
    { _id: registration.event, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } }
  );
  res.json({ message: "Registration cancel ho gayi" });
});