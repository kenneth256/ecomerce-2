'use server'

import {arcJetProtectSign, protectProductCreate, validateLogin} from "./auth";
import { isSpoofedBot } from "@arcjet/inspect";
import { request } from "@arcjet/next";
import { error } from "console";


export async function checkValidityCredentials(email: string) {
  const req = await request();
  const decision = await arcJetProtectSign.protect(req, { 
    requested: 5, 
    email 
  });

  console.log("Arcjet decision for", email, ":", decision);

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      const emailTypes = decision.reason.emailTypes;

      if (emailTypes.includes("DISPOSABLE")) {
        return {
          success: false,
          error: "Disposable email not allowed",
          status: 403
        };
      }

      if (emailTypes.includes("INVALID")) {
        return {
          success: false,
          error: "Invalid email format",
          status: 403
        };
      }

      if (emailTypes.includes("NO_MX_RECORDS")) {
        return {
          success: false,
          error: "Email domain cannot receive emails",
          status: 403
        };
      }

      if (emailTypes.includes("NO_GRAVATAR")) {
        return {
          success: false,
          error: "No Gravatar associated with this email",
          status: 403
        };
      }

      return {
        success: false,
        error: "Email validation failed",
        status: 403
      };
    }

    if (decision.reason.isRateLimit()) {
      return {
        success: false,
        error: "Too many requests. Please try again later",
        status: 429
      };
    }

    if (decision.reason.isBot()) {
      return {
        success: false,
        error: "Bot detected",
        status: 403
      };
    }

    if (decision.reason.isShield()) {
      return {
        success: false,
        error: "Access blocked by security shield",
        status: 403
      };
    }

    return {
      success: false,
      error: "Access forbidden",
      status: 403
    };
  }

  if (decision.ip.isHosting()) {
    return {
      success: false,
      error: "Forbidden - Hosting IP detected",
      status: 403
    };
  }

  if (decision.results.some(isSpoofedBot)) {
    return {
      success: false,
      error: "Forbidden - Spoofed bot detected",
      status: 403
    };
  }

  return {
    success: true
  };
}


export async function checkValidityLogin(email: string) {
  const req = await request();
  const decision = await validateLogin.protect(req, { 
    email 
  });

  console.log("Arcjet decision for", email, ":", decision);

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      const emailTypes = decision.reason.emailTypes;

      if (emailTypes.includes("DISPOSABLE")) {
        return {
          success: false,
          error: "Disposable email not allowed",
          status: 403
        };
      }

      if (emailTypes.includes("INVALID")) {
        return {
          success: false,
          error: "Invalid email format",
          status: 403
        };
      }

      if (emailTypes.includes("NO_MX_RECORDS")) {
        return {
          success: false,
          error: "Email domain cannot receive emails",
          status: 403
        };
      }

      if (emailTypes.includes("NO_GRAVATAR")) {
        return {
          success: false,
          error: "No Gravatar associated with this email",
          status: 403
        };
      }

      return {
        success: false,
        error: "Email validation failed",
        status: 403
      };
    }

    if (decision.reason.isRateLimit()) {
      return {
        success: false,
        error: "Too many requests. Please try again later",
        status: 429
      };
    }

    if (decision.reason.isBot()) {
      return {
        success: false,
        error: "Bot detected",
        status: 403
      };
    }

    if (decision.reason.isShield()) {
      return {
        success: false,
        error: "Access blocked by security shield",
        status: 403
      };
    }

    return {
      success: false,
      error: "Access forbidden",
      status: 403
    };
  }
  return {
    success: true
  };
}


export async function productProtect() {
  const req = await request();
  const decision = await protectProductCreate.protect(req);
  
  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return {
        success: false,
        status: 403,
        error: "Bot activity detected!"
      };
    }
    
    if (decision.reason.isRateLimit()) {
      return {
        success: false,
        status: 429, 
        error: "Too much activity, try again after sometime!"
      };
    }
    
    if (decision.reason.isShield()) {
      return {
        success: false,
        status: 403,
        error: "Unusual activity detected!"
      };
    }
    
   
    return {
      success: false,
      status: 403,
      error: "Access denied!"
    };
  }
  
  return { success: true };
}