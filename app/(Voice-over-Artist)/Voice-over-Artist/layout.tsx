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
import { BiBell } from "react-icons/bi";
import toast from "react-hot-toast";
import LoadingReuse from "@/components/LoadingReuse";
import userAuth from "@/myStore/userAuth";
import Voice0verArtistSidebar from "@/components/Voice0verArtistSidebar";
import axios from "axios";

 interface AdminLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
  read?: boolean;
  category?: 'info' | 'success' | 'warning' | 'alert';
  time?: string;
}

export default function Voice0verArtistLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const user = userAuth((state) => state.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastOpenedTime, setLastOpenedTime] = useState<Date | null>(null);

  const { logoutUser } = userAuth();;

  const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

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

    // Load lastOpenedTime from localStorage
    const storedTime = localStorage.getItem('lastNotificationOpenTime');
    if (storedTime) {
      setLastOpenedTime(new Date(storedTime));
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
      
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL}/api/notifications/user/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        
        // Transform the notifications
        const formattedNotifications = data.data.map((notification: Notification) => ({
          ...notification,
          read: false, // Default as unread
          time: formatTimeAgo(new Date(notification.created_at))
        }));
        
        setNotifications(formattedNotifications);
        
        // Only count notifications that came after the last time notifications were opened
        if (lastOpenedTime) {
          const newNotifications = formattedNotifications.filter(
            (n: Notification) => new Date(n.created_at) > lastOpenedTime
          );
          setUnreadCount(newNotifications.length);
        } else {
          setUnreadCount(formattedNotifications.length);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, lastOpenedTime]);

  // Helper function to format date as time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 1) return 'Just Now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(item => 
      item.id === id ? {...item, read: true} : item
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

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

  const viewAllNotifications = () => {
    setIsNotificationOpen(false);
    router.push('/Voice-over-Artist/Notifications');
  };

  const handleNotificationClick = () => {
    if (!isNotificationOpen) {
      // When opening notifications, set the current time as the last opened time
      const now = new Date();
      setLastOpenedTime(now);
      // Store in localStorage for persistence across refreshes
      localStorage.setItem('lastNotificationOpenTime', now.toISOString());
      // Reset the unread count to zero
      setUnreadCount(0);
    }
    setIsNotificationOpen(!isNotificationOpen);
  };

  if (!isHydrated) {
    return <LoadingReuse />;
  }

  if (user?.role !== "Voice-over Artist") {
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
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                className="flex items-center justify-center p-2 rounded-full hover:bg-[#fff1ec] transition-all relative"
                onClick={handleNotificationClick}
              >
                <BiBell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4e00] text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-auto bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    <Link href="/Voice-over-Artist/Notifications" className="text-sm text-[#ff4e00] hover:underline">
                      View All
                    </Link>
                  </div>
                  
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff4e00]"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-[#fff9f6]' : ''}`}
                        >
                          <div className="flex">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-[#ff4e00] hover:underline ml-2"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-gray-100 text-center">
                    <button 
                      onClick={viewAllNotifications}
                      className="text-sm text-[#ff4e00] hover:underline"
                    >
                      See all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-[#fff1ec] transition-all border border-gray-100 shadow-sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="relative h-8 w-8 rounded-full border-2 border-[#ff4e00]/20 overflow-hidden flex items-center justify-center">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name || "Voice-over Artist"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-[#ff4e00]/10 text-[#ff4e00] font-medium h-full w-full flex items-center justify-center">
                      <FaUser className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">{user?.name || "Voice-over Artist"}</p>
                  <p className="text-xs text-gray-500">{user?.role || "Voice-over Artist"}</p>
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
                          alt={user.name || "Voice-over Artist"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="bg-[#ff4e00]/10 text-[#ff4e00] h-full w-full flex items-center justify-center">
                          <FaUser className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.name || "Voice-over Artist"}</p>
                      <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 my-1"></div>

                  <Link
                    href="/Voice-over-Artist/Settings"
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
            <Voice0verArtistSidebar open={sidebarOpen} />
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
