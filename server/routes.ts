import type { Express } from "express";
import { createServer, type Server } from "http";
import { bfhlInputSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST endpoint for processing arrays
  app.post("/api/bfhl", async (req, res) => {
    try {
      const { data } = bfhlInputSchema.parse(req.body);
      
      // Separate numbers and alphabets
      const numbers = data.filter(item => !isNaN(Number(item)));
      const alphabets = data.filter(item => /^[A-Za-z]$/.test(item));
      
      // Find highest alphabet (case insensitive)
      const highest_alphabet = alphabets.length > 0 ? 
        [alphabets.reduce((max, curr) => 
          curr.toLowerCase() > max.toLowerCase() ? curr : max
        )] : [];

      res.json({
        is_success: true,
        user_id: "john_doe_17091999", 
        email: "john@xyz.com",
        roll_number: "ABCD123",
        numbers,
        alphabets,
        highest_alphabet
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          is_success: false,
          message: "Invalid input format"
        });
      } else {
        res.status(500).json({
          is_success: false,
          message: "Internal server error"
        });
      }
    }
  });

  // GET endpoint returning operation code
  app.get("/api/bfhl", (_req, res) => {
    res.json({ operation_code: 1 });
  });

  return createServer(app);
}
