'use server'
import arcjet, { detectBot, request, shield, slidingWindow, validateEmail } from "@arcjet/next";

const protectPaymentRules = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    validateEmail({
      mode: "LIVE",
      block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "10m",
      max: 5,
    }),
  ],
});

export const paymentProtected = async (email: string) => {
  const req = await request();
  const decision = await protectPaymentRules.protect(req, {  
      email 
    });

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return { success: false, error: 'Unusual activity detected!' };
    }
    
    if (decision.reason.isRateLimit()) {
      return { success: false, error: 'Too many payment attempts. Please try again later.' };
    }
    
    if (decision.reason.isEmail()) {
      return { success: false, error: 'Invalid email address. Please use a valid email.' };
    }
    
    return { success: false, error: 'Payment blocked. Please try again.' };
  }

  return { success: true };
};