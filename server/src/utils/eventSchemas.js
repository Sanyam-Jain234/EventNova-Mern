import { z } from "zod";

const categories = ["tech", "music", "sports", "business", "education", "art", "food", "other"];

const eventBase = z.object({
  title: z.string().min(3, "Title kam se kam 3 letters ka ho").max(120),
  description: z.string().min(10, "Description thoda detail me likho").max(5000),
  category: z.enum(categories),
  mode: z.enum(["in-person", "online"]).default("in-person"),
  location: z
    .object({
      venue: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  capacity: z.coerce.number().int().min(1, "Capacity kam se kam 1 ho"),
  ticketPrice: z.coerce.number().min(0).default(0),
  coverImage: z.string().url().optional().or(z.literal("")),
});

const dateCheck = {
  check: (d) => !d.startDate || !d.endDate || d.endDate > d.startDate,
  msg: { message: "End date, start date ke baad honi chahiye", path: ["endDate"] },
};

export const createEventSchema = eventBase.refine(dateCheck.check, dateCheck.msg);

// update me sab fields optional
export const updateEventSchema = eventBase
  .partial()
  .refine(dateCheck.check, dateCheck.msg);