import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventBySlug,
  getMyEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createEventSchema, updateEventSchema } from "../utils/eventSchemas.js";

const router = Router();

router.get("/", getEvents);
router.get("/mine", protect, authorize("organizer", "admin"), getMyEvents); // /:slug se pehle
router.get("/:slug", getEventBySlug);

router.post(
  "/",
  protect,
  authorize("organizer", "admin"),
  validate(createEventSchema),
  createEvent
);
router.patch(
  "/:id",
  protect,
  authorize("organizer", "admin"),
  validate(updateEventSchema),
  updateEvent
);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteEvent);

export default router;