'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiUser,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFile,
  FiPaperclip,
  FiUsers,
} from "react-icons/fi";
import userAuth from "@/myStore/userAuth";

interface Subtask {
  id: number;
  task_id: number;
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Review" | "Completed";
  priority: "Low" | "Medium" | "High" | "Critical";
  deadline?: string;
  estimated_hours?: number;
  assigned_to: number;
  assigned_user?: string | null;
  profile_image?: string | null;
  file_url: string[];
  completed_at: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  profile_image?: string;
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "To Do":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Review":
      return "bg-purple-100 text-purple-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Low":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-blue-100 text-blue-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to determine the file type
const getFileType = (fileUrl: string) => {
  const extension = fileUrl.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'other';
  
  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return 'image';
  } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'audio';
  } else if (['mp4', 'mpeg', 'mov', 'quicktime'].includes(extension)) {
    return 'video';
  } else if (extension === 'pdf') {
    return 'pdf';
  } else if (['doc', 'docx'].includes(extension)) {
    return 'document';
  }
  
  return 'other';
};

export default function Page() {
  const router = useRouter();
  const params = useParams();
   const id = params?.id;
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isDeletingSubtask, setIsDeletingSubtask] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [showAddSubtaskForm, setShowAddSubtaskForm] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState<number | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
  const [newSubtask, setNewSubtask] = useState<{
    title: string;
    description: string;
    status: "To Do" | "In Progress" | "Review" | "Completed";
    priority: "Low" | "Medium" | "High" | "Critical";
    deadline: string;
    estimated_hours: number;
    file_url: string[];
  }>({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    deadline: "",
    estimated_hours: 0,
    file_url: [],
  });
  const [editSubtask, setEditSubtask] = useState<{
    title: string;
    description: string;
    status: "To Do" | "In Progress" | "Review" | "Completed";
    priority: "Low" | "Medium" | "High" | "Critical";
    deadline: string;
    estimated_hours: number;
  }>({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    deadline: "",
    estimated_hours: 0,
  });
  const user = userAuth((state) => state.user);
  const [viewSubtaskId, setViewSubtaskId] = useState<number | null>(null);

    const fetchSubtasks = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching subtasks for task ID:", id);
      
      // Try to fetch subtasks with error handling for 404
      try {
        const res = await axios.get(`http://localhost:8003/api/subtasks/task/${id}`);
        console.log("API Response:", res.data);
        
        // Check if we got a valid response
        if (!res.data || !Array.isArray(res.data)) {
          console.log("No subtasks found or invalid response format:", res.data);
          setSubtasks([]);
          return;
        }
        
        // Process the response data directly
        const parsedSubtasks = res.data.map((item: any) => ({
          ...item,
          // Parse file_url if it's a string, otherwise use as is or default to empty array
          file_url: typeof item.file_url === 'string' ? 
            JSON.parse(item.file_url || '[]') : 
            (item.file_url || []),
          assigned_to: item.assigned_to || 0,
          assigned_user: item.assigned_user || null,
          profile_image: item.profile_image || null,
        })) as Subtask[];
        
        console.log("Parsed subtasks:", parsedSubtasks);
        setSubtasks(parsedSubtasks);
      } catch (fetchError: any) {
        console.log("Could not fetch subtasks:", fetchError.message);
        // Handle 404 gracefully - just set empty subtasks array
        setSubtasks([]);
        return;
      }
      
      // Optionally fetch assignments separately - wrap in try/catch to prevent failure
      try {
        // Check if the assignments endpoint exists before calling it
        const checkEndpoint = await axios.head('http://localhost:8003/api/task-assignment/allTaskStatusUpdates')
          .catch(() => ({ status: 404 }));
          
        if (checkEndpoint.status === 200) {
          const assignmentsResponse = await axios.get('http://localhost:8003/api/task-assignment/allTaskStatusUpdates');
          
          if (assignmentsResponse.data && assignmentsResponse.data.statusUpdates) {
            // Create a map of latest assignments by task_id
            const latestAssignments = assignmentsResponse.data.statusUpdates.reduce((acc: any, curr: any) => {
              if (!acc[curr.task_id] || new Date(curr.updated_at) > new Date(acc[curr.task_id].updated_at)) {
                acc[curr.task_id] = {
                  assigned_user: curr.assigned_user,
                  profile_image: curr.profile_image,
                  updated_by: curr.updated_by
                };
              }
              return acc;
            }, {});
            
            // Update subtasks with assignment info
            setSubtasks(prev => prev.map(subtask => {
              const assignment = latestAssignments[subtask.id];
              if (assignment) {
                return {
                  ...subtask,
                  assigned_to: assignment.updated_by || subtask.assigned_to,
                  assigned_user: assignment.assigned_user || subtask.assigned_user,
                  profile_image: assignment.profile_image || subtask.profile_image
                } as Subtask;
              }
              return subtask;
            }));
          }
        } else {
          console.log("Assignments endpoint not available - skipping");
        }
      } catch (assignError) {
        console.log("Error fetching assignments (non-critical):", assignError);
        // Continue without assignments data if there's an error
      }
    } catch (error) {
      console.log('General error in fetchSubtasks:', error);
      // Just set empty subtasks to display the "No subtasks found" UI
      setSubtasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/auth/users');

      const users = response.data.users || response.data;
      
      if (Array.isArray(users)) {
        const filteredUsers = users.filter((user: any) => 
          user.role !== 'Admin' && user.role !== 'Supervisor'
        );
        setUsers(filteredUsers);
      } else {
        console.error('Invalid users data format:', response.data);
        toast.error('Failed to load users: Invalid data format');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubtasks();
      fetchUsers();
    }
  }, [id]);

  // Add this function to handle task assignment
  const handleAssignTask = async (subtaskId: number, userId: number) => {
    try {
      setIsAssigning(subtaskId);
      
      // Remove the endpoint check and directly call the API
      // The correct endpoint is http://localhost:8003/api/task-assignment/assignTask
      const response = await axios.post('http://localhost:8003/api/task-assignment/assignTask', {
        task_id: subtaskId,
        user_id: userId
      });

      if (response.status === 200 || response.status === 201) {
        // Find the selected user's information
        const assignedUser = users.find(u => u.id === userId);
        
        toast.success('Task assigned successfully');
        // Update the local state to reflect the assignment
        setSubtasks(prev => 
          prev.map(subtask =>
            subtask.id === subtaskId
              ? { 
                  ...subtask, 
                  assigned_to: userId,
                  assigned_user: assignedUser?.name || 'Unknown User',
                  profile_image: assignedUser?.profile_image || null
                } as Subtask
              : subtask
          )
        );

        // Refresh the latest status - avoid trying to fetch assignments if they're not available
        await fetchSubtasks();
      }
    } catch (error: any) {
      console.error('Error assigning task:', error);
      if (error.response?.status === 404) {
        toast.error('Task assignment endpoint not found');
      } else {
        toast.error('Failed to assign task: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsAssigning(null);
      setShowAssignDropdown(null);
    }
  };

  const handleDelete = async (subtaskId: number) => {
    if (confirm("Are you sure you want to delete this subtask?")) {
      try {
        setIsDeletingSubtask(subtaskId);
        const response = await axios.delete(`http://localhost:8003/api/subtasks/DeleteSubTask/${subtaskId}`);
        
        // Consider the request successful if we get a 200 or 204 status
        if (response.status === 200 || response.status === 204) {
          toast.success("Subtask deleted successfully");
          // Filter out the deleted subtask
      setSubtasks(prev => prev.filter(sub => sub.id !== subtaskId));
        }
    } catch (error) {
      console.error('Failed to delete subtask:', error);
        toast.error('Failed to delete subtask');
      } finally {
        setIsDeletingSubtask(null);
      }
    }
  };

  const handleUpdateSubtask = async () => {
    if (!editingSubtaskId) return;
    
    try {
      // Format the payload for the API
      const subtaskData = {
        title: editSubtask.title,
        description: editSubtask.description,
        status: editSubtask.status,
        priority: editSubtask.priority,
        deadline: editSubtask.deadline ? new Date(editSubtask.deadline).toISOString() : null,
        estimated_hours: editSubtask.estimated_hours,
      };

      // Call the update API
      const response = await axios.put(
        `http://localhost:8003/api/subtasks/updateSubTask/${editingSubtaskId}`,
        subtaskData
      );

      if (response.status === 200 || response.status === 204) {
        toast.success("Subtask updated successfully");
        
        // Update local state with type safety
        setSubtasks(prev => 
          prev.map(subtask => 
            subtask.id === editingSubtaskId 
              ? { ...subtask, ...subtaskData as Partial<Subtask> } 
              : subtask
          ) as Subtask[]
        );
        
        // Close the edit modal
        setEditingSubtaskId(null);
        
        // Refresh subtasks to get the latest data
        fetchSubtasks();
      }
    } catch (error: any) {
      console.error("Error updating subtask:", error);
      toast.error("Failed to update subtask: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.title) {
      toast.error("Title is required");
      return;
    }

    if (!id) {
      toast.error("Task ID is missing");
      return;
    }

    try {
      setIsCreatingSubtask(true);

      // Create FormData object
      const formData = new FormData();
      // Add task ID
      formData.append("task_id", id.toString());
      formData.append("title", newSubtask.title);
      formData.append("description", newSubtask.description || "");
      formData.append("status", newSubtask.status);
      formData.append("priority", newSubtask.priority);
      
      if (newSubtask.deadline) {
        const formattedDeadline = new Date(newSubtask.deadline).toISOString();
        formData.append("deadline", formattedDeadline);
      }
      
      formData.append("estimated_hours", newSubtask.estimated_hours.toString());

      // Append files if any
      if (selectedFiles && selectedFiles.length > 0) {
        Array.from(selectedFiles).forEach((file) => {
          formData.append("file_url", file);
        });
      }

      // Send request to create subtask
      const response = await axios.post(
        "http://localhost:8003/api/subtasks/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Consider the request successful if we get a response with data
      // or if the status is in the 2xx range
      if (response.data || (response.status >= 200 && response.status < 300)) {
        toast.success("Subtask created successfully");
        
        // Reset form
        setNewSubtask({
          title: "",
          description: "",
          status: "To Do",
          priority: "Medium",
          deadline: "",
          estimated_hours: 0,
          file_url: [],
        });
        setSelectedFiles(null);
        setShowAddSubtaskForm(false);

        // Refresh subtasks
        setTimeout(fetchSubtasks, 500);
      } else {
        toast.error("Failed to create subtask. Please try again.");
      }
    } catch (error: any) {
      console.error('Error details:', error.response?.data || error.message);
      
      // Check if the error is actually indicating success
      if (error.response?.status === 201 || error.response?.status === 200) {
        // If we get here, the subtask was actually created successfully
        toast.success("Subtask created successfully");
        
        // Reset form
        setNewSubtask({
          title: "",
          description: "",
          status: "To Do",
          priority: "Medium",
          deadline: "",
          estimated_hours: 0,
          file_url: [],
        });
        setSelectedFiles(null);
        setShowAddSubtaskForm(false);

        // Refresh subtasks
        setTimeout(fetchSubtasks, 500);
      } else {
        // Only show error if it's a real error
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || "Failed to create subtask";
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setIsCreatingSubtask(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-600 hover:text-[#ff4e00] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Subtasks</h1>
        </div>
        {!showAddSubtaskForm && (
        <button
            onClick={() => setShowAddSubtaskForm(true)}
            className="inline-flex items-center px-4 py-2 rounded-md bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 transition-all text-sm font-medium"
        >
            <FiPlus className="mr-1.5" size={18} /> Add Subtask
        </button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4e00]"></div>
        </div>
      ) : (
        <>
          {/* Add Subtask Form */}
          {showAddSubtaskForm && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Add New Subtask</h2>
                <button
                  onClick={() => {
                    setShowAddSubtaskForm(false);
                    setSelectedFiles(null);
                    setNewSubtask({
                      title: "",
                      description: "",
                      status: "To Do",
                      priority: "Medium",
                      deadline: "",
                      estimated_hours: 0,
                      file_url: [],
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newSubtask.title}
                    onChange={(e) =>
                      setNewSubtask({
                        ...newSubtask,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    placeholder="Enter subtask title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newSubtask.description}
                    onChange={(e) =>
                      setNewSubtask({
                        ...newSubtask,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    placeholder="Enter subtask description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newSubtask.status}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          status: e.target.value as
                            | "To Do"
                            | "In Progress"
                            | "Review"
                            | "Completed",
                        })
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newSubtask.priority}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          priority: e.target.value as
                            | "Low"
                            | "Medium"
                            | "High"
                            | "Critical",
                        })
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newSubtask.deadline}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newSubtask.estimated_hours}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          estimated_hours: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                      placeholder="Hours"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File(s)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload any relevant files for this subtask
                  </p>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.title || isCreatingSubtask}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                      newSubtask.title && !isCreatingSubtask
                        ? "bg-[#ff4e00] hover:bg-[#ff4e00]/90"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isCreatingSubtask ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Subtask"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subtasks Table */}
          {subtasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FiCheckCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No subtasks found</h3>
              <p className="text-gray-500 mb-4">Add subtasks to help organize your work</p>
              {!showAddSubtaskForm && (
                <button
                  onClick={() => setShowAddSubtaskForm(true)}
                  className="inline-flex items-center px-4 py-2 rounded-md bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 transition-all text-sm font-medium"
                >
                  <FiPlus className="mr-1.5" size={18} /> Add Your First Subtask
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignees
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th scope="col" className="px-4 py-3 relative">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subtasks.map((subtask, index) => (
                    <tr key={subtask.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${
                            subtask.status === "Completed"
                              ? "bg-green-500"
                              : subtask.status === "In Progress"
                              ? "bg-blue-500"
                              : subtask.status === "Review"
                              ? "bg-purple-500"
                              : "bg-yellow-500"
                          }`} />
                          <span className="font-medium text-gray-900">{subtask.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {subtask.assigned_to > 0 ? (
                          <div className="flex items-center">
                            {subtask.profile_image ? (
                              <img
                                src={subtask.profile_image}
                                alt={subtask.assigned_user || ''}
                                className="w-6 h-6 rounded-full mr-2 object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                <FiUser size={12} className="text-gray-600" />
                              </div>
                            )}
                            <span className="text-sm font-medium">{subtask.assigned_user || 'Unknown User'}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowAssignDropdown(subtask.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            <FiUser size={12} className="mr-1" /> Unassigned
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {subtask.deadline ? (
                          <div className="text-sm text-gray-900">{formatDate(subtask.deadline)}</div>
                        ) : (
                          <span className="text-sm text-gray-500">No deadline</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          subtask.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : subtask.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : subtask.status === "Review"
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {subtask.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => setViewSubtaskId(subtask.id)}
                            className="text-[#ff4e00] hover:text-[#ff4e00]/80"
                          >
                            View Task
                          </button>
                          <button
                            onClick={() => {
                              const subtaskToEdit = subtasks.find(s => s.id === subtask.id);
                              if (subtaskToEdit) {
                                setEditSubtask({
                                  title: subtaskToEdit.title,
                                  description: subtaskToEdit.description || "",
                                  status: subtaskToEdit.status,
                                  priority: subtaskToEdit.priority,
                                  deadline: subtaskToEdit.deadline 
                                    ? new Date(subtaskToEdit.deadline).toISOString().split("T")[0] 
                                    : "",
                                  estimated_hours: subtaskToEdit.estimated_hours || 0,
                                });
                                setEditingSubtaskId(subtask.id);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(subtask.id)}
                            disabled={isDeletingSubtask === subtask.id}
                            className="text-red-600 hover:text-red-800"
                          >
                            {isDeletingSubtask === subtask.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                            ) : (
                              <FiTrash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* View Subtask Modal */}
      {viewSubtaskId !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Subtask Details</h3>
              <button
                onClick={() => setViewSubtaskId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const subtask = subtasks.find(s => s.id === viewSubtaskId);
                if (!subtask) return <div>Subtask not found</div>;
                
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="block text-sm font-medium text-gray-700 mb-1">
                        Subtask Title
                      </h3>
                      <div className="flex items-center py-2.5">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            subtask.status === "Completed"
                              ? "bg-green-500"
                              : subtask.status === "In Progress"
                              ? "bg-blue-500"
                              : subtask.status === "Review"
                              ? "bg-purple-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <p className="font-medium text-gray-900">{subtask.title}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </h3>
                        <div className="py-2.5">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                            subtask.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : subtask.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : subtask.status === "Review"
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {subtask.status}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </h3>
                        <div className="py-2.5">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getPriorityColor(subtask.priority)}`}>
                            {subtask.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="block text-sm font-medium text-gray-700 mb-1">
                          Deadline
                        </h3>
                        <div className="py-2.5 flex items-center">
                          <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                          </svg>
                          <p className="text-gray-900">
                            {subtask.deadline ? formatDate(subtask.deadline) : 'No deadline set'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Hours
                        </h3>
                        <div className="py-2.5 flex items-center">
                          <FiClock className="mr-2 text-gray-500" size={16} />
                          <p className="text-gray-900">
                            {subtask.estimated_hours ? `${subtask.estimated_hours} hours` : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment
                      </h3>
                      <div className="py-2.5">
                        {subtask.assigned_to > 0 ? (
                          <div className="flex items-center">
                            {subtask.profile_image ? (
                              <img
                                src={subtask.profile_image}
                                alt={subtask.assigned_user || ''}
                                className="w-6 h-6 rounded-full mr-2 object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                <FiUser size={14} className="text-gray-600" />
                              </div>
                            )}
                            <span className="text-sm font-medium mr-3">{subtask.assigned_user || 'Unknown User'}</span>
                            <button
                              onClick={() => {
                                setViewSubtaskId(null);
                                setTimeout(() => {
                                  setShowAssignDropdown(subtask.id);
                                }, 100);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <FiUser size={14} className="text-gray-600 mr-2" />
                            <span className="text-sm text-gray-500 mr-3">Not assigned</span>
                            <button
                              onClick={() => {
                                setViewSubtaskId(null);
                                setTimeout(() => {
                                  setShowAssignDropdown(subtask.id);
                                }, 100);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </h3>
                      <div className="py-2.5">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {subtask.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Display files if any */}
                    {subtask.file_url && subtask.file_url.length > 0 && (
                      <div>
                        <h3 className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FiPaperclip className="mr-1" size={14} /> Attachments
                        </h3>
                        <div className="py-2.5">
                          <div className="flex flex-wrap gap-2">
                            {subtask.file_url.map((file, index) => {
                              // Handle JSON string if necessary
                              let fileUrl = file;
                              try {
                                if (typeof file === 'string' && file.startsWith('[')) {
                                  const parsed = JSON.parse(file);
                                  fileUrl = parsed[0] || file;
                                }
                              } catch (e) {
                                fileUrl = file; // Keep original if parsing fails
                              }
                              
                              const fileType = getFileType(fileUrl);
                              return (
                                <a
                                  key={index}
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-md text-sm text-gray-700"
                                >
                                  {fileType === 'image' ? (
                                    <span className="w-5 h-5 mr-1.5 rounded overflow-hidden">
                                      <img src={fileUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                    </span>
                                  ) : (
                                    <FiFile className="mr-1.5" size={14} />
                                  )}
                                  File {index + 1}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                      <button
                        onClick={() => {
                          setViewSubtaskId(null);
                          setTimeout(() => {
                            const subtaskToEdit = subtasks.find(s => s.id === subtask.id);
                            if (subtaskToEdit) {
                              setEditSubtask({
                                title: subtaskToEdit.title,
                                description: subtaskToEdit.description || "",
                                status: subtaskToEdit.status,
                                priority: subtaskToEdit.priority,
                                deadline: subtaskToEdit.deadline 
                                  ? new Date(subtaskToEdit.deadline).toISOString().split("T")[0] 
                                  : "",
                                estimated_hours: subtaskToEdit.estimated_hours || 0,
                              });
                              setEditingSubtaskId(subtask.id);
                            }
                          }, 100);
                        }}
                        className="px-4 py-2 bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-md text-sm font-medium"
                      >
                        <FiEdit className="inline mr-1" size={14} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setViewSubtaskId(null);
                          setTimeout(() => handleDelete(subtask.id), 100);
                        }}
                        className="px-4 py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-md text-sm font-medium"
                      >
                        <FiTrash2 className="inline mr-1" size={14} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Edit Subtask Modal */}
      {editingSubtaskId && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 border border-gray-200">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Subtask</h3>
              <button
                onClick={() => setEditingSubtaskId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtask Title
                  </label>
                  <input
                    type="text"
                    value={editSubtask.title}
                    onChange={(e) =>
                      setEditSubtask({ ...editSubtask, title: e.target.value })
                    }
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ff4e00] focus:border-[#ff4e00]"
                    placeholder="Enter subtask title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={editSubtask.deadline}
                        onChange={(e) =>
                          setEditSubtask({
                            ...editSubtask,
                            deadline: e.target.value,
                          })
                        }
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ff4e00] focus:border-[#ff4e00]"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editSubtask.estimated_hours}
                      onChange={(e) =>
                        setEditSubtask({
                          ...editSubtask,
                          estimated_hours: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ff4e00] focus:border-[#ff4e00]"
                      placeholder="Hours"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editSubtask.status}
                      onChange={(e) =>
                        setEditSubtask({
                          ...editSubtask,
                          status: e.target.value as
                            | "To Do"
                            | "In Progress"
                            | "Review"
                            | "Completed",
                        })
                      }
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ff4e00] focus:border-[#ff4e00] bg-white"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={editSubtask.priority}
                      onChange={(e) =>
                        setEditSubtask({
                          ...editSubtask,
                          priority: e.target.value as
                            | "Low"
                            | "Medium"
                            | "High"
                            | "Critical",
                        })
                      }
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ff4e00] focus:border-[#ff4e00] bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editSubtask.description}
                    onChange={(e) =>
                      setEditSubtask({
                        ...editSubtask,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ff4e00] focus:border-[#ff4e00]"
                    placeholder="Enter subtask description"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setEditingSubtaskId(null)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSubtask}
                    disabled={!editSubtask.title}
                    className={`px-5 py-2 rounded-md text-white text-sm font-medium ${
                      editSubtask.title ? "bg-[#ff4e00] hover:bg-[#ff4e00]/90" : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Update Subtask
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignDropdown !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] max-h-[80vh] overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Assign Subtask</h3>
              <button
                onClick={() => setShowAssignDropdown(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-4">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users available for assignment</p>
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAssignTask(showAssignDropdown, user.id)}
                    disabled={isAssigning === showAssignDropdown}
                    className="w-full text-left p-3 hover:bg-gray-50 flex items-center space-x-3 rounded-lg mb-2 border border-gray-100"
                  >
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                        <FiUser size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.role || 'Team Member'}</p>
                    </div>
                    {isAssigning === showAssignDropdown && (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowAssignDropdown(null)}
                className="w-full py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
