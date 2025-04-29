"use client";

import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import LoadingReuse from "@/components/LoadingReuse";
import { FiEdit, FiEye, FiX, FiUpload, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import Authentication from "@/service/Authentication";

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
              </div>
            </div>
            
            <div className="flex-1">
              <div className="border-b border-gray-200 pb-4 mb-5">
                <h3 className="text-2xl font-semibold mb-1">{user.name}</h3>
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
      const response = await Authentication.getUsers();
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
      const response = await Authentication.deleteUser(userId);
      
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
  
        const response = await Authentication.updateUser(user.id, formData);
        
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

        const response = await Authentication.createUser(formData);
        
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 mt-2">Manage system users, roles, and permissions</p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2.5 bg-[#ff4e00] hover:bg-[#ff4e00]/90 text-white rounded-lg font-medium transition-all shadow-sm"
            onClick={handleAddNewUser}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-grow">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Search Users</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 font-medium flex items-center"
                  onClick={() => {
                    setSelectedRole("all");
                    setSearchQuery("");
                    setSelectedTab("all");
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="border-t border-gray-100">
            <div className="flex overflow-x-auto p-1.5 gap-2">
              <button
                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  selectedTab === 'all' 
                    ? 'bg-[#ff4e00]/10 text-[#ff4e00] font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
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
                    className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      selectedTab === tabValue 
                        ? 'bg-[#ff4e00]/10 text-[#ff4e00] font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTab(tabValue)}
                  >
                    {displayText}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <LoadingReuse />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                className="text-[#ff4e00] font-medium hover:text-[#ff4e00]/80 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const hasAvatar = user.avatar && user.avatar !== "null" && user.avatar !== "undefined";
                    const bgColor = stringToColor(user.name);
                    const initials = getInitials(user.name);
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              {hasAvatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.parentElement!.innerHTML = `<div class="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-white" style="background-color: ${bgColor}">${initials}</div>`;
                                  }}
                                />
                              ) : (
                                <div 
                                  className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-white" 
                                  style={{ backgroundColor: bgColor }}
                                >
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center text-gray-900">
                              <svg className="w-4 h-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {user.email}
                            </div>
                            <div className="flex items-center text-gray-500 mt-1">
                              <svg className="w-4 h-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{user.joinDate}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleViewUser(user.id)}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={18} />
                            </button>
                            <button 
                              onClick={() => handleEditUser(user.id)}
                              className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                              title="Edit User"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmUser(user)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete User"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Keep existing modals */}
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
