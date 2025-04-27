"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingReuse from "@/components/LoadingReuse";
import { FiEdit, FiEye, FiX, FiUpload, FiTrash2, FiAlertTriangle } from "react-icons/fi";

const userRoles = [
  "User",
  "Admin",
  "Translator", 
  "Supervisor",
  "Voice-over Artist",
  "Sound Engineer",
  "Editor"
];

 const getInitials = (name: string) => {
  if (!name) return "?";
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

 const stringToColor = (str: string) => {
  if (!str) return "#6366f1";  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

 const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-purple-100 text-purple-800";
    case "Supervisor":
      return "bg-indigo-100 text-indigo-800";
    case "Translator":
      return "bg-blue-100 text-blue-800";
    case "Voice-over Artist":
      return "bg-teal-100 text-teal-800";
    case "Sound Engineer":
      return "bg-green-100 text-green-800";
    case "Editor":
      return "bg-amber-100 text-amber-800";
    case "User":
      return "bg-sky-100 text-sky-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

 const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Inactive":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

 const UserDetailModal = ({ user, onClose, onEdit, onDelete }: { 
  user: any; 
  onClose: () => void; 
  onEdit: (userId: number) => void;
  onDelete: (user: any) => void;
}) => {
  if (!user) return null;
  
  const hasAvatar = user.avatar && user.avatar !== "null" && user.avatar !== "undefined";
  const bgColor = stringToColor(user.name);
  const initials = getInitials(user.name);
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div 
        className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={24} className="text-gray-600" />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <div className="h-32 w-32 relative rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-white">
                {hasAvatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.style.backgroundColor = bgColor;
                      target.parentElement!.innerHTML += `<div class="flex items-center justify-center w-full h-full text-white text-3xl font-semibold">${initials}</div>`;
                    }}
                  />
                ) : (
                  <div 
                    className="flex items-center justify-center w-full h-full text-white text-3xl font-semibold" 
                    style={{ backgroundColor: bgColor }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="border-b border-gray-200 pb-4 mb-5">
                <h3 className="text-2xl font-semibold mb-1">{user.name}</h3>
                <p className="text-gray-500 flex items-center">
                  <span className="inline-block w-6 h-6 bg-gray-100 rounded-full text-center text-xs mr-2">ID</span>
                  {user.id}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-sm text-gray-500 font-medium mb-1">Email</p>
                  <p className="font-medium flex items-center">
                    <span className="mr-2 text-[#ff4e00]">📧</span>
                    {user.email}
                  </p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-sm text-gray-500 font-medium mb-1">Phone</p>
                  <p className="font-medium flex items-center">
                    <span className="mr-2 text-[#ff4e00]">📞</span>
                    {user.phone}
                  </p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-sm text-gray-500 font-medium mb-1">Joined Date</p>
                  <p className="font-medium flex items-center">
                    <span className="mr-2 text-[#ff4e00]">📅</span>
                    {user.joinDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => {
                onClose();
                onDelete(user);
              }}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Delete User
            </button>
            <button
              onClick={() => onClose()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(user.id)}
              className="px-4 py-2 bg-[#ff4e00] text-white rounded-md hover:bg-[#ff4e00]/90 transition-colors"
            >
              Edit User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userList, setUserList] = useState<any[]>([]);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  const getUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(`${userService}/api/auth/users`);
      if (response.status === 200) {
        setUserList(response.data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.mobile || "N/A",
          role: user.role,
          status: "Active",  
          avatar: user.profile_image,
          joinDate: new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        })));
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || "Server error";
      toast.error(message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = userList.filter((user: any) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (selectedTab !== "all") {
       switch(selectedTab) {
        case "user":
          matchesTab = user.role === "User";
          break;
        case "admin":
          matchesTab = user.role === "Admin";
          break;
        case "translator":
          matchesTab = user.role === "Translator";
          break;
        case "supervisor":
          matchesTab = user.role === "Supervisor";
          break;
        case "voice-over-artist":
          matchesTab = user.role === "Voice-over Artist";
          break;
        case "sound-engineer":
          matchesTab = user.role === "Sound Engineer";
          break;
        case "editor":
          matchesTab = user.role === "Editor";
          break;
        default:
          matchesTab = true;
      }
    }

    return matchesSearch && matchesTab;
  });

  const handleAddNewUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (userId: number) => {
    const user = userList.find((u: any) => u.id === userId);
    if (user) {
      setViewingUser(null); 
      setEditingUser(user);
    }
  };

  const handleViewUser = (userId: number) => {
    const user = userList.find((u: any) => u.id === userId);
    if (user) {
      setViewingUser(user);
    }
  };
  
  const handleDeleteUser = async (userId: number) => {
    try {
      setIsDeleting(true);
      const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
      const response = await axios.delete(`${userService}/api/auth/users/${userId}`);
      
      if (response.status === 200) {
        toast.success(response.data.message || "User deleted successfully");
        getUsers();  
        setDeleteConfirmUser(null);  
      } else {
        toast.error(response.data.message || "Failed to delete user");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to delete user";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

   const EditUserModal = ({ user, onClose }: { user: any; onClose: () => void }) => {
    if (!user) return null;
    
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);
    const [role, setRole] = useState(user.role);
    const [previewImage, setPreviewImage] = useState(user.avatar);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    
    const handleImageClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        
         const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        setLoading(true);
        
        const formData = new FormData();
  
        if(name) formData.append('name', name);
  
        if(email) formData.append('email', email);
  
        if(phone) formData.append('mobile', phone);
  
        if(role) formData.append('role', role);
        
        if(selectedFile) formData.append('profileImage', selectedFile);
  
        const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
        const response = await axios.put(
          `${userService}/api/auth/users/${user.id}`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (response.status === 200) {
          toast.success(response.data.message);
          getUsers();
          onClose();
        }
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to update user";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    
    const hasAvatar = previewImage && previewImage !== "null" && previewImage !== "undefined";
    const bgColor = stringToColor(name);
    const initials = getInitials(name);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
                <button 
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX size={24} className="text-gray-600" />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <div 
                    className="h-32 w-32 relative rounded-full overflow-hidden border-4 border-white shadow-md mb-4 cursor-pointer group"
                    onClick={handleImageClick}
                  >
                    {hasAvatar ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewImage}
                          alt={name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <FiUpload className="text-white text-2xl" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <div 
                          className="flex items-center justify-center w-full h-full text-white text-3xl font-semibold" 
                          style={{ backgroundColor: bgColor }}
                        >
                          {initials}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <FiUpload className="text-white text-2xl" />
                        </div>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    name="profile_image"
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-sm text-gray-500 mb-4">Click to change avatar</p>
                  
                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {userRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <input
                      type="text"
                      value={user.id}
                      disabled
                      className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">User ID cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="mobile"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-xs text-gray-400">Joined: {user.joinDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md mr-3 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#ff4e00] text-white rounded-md hover:bg-[#ff4e00]/90 flex items-center"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

   const AddUserModal = ({ onClose }: { onClose: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("User");
    const [password, setPassword] = useState("");
    const [previewImage, setPreviewImage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formError, setFormError] = useState("");
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    
    const handleImageClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");
      
      if (!name || !email || !password || !phone) {
        toast.error("All fields are required: name, email, password, and mobile");
        return;
      }
      
       const trimmedPhone = phone.trim();
      
      try {
        setLoading(true);
        
        const formData = new FormData();

        formData.append('name', name);
        formData.append('email', email);
        formData.append('mobile', trimmedPhone);
        formData.append('role', role);
        formData.append('password', password);
        if(selectedFile) formData.append('profileImage', selectedFile);

        const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
        const response = await axios.post(
          `${userService}/api/auth/register`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
         if (response.status === 201 || (response.data && response.data.success)) {
          toast.success(response.data.message || "User created successfully");
          getUsers();
          onClose();
        } else {
          setFormError(response.data.message || "Failed to create user");
          toast.error(response.data.message || "Failed to create user");
        }
      } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to create user";
        setFormError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    
    const hasAvatar = previewImage && previewImage !== "null" && previewImage !== "undefined";
    const bgColor = stringToColor(name || "User");
    const initials = getInitials(name || "User");
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
                <button 
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX size={24} className="text-gray-600" />
                </button>
              </div>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {formError}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <div 
                    className="h-32 w-32 relative rounded-full overflow-hidden border-4 border-white shadow-md mb-4 cursor-pointer group"
                    onClick={handleImageClick}
                  >
                    {hasAvatar ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewImage}
                          alt={name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <FiUpload className="text-white text-2xl" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <div 
                          className="flex items-center justify-center w-full h-full text-white text-3xl font-semibold" 
                          style={{ backgroundColor: bgColor }}
                        >
                          {initials}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <FiUpload className="text-white text-2xl" />
                        </div>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    name="profileImage"
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-sm text-gray-500 mb-4">Click to upload avatar</p>
                  
                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {userRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="mobile"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter phone number"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Phone number must be unique (Example: 1234567)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md mr-3 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#ff4e00] text-white rounded-md hover:bg-[#ff4e00]/90 flex items-center"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

   const DeleteConfirmModal = ({ user, onClose, onConfirm }: { user: any; onClose: () => void; onConfirm: () => void }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full pointer-events-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={24} className="text-gray-600" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-center text-yellow-500 mb-4">
                <FiAlertTriangle size={48} />
              </div>
              <p className="text-center mb-2">Are you sure you want to delete this user?</p>
              <p className="text-center font-semibold">{user.name}</p>
              <p className="text-center text-sm text-gray-500">{user.email}</p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Users</h1>
            <p className="text-gray-600">Manage and view all users in the system</p>
          </div>
          <button
            className="mt-4 sm:mt-0 bg-[#ff4e00] hover:bg-[#ff4e00]/90 text-white flex items-center gap-2 px-5 py-2.5 rounded-md font-medium transition-all shadow-sm"
            onClick={handleAddNewUser}
          >
            <span>Add New User</span>
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl mb-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-grow">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Search Users</label>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="pl-4 pr-4 py-2.5 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="mt-7">
                <button
                  className="border border-gray-200 rounded-md px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700"
                  onClick={() => {
                    setSelectedRole("all");
                    setSearchQuery("");
                    setSelectedTab("all");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex overflow-x-auto space-x-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
            <button
              className={`px-4 py-2.5 rounded-md transition-all ${selectedTab === 'all' ? 'bg-gray-100 shadow-sm font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setSelectedTab("all")}
            >
              All Users
            </button>
            {userRoles.map(role => {
              const tabValue = role.toLowerCase().replace(/\s+/g, '-');
              const displayText = role + 's';
              
              return (
                <button
                  key={role}
                  className={`px-4 py-2.5 rounded-md whitespace-nowrap transition-all ${selectedTab === tabValue ? 'bg-gray-100 shadow-sm font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setSelectedTab(tabValue)}
                >
                  {displayText}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <LoadingReuse />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={() => {
                    setSelectedRole("all");
                    setSearchQuery("");
                    setSelectedTab("all");
                  }}
                  className="text-[#ff4e00] font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user: any) => {
                  const hasAvatar = user.avatar && user.avatar !== "null" && user.avatar !== "undefined";
                  const bgColor = stringToColor(user.name);
                  const initials = getInitials(user.name);
                  
                  return (
                    <div
                      key={user.id}
                      className="bg-white overflow-hidden border border-gray-100 hover:border-[#ff4e00]/30 transition-all shadow-sm hover:shadow rounded-xl"
                    >
                      <div className="p-6 flex flex-col items-center text-center">
                        <div className="relative">
                          <div className="h-20 w-20 relative rounded-full overflow-hidden border-2 border-white shadow mb-3 bg-white">
                            {hasAvatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                   const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.parentElement!.style.backgroundColor = bgColor;
                                  target.parentElement!.innerHTML += `<div class="flex items-center justify-center w-full h-full text-white text-xl font-semibold">${initials}</div>`;
                                }}
                              />
                            ) : (
                              <div 
                                className="flex items-center justify-center w-full h-full text-white text-xl font-semibold" 
                                style={{ backgroundColor: bgColor }}
                              >
                                {initials}
                              </div>
                            )}
                          </div>
                          <span
                            title={user.status}
                            className={`absolute bottom-3 right-0 h-4 w-4 rounded-full border-2 border-white ${
                              user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          ></span>
                        </div>

                        <h3 className="font-medium text-gray-900 mb-0.5">{user.name}</h3>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full mb-3 ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>

                        <div className="w-full space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center justify-center gap-1.5 overflow-hidden text-ellipsis">
                            <span className="text-gray-400">📧</span>
                            <span className="truncate max-w-[180px]" title={user.email}>{user.email}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-gray-400">📞</span>
                            <span>{user.phone}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Joined: {user.joinDate}</div>
                        </div>
                        
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => handleViewUser(user.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <FiEye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            title="Edit User"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmUser(user)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete User"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {viewingUser && (
        <UserDetailModal 
          user={viewingUser} 
          onClose={() => setViewingUser(null)}
          onEdit={handleEditUser}
          onDelete={setDeleteConfirmUser}
        />
      )}
      
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)}
        />
      )}
      
      {showAddModal && (
        <AddUserModal 
          onClose={() => setShowAddModal(false)}
        />
      )}
      
      {deleteConfirmUser && (
        <DeleteConfirmModal 
          user={deleteConfirmUser}
          onClose={() => setDeleteConfirmUser(null)}
          onConfirm={() => handleDeleteUser(deleteConfirmUser.id)}
        />
      )}
    </div>
  );
}
