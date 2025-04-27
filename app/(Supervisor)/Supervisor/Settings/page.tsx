"use client";

import userAuth from '@/myStore/userAuth';
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const user = userAuth((state) => state.user);
  const updateUser = userAuth((state) => state.updateUser);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to change your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
       const formData = new FormData();
      formData.append('password', newPassword);

      const response = await axios.put(
        `${userService}/api/auth/users/${user.id}`,
        formData,
        { 
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true 
        }
      );

      if (response.status === 200) {
        toast.success("Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
        
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     "Failed to update password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              minLength={8}
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
