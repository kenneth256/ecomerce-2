import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatSizes = (sizes: any): string => {
  if (!sizes || (Array.isArray(sizes) && sizes.length === 0)) {
    return "";
  }
  
  try {
    const allSizes: string[] = [];
    
   
    if (Array.isArray(sizes)) {
      sizes.forEach((item: any) => {
        if (typeof item === 'string') {
          // Try to parse multiple times to unwrap escaped strings
          let parsed: any = item;
          for (let i = 0; i < 5; i++) {
            try {
              parsed = JSON.parse(parsed);
            } catch {
              break;
            }
          }
          
          
          if (Array.isArray(parsed)) {
            allSizes.push(...parsed);
          } else if (parsed) {
            allSizes.push(parsed);
          }
        }
      });
    }
    
   
    const cleanSizes = allSizes
      .filter((size: any) => typeof size === 'string')
      .map((size: string) => size.trim())
      .filter((size: string) => size && /^[a-zA-Z0-9]+$/.test(size));
    
    return cleanSizes.join(", ") || " ";
  } catch (e) {
    console.error('ERROR:', e);
    return " ";
  }
};


export const formatDate = (date?: string | Date) => {
  if (!date) return '' 
  return new Date(date).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

