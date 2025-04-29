"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiArrowLeft,
  FiClock,
  FiX,
  FiPlus,
  FiMessageCircle,
  FiCheckCircle,
  FiFile,
  FiPaperclip,
  FiSend,
  FiEye,
  FiImage,
} from "react-icons/fi";
import LoadingReuse from "@/components/LoadingReuse";
import userAuth from "@/myStore/userAuth";

 const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
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

const calculateDaysLeft = (deadline: string) => {
  if (!deadline) return { days: 0, overdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const differenceMs = deadlineDate.getTime() - today.getTime();
  const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

  return {
    days: Math.abs(differenceDays),
    overdue: differenceDays < 0,
  };
};

 interface Subtask {
  id: number;
  task_id: number;
  title: string;
  status: "To Do" | "In Progress" | "Review" | "Completed";
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Review" | "Completed";
  priority: "Low" | "Medium" | "High" | "Critical";
  deadline: string;
  estimated_hours: number;
  file_url: string | null;
  completed_at: string | null;
  subtasks: Subtask[]; // Only need minimal subtask data since details are handled on the subtasks page
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  profile_image?: string;
}

interface ChatMessage {
  _id: string;
  projectId: string;
  senderId: string;
  message: string;
  file?: string | null;
  createdAt: string;
  updatedAt: string;
  senderName: string;
  senderProfileImage: string;
}

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

// Parse file URLs from string or JSON 
const parseFileUrls = (fileUrlString: string | null | undefined) => {
  if (!fileUrlString) return [];
  
  try {
    // Try to parse as JSON in case it's a JSON string
    const parsed = JSON.parse(fileUrlString);
    // Check if it's an array
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // If it's a string inside JSON, return it as a single-item array
    if (typeof parsed === 'string') {
      return [parsed];
    }
    return [];
  } catch (error) {
    // If it's not JSON, it's probably a direct URL string
    return [fileUrlString];
  }
};

// Get first file URL or undefined
const getFirstFileUrl = (fileUrl: string | null | undefined) => {
  const urls = parseFileUrls(fileUrl);
  return urls.length > 0 ? urls[0] : undefined;
};

export default function ProjectDetail({ params }: { params: any }) {
  const router = useRouter();
   const paramsObj = React.use(params) as { id: string };
  const id = paramsObj.id;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"tasks" | "chat">("tasks");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [daysInfo, setDaysInfo] = useState({ days: 0, overdue: false });
  const user = userAuth((state) => state.user);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const [newTask, setNewTask] = useState<{
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
  
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
   const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  
  const [editTask, setEditTask] = useState<{
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

  const [editTaskFile, setEditTaskFile] = useState<File | null>(null);

  const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

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
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8002/api/project/singleProject/${id}`
        );

        if (response.data.success) {
          const projectData = response.data.project;
          setProject(projectData);

           const daysData = calculateDaysLeft(projectData.deadline);
          setDaysInfo(daysData);

           fetchTasks(id);
        } else {
          toast.error("Failed to load project details");
          router.push("/Admin/Projects");
        }
      } catch (error: any) {
        toast.error(
          "Error loading project: " +
            (error.response?.data?.message || error.message)
        );
        router.push("/Admin/Projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, projectService, router]);

   const fetchTasks = async (projectId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8003/api/task/projectTasks/${projectId}`
      );

      if (response.data.success) {
         const tasksFromApi = response.data.tasks ? response.data.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          estimated_hours: task.estimated_hours,
          file_url: task.file_url,
          completed_at: task.completed_at,
          subtasks: [],  // We only need the empty array to match the interface
        })) : [];

        setTasks(tasksFromApi as Task[]);
      } else {
        setTasks([]);
      }
    } catch (error: any) {
       if (error.response?.status === 404 || error.response?.data?.message?.includes("No tasks found")) {
        setTasks([]);
      } else {
         toast.error(
          "Error loading tasks: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

   const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${projectService}/api/project/projectDelete/${id}`
      );

      if (response.data.success) {
        toast.success("Project deleted successfully");
        router.push("/Admin/Projects");
      } else {
        toast.error(response.data.message || "Failed to delete project");
        setIsDeleting(false);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to delete project";
      toast.error(message);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (id && activeTab === "chat") {
      fetchChatMessages(id);
    }
  }, [id, activeTab]);

  const fetchChatMessages = async (projectId: any) => {
    try {
      setLoadingChat(true);
      const response = await axios.get(`http://localhost:8006/api/chat/${projectId}`);
      
      if (response.data && Array.isArray(response.data.messages)) {
        setChatMessages(response.data.messages);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast.error("Failed to load chat messages");
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !chatFile) || !id || !user) return;
    
    const messageText = newMessage.trim();
    const messageFile = chatFile;
    
     setNewMessage("");
    setChatFile(null);
    
    try {
      setSendingMessage(true);
      
      const formData = new FormData();
      formData.append("projectId", id);
       formData.append("senderId", user.id.toString());
      
      if (messageText) {
        formData.append("message", messageText);
      }
      
      if (messageFile) {
        formData.append("file", messageFile);
      }
      
      const response = await axios.post(
        "http://localhost:8006/api/chat/send",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000, // 10 second timeout
        }
      );
      
       if (response.data && (response.data.success || response.data.message === "Message sent" || response.data.newMessage)) {
         toast.success("Message sent successfully");
         setTimeout(() => fetchChatMessages(id), 500);
      } else {
        console.error("Failed to send message:", response.data);
        toast.error(response.data?.message || "Failed to send message");
         if (messageText || messageFile) {
          setNewMessage(messageText);
          if (messageFile) setChatFile(messageFile);
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
       if (error.code === 'ECONNABORTED') {
        toast.error("Request timed out. The server may be busy.");
      } else if (error.response) {
        
        toast.error(`Server error: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
         toast.error("No response from server. Please check your connection.");
      } else {
         toast.error(`Error: ${error.message || "Unknown error occurred"}`);
      }
      
       if (messageText || messageFile) {
        setNewMessage(messageText);
        if (messageFile) setChatFile(messageFile);
      }
    } finally {
      setSendingMessage(false);
       setTimeout(() => fetchChatMessages(id), 1000);
    }
  };

  // Filter tasks based on selected status
  const filteredTasks = useMemo(() => {
    if (selectedStatus === "All") {
      return tasks;
    }
    return tasks.filter(task => task.status === selectedStatus);
  }, [tasks, selectedStatus]);

  const getStatusCount = (status: string) => {
    return tasks.filter(task => task.status === status).length;
  };

  const getTotalCount = () => {
    return tasks.length;
  };

  // Reset form state when the form is closed
  useEffect(() => {
    if (!showNewTaskForm) {
      setTaskFile(null);
      setNewTask({
        title: "",
        description: "",
        status: "To Do",
        priority: "Medium",
        deadline: "",
        estimated_hours: 0,
      });
    }
  }, [showNewTaskForm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingReuse />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
          <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <FiEye className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Project not found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The project you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => router.push("/Admin/Projects")}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-[#ff4e00] hover:bg-[#ff4e00]/90 transition-all font-medium shadow-sm"
          >
            <FiArrowLeft className="mr-2" /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

   const { days, overdue } = daysInfo;

  return (
    <div className="w-full mx-auto py-5 px-4 sm:px-4 lg:px-4">
      {/* Add Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/Admin/Projects')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4e00] transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
         <div className="lg:col-span-3 space-y-8">
          
           <div className=" rounded-xl  overflow-hidden transition-all ">
             <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex-1 py-4 px-4 text-center font-medium ${
                  activeTab === "tasks"
                    ? "text-[#ff4e00] border-b-2 border-[#ff4e00]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center">
                  <FiCheckCircle className="mr-2" /> Tasks 
                </div>
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === "chat"
                    ? "text-[#ff4e00] border-b-2 border-[#ff4e00]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center">
                  <FiMessageCircle className="mr-2" /> Project Chat
                </div>
              </button>
            </div>

             {activeTab === "tasks" && (
              <div className="p-6 w-full">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-gray-800">
                    Project Tasks
                  </h3>
                  {!showNewTaskForm && (
                    <button
                      onClick={() => setShowNewTaskForm(true)}
                      className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 transition-all text-sm font-medium"
                    >
                      <FiPlus className="mr-2" /> Add Task
                    </button>
                  )}
                </div>

                {showNewTaskForm && (
                  <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-medium text-gray-800">
                        Create New Task
                      </h4>
                      <button
                        onClick={() => setShowNewTaskForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={20} />
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Task Title *
                        </label>
                        <input
                          type="text"
                          value={newTask.title}
                          onChange={(e) =>
                            setNewTask({ ...newTask, title: e.target.value })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                          placeholder="Enter task title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Description
                        </label>
                        <textarea
                          value={newTask.description}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              description: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                          placeholder="Enter task description"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Status
                          </label>
                          <select
                            value={newTask.status}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                status: e.target.value as
                                  | "To Do"
                                  | "In Progress"
                                  | "Review"
                                  | "Completed",
                              })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Priority
                          </label>
                          <select
                            value={newTask.priority}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                priority: e.target.value as
                                  | "Low"
                                  | "Medium"
                                  | "High"
                                  | "Critical",
                              })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Deadline
                          </label>
                          <input
                            type="date"
                            value={newTask.deadline}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                deadline: e.target.value,
                              })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Estimated Hours
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newTask.estimated_hours}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                estimated_hours: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                            placeholder="Enter estimated hours"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Attachment
                        </label>
                        <div className="relative border border-gray-300 rounded-lg p-3 bg-white">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setTaskFile(e.target.files[0]);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex items-center">
                            <div className="mr-3 flex-shrink-0">
                              <FiImage className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-grow">
                              <span className="text-sm text-gray-500">
                                {taskFile ? taskFile.name : "Choose image - No file chosen"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Upload an image related to this task
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 mt-2">
                        <button
                          onClick={() => {
                            setShowNewTaskForm(false);
                            setTaskFile(null);
                          }}
                          className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (!newTask.title) {
                              toast.error("Task title is required");
                              return;
                            }

                            try {
                              setIsCreatingTask(true);

                              // Create FormData object
                              const formData = new FormData();
                              
                              // Append task data
                              formData.append("title", newTask.title);
                              formData.append("description", newTask.description);
                              formData.append("project_id", id);
                              formData.append("status", newTask.status);
                              formData.append("priority", newTask.priority);
                              
                              if (newTask.deadline) {
                                const formattedDeadline = new Date(newTask.deadline).toISOString();
                                formData.append("deadline", formattedDeadline);
                              }
                              
                              formData.append("estimated_hours", newTask.estimated_hours.toString());
                              
                              // Append file if any
                              if (taskFile) {
                                formData.append("file_url", taskFile);
                              }

                              // Send request to create task
                              const response = await axios.post(
                                "http://localhost:8003/api/task/addTask",
                                formData,
                                {
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
                                }
                              );

                              if (response.data.success) {
                                toast.success("Task added successfully");

                                // Reset form
                                setNewTask({
                                  title: "",
                                  description: "",
                                  status: "To Do",
                                  priority: "Medium",
                                  deadline: "",
                                  estimated_hours: 0,
                                });
                                setTaskFile(null);
                                setShowNewTaskForm(false);

                                // Refresh tasks
                                fetchTasks(id);
                              } else {
                                toast.error(
                                  response.data.message ||
                                    "Failed to create task"
                                );
                              }
                            } catch (error: any) {
                              const errorMessage =
                                error.response?.data?.message ||
                                "Error creating task";
                              toast.error(errorMessage);
                              console.error("Task creation error:", error);
                            } finally {
                              setIsCreatingTask(false);
                            }
                          }}
                          disabled={!newTask.title || isCreatingTask}
                          className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                            newTask.title && !isCreatingTask
                              ? "bg-[#ff4e00] hover:bg-[#ff4e00]/90"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {isCreatingTask ? (
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
                            "Create Task"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Task Board - Simplified rows */}
                <div className="grid grid-cols-4 gap-6 mt-6">
                  {/* To Do */}
                  <div>
                    <div className="flex items-center mb-5">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2.5"></div>
                      <h3 className="font-medium text-gray-800">To Do</h3>
                      <span className="ml-1.5 text-gray-500">{getStatusCount("To Do")}</span>
                    </div>
                    
                    {tasks.filter(task => task.status === "To Do").length > 0 ? (
                      <div>
                        {tasks.filter(task => task.status === "To Do").map(task => (
                          <div key={task.id} className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                            {/* Image section */}
                            <div className="h-44 bg-gray-100 relative rounded-t-xl overflow-hidden">
                              {task.file_url ? (
                                <img 
                                  src={getFirstFileUrl(task.file_url)}
                                  alt={task.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-red-100 to-cyan-100">
                                  <FiFile className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                              
                              {/* Priority badge */}
                              <div className="absolute bottom-3 left-3">
                                <span className={`text-sm px-3 py-1 rounded-md text-white font-medium ${
                                  task.priority === "High" ? "bg-red-500" : 
                                  task.priority === "Medium" ? "bg-orange-500" : 
                                  "bg-green-500"
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                              
                              {/* Estimated hours badge */}
                              <div className="absolute top-3 right-3">
                                <span className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded-md">
                                  {task.estimated_hours}h
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-800 mb-1.5">{task.title}</h4>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                              
                              {/* Task details */}
                              <div className="text-xs text-gray-500 space-y-2 mb-4">
                                <div className="flex items-center">
                                  <FiCalendar className="mr-2" size={12} />
                                  <span className="mr-1 font-medium">Deadline:</span> 
                                  <span>{formatDate(task.deadline)}</span>
                                </div>
                                
                                {/* Attachment indicator */}
                                {task.file_url && (
                                  <div className="flex items-center">
                                    <FiPaperclip className="mr-2" size={12} />
                                    <span className="mr-1 font-medium">Attachment:</span>
                                    <span>{parseFileUrls(task.file_url).length} file(s)</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                                <button
                                  onClick={() => router.push(`/Admin/Projects/SubTasks/${task.id}`)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  View Task
                                </button>
                                
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => {
                                      const taskToEdit = tasks.find(t => t.id === task.id);
                                      if (taskToEdit) {
                                        setEditTask({
                                          title: taskToEdit.title,
                                          description: taskToEdit.description || "",
                                          status: taskToEdit.status,
                                          priority: taskToEdit.priority,
                                          deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split("T")[0] : "",
                                          estimated_hours: taskToEdit.estimated_hours || 0,
                                        });
                                        setEditingTaskId(task.id);
                                        setEditTaskFile(null);
                                      }
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <FiEdit size={16} />
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this task?")) {
                                        setDeletingTaskId(task.id);
                                        axios.delete(`http://localhost:8003/api/task/deleteSingleTask/${task.id}`)
                                          .then(response => {
                                            if (response.status === 200) {
                                              toast.success("Task deleted successfully");
                                              fetchTasks(id);
                                            }
                                          })
                                          .catch(error => {
                                            toast.error("Error deleting task: " + (error.response?.data?.message || error.message));
                                          })
                                          .finally(() => {
                                            setDeletingTaskId(null);
                                          });
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-200 p-10 rounded-xl text-center">
                        <p className="text-gray-500">No tasks to do</p>
                      </div>
                    )}
                  </div>

                  {/* In Progress */}
                  <div>
                    <div className="flex items-center mb-5">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2.5"></div>
                      <h3 className="font-medium text-gray-800">In Progress</h3>
                      <span className="ml-1.5 text-gray-500">{getStatusCount("In Progress")}</span>
                    </div>
                    
                    {tasks.filter(task => task.status === "In Progress").length > 0 ? (
                      <div>
                        {tasks.filter(task => task.status === "In Progress").map(task => (
                          <div key={task.id} className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                            {/* Image section */}
                            <div className="h-44 bg-gray-100 relative rounded-t-xl overflow-hidden">
                              {task.file_url ? (
                                <img 
                                  src={getFirstFileUrl(task.file_url)}
                                  alt={task.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100">
                                  <FiFile className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                              
                              {/* Priority badge */}
                              <div className="absolute bottom-3 left-3">
                                <span className={`text-sm px-3 py-1 rounded-md text-white font-medium ${
                                  task.priority === "High" ? "bg-red-500" : 
                                  task.priority === "Medium" ? "bg-orange-500" : 
                                  "bg-green-500"
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                              
                              {/* Estimated hours badge */}
                              <div className="absolute top-3 right-3">
                                <span className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded-md">
                                  {task.estimated_hours}h
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-800 mb-1.5">{task.title}</h4>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                              
                              {/* Task details */}
                              <div className="text-xs text-gray-500 space-y-2 mb-4">
                                <div className="flex items-center">
                                  <FiCalendar className="mr-2" size={12} />
                                  <span className="mr-1 font-medium">Deadline:</span> 
                                  <span>{formatDate(task.deadline)}</span>
                                </div>
                                
                                {/* Attachment indicator */}
                                {task.file_url && (
                                  <div className="flex items-center">
                                    <FiPaperclip className="mr-2" size={12} />
                                    <span className="mr-1 font-medium">Attachment:</span>
                                    <span>{parseFileUrls(task.file_url).length} file(s)</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                                <button
                                  onClick={() => router.push(`/Admin/Projects/SubTasks/${task.id}`)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  View Task
                                </button>
                                
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => {
                                      const taskToEdit = tasks.find(t => t.id === task.id);
                                      if (taskToEdit) {
                                        setEditTask({
                                          title: taskToEdit.title,
                                          description: taskToEdit.description || "",
                                          status: taskToEdit.status,
                                          priority: taskToEdit.priority,
                                          deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split("T")[0] : "",
                                          estimated_hours: taskToEdit.estimated_hours || 0,
                                        });
                                        setEditingTaskId(task.id);
                                        setEditTaskFile(null);
                                      }
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <FiEdit size={16} />
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this task?")) {
                                        setDeletingTaskId(task.id);
                                        axios.delete(`http://localhost:8003/api/task/deleteSingleTask/${task.id}`)
                                          .then(response => {
                                            if (response.status === 200) {
                                              toast.success("Task deleted successfully");
                                              fetchTasks(id);
                                            }
                                          })
                                          .catch(error => {
                                            toast.error("Error deleting task: " + (error.response?.data?.message || error.message));
                                          })
                                          .finally(() => {
                                            setDeletingTaskId(null);
                                          });
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-200 p-10 rounded-xl text-center">
                        <p className="text-gray-500">No tasks in progress</p>
                      </div>
                    )}
                  </div>

                  {/* Review */}
                  <div>
                    <div className="flex items-center mb-5">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2.5"></div>
                      <h3 className="font-medium text-gray-800">Review</h3>
                      <span className="ml-1.5 text-gray-500">{getStatusCount("Review")}</span>
                    </div>
                    
                    {tasks.filter(task => task.status === "Review").length > 0 ? (
                      <div>
                        {tasks.filter(task => task.status === "Review").map(task => (
                          <div key={task.id} className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                            {/* Image section */}
                            <div className="h-44 bg-gray-100 relative rounded-t-xl overflow-hidden">
                              {task.file_url ? (
                                <img 
                                  src={getFirstFileUrl(task.file_url)}
                                  alt={task.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100">
                                  <FiFile className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                              
                              {/* Priority badge */}
                              <div className="absolute bottom-3 left-3">
                                <span className={`text-sm px-3 py-1 rounded-md text-white font-medium ${
                                  task.priority === "High" ? "bg-red-500" : 
                                  task.priority === "Medium" ? "bg-orange-500" : 
                                  "bg-green-500"
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                              
                              {/* Estimated hours badge */}
                              <div className="absolute top-3 right-3">
                                <span className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded-md">
                                  {task.estimated_hours}h
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-800 mb-1.5">{task.title}</h4>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                              
                              {/* Task details */}
                              <div className="text-xs text-gray-500 space-y-2 mb-4">
                                <div className="flex items-center">
                                  <FiCalendar className="mr-2" size={12} />
                                  <span className="mr-1 font-medium">Deadline:</span> 
                                  <span>{formatDate(task.deadline)}</span>
                                </div>
                                
                                {/* Attachment indicator */}
                                {task.file_url && (
                                  <div className="flex items-center">
                                    <FiPaperclip className="mr-2" size={12} />
                                    <span className="mr-1 font-medium">Attachment:</span>
                                    <span>{parseFileUrls(task.file_url).length} file(s)</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                                <button
                                  onClick={() => router.push(`/Admin/Projects/SubTasks/${task.id}`)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  View Task
                                </button>
                                
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => {
                                      const taskToEdit = tasks.find(t => t.id === task.id);
                                      if (taskToEdit) {
                                        setEditTask({
                                          title: taskToEdit.title,
                                          description: taskToEdit.description || "",
                                          status: taskToEdit.status,
                                          priority: taskToEdit.priority,
                                          deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split("T")[0] : "",
                                          estimated_hours: taskToEdit.estimated_hours || 0,
                                        });
                                        setEditingTaskId(task.id);
                                        setEditTaskFile(null);
                                      }
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <FiEdit size={16} />
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this task?")) {
                                        setDeletingTaskId(task.id);
                                        axios.delete(`http://localhost:8003/api/task/deleteSingleTask/${task.id}`)
                                          .then(response => {
                                            if (response.status === 200) {
                                              toast.success("Task deleted successfully");
                                              fetchTasks(id);
                                            }
                                          })
                                          .catch(error => {
                                            toast.error("Error deleting task: " + (error.response?.data?.message || error.message));
                                          })
                                          .finally(() => {
                                            setDeletingTaskId(null);
                                          });
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-200 p-10 rounded-xl text-center">
                        <p className="text-gray-500">No tasks in review</p>
                      </div>
                    )}
                  </div>

                  {/* Completed */}
                  <div>
                    <div className="flex items-center mb-5">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2.5"></div>
                      <h3 className="font-medium text-gray-800">Completed</h3>
                      <span className="ml-1.5 text-gray-500">{getStatusCount("Completed")}</span>
                    </div>
                    
                    {tasks.filter(task => task.status === "Completed").length > 0 ? (
                      <div>
                        {tasks.filter(task => task.status === "Completed").map(task => (
                          <div key={task.id} className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                            {/* Image section */}
                            <div className="h-44 bg-gray-100 relative rounded-t-xl overflow-hidden">
                              {task.file_url ? (
                                <img 
                                  src={getFirstFileUrl(task.file_url)}
                                  alt={task.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-100 to-teal-100">
                                  <FiFile className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                              
                              {/* Priority badge */}
                              <div className="absolute bottom-3 left-3">
                                <span className={`text-sm px-3 py-1 rounded-md text-white font-medium ${
                                  task.priority === "High" ? "bg-red-500" : 
                                  task.priority === "Medium" ? "bg-orange-500" : 
                                  "bg-green-500"
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                              
                              {/* Estimated hours badge */}
                              <div className="absolute top-3 right-3">
                                <span className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded-md">
                                  {task.estimated_hours}h
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-800 mb-1.5">{task.title}</h4>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                              
                              {/* Task details */}
                              <div className="text-xs text-gray-500 space-y-2 mb-4">
                                <div className="flex items-center">
                                  <FiCalendar className="mr-2" size={12} />
                                  <span className="mr-1 font-medium">Deadline:</span> 
                                  <span>{formatDate(task.deadline)}</span>
                                </div>
                                
                                {/* Attachment indicator */}
                                {task.file_url && (
                                  <div className="flex items-center">
                                    <FiPaperclip className="mr-2" size={12} />
                                    <span className="mr-1 font-medium">Attachment:</span>
                                    <span>{parseFileUrls(task.file_url).length} file(s)</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                                <button
                                  onClick={() => router.push(`/Admin/Projects/SubTasks/${task.id}`)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  View Task
                                </button>
                                
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => {
                                      const taskToEdit = tasks.find(t => t.id === task.id);
                                      if (taskToEdit) {
                                        setEditTask({
                                          title: taskToEdit.title,
                                          description: taskToEdit.description || "",
                                          status: taskToEdit.status,
                                          priority: taskToEdit.priority,
                                          deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split("T")[0] : "",
                                          estimated_hours: taskToEdit.estimated_hours || 0,
                                        });
                                        setEditingTaskId(task.id);
                                        setEditTaskFile(null);
                                      }
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <FiEdit size={16} />
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this task?")) {
                                        setDeletingTaskId(task.id);
                                        axios.delete(`http://localhost:8003/api/task/deleteSingleTask/${task.id}`)
                                          .then(response => {
                                            if (response.status === 200) {
                                              toast.success("Task deleted successfully");
                                              fetchTasks(id);
                                            }
                                          })
                                          .catch(error => {
                                            toast.error("Error deleting task: " + (error.response?.data?.message || error.message));
                                          })
                                          .finally(() => {
                                            setDeletingTaskId(null);
                                          });
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-200 p-10 rounded-xl text-center">
                        <p className="text-gray-500">No completed tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

             {activeTab === "chat" && (
              <div className="h-[600px] flex flex-col">
                {loadingChat ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff4e00]"></div>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <FiMessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center mb-2">No messages yet.</p>
                    <p className="text-gray-400 text-center text-sm">Start the conversation by sending a message below.</p>
                  </div>
                ) : (
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {chatMessages.map((message) => {
                         const isCurrentUser = user && message.senderId === user.id.toString();

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex max-w-[80%] ${
                                isCurrentUser ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              <div className="flex-shrink-0 mx-2">
                                {message.senderProfileImage ? (
                                  <img
                                    src={message.senderProfileImage}
                                    alt={message.senderName}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                                    {message.senderName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div
                                  className={`rounded-lg px-4 py-2 mb-1 inline-block ${
                                    isCurrentUser
                                      ? "bg-[#ff4e00] text-white rounded-tr-none"
                                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                                  }`}
                                >
                                  {!message.file ? (
                                    <p className="text-sm">{message.message}</p>
                                  ) : (() => {
                                    const fileType = getFileType(message.file);
                                    
                                    switch (fileType) {
                                      case 'image':
                                        return (
                                          <div>
                                            <img 
                                              src={message.file} 
                                              alt="Image attachment" 
                                              className="max-w-full rounded-lg my-1"
                                              style={{ maxHeight: '200px' }}
                                            />
                                             {message.message !== message.file && (
                                              <p className="text-sm mt-1">{message.message}</p>
                                            )}
                                          </div>
                                        );
                                      
                                      case 'audio':
                                        return (
                                          <div>
                                            <audio 
                                              controls 
                                              className="max-w-full my-1"
                                            >
                                              <source src={message.file} />
                                              Your browser does not support the audio element.
                                            </audio>
                                             {message.message !== message.file && (
                                              <p className="text-sm mt-1">{message.message}</p>
                                            )}
                                          </div>
                                        );
                                      
                                      case 'video':
                                        return (
                                          <div>
                                            <video 
                                              controls 
                                              className="max-w-full rounded-lg my-1"
                                              style={{ maxHeight: '200px' }}
                                            >
                                              <source src={message.file} />
                                              Your browser does not support the video element.
                                            </video>
                                             {message.message !== message.file && (
                                              <p className="text-sm mt-1">{message.message}</p>
                                            )}
                                          </div>
                                        );
                                      
                                      case 'pdf':
                                        return (
                                          <div>
                                            <a 
                                              href={message.file} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className={`flex items-center rounded-md py-1 px-2 text-xs ${
                                                isCurrentUser ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                                              }`}
                                            >
                                              <FiFile className="mr-1" />
                                              <span className="truncate max-w-[150px]">
                                                {message.file.split('/').pop() || 'PDF Document'}
                                              </span>
                                            </a>
                                             {message.message !== message.file && (
                                              <p className="text-sm mt-1">{message.message}</p>
                                            )}
                                          </div>
                                        );
                                      
                                      case 'document':
                                        return (
                                          <div>
                                            <a 
                                              href={message.file} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className={`flex items-center rounded-md py-1 px-2 text-xs ${
                                                isCurrentUser ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                                              }`}
                                            >
                                              <FiFile className="mr-1" />
                                              <span className="truncate max-w-[150px]">
                                                {message.file.split('/').pop() || 'Document'}
                                              </span>
                                            </a>
                                             {message.message !== message.file && (
                                              <p className="text-sm mt-1">{message.message}</p>
                                            )}
                                          </div>
                                        );
                                      
                                      default:
                                        return (
                                          <div>
                                            <a 
                                              href={message.file} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className={`flex items-center rounded-md py-1 px-2 text-xs ${
                                                isCurrentUser ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                                              }`}
                                            >
                                              <FiFile className="mr-1" />
                                              <span className="truncate max-w-[150px]">
                                                {message.file.split('/').pop() || 'File'}
                                              </span>
                                            </a>
                                             {message.message !== message.file && (
                                              <p className="text-sm mt-1">{message.message}</p>
                                            )}
                                          </div>
                                        );
                                    }
                                  })()}
                                </div>
                                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                  <p className="text-xs text-gray-500">
                                    {new Date(message.createdAt).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" }
                                    )}
                                  </p>
                                  {!isCurrentUser && (
                                    <p className="text-xs text-gray-500 ml-1">• {message.senderName}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                 <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {chatFile && (
                    <div className="mb-2 p-2 bg-gray-100 rounded-md flex justify-between items-center">
                      <div className="flex items-center">
                        <FiFile className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">
                          {chatFile.name}
                        </span>
                      </div>
                      <button 
                        onClick={() => setChatFile(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex">
                    <div className="flex-none pr-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setChatFile(e.target.files[0]);
                            }
                          }}
                        />
                        <FiPaperclip className="h-5 w-5 text-gray-500 hover:text-[#ff4e00]" />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                      placeholder="Type your message..."
                      disabled={sendingMessage}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && (newMessage.trim() || chatFile)) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || (!newMessage.trim() && !chatFile)}
                      className={`px-4 rounded-r-lg ${
                        sendingMessage
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : (newMessage.trim() || chatFile)
                            ? "bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {sendingMessage ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <FiSend className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

       {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => !isDeleting && setShowDeleteConfirm(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-center text-red-500 mb-4">
                <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                  <FiTrash2 className="h-8 w-8" />
                </div>
              </div>
              <p className="text-center text-lg mb-2">
                Are you sure you want to delete this project?
              </p>
              <p className="text-center font-semibold text-lg mb-1 text-gray-900">
                {project.name}
              </p>
              <p className="text-center text-sm text-red-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center shadow-sm font-medium"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" /> Delete Project
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

       {editingTaskId && (
        <>
           <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-xl max-w-md w-full p-0">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
              <button
                onClick={() => setEditingTaskId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editTask.title}
                    onChange={(e) =>
                      setEditTask({ ...editTask, title: e.target.value })
                    }
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editTask.description}
                    onChange={(e) =>
                      setEditTask({ ...editTask, description: e.target.value })
                    }
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editTask.status}
                      onChange={(e) =>
                        setEditTask({
                          ...editTask,
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
                      value={editTask.priority}
                      onChange={(e) =>
                        setEditTask({
                          ...editTask,
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={editTask.deadline}
                      onChange={(e) =>
                        setEditTask({ ...editTask, deadline: e.target.value })
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
                      value={editTask.estimated_hours}
                      onChange={(e) =>
                        setEditTask({
                          ...editTask,
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
                    Update Attachment
                  </label>
                  {editingTaskId && (
                    <div className="mb-2">
                      {tasks.find(t => t.id === editingTaskId)?.file_url ? (
                        <div className="text-sm text-gray-600 flex items-center bg-gray-50 p-2 rounded-md">
                          <FiFile className="mr-2 text-gray-500" />
                          <span className="truncate">
                            Current file: {getFirstFileUrl(tasks.find(t => t.id === editingTaskId)?.file_url)?.split('/').pop()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 mb-2">No file currently attached</div>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditTaskFile(e.target.files[0]);
                      }
                    }}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep the current file
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    setEditingTaskId(null);
                     const taskId = editingTaskId;
                    const button = document.querySelector(
                      `button[data-task-id="${taskId}"]`
                    ) as HTMLButtonElement;
                    if (button) {
                      button.click();
                    }
                  }
                }}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete Task
              </button>
              <button
                onClick={() => setEditingTaskId(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  if (!editTask.title) {
                    toast.error("Title is required");
                    return;
                  }

                  try {
                    setIsUpdatingTask(true);

                    // Create FormData object
                    const formData = new FormData();
                    
                    // Append task data
                    formData.append("title", editTask.title);
                    formData.append("description", editTask.description);
                    formData.append("status", editTask.status);
                    formData.append("priority", editTask.priority);
                    
                    if (editTask.deadline) {
                      const formattedDeadline = new Date(editTask.deadline).toISOString();
                      formData.append("deadline", formattedDeadline);
                    }
                    
                    formData.append("estimated_hours", editTask.estimated_hours.toString());
                    
                    // Append file if any
                    if (editTaskFile) {
                      formData.append("file_url", editTaskFile);
                    }

                    // Send request to update task
                    const response = await axios.put(
                      `http://localhost:8003/api/task/updateTask/${editingTaskId}`,
                      formData,
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    if (response.data && response.data.success) {
                      toast.success("Task updated successfully");

                      // Refresh tasks
                      fetchTasks(id);

                      // Close edit modal
                      setEditingTaskId(null);
                      setEditTaskFile(null);
                    } else {
                      toast.error(
                        response.data?.message || "Failed to update task"
                      );

                      // Update local state as fallback
                      const updatedTasks = tasks.map((t) => {
                        if (t.id === editingTaskId) {
                          return {
                            ...t,
                            title: editTask.title,
                            description: editTask.description,
                            status: editTask.status,
                            priority: editTask.priority,
                            deadline: editTask.deadline
                              ? new Date(editTask.deadline).toISOString()
                              : t.deadline,
                            estimated_hours: editTask.estimated_hours,
                             progress:
                              editTask.status === "Completed"
                                ? 100
                                : editTask.status === "In Progress"
                                ? 50
                                : editTask.status === "Review"
                                ? 75
                                : 0,
                          };
                        }
                        return t;
                      });

                      setTasks(updatedTasks as Task[]);
                    }
                  } catch (error: any) {
                    toast.error(
                      "Error updating task: " +
                        (error.response?.data?.message || error.message)
                    );
                    console.error("Task update error:", error);
                  } finally {
                    setIsUpdatingTask(false);
                  }
                }}
                disabled={!editTask.title || isUpdatingTask}
                className={`px-4 py-2 rounded-md ${
                  isUpdatingTask
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-[#ff4e00] hover:bg-[#ff4e00]/90"
                } text-white transition-colors`}
              >
                {isUpdatingTask ? (
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
                    Updating...
                  </>
                ) : (
                  "Edit Task"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
