
import arcjet, { shield, detectBot, tokenBucket, validateEmail, fixedWindow } from "@arcjet/next";

export const arcJetProtectSign = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    
   
    validateEmail({
      mode: "LIVE",
      block: [
        "DISPOSABLE",
        "INVALID",
        "NO_MX_RECORDS",
        
      ],
    }),
    
    tokenBucket({
      mode: "LIVE",
      characteristics: ["email"],
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export const validateLogin = arcjet({

  key: process.env.ARCJET_KEY!,

  rules: [

    validateEmail({

      mode: "LIVE", 

    
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],

    }),

  ],

});

export const protectProductCreate = arcjet({

  key: process.env.ARCJET_KEY!,

  rules: [

    detectBot({

      mode: "LIVE", 
      allow: [
      ],

    }),
        fixedWindow({

      mode: "LIVE", 

      window: "500s", 

      max: 5, 

    }),
    shield({

      mode: "LIVE",

    }),
  ],

});



