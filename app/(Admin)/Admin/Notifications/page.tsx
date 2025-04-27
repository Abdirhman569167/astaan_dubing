"use client";

import React, { useState } from 'react';
import { BiBell, BiCheck, BiCheckCircle, BiEnvelope, BiEnvelopeOpen, BiFilter, BiSearch, BiX } from 'react-icons/bi';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  category: 'info' | 'success' | 'warning' | 'alert';
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: "We're pleased to inform you that a new customer has registered! Please follow up promptly by contacting.",
      time: 'Just Now',
      read: false,
      category: 'info'
    },
    {
      id: 2,
      message: 'Hello Sales Marketing Team, We have a special offer for our customers! Enjoy a 20% discount on selected..',
      time: '30 mins ago',
      read: false,
      category: 'success'
    },
    {
      id: 3,
      message: 'Hello Sales Marketing Team, This is a reminder to achieve this month\'s sales target. Currently, we\'re...',
      time: '2 days ago',
      read: true,
      category: 'warning'
    },
    {
      id: 4,
      message: 'Hello Sales Marketing Team, We\'ve received a product information request from a potential customer.',
      time: '5 days ago',
      read: true,
      category: 'info'
    },
    {
      id: 5,
      message: 'Hello Sales Marketing Team, A meeting or presentation has been scheduled with a customer/prospect.',
      time: '01 Feb, 2024',
      read: true,
      category: 'alert'
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(item => 
      item.id === id ? {...item, read: true} : item
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(item => ({...item, read: true})));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter !== 'all' && notification.category !== activeFilter) return false;
    if (search && !notification.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'info': return 'bg-blue-50 text-blue-600';
      case 'success': return 'bg-green-50 text-green-600';
      case 'warning': return 'bg-amber-50 text-amber-600';
      case 'alert': return 'bg-rose-50 text-rose-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'info': return <div className="bg-blue-100 p-2 rounded-full"><BiEnvelope className="text-blue-600" size={18} /></div>;
      case 'success': return <div className="bg-green-100 p-2 rounded-full"><BiCheckCircle className="text-green-600" size={18} /></div>;
      case 'warning': return <div className="bg-amber-100 p-2 rounded-full"><BiBell className="text-amber-600" size={18} /></div>;
      case 'alert': return <div className="bg-rose-100 p-2 rounded-full"><BiEnvelope className="text-rose-600" size={18} /></div>;
      default: return <div className="bg-gray-100 p-2 rounded-full"><BiBell className="text-gray-600" size={18} /></div>;
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-gray-50">
      <div className="max-w-[1500px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated with all your important alerts and messages</p>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="relative w-full lg:w-auto lg:flex-1 lg:max-w-md">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notifications..."
              className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:border-[#ff4e00] focus:ring-2 focus:ring-[#fff1ec] transition-all outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <div className="flex overflow-x-auto scrollbar-hide gap-2 bg-gray-50 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  All
                  <span className="ml-1 bg-gray-100 text-gray-600 text-xs py-0.5 px-1.5 rounded-full">{notifications.length}</span>
                </button>
                <button 
                  onClick={() => setActiveFilter('info')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'info' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Info
                </button>
                <button 
                  onClick={() => setActiveFilter('success')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'success' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Success
                </button>
                <button 
                  onClick={() => setActiveFilter('warning')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'warning' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Warning
                </button>
                <button 
                  onClick={() => setActiveFilter('alert')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'alert' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Alert
                </button>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-[#ff4e00] border border-[#ff4e00] rounded-xl hover:bg-[#fff1ec] transition-colors whitespace-nowrap"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-5 transition-colors duration-200 hover:bg-gray-50 relative ${!notification.read ? 'bg-[#fff9f6]' : ''}`}
                >
                  {!notification.read && (
                    <span className="absolute top-4 sm:top-5 right-4 sm:right-5 h-2.5 w-2.5 bg-[#ff4e00] rounded-full"></span>
                  )}
                  <div className="flex-shrink-0">
                    {getCategoryIcon(notification.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-relaxed ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {notification.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                      <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(notification.category)}`}>
                        {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                      </span>
                      <p className="text-xs text-gray-400">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                      title="Mark as read"
                    >
                      <BiCheck size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <BiEnvelopeOpen className="text-gray-400" size={28} />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">No notifications found</h3>
              <p className="text-gray-500 text-sm text-center px-4">
                {search ? `No results for "${search}"` : 'You don\'t have any notifications matching the current filter'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
