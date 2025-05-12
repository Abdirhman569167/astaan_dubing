"use client";

import { useState, useEffect } from "react";
import {
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import {
  Home,
  MessageCircle,
  Bell,
  Settings,
  DollarSign,
  ListChecks,
  ClipboardCheck,
  Music
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import userAuth from "@/myStore/userAuth";
import axios from "axios";

interface SoundEngineerSidebarProps {
  open?: boolean;
}

export default function SoundEngineerSidebar({ open = true }: SoundEngineerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { logoutUser } = userAuth();

  const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  const mainMenuItems = [
    { path: "/Sound-Engineer", icon: Home, label: "Dashboard" },
    { path: "/Sound-Engineer/My-Tasks", icon: ListChecks, label: "My Tasks" },  
    { path: "/Sound-Engineer/assignedTasks", icon: ClipboardCheck, label: "Assigned Tasks" },
  ];

  const toolsMenuItems = [
    { path: "/Sound-Engineer/Payments", icon: DollarSign, label: "Payments" },    
    { path: "/Sound-Engineer/Notifications", icon: Bell, label: "Notifications" },   
    { path: "/Sound-Engineer/Settings", icon: Settings, label: "Settings" },
  ];

  const closeSidebar = () => setIsOpen(false);

  const MenuSection = ({ title, items }: { title?: string; items: Array<{ path: string; icon: any; label: string }> }) => (
    <div className="space-y-1">
      {title && open && (
        <h2 className="px-4 text-sm font-medium text-[#ff4e00] uppercase tracking-wider mb-2">{title}</h2>
      )}
      {items.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center ${!open ? 'justify-center' : ''} gap-3 ${!open ? 'px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              active 
                ? "bg-[#ff4e00] text-white" 
                : "text-gray-700 hover:bg-[#fff1ec]"
            }`}
            onClick={closeSidebar}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              active 
                ? "bg-white/20" 
                : "bg-[#fff1ec]"
            }`}>
              <item.icon className={`h-5 w-5 ${
                active ? "text-white" : "text-[#ff4e00]"
              }`} />
            </div>
            {open && <span>{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {isMobile && (
        <button
          className="p-3 bg-[#ff4e00] text-white fixed top-4 left-4 z-50 rounded-lg shadow-lg hover:bg-[#e64500] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      )}

      <aside className={`fixed top-0 left-0 ${!open ? 'w-[74px]' : 'w-64'} bg-white border-r border-gray-100 h-full flex flex-col transition-transform duration-300 ease-in-out ${
        isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
      } z-40`}>
        {open ? (
          <div className="p-4 flex items-center justify-center border-b border-gray-100 mb-4">
            <div className="bg-[#fff1ec] p-3 rounded-xl flex items-center">
              <Image
                src="/logo.png"
                alt="Astaan Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
              <span className="ml-3 font-bold text-base text-[#ff4e00]">Dubbing Film</span>
            </div>
          </div>
        ) : (
          <div className="py-4 flex items-center justify-center border-b border-gray-100 mb-4">
            <div className="p-2 rounded-full flex items-center justify-center bg-[#fff1ec]">
              <Image
                src="/logo.png"
                alt="Astaan Logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}
        
        <div className={`flex-1 overflow-y-auto ${!open ? 'px-2' : 'px-3'} py-2 space-y-6`}>
          <MenuSection items={mainMenuItems} />
          <MenuSection title="TOOLS" items={toolsMenuItems} />
        </div>
        
        <div className={`${!open ? 'px-2 flex justify-center' : 'px-3'} py-4 border-t border-gray-100`}>
          <button
            onClick={handleLogout}
            className={`flex items-center ${!open ? 'justify-center w-12 h-12' : ''} gap-3 ${!open ? 'p-0' : 'px-4 py-3'} text-sm font-medium rounded-lg transition-all duration-200 ${!open ? '' : 'w-full'} text-gray-700 hover:bg-[#fff1ec]`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fff1ec]">
              <FaSignOutAlt className="h-5 w-5 text-[#ff4e00]" />
            </div>
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}