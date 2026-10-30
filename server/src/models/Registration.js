import mongoose from "mongoose";
import crypto from "crypto";

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
    // QR code isi par banega (Week 2 ke QR step me)
    ticketCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// ek user ek event par sirf ek ACTIVE registration rakh sakta hai.
// cancelled wale is rule se bahar hain, isliye cancel ke baad dobara register ho sakta hai
registrationSchema.index(
  { event: 1, user: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);
registrationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Registration", registrationSchema);