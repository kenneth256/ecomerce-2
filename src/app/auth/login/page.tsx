"use client";

import { checkValidityLogin } from "@/actions/authSign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      if (user.role === "SUPER_ADMIN") {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [user, router]);

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = await checkValidityLogin(formData.email);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    const success = await login(formData.email, formData.password);

    if (!success) {
      toast.error("Login failed!");
      return;
    }

    toast.success("Logged in successfully!");
  };

  return (
    <div className="min-h-screen bg-[#fffefe] flex">
      <div className="hidden lg:block w-1/2 bg-amber-100 relative overflow-hidden">
        <Image
          alt="online shopping"
          fill
          src={"/images.jpg"}
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex justify-center">
            <Image
              alt="logo"
              src="/images.jpg"
              width={50}
              height={50}
              className="rounded-lg"
              priority
            />
          </div>
          <h1 className="font-bold justify-center">
            Log into Your account to continue
          </h1>
          <form onSubmit={handleSubmit} className="py-4 flex flex-col gap-3">
            <Label
              htmlFor="email"
              className="text-gray-700 font-medium text-sm mt-2"
            >
              Enter Email
            </Label>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="Enter your email"
              className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors"
              required
              value={formData.email}
              onChange={handleEventChange}
            />
            <Label
              htmlFor="password"
              className="text-gray-700 font-medium text-sm mt-2"
            >
              Enter Password
            </Label>
            <Input
              name="password"
              value={formData.password}
              onChange={handleEventChange}
              id="password"
              type="password"
              placeholder="Enter password"
              className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors"
              required
            />
            <Button
              disabled={loading}
              type="submit"
              className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-medium py-2.5 transition-colors"
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Login <ArrowRight className="w-4 h-4 mr-4" />
                </>
              )}
            </Button>
            <p className="text-center text-sm text-gray-600 mt-2">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-black font-medium hover:text-purple-700 transition-colors"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
