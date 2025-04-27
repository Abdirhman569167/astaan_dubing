"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";
import { MdEmail } from "react-icons/md";

export default function ForgetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.success("valid email address is required");
      return;
    }

    setSending(true);

    try {
      const response = await axios.post(
        `${userService}/api/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setEmail("");
        toast.success(response.data.message);
        setEmail("");
        return;
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || "Server error";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center">
      {/* Background Image with blur effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bgAstan.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
          quality={100}
        />
        <div className="absolute inset-0 backdrop-blur-sm bg-black/30"></div>
      </div>
      
      {/* Forgot Password Card */}
      <div className="bg-white rounded-2xl p-10 shadow-2xl max-w-md w-full z-10 relative mx-4">
        <div className="flex justify-center mb-6">
          <Image 
            src="/astan_Logo.png"
            alt="Astaan Logo"
            width={80}
            height={50}
            className="mb-2"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot your password?
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdEmail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="pl-10 pr-4 py-3.5 w-full border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className={`w-full py-3.5 rounded-lg text-white font-medium text-base ${
              sending
                ? "bg-orange-400 cursor-not-allowed opacity-75"
                : "bg-[#ff4e00] hover:bg-orange-700"
            } transition-all duration-200 shadow-md hover:shadow-lg mt-4`}
          >
            {sending ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-orange-600 hover:text-orange-700 font-medium transition"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
