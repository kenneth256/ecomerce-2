"use client";
import {
  LogOut,
  ShoppingCart,
  User,
  Menu,
  Package,
  Settings,
  ArrowLeft,
  SquareDashed,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/usecartStore";
import { useAuthStore } from "@/store/useAuthStore";

const Header = () => {
  const { logout, user } = useAuthStore();
  const nav = [
    {
      item: "Home",
      href: "/",
    },
    {
      item: "Products",
      href: "/products",
    },
  ];

  const [mobileView, setMobileView] = useState<"Menu items" | "Account">(
    "Menu items"
  );
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const excludedPaths = ["/auth", "/dashboard"];

  const shouldShowHeader = !excludedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const { cartItems, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const totalQuantity = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    setCartCount(totalQuantity);
  }, [cartItems]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const renderMenuItems = () => {
    switch (mobileView) {
      case "Account":
        return (
          <div className="space-y-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileView("Menu items")}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="ml-2">Back</span>
              </Button>
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 text-lg hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
                My Account
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-2 text-lg hover:text-primary transition-colors"
              >
                <Package className="w-5 h-5" />
                Orders
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 text-lg hover:text-primary transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </nav>
          </div>
        );

      case "Menu items":
      default:
        return (
          <div className="space-y-4">
            {nav.map((navItem, key) => (
              <Link
                key={key}
                href={navItem.href}
                className="block text-lg font-medium hover:text-primary transition-colors"
              >
                {navItem.item}
              </Link>
            ))}

            <hr className="my-2" />

            <Button
              variant="ghost"
              className="w-full justify-start text-lg"
              onClick={() => setMobileView("Account")}
            >
              <User className="w-5 h-5 mr-2" />
              Account
            </Button>
          </div>
        );
    }
  };

  if (!shouldShowHeader) return null;

  return (
    <div className="h-[70px] top-0 sticky z-50 shadow-sm bg-white">
      <div className="container items-center h-full flex justify-between mx-auto px-4">
        <div className="font-bold text-xl">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            UGMART
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex gap-6">
            {nav.map((navItem, key) => (
              <Link
                key={key}
                href={navItem.href}
                className="hover:text-primary transition-colors font-medium"
              >
                {navItem.item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <div className="relative cursor-pointer hover:opacity-70 transition-opacity p-2">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
            {/* Desktop Account Menu */}
            <div className="hidden lg:block ml-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center w-fit"
                    >
                      <User className="w-5 h-5" />
                      <p className="text-sm text-muted-foreground">
                        {user?.name}
                      </p>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "SUPER_ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <SquareDashed className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex items-center w-fit"
                  >
                    <User className="w-5 h-5" />
                    <p className="text-sm font-semibold">Login</p>
                  </Button>
                </Link>
              )}
            </div>
            {/* Mobile Menu */}
            <div className="lg:hidden px-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="px-4">
                  <SheetHeader>
                    <SheetTitle>UGMART</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 mt-6">
                    {renderMenuItems()}

                    <hr className="my-2" />

                    {/* ✅ Fixed: Added onClick handler */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-lg text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
