"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import userAuth from "@/myStore/userAuth";
import Authentication from "@/service/Authentication";
import Image from "next/image";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { BsPerson } from "react-icons/bs";

export default function Login() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("employeeId"); // Default to employee ID tab
  const { loginUser } = userAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set the identifier based on which tab is active
    const identifier = activeTab === "employeeId" ? employeeId : email;

    if (!identifier || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await Authentication.login(identifier, password);

      if (response.status === 200) {
        const { role } = response.data.user;
        loginUser(response.data.user);
        toast.success(response.data.message);

        switch (role) {
          case "Admin":
            router.replace("/Admin");
            break;
          case "Translator":
            router.replace("/Translator");
            break;
          case "Supervisor":
            router.replace("/Supervisor");
            break;
          case "Voice-over Artist":
            router.replace("/Voice-over-Artist");
            break;
          case "Sound Engineer":
            router.replace("/Sound-Engineer");
            break;
          case "Editor":
            router.replace("/Editor");
            break;
          case "User":
            router.replace("/Home");
            break;
          default:
            toast.error("You are not authorized. Contact ICT Team.");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      
      {/* Login Form Card */}
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
          Astaan Film Dubbing
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Sign in to continue to your account
        </p>

        {/* Login Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            className={`py-3 rounded-lg text-center font-medium transition-colors ${
              activeTab === "employeeId"
                ? "bg-[#ff4e00]/10 text-[#ff4e00]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("employeeId")}
          >
            Employee ID
          </button>
          <button
            type="button"
            className={`py-3 rounded-lg text-center font-medium transition-colors ${
              activeTab === "email"
                ? "bg-[#ff4e00]/10 text-[#ff4e00]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("email")}
          >
            Email
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Dynamic Input based on active tab */}
          {activeTab === "employeeId" ? (
            <div>
              <label htmlFor="employeeId" className="text-sm font-medium text-gray-700 mb-2 block">
                Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BsPerson className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your employee ID"
                  className="pl-10 pr-4 py-3.5 w-full border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition duration-200"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email
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
                  placeholder="Enter Email"
                  className="pl-10 pr-4 py-3.5 w-full border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition duration-200"
                  required
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-10 pr-12 py-3.5 w-full border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition duration-200"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <MdVisibilityOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <MdVisibility className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="text-right text-sm">
            <Link
              href="/forgetpassword"
              className="text-[#ff4e00] hover:text-[#ff4e00]/80 font-medium transition"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-lg text-white font-medium text-base ${
              loading
                ? "bg-[#ff4e00] cursor-not-allowed opacity-75"
                : "bg-[#ff4e00] hover:bg-[#ff4e00]/90"
            } transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
