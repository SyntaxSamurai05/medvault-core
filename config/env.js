import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*",
  DEFAULT_SESSION_TTL_SECONDS: parseInt(process.env.DEFAULT_SESSION_TTL_SECONDS, 10) || 900
};