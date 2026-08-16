import type { RequestHandler } from "express";
import { registerSchema } from "../schemas/register-schema.js";
import {
  logUser,
  createUser,
  createAddress,
  getAddressesFromUserId,
} from "../services/user.service.js";
import { loginSchema } from "../schemas/login-schema.js";
import { addAddressSchema } from "../schemas/add-address-schema.js";

export const register: RequestHandler = async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success)
    return res.status(400).json({ error: "Invalid input data" });

  const { name, email, password } = result.data;

  const user = await createUser(name, email, password);
  if (!user) return res.status(400).json({ error: "E-mail already in use" });

  res.status(201).json({ error: null, user });
};

export const login: RequestHandler = async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success)
    return res.status(400).json({ error: "Invalid input data" });

  const { email, password } = result.data;
  const token = await logUser(email, password);
  if (!token) return res.status(401).json({ error: "Invalid credentials" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ error: null });
};

export const logout: RequestHandler = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ error: null });
};

export const addAddress: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: "Access denied" });

  const result = addAddressSchema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ error: "Invalid input data" });

  const address = await createAddress(userId, result.data);

  if (!address) return res.status(400).json({ error: "Failed to add address" });

  res.status(200).json({ error: null, address });
};

export const getAddresses: RequestHandler = async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: "Access denied" });

  const addresses = await getAddressesFromUserId(userId);

  res.status(200).json({ error: null, addresses });
};
