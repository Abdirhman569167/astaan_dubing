"use client";

import AdminSideBar from "@/components/AdminSideBar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import {
  FaBell,
  FaSearch,
  FaUser,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import toast from "react-hot-toast";
import LoadingReuse from "@/components/LoadingReuse";
import userAuth from "@/myStore/userAuth";
import Voice0verArtistSidebar from "@/components/Voice0verArtistSidebar";
import axios from "axios";

 interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function Voice0verArtistLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const user = userAuth((state) => state.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { logoutUser } = userAuth();;

  const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;


  useEffect(() => {
    if (user) {
      setIsHydrated(true);

      if (user?.role !== "Voice-over Artist") {
        router.push("/");
      }
    }
  }, [user, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async() => {
    try {
      const response = await axios.get(`${userService}/api/auth/logout`, 
         { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        logoutUser(); 
        router.replace("/");
        return; 
      }
    } catch (error : any) {
      const message = error.response?.data?.error || "Server error";
      toast.error(message);
    }

  };


  if (!isHydrated) {
    return <LoadingReuse />;
  }

  if (user?.role !== "Voice-over Artist") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-10 md:pl-[260px] md:ml-[262px]">
        <div className="flex items-center justify-end h-16 px-4">
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="hidden md:block mr-2 text-sm font-medium text-gray-700">
                  {user?.name || "Admin"}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#ff4e00] flex items-center justify-center text-white">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name || "Admin"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser size={14} />
                  )}
                </div>
                <FaChevronDown
                  className={`ml-1 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  size={12}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
 

                  <Link
                    href="/Admin/Setting"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaCog className="mr-3 text-[#ff4e00]" size={16} />
                    Settings
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-3 text-[#ff4e00]" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow pt-16">
        <div className="fixed left-0 top-0 h-full w-[260px] flex-shrink-0 z-30">
          <Voice0verArtistSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto md:ml-[260px]">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <footer className="bg-white py-4 border-t border-gray-200 text-center text-sm text-gray-600 md:ml-[260px]">
        <p>© {new Date().getFullYear()} Astaan. All rights reserved.</p>
      </footer>
    </div>
  );
}
