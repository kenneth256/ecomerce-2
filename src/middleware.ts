import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { useAuthStore } from "./store/useAuthStore";



const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signup",
];

// Routes requiring SUPER_ADMIN role
const adminOnlyRoutes = [
  "/dashboard",
  "/super_admin",
];

// Routes requiring authentication (any role)
const protectedRoutes = [
  "/account",
  "/cart",
  "/checkout",
  "/user",
  "/cart",
];

// ====================
// HELPER FUNCTIONS
// ====================

function normalizePathname(pathname: string): string {
  // Remove trailing slashes but keep root "/"
  return (pathname.replace(/\/+$/, "") || "/").toLowerCase();
}

function isPublicRoute(pathname: string): boolean {
  // Exact match for public routes
  if (publicRoutes.includes(pathname)) return true;
  
  // Products pages are public
  if (pathname.startsWith("/products")) return true;
  
  return false;
}

function isAdminRoute(pathname: string): boolean {
  return adminOnlyRoutes.some(route => 
    pathname === route.toLowerCase() || pathname.startsWith(route.toLowerCase() + "/")
  );
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => 
    pathname === route.toLowerCase() || pathname.startsWith(route.toLowerCase() + "/")
  );
}

function extractRole(payload: any): string {
  if (!payload || typeof payload !== "object") return "";
  
  // Check common role field patterns
  if ("role" in payload && payload.role) {
    return String(payload.role).toUpperCase();
  }
  
  if ("roles" in payload && Array.isArray(payload.roles) && payload.roles[0]) {
    return String(payload.roles[0]).toUpperCase();
  }
  
  if ("user" in payload && payload.user?.role) {
    return String(payload.user.role).toUpperCase();
  }
  
  return "";
}

// ====================
// MIDDLEWARE FUNCTION
// ====================

export async function middleware(request: NextRequest) {
  const rawPath = request.nextUrl.pathname;
  const pathname = normalizePathname(rawPath);
  
  // Get token from multiple possible cookie names
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;


  // Skip middleware for internal Next.js routes and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ---------- CHECK ROUTE TYPE ----------
  const isPublic = isPublicRoute(pathname);
  const isAdmin = isAdminRoute(pathname);
  const isProtected = isProtectedRoute(pathname);



  // ---------- NO TOKEN HANDLING ----------
  if (!accessToken) {
    
    if (isPublic) {
      console.log("✅ PUBLIC ROUTE - ALLOWED");
      return NextResponse.next();
    }
    
    console.log("🔒 REDIRECT TO LOGIN");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ---------- TOKEN VERIFICATION ----------

  if (!process.env.JWT_SECRET) {
  
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    return response;
  }

  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const role = extractRole(payload);
    const isSuperAdmin = role === "SUPER_ADMIN";
    const isUser = role === "USER";

  

    // Redirect logged-in users away from auth pages
    if (pathname === "/auth/login" || pathname === "/auth/signup") {
      const redirectTo = isSuperAdmin ? "/dashboard" : "/";
      console.log("🔄 LOGGED IN - REDIRECT TO:", redirectTo);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Check admin-only routes
    if (isAdmin) {
    
      if (!isSuperAdmin) {
       
        return NextResponse.redirect(new URL("/", request.url));
      }
      console.log("✅ SUPER_ADMIN - ALLOWED");
      return NextResponse.next();
    }

    // Protected routes - any authenticated user
    if (isProtected) {
    
      return NextResponse.next();
    }

    // Public routes - allow authenticated users
    if (isPublic) {
    
      return NextResponse.next();
    }

   
    return NextResponse.next();

  } catch (error) {
    
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    return response;
  } finally {
    console.log("=".repeat(50));
  }
}

// ====================`
// MIDDLEWARE CONFIG
// ====================

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};