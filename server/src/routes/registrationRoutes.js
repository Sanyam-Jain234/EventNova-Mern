import { Router } from "express";
import {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} from "../controllers/registrationController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/events/:id/register", protect, registerForEvent);
router.get("/registrations/mine", protect, getMyRegistrations);
router.delete("/registrations/:id", protect, cancelRegistration);

export default router;