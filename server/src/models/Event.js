import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true, maxlength: 5000 },
    category: {
      type: String,
      required: true,
      enum: ["tech", "music", "sports", "business", "education", "art", "food", "other"],
    },
    mode: { type: String, enum: ["in-person", "online"], default: "in-person" },
    location: {
      venue: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    ticketPrice: { type: Number, default: 0, min: 0 },
    coverImage: { type: String, default: "" },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// searching/filtering fast karne ke liye indexes
eventSchema.index({ startDate: 1 });
eventSchema.index({ category: 1, "location.city": 1 });
eventSchema.index({ organizer: 1 });

export default mongoose.model("Event", eventSchema);