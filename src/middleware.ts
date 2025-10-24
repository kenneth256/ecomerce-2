// // ...existing code...
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const rawPath = request.nextUrl.pathname;
  // Normalize: remove trailing slashes (but keep root "/") and lowercase for comparisons
  const pathname = (rawPath.replace(/\/+$/, "") || "/").toLowerCase();

  // support multiple cookie names
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;

  console.log("=".repeat(40));
  console.log("🔍 RAW PATH:", rawPath);
  console.log("🔍 NORM PATH:", pathname);
  console.log("🔑 HAS TOKEN:", !!accessToken);

  // Allow internals & static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/listing", "/cart", "/dashboard/public"];
  const isProductRoute = pathname.startsWith("/products");

  if (!accessToken) {
    if (publicRoutes.includes(pathname) || isProductRoute) {
      console.log("✅ PUBLIC ROUTE - ALLOWED");
      return NextResponse.next();
    }
    console.log("❌ NO TOKEN - REDIRECT TO LOGIN");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET not set");
    const resp = NextResponse.redirect(new URL("/auth/login", request.url));
    resp.cookies.delete("accessToken");
    resp.cookies.delete("refreshToken");
    return resp;
  }

  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    // robust role extraction
    let role = "";
    if (payload && typeof payload === "object") {
      if ("role" in payload && (payload as any).role) role = String((payload as any).role);
      else if ("roles" in payload && Array.isArray((payload as any).roles))
        role = String(((payload as any).roles as string[])[0] || "");
      else if ("user" in payload && (payload as any).user?.role)
        role = String((payload as any).user.role);
    }
    role = role.toUpperCase();
    console.log("👤 ROLE:", role);
    console.log("📦 PAYLOAD:", payload);

    // redirect away from auth pages if already logged in
    if (pathname === "/auth/login" || pathname === "/auth/signup") {
      const redirectTo = role === "SUPER_ADMIN" ? "/dashboard" : "/";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // admin-only areas (handle both /dashboard and /super_admin)
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/super_admin")) {
      if (role === "SUPER_ADMIN") {
        console.log("✅ SUPER_ADMIN - ALLOW");
        return NextResponse.next();
      }
      console.log("❌ NOT SUPER_ADMIN - REDIRECT HOME");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // user area: allow USER and SUPER_ADMIN
    if (pathname.startsWith("/user")) {
      if (role === "USER" || role === "SUPER_ADMIN") {
        console.log("✅ USER AREA - ALLOW");
        return NextResponse.next();
      }
      console.log("❌ NOT USER - REDIRECT HOME");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // authenticated -> allow
    return NextResponse.next();
  } catch (err) {
    console.error("❌ JWT VERIFY FAILED:", err);
    const resp = NextResponse.redirect(new URL("/auth/login", request.url));
    resp.cookies.delete("accessToken");
    resp.cookies.delete("refreshToken");
    return resp;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
// ...existing code...