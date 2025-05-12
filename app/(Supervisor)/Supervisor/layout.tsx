"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaBars,
} from "react-icons/fa";
import toast from "react-hot-toast";
import LoadingReuse from "@/components/LoadingReuse";
import SupervisorSidebar from "@/components/SupervisorSidebar";
import userAuth from "@/myStore/userAuth";
import Authentication from "@/service/Authentication";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const user = userAuth((state) => state.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const { logoutUser } = userAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setIsHydrated(true);

      if (user?.role !== "Supervisor") {
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
      const response = await Authentication.logout();
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

  if (user?.role !== "Supervisor") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className={`bg-white shadow-sm border-b border-gray-100 fixed top-0 right-0 z-20 transition-all duration-300 rounded-bl-3xl ${
        isMobile ? 'left-0' : sidebarOpen ? 'left-[260px]' : 'left-[74px]'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              className="text-[#ff4e00] hover:bg-[#fff1ec] rounded-full p-2 transition-all"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars className="h-5 w-5" />
            </button>
            
            <div className="hidden md:flex items-center">
              <span className="text-xl font-bold text-gray-800">Dubbing Film</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-[#fff1ec] transition-all border border-gray-100 shadow-sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="relative h-8 w-8 rounded-full border-2 border-[#ff4e00]/20 overflow-hidden flex items-center justify-center">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name || "Supervisor"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-[#ff4e00]/10 text-[#ff4e00] font-medium h-full w-full flex items-center justify-center">
                      <FaUser className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">{user?.name || "Supervisor"}</p>
                  <p className="text-xs text-gray-500">{user?.role || "Supervisor"}</p>
                </div>
                <FaChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 p-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="flex items-center gap-3 p-2 mb-1">
                    <div className="h-10 w-10 rounded-full border-2 border-[#ff4e00]/20 flex items-center justify-center overflow-hidden">
                      {user?.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt={user.name || "Supervisor"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="bg-[#ff4e00]/10 text-[#ff4e00] h-full w-full flex items-center justify-center">
                          <FaUser className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.name || "Supervisor"}</p>
                      <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 my-1"></div>

                  <Link
                    href="/Supervisor/Settings"
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[#ff4e00]/10 text-gray-700 hover:text-[#ff4e00] transition-colors w-full"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaCog className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[#ff4e00]/10 text-gray-700 hover:text-[#ff4e00] transition-colors w-full text-left"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow pt-16">
        <div className={`fixed left-0 top-0 h-full flex-shrink-0 z-30 transition-all duration-300 ${
          isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
        }`}>
          <div className={`${isMobile && 'relative'}`}>
            <SupervisorSidebar open={sidebarOpen} />
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20" 
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
        </div>

         <main className={`flex-grow p-4 md:p-6 overflow-y-auto transition-all duration-300 w-full ${
          isMobile ? 'ml-0' : sidebarOpen ? 'ml-[260px]' : 'ml-[74px]'
        }`}>
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <footer className={`bg-white py-4 border-t border-gray-200 text-center text-sm text-gray-600 transition-all duration-300 ${
        isMobile ? 'ml-0' : sidebarOpen ? 'ml-[260px]' : 'ml-[74px]'
      }`}>
        <p>© {new Date().getFullYear()} Astaan. All rights reserved.</p>
      </footer>
    </div>
  );
}
