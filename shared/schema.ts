import { z } from "zod";

// Schema for raw form input (JSON string)
export const bfhlFormSchema = z.object({
  data: z.string()
});

// Schema for API input validation
export const bfhlInputSchema = z.object({
  data: z.array(z.string())
});

export const bfhlResponseSchema = z.object({
  is_success: z.boolean(),
  user_id: z.string(),
  email: z.string(),
  roll_number: z.string(),
  numbers: z.array(z.string()),
  alphabets: z.array(z.string()),
  highest_alphabet: z.array(z.string())
});

export type BfhlFormInput = z.infer<typeof bfhlFormSchema>;
export type BfhlInput = z.infer<typeof bfhlInputSchema>;
export type BfhlResponse = z.infer<typeof bfhlResponseSchema>;