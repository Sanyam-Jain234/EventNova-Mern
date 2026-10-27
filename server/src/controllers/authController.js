import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Is email se account pehle se hai");

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ user: userResponse(user), token: generateToken(user._id) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    // dono case me same message, taaki pata na chale email exist karta hai ya nahi
    throw new ApiError(401, "Email ya password galat hai");
  }

  res.json({ user: userResponse(user), token: generateToken(user._id) });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});