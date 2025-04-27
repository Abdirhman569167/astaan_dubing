"use client";

import React, { useState } from 'react';
import { BiBell } from 'react-icons/bi';

interface Notification {
  id: number;
  message: string;
  time: string;
}

export default function NotificationsPage() {
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      message: "We're pleased to inform you that a new customer has registered! Please follow up promptly by contacting.",
      time: 'Just Now'
    },
    {
      id: 2,
      message: 'Hello Sales Marketing Team,We have a special offer for our customers! Enjoy a 20% discount on selected..',
      time: '30 mins ago'
    },
    {
      id: 3,
      message: 'Hello Sales Marketing Team, This is a reminder to achieve this month\'s sales target. Currently, we\'re...',
      time: '2 days ago'
    },
    {
      id: 4,
      message: 'Hello Sales Marketing Team, We\'ve received a product information request from a potential customer.',
      time: '5 days ago'
    },
    {
      id: 5,
      message: 'Hello Sales Marketing Team, A meeting or presentation has been scheduled with a customer/prospect.',
      time: '01 Feb, 2024'
    }
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-4">
      <div className="mb-6">
        <span className="text-base font-medium text-gray-900">
          {notifications.length} Notification{notifications.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
          >
            <div className="mt-[3px] flex-shrink-0">
              <BiBell className="text-gray-400" size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] leading-relaxed text-gray-700">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                {notification.time}
              </p>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No notifications found
          </div>
        )}
      </div>
    </div>
  );
}
