import { NextResponse } from "next/server";
import { bfhlInputSchema } from "@/lib/schema";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = bfhlInputSchema.parse(body);
    
    // Separate numbers and alphabets
    const numbers = data.filter(item => !isNaN(Number(item)));
    const alphabets = data.filter(item => /^[A-Za-z]$/.test(item));
    
    // Find highest alphabet (case insensitive)
    const highest_alphabet = alphabets.length > 0 ? 
      [alphabets.reduce((max, curr) => 
        curr.toLowerCase() > max.toLowerCase() ? curr : max
      )] : [];

    return NextResponse.json({
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
      return NextResponse.json({ 
        is_success: false,
        message: "Invalid input format"
      }, { status: 400 });
    }
    return NextResponse.json({
      is_success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ operation_code: 1 });
}
