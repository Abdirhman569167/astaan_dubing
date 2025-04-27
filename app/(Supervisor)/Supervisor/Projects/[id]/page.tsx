"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiArrowLeft,
  FiClock,
  FiUser,
  FiMail,
  FiBriefcase,
  FiLink,
  FiEye,
  FiActivity,
  FiX,
  FiCheck,
  FiPlus,
  FiMessageCircle,
  FiUsers,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiFile,
  FiPaperclip,
  FiSend,
  FiCheckSquare,
} from "react-icons/fi";
import LoadingReuse from "@/components/LoadingReuse";
import userAuth from "@/myStore/userAuth";

// Sample data
const SAMPLE_USERS = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: null,
    role: "Developer",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: null,
    role: "Designer",
  },
  {
    id: 3,
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: null,
    role: "Project Manager",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah@example.com",
    avatar: null,
    role: "QA Engineer",
  },
];

const SAMPLE_CHAT = [
  {
    id: 1,
    user_id: 3,
    content: "Team, let's discuss the project timeline.",
    timestamp: "2023-10-10T09:30:00.000Z",
  },
  {
    id: 2,
    user_id: 2,
    content: "I've completed the mockups, please review when you have time.",
    timestamp: "2023-10-12T11:45:00.000Z",
  },
  {
    id: 3,
    user_id: 1,
    content: "Looking good! I'll start implementing the components now.",
    timestamp: "2023-10-13T14:20:00.000Z",
  },
  {
    id: 4,
    user_id: 4,
    content:
      "Found a few issues during testing. I'll create a list and share it soon.",
    timestamp: "2023-10-20T16:05:00.000Z",
  },
  {
    id: 5,
    user_id: 3,
    content: "Great work everyone! We're on track to meet our deadline.",
    timestamp: "2023-10-25T10:15:00.000Z",
  },
];

const SAMPLE_TASKS: Task[] = [
  {
    id: 1,
    title: "Design User Interface",
    description: "Create wireframes and mockups for the application",
    status: "Completed",
    priority: "High",
    created_at: "2023-10-15T00:00:00.000Z",
    deadline: "2023-10-30T00:00:00.000Z",
    assigned_to: 2,
    progress: 100,
    estimated_hours: 20,
    subtasks: [
      {
        id: 1,
        task_id: 1,
        title: "Create wireframes",
        description: "Create wireframes for all main pages",
        status: "Completed",
        priority: "High",
        deadline: "2023-10-20T00:00:00.000Z",
        estimated_hours: 8,
        assigned_to: 2,
        file_url: [],
        completed_at: "2023-10-19T00:00:00.000Z",
      },
      {
        id: 2,
        task_id: 1,
        title: "Design mockups",
        description:
          "Create high-fidelity mockups based on approved wireframes",
        status: "Completed",
        priority: "Medium",
        deadline: "2023-10-25T00:00:00.000Z",
        estimated_hours: 10,
        assigned_to: 2,
        file_url: [
          "https://example.com/mockup1.jpg",
          "https://example.com/mockup2.jpg",
        ],
        completed_at: "2023-10-24T00:00:00.000Z",
      },
      {
        id: 3,
        task_id: 1,
        title: "Get approval",
        description: "Present designs to stakeholders for approval",
        status: "Completed",
        priority: "High",
        deadline: "2023-10-30T00:00:00.000Z",
        estimated_hours: 2,
        assigned_to: 3,
        file_url: ["https://example.com/presentation.pdf"],
        completed_at: "2023-10-29T00:00:00.000Z",
      },
    ],
  } as Task,
  {
    id: 2,
    title: "Frontend Development",
    description: "Implement the UI components using React",
    status: "In Progress",
    priority: "Medium",
    created_at: "2023-10-25T00:00:00.000Z",
    deadline: "2023-11-15T00:00:00.000Z",
    assigned_to: 1,
    progress: 60,
    estimated_hours: 40,
    subtasks: [
      {
        id: 4,
        task_id: 2,
        title: "Set up project structure",
        description: "Initialize React project and configure build tools",
        status: "Completed",
        priority: "Medium",
        deadline: "2023-10-28T00:00:00.000Z",
        estimated_hours: 5,
        assigned_to: 1,
        file_url: [],
        completed_at: "2023-10-27T00:00:00.000Z",
      },
      {
        id: 5,
        task_id: 2,
        title: "Implement components",
        description: "Develop UI components according to design specs",
        status: "In Progress",
        priority: "High",
        deadline: "2023-11-10T00:00:00.000Z",
        estimated_hours: 25,
        assigned_to: 1,
        file_url: [],
        completed_at: null,
      },
      {
        id: 6,
        task_id: 2,
        title: "Write tests",
        description: "Create unit and integration tests for components",
        status: "To Do",
        priority: "Medium",
        deadline: "2023-11-15T00:00:00.000Z",
        estimated_hours: 10,
        assigned_to: 4,
        file_url: [],
        completed_at: null,
      },
    ],
  } as Task,
  {
    id: 3,
    title: "Backend Integration",
    description: "Connect frontend with backend APIs",
    status: "To Do",
    priority: "Critical",
    created_at: "2023-11-01T00:00:00.000Z",
    deadline: "2023-11-30T00:00:00.000Z",
    assigned_to: 1,
    progress: 0,
    estimated_hours: 30,
    subtasks: [
      {
        id: 7,
        task_id: 3,
        title: "Set up API client",
        description: "Create API client with authentication",
        status: "To Do",
        priority: "High",
        deadline: "2023-11-10T00:00:00.000Z",
        estimated_hours: 8,
        assigned_to: 1,
        file_url: [],
        completed_at: null,
      },
      {
        id: 8,
        task_id: 3,
        title: "Implement authentication",
        description: "Integrate auth flow with backend",
        status: "To Do",
        priority: "Critical",
        deadline: "2023-11-20T00:00:00.000Z",
        estimated_hours: 12,
        assigned_to: 1,
        file_url: [],
        completed_at: null,
      },
      {
        id: 9,
        task_id: 3,
        title: "Connect data services",
        description: "Implement data fetching and state management",
        status: "To Do",
        priority: "High",
        deadline: "2023-11-30T00:00:00.000Z",
        estimated_hours: 10,
        assigned_to: 1,
        file_url: [],
        completed_at: null,
      },
    ],
  } as Task,
];

// Helper functions
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

const getStatusBgColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-500";
    case "In Progress":
      return "bg-blue-500";
    case "Completed":
      return "bg-green-500";
    default:
      return "bg-gray-500";
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

// Types for our data
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
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Review" | "Completed";
  priority: "Low" | "Medium" | "High" | "Critical";
  created_at: string;
  deadline: string;
  assigned_to: number;
  progress: number;
  estimated_hours: number;
  subtasks: Subtask[];
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

export default function ProjectDetail({ params }: { params: any }) {
  const router = useRouter();
  // Fixed params handling with proper type safety
  const paramsObj = React.use(params) as { id: string };
  const id = paramsObj.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [daysInfo, setDaysInfo] = useState({ days: 0, overdue: false });
  const [isDeletingSubtask, setIsDeletingSubtask] = useState<number | null>(null);
  const user = userAuth((state) => state.user);

  // New state for tasks and chat
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [users, setUsers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' or 'chat'
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
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [loadingSubtasks, setLoadingSubtasks] = useState<{ [key: number]: boolean }>({});
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
  const [showNewSubtaskForm, setShowNewSubtaskForm] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(
    null
  );
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showSubtaskDetailsModal, setShowSubtaskDetailsModal] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submittingSubtask, setSubmittingSubtask] = useState(false);
  // Add a new state for expanded subtasks
  const [expandedSubtaskId, setExpandedSubtaskId] = useState<number | null>(
    null
  );
  // Add states for editing subtasks
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
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
  // Add state to track which subtask has user assignment dropdown open
  const [showAssignDropdown, setShowAssignDropdown] = useState<number | null>(
    null
  );
  // Add new state for editing tasks
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

  const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

  // Add a loading state for task creation
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Add a state to track which task is being deleted
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  // Add a state for tracking task update loading
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  const [isAssigning, setIsAssigning] = useState<number | null>(null);

  // Add this function after the fetchSubtasks function
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

  // Add this function to handle task assignment
  const handleAssignTask = async (subtaskId: number, userId: number) => {
    try {
      setIsAssigning(subtaskId);
      const response = await axios.post('http://localhost:8003/api/task-assignment/assignTask', {
        task_id: subtaskId,
        user_id: userId
      });

      if (response.status === 200 || response.status === 201) {
        // Find the selected user's information
        const assignedUser = users.find(u => u.id === userId);
        
        toast.success('Task assigned successfully');
        // Update the local state to reflect the assignment
        setTasks(prevTasks =>
          prevTasks.map(task => ({
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { 
                    ...subtask, 
                    assigned_to: userId,
                    assigned_user: assignedUser?.name || 'Unknown User',
                    profile_image: assignedUser?.profile_image || null
                  }
                : subtask
            )
          }))
        );

        // Fetch the latest assignment status
        const taskId = tasks.find(task => 
          task.subtasks.some(subtask => subtask.id === subtaskId)
        )?.id;
        
        if (taskId) {
          await fetchSubtasks(taskId);
        }
      }
    } catch (error: any) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
    } finally {
      setIsAssigning(null);
      setShowAssignDropdown(null);
    }
  };

  // Add useEffect to fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${projectService}/api/project/singleProject/${id}`
        );

        if (response.data.success) {
          const projectData = response.data.project;
          setProject(projectData);

          // Calculate days remaining when project is loaded
          const daysData = calculateDaysLeft(projectData.deadline);
          setDaysInfo(daysData);

          // Fetch tasks for this project
          fetchTasks(id);
        } else {
          toast.error("Failed to load project details");
          router.push("/Supervisor/Projects");
        }
      } catch (error: any) {
        toast.error(
          "Error loading project: " +
            (error.response?.data?.message || error.message)
        );
        router.push("/Supervisor/Projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, projectService, router]);

  // Add a function to fetch tasks for a project
  const fetchTasks = async (projectId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8003/api/task/projectTasks/${projectId}`
      );

      if (response.data.success) {
        // Map the API response to our task structure
        const tasksFromApi = response.data.tasks ? response.data.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          created_at: task.created_at || new Date().toISOString(),
          deadline: task.deadline,
          assigned_to: task.assigned_to || 0,
          progress:
            task.status === "Completed"
              ? 100
              : task.status === "In Progress"
              ? 50
              : task.status === "Review"
              ? 75
              : 0,
          estimated_hours: task.estimated_hours,
          subtasks: [], // Initialize with empty subtasks
        })) : [];

        setTasks(tasksFromApi as Task[]);
      } else {
        // Don't show an error, just set empty tasks array
        setTasks([]);
      }
    } catch (error: any) {
      // For no tasks, don't show an error, just set an empty tasks array
      if (error.response?.status === 404 || error.response?.data?.message?.includes("No tasks found")) {
        setTasks([]);
      } else {
        // Only show errors for actual API failures, not for "no tasks found" cases
        toast.error(
          "Error loading tasks: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${projectService}/api/project/projectDelete/${id}`
      );

      if (response.data.success) {
        toast.success("Project deleted successfully");
        router.push("/Supervisor/Projects");
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

  // Add a function to fetch subtasks for a specific task
  const fetchSubtasks = async (taskId: number) => {
    try {
      setLoadingSubtasks(prev => ({ ...prev, [taskId]: true }));
      
      // Fetch subtasks
      const subtasksResponse = await axios.get(`http://localhost:8003/api/subtasks/task/${taskId}`);
      
      // Fetch task assignments
      const assignmentsResponse = await axios.get('http://localhost:8003/api/task-assignment/allTaskStatusUpdates');
      
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

      // Update the tasks state with subtasks and assignment information
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              subtasks: Array.isArray(subtasksResponse.data) ? subtasksResponse.data.map((subtask: any) => {
                const assignment = latestAssignments[subtask.id];
                return {
                  id: subtask.id,
                  task_id: subtask.task_id,
                  title: subtask.title,
                  description: subtask.description,
                  status: subtask.status,
                  priority: subtask.priority,
                  deadline: subtask.deadline,
                  estimated_hours: subtask.estimated_hours,
                  assigned_to: assignment?.updated_by || 0,
                  assigned_user: assignment?.assigned_user || null,
                  profile_image: assignment?.profile_image || null,
                  file_url: JSON.parse(subtask.file_url || '[]'),
                  completed_at: subtask.completed_at
                };
              }) : []
            };
          }
          return task;
        })
      );
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Error fetching subtasks: " + (error.response?.data?.message || error.message));
      }
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              subtasks: []
            };
          }
          return task;
        })
      );
    } finally {
      setLoadingSubtasks(prev => ({ ...prev, [taskId]: false }));
    }
  };

  useEffect(() => {
    if (id && activeTab === "chat") {
      fetchChatMessages(id);
    }
  }, [id, activeTab]);

  const fetchChatMessages = async (projectId: string) => {
    try {
      setLoadingChat(true);
      const response = await axios.get(`http://localhost:8005/api/chat/${projectId}`);
      
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
    
    // Store current message text and file to clear input immediately
    const messageText = newMessage.trim();
    const messageFile = chatFile;
    
    // Clear input fields immediately for better UX
    setNewMessage("");
    setChatFile(null);
    
    try {
      setSendingMessage(true);
      
      const formData = new FormData();
      formData.append("projectId", id);
      // Use the user ID from auth state with null check
      formData.append("senderId", user.id.toString());
      
      if (messageText) {
        formData.append("message", messageText);
      }
      
      if (messageFile) {
        formData.append("file", messageFile);
      }
      
      const response = await axios.post(
        "http://localhost:8005/api/chat/send",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000, // 10 second timeout
        }
      );
      
      // Check for successful response
      if (response.data && (response.data.success || response.data.message === "Message sent" || response.data.newMessage)) {
        // Message sent successfully
        toast.success("Message sent successfully");
        // Refresh chat messages
        setTimeout(() => fetchChatMessages(id), 500);
      } else {
        console.error("Failed to send message:", response.data);
        toast.error(response.data?.message || "Failed to send message");
        // If sending failed, give the option to retry
        if (messageText || messageFile) {
          setNewMessage(messageText);
          if (messageFile) setChatFile(messageFile);
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Provide better error messages based on error type
      if (error.code === 'ECONNABORTED') {
        toast.error("Request timed out. The server may be busy.");
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(`Server error: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(`Error: ${error.message || "Unknown error occurred"}`);
      }
      
      // If sending failed, give the option to retry by restoring message
      if (messageText || messageFile) {
        setNewMessage(messageText);
        if (messageFile) setChatFile(messageFile);
      }
    } finally {
      setSendingMessage(false);
      // Try to refresh messages regardless of success or failure
      setTimeout(() => fetchChatMessages(id), 1000);
    }
  };

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
            onClick={() => router.push("/Supervisor/Projects")}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-[#ff4e00] hover:bg-[#ff4e00]/90 transition-all font-medium shadow-sm"
          >
            <FiArrowLeft className="mr-2" /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Use the stored days info instead of calculating it every render
  const { days, overdue } = daysInfo;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top navigation and actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 bg-white p-5 rounded-xl shadow-md sticky top-0 z-10 border-b border-gray-100">
        <button
          onClick={() => router.push("/Supervisor/Projects")}
          className="inline-flex items-center text-gray-600 hover:text-[#ff4e00] transition-colors font-medium"
        >
          <FiArrowLeft className="mr-2" /> Back to Projects
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column with project image and stats */}
        <div className="lg:col-span-1">
          {/* Project image */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-all hover:shadow-lg">
            <div className="h-52 sm:h-72 overflow-hidden relative">
              {project.project_image ? (
                <img
                  src={project.project_image}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder-image.png";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400">
                  <div className="text-center">
                    <FiBriefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <span>No Image Available</span>
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <div className="flex justify-between items-center">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPriorityColor(
                      project.priority
                    )}`}
                  >
                    {project.priority} Priority
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800 truncate">
                  {project.name}
                </h1>
              </div>
              <div className="mb-5 space-y-2.5">
                <div className="flex items-center text-gray-500">
                  <FiCalendar size={16} className="mr-3 text-gray-400" />
                  <span>Created: {formatDate(project.created_at)}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FiClock size={16} className="mr-3 text-gray-400" />
                  <span className={overdue ? "text-red-600 font-medium" : ""}>
                    Deadline: {formatDate(project.deadline)}
                  </span>
                </div>
                {overdue && (
                  <div className="flex items-center text-red-600 font-medium mt-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 text-xs">
                      {days} {days === 1 ? "day" : "days"} overdue
                    </span>
                  </div>
                )}
                {!overdue && project.deadline && (
                  <div className="flex items-center text-green-600 font-medium mt-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-xs">
                      {days} {days === 1 ? "day" : "days"} remaining
                    </span>
                  </div>
                )}
              </div>

              {/* Project metadata with decorative elements */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 mb-5">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FiCalendar className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Project Timeline
                    </div>
                    <div className="text-sm font-medium">
                      {formatDate(project.created_at)} -{" "}
                      {formatDate(project.deadline)}
                    </div>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-blue-200 rounded-full mt-3 mb-1">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Started</span>
                  <span>{project.progress}% Complete</span>
                  <span>Deadline</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium text-gray-700">Progress</span>
                  <span className="text-gray-500">{project.progress}%</span>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      project.progress < 25
                        ? "bg-red-500"
                        : project.progress < 50
                        ? "bg-orange-500"
                        : project.progress < 75
                        ? "bg-blue-500"
                        : "bg-green-500"
                    } transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Creator information */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 transition-all hover:shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FiUser className="mr-2 text-[#ff4e00]" /> Creator
            </h2>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {project.creator_profile_image ? (
                  <img
                    src={project.creator_profile_image}
                    alt={project.creator_name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/api/avatar?name=${encodeURIComponent(
                        project.creator_name
                      )}`;
                    }}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-semibold text-blue-600 border-2 border-white shadow-md">
                    {project.creator_name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  {project.creator_name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <FiBriefcase className="mr-2 text-gray-400" size={14} />
                    <span>{project.creator_role || "No role specified"}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FiMail className="mr-2 text-gray-400" size={14} />
                    <span className="truncate">
                      {project.creator_email || "No email available"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FiUser className="mr-2 text-gray-400" size={14} />
                    <span>ID: {project.creator_id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column with project details and tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project description */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
              <FiActivity className="mr-2 text-[#ff4e00]" /> Project Overview
            </h2>
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center pl-3 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 shadow-sm">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mr-2 ${getStatusBgColor(
                      project.status
                    )}`}
                  ></div>
                  <span className="text-gray-700 text-sm font-medium">
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center px-4 py-2 rounded-full bg-gray-50 border border-gray-200 shadow-sm">
                  <span className="text-gray-700 text-sm">
                    ID: {project.id}
                  </span>
                </div>
                <div className="flex items-center px-4 py-2 rounded-full bg-gray-50 border border-gray-200 shadow-sm">
                  <span className="text-gray-700 text-sm">
                    Created: {formatDate(project.created_at)}
                  </span>
                </div>
                <div className="flex items-center px-4 py-2 rounded-full bg-gray-50 border border-gray-200 shadow-sm">
                  <span className="text-gray-700 text-sm">
                    Last updated: {formatDate(project.updated_at)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-4 text-lg">
                  Description
                </h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {project.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Project timeline */}
            <div>
              <h3 className="font-medium text-gray-700 mb-4 text-lg flex items-center">
                <FiClock className="mr-2 text-blue-500" /> Timeline
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(project.created_at)}
                    </p>
                  </div>
                  <div className="h-1.5 flex-grow mx-8 bg-gray-200 rounded-full relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-[#ff4e00] rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                    <div
                      className="absolute -top-2 -ml-3 h-6 w-6 rounded-full bg-white border-2 border-[#ff4e00] shadow-md transition-all"
                      style={{ left: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Deadline</p>
                    <p
                      className={`font-medium ${
                        overdue ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm text-center">
                      <p className="text-sm text-gray-500 mb-2">Status</p>
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${getStatusBgColor(
                            project.status
                          )}`}
                        ></div>
                        <p className={`font-semibold text-sm`}>
                          {project.status}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm text-center">
                      <p className="text-sm text-gray-500 mb-2">Priority</p>
                      <p
                        className={`font-semibold inline-block px-3 py-1 rounded-full text-sm ${getPriorityColor(
                          project.priority
                        )}`}
                      >
                        {project.priority}
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm text-center">
                      <p className="text-sm text-gray-500 mb-2">Completion</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `conic-gradient(#4ade80 ${
                              project.progress * 3.6
                            }deg, #f3f4f6 ${project.progress * 3.6}deg)`,
                          }}
                        >
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-800">
                              {project.progress}%
                            </span>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800">
                          {project.progress}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional project metrics */}
                <div className="mt-8 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-4">
                    Project Metrics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {days}
                      </div>
                      <p className="text-sm text-gray-500">
                        {overdue ? "Days Overdue" : "Days Remaining"}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {users.length}
                      </div>
                      <p className="text-sm text-gray-500">Team Members</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {
                          tasks.filter((task) => task.status === "Completed")
                            .length
                        }
                      </div>
                      <p className="text-sm text-gray-500">Completed Tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        {
                          tasks.filter((task) => task.status !== "Completed")
                            .length
                        }
                      </div>
                      <p className="text-sm text-gray-500">Open Tasks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Management and Chat Tabs */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === "tasks"
                    ? "text-[#ff4e00] border-b-2 border-[#ff4e00]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center">
                  <FiCheckCircle className="mr-2" /> Tasks & Subtasks
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

            {/* Tasks Tab Content */}
            {activeTab === "tasks" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    Project Tasks
                  </h3>
                  {!showNewTaskForm && (
                    <button
                      onClick={() => setShowNewTaskForm(true)}
                      className="inline-flex items-center px-3 py-2 rounded-lg bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 transition-all text-sm font-medium"
                    >
                      <FiPlus className="mr-1" /> Add Task
                    </button>
                  )}
                </div>

                {/* New Task Form */}
                {showNewTaskForm && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-700">
                        Create New Task
                      </h4>
                      <button
                        onClick={() => setShowNewTaskForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Task Title *
                        </label>
                        <input
                          type="text"
                          value={newTask.title}
                          onChange={(e) =>
                            setNewTask({ ...newTask, title: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                          placeholder="Enter task title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                          placeholder="Enter task description"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
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
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
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
                            value={newTask.deadline}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                deadline: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                            placeholder="Enter estimated hours"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          onClick={() => setShowNewTaskForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-medium"
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

                              // Format the payload for the API
                              const taskData = {
                                title: newTask.title,
                                description: newTask.description,
                                project_id: Number(id), // Convert to number if needed
                                status: newTask.status,
                                priority: newTask.priority,
                                deadline: newTask.deadline
                                  ? new Date(newTask.deadline).toISOString()
                                  : null,
                                estimated_hours: newTask.estimated_hours,
                              };

                              // Send data to the API
                              const response = await axios.post(
                                "http://localhost:8003/api/task/addTask",
                                taskData
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

                                // Close the form
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
                          className={`px-3 py-2 rounded-lg text-white text-sm font-medium ${
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
                            "Add Task"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Task List */}
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-600">
                        No tasks for this project yet. Use the Add Task button to create your first task.
                      </h3>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
                      >
                        {/* Task Header */}
                        <div
                          className="p-4 cursor-pointer hover:bg-gray-50"
                          onClick={async () => {
                            if (expandedTask === task.id) {
                              setExpandedTask(null);
                            } else {
                              setExpandedTask(task.id);
                              // Fetch subtasks when expanding a task
                              await fetchSubtasks(task.id);
                            }
                          }}
                        >
                          <div
                            className="flex justify-between items-center w-full"
                            onClick={() =>
                              setExpandedTask(
                                expandedTask === task.id ? null : task.id
                              )
                            }
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  task.status === "Completed"
                                    ? "bg-green-500"
                                    : task.status === "In Progress"
                                    ? "bg-blue-500"
                                    : task.status === "Review"
                                    ? "bg-purple-500"
                                    : "bg-yellow-500"
                                }`}
                              ></div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {task.title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                {task.status}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Prepare edit form with current values
                                  const taskToEdit = tasks.find(
                                    (t) => t.id === task.id
                                  );

                                  if (taskToEdit) {
                                    setEditTask({
                                      title: taskToEdit.title,
                                      description: taskToEdit.description || "",
                                      status: taskToEdit.status,
                                      priority: taskToEdit.priority,
                                      deadline: taskToEdit.deadline
                                        ? new Date(taskToEdit.deadline)
                                            .toISOString()
                                            .split("T")[0]
                                        : "",
                                      estimated_hours:
                                        taskToEdit.estimated_hours || 0,
                                    });
                                    setEditingTaskId(task.id);
                                  }
                                }}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this task and all its subtasks?"
                                    )
                                  ) {
                                    try {
                                      setDeletingTaskId(task.id);

                                      // Call the API to delete the task
                                      const response = await axios.delete(
                                        `http://localhost:8003/api/task/deleteSingleTask/${task.id}`
                                      );

                                      if (
                                        response.data &&
                                        response.data.success
                                      ) {
                                        toast.success(
                                          "Task deleted successfully"
                                        );

                                        // Refresh the task list
                                        fetchTasks(id);
                                      } else {
                                        toast.error(
                                          response.data?.message ||
                                            "Failed to delete task"
                                        );

                                        // Update local state as fallback if needed
                                        const updatedTasks = tasks.filter(
                                          (t) => t.id !== task.id
                                        );
                                        setTasks(updatedTasks as Task[]);
                                      }
                                    } catch (error: any) {
                                      toast.error(
                                        "Error deleting task: " +
                                          (error.response?.data?.message ||
                                            error.message)
                                      );
                                      console.error(
                                        "Task deletion error:",
                                        error
                                      );
                                    } finally {
                                      setDeletingTaskId(null);
                                      setExpandedTask(null);
                                    }
                                  }
                                }}
                                className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                disabled={deletingTaskId === task.id}
                              >
                                {deletingTaskId === task.id ? (
                                  <span className="flex items-center">
                                    <svg
                                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-600"
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
                                  </span>
                                ) : (
                                  "Delete"
                                )}
                              </button>
                              <svg
                                className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                  expandedTask === task.id ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Task Content with Subtasks */}
                        {expandedTask === task.id && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                                <FiCheckCircle className="mr-2 text-gray-500" size={16} />
                                Subtasks ({task.subtasks.length})
                              </h5>

                              {/* Add Subtask Button - Moved to top */}
                              {showNewSubtaskForm === task.id ? (
                                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="text-sm font-medium text-gray-700">
                                      Add Subtask
                                    </h6>
                                    <button
                                      onClick={() => {
                                        setShowNewSubtaskForm(null);
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
                                      <FiX size={16} />
                                    </button>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                        rows={2}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                        onClick={async () => {
                                          if (!newSubtask.title) {
                                            toast.error("Title is required");
                                            return;
                                          }

                                          try {
                                            setIsCreatingSubtask(true);

                                            // Create FormData object
                                            const formData = new FormData();
                                            formData.append("task_id", task.id.toString());
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
                                              setShowNewSubtaskForm(null);

                                              // Refresh subtasks with a slight delay to ensure the backend has processed the creation
                                              setTimeout(async () => {
                                                await fetchSubtasks(task.id);
                                              }, 500);
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
                                              setShowNewSubtaskForm(null);

                                              // Refresh subtasks with a slight delay
                                              setTimeout(async () => {
                                                await fetchSubtasks(task.id);
                                              }, 500);
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
                                        }}
                                        disabled={!newSubtask.title || isCreatingSubtask}
                                        className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium ${
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
                              ) : (
                                <button
                                  onClick={() => setShowNewSubtaskForm(task.id)}
                                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-xs font-medium mb-4"
                                >
                                  <FiPlus className="mr-1" /> Add Subtask
                                </button>
                              )}

                              {/* Subtask List */}
                              {loadingSubtasks[task.id] ? (
                                <div className="flex justify-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff4e00]"></div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {task.subtasks.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic bg-white p-4 rounded-lg border border-gray-200">
                                      No subtasks yet. Click "Add Subtask" to create one.
                                    </p>
                                  ) : (
                                    task.subtasks.map((subtask) => (
                                      <div
                                        key={subtask.id}
                                        className="flex flex-col bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all overflow-hidden"
                                      >
                                        {/* Header - always visible */}
                                        <div
                                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                                          onClick={() => setExpandedSubtaskId(expandedSubtaskId === subtask.id ? null : subtask.id)}
                                        >
                                          <div className="flex items-start flex-1">
                                            <div className="flex items-center">
                                              <div
                                                className={`w-2.5 h-2.5 rounded-full mr-2 ${
                                                  subtask.status === "Completed"
                                                    ? "bg-green-500"
                                                    : subtask.status === "In Progress"
                                                    ? "bg-blue-500"
                                                    : subtask.status === "Review"
                                                    ? "bg-purple-500"
                                                    : "bg-yellow-500"
                                                }`}
                                              />
                                            </div>
                                            <div>
                                              <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-gray-800">
                                                  {subtask.title}
                                                </span>
                                                <span
                                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                    subtask.status
                                                  )}`}
                                                >
                                                  {subtask.status}
                                                </span>
                                                <span
                                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                                    subtask.priority
                                                  )}`}
                                                >
                                                  {subtask.priority}
                                                </span>
                                              </div>
                                              <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                                                {subtask.deadline && (
                                                  <div className="flex items-center">
                                                    <FiCalendar
                                                      className="mr-1"
                                                      size={12}
                                                    />
                                                    <span>
                                                      {formatDate(
                                                        subtask.deadline
                                                      )}
                                                    </span>
                                                  </div>
                                                )}
                                                {subtask.estimated_hours && (
                                                  <div className="flex items-center">
                                                    <FiClock
                                                      className="mr-1"
                                                      size={12}
                                                    />
                                                    <span>
                                                      {subtask.estimated_hours}{" "}
                                                      hours
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {!subtask.assigned_to ? (
                                              <div className="relative">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowAssignDropdown(showAssignDropdown === subtask.id ? null : subtask.id);
                                                  }}
                                                  className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                                                >
                                                  Assign
                                                </button>
                                                {showAssignDropdown === subtask.id && (
                                                  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[400px]">
                                                    <div className="flex justify-between items-center p-4 border-b">
                                                      <h3 className="text-lg font-semibold">Assign Subtask</h3>
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setShowAssignDropdown(null);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                      >
                                                        ×
                                                      </button>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto p-4">
                                                      {users.map((user) => (
                                                        <button
                                                          key={user.id}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAssignTask(subtask.id, user.id);
                                                          }}
                                                          className="w-full text-left p-3 hover:bg-gray-50 flex items-center space-x-3 rounded-lg mb-2"
                                                        >
                                                          {user.profile_image ? (
                                                            <img 
                                                              src={user.profile_image} 
                                                              alt={user.name}
                                                              className="w-10 h-10 rounded-full object-cover"
                                                              onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = `/api/avatar?name=${encodeURIComponent(user.name)}`;
                                                              }}
                                                            />
                                                          ) : (
                                                            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                                                              {user.name.charAt(0)}
                                                            </div>
                                                          )}
                                                          <div>
                                                            <div className="font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.role}</div>
                                                          </div>
                                                        </button>
                                                      ))}
                                                    </div>
                                                    <div className="p-4 border-t">
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setShowAssignDropdown(null);
                                                        }}
                                                        className="w-full py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded"
                                                      >
                                                        Cancel
                                                      </button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="flex items-center space-x-2">
                                                {subtask.profile_image ? (
                                                  <img 
                                                    src={subtask.profile_image}
                                                    alt={subtask.assigned_user || 'Assigned User'}
                                                    className="h-6 w-6 rounded-full object-cover"
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      target.src = `/api/avatar?name=${encodeURIComponent(subtask.assigned_user || '')}`;
                                                    }}
                                                  />
                                                ) : (
                                                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                                    {(subtask.assigned_user || '?').charAt(0)}
                                                  </div>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                  {subtask.assigned_user || 'Unknown User'}
                                                </span>
                                              </div>
                                            )}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // Prepare edit form with current values
                                                const subtaskToEdit = tasks
                                                  .flatMap((t) => t.subtasks)
                                                  .find(
                                                    (s) => s.id === subtask.id
                                                  );

                                                if (subtaskToEdit) {
                                                  setEditSubtask({
                                                    title: subtaskToEdit.title,
                                                    description:
                                                      subtaskToEdit.description ||
                                                      "",
                                                    status: subtaskToEdit.status,
                                                    priority:
                                                      subtaskToEdit.priority,
                                                    deadline:
                                                      subtaskToEdit.deadline
                                                        ? new Date(
                                                            subtaskToEdit.deadline
                                                          )
                                                            .toISOString()
                                                            .split("T")[0]
                                                        : "",
                                                    estimated_hours:
                                                      subtaskToEdit.estimated_hours ||
                                                      0,
                                                  });
                                                  setEditingSubtaskId(subtask.id);
                                                }
                                              }}
                                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                if (confirm("Are you sure you want to delete this subtask?")) {
                                                  try {
                                                    setIsDeletingSubtask(subtask.id);
                                                    const response = await axios.delete(
                                                      `http://localhost:8003/api/subtasks/DeleteSubTask/${subtask.id}`
                                                    );

                                                    // Consider the request successful if we get a 200 or 204 status
                                                    if (response.status === 200 || response.status === 204) {
                                                      toast.success("Subtask deleted successfully");
                                                      await fetchSubtasks(task.id);
                                                      setExpandedSubtaskId(null);
                                                    }
                                                  } catch (error: any) {
                                                    console.error('Delete error:', error);
                                                    // Check if the status code indicates success despite being in catch block
                                                    if (error.response?.status === 200 || error.response?.status === 204) {
                                                      toast.success("Subtask deleted successfully");
                                                      await fetchSubtasks(task.id);
                                                      setExpandedSubtaskId(null);
                                                    } else {
                                                      toast.error(`Failed to delete subtask`);
                                                    }
                                                  } finally {
                                                    setIsDeletingSubtask(null);
                                                  }
                                                }
                                              }}
                                              disabled={isDeletingSubtask === subtask.id}
                                              className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {isDeletingSubtask === subtask.id ? (
                                                <span className="flex items-center">
                                                  <svg
                                                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-600"
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
                                                </span>
                                              ) : (
                                                "Delete"
                                              )}
                                            </button>
                                            <svg
                                              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                                expandedSubtaskId === subtask.id ? "rotate-180" : ""
                                              }`}
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 9l-7 7-7-7"
                                              ></path>
                                            </svg>
                                          </div>
                                        </div>

                                        {/* Expanded content - only visible when expanded */}
                                        {expandedSubtaskId === subtask.id && (
                                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                                            <div className="space-y-4">
                                              {/* Description */}
                                              <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                  Description
                                                </h4>
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                  {subtask.description ? (
                                                    <p className="text-sm text-gray-700">
                                                      {subtask.description}
                                                    </p>
                                                  ) : (
                                                    <p className="text-sm text-gray-500 italic">
                                                      No description provided
                                                    </p>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Details grid */}
                                              <div className="grid grid-cols-2 gap-4">
                                                {/* Deadline */}
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                  <p className="text-xs text-gray-500 mb-1">Deadline</p>
                                                  <p className="text-sm font-medium">
                                                    {formatDate(subtask.deadline || "")}
                                                  </p>
                                                </div>

                                                {/* Estimated Hours */}
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                  <p className="text-xs text-gray-500 mb-1">
                                                    Estimated Hours
                                                  </p>
                                                  <p className="text-sm font-medium">
                                                    {subtask.estimated_hours || "Not specified"}
                                                  </p>
                                                </div>

                                                {/* Status */}
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                  <p className="text-xs text-gray-500 mb-1">Status</p>
                                                  <div className="flex items-center">
                                                    <div
                                                      className={`w-2.5 h-2.5 rounded-full mr-2 ${
                                                        subtask.status === "Completed"
                                                          ? "bg-green-500"
                                                          : subtask.status === "In Progress"
                                                          ? "bg-blue-500"
                                                          : subtask.status === "Review"
                                                          ? "bg-purple-500"
                                                          : "bg-yellow-500"
                                                      }`}
                                                    />
                                                    <p className="text-sm font-medium">{subtask.status}</p>
                                                  </div>
                                                </div>

                                                {/* Priority */}
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                  <p className="text-xs text-gray-500 mb-1">Priority</p>
                                                  <p
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                                      subtask.priority
                                                    )}`}
                                                  >
                                                    {subtask.priority}
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Attached Files */}
                                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                <p className="text-xs text-gray-500 mb-1">Attached Files</p>
                                                {subtask.file_url && subtask.file_url.length > 0 ? (
                                                  <div className="space-y-2">
                                                    {subtask.file_url.map((url, index) => (
                                                      <div
                                                        key={index}
                                                        className="flex items-center justify-between"
                                                      >
                                                        <div className="flex items-center">
                                                          <FiLink size={14} className="text-blue-500 mr-2" />
                                                          <span className="text-sm truncate">
                                                            File {index + 1}
                                                          </span>
                                                        </div>
                                                        <button
                                                          onClick={() => window.open(url, "_blank")}
                                                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                                        >
                                                          View
                                                        </button>
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <p className="text-sm text-gray-500 italic">
                                                    No files attached
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Chat Tab Content */}
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
                        // Check if the message sender ID matches the current user ID
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
                                            {/* Only display message text if it's different from the file URL */}
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
                                            {/* Only display message text if it's different from the file URL */}
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
                                            {/* Only display message text if it's different from the file URL */}
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
                                            {/* Only display message text if it's different from the file URL */}
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
                                            {/* Only display message text if it's different from the file URL */}
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
                                            {/* Only display message text if it's different from the file URL */}
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

                {/* Chat Input */}
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

      {/* Delete confirmation modal */}
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

      {/* Edit Subtask Form Modal */}
      {editingSubtaskId && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg w-[400px]">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Edit Subtask</h3>
            <button
              onClick={() => setEditingSubtaskId(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editSubtask.title}
                  onChange={(e) =>
                    setEditSubtask({ ...editSubtask, title: e.target.value })
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
                  value={editSubtask.description}
                  onChange={(e) =>
                    setEditSubtask({
                      ...editSubtask,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  placeholder="Enter subtask description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editSubtask.status}
                    onChange={(e) =>
                      setEditSubtask({
                        ...editSubtask,
                        status: e.target.value as "To Do" | "In Progress" | "Review" | "Completed",
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
                    value={editSubtask.priority}
                    onChange={(e) =>
                      setEditSubtask({
                        ...editSubtask,
                        priority: e.target.value as "Low" | "Medium" | "High" | "Critical",
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={editSubtask.deadline}
                    onChange={(e) =>
                      setEditSubtask({
                        ...editSubtask,
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
                    value={editSubtask.estimated_hours}
                    onChange={(e) =>
                      setEditSubtask({
                        ...editSubtask,
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
            </div>
          </div>
          <div className="p-4 border-t">
            <button
              onClick={async () => {
                if (!editSubtask.title) {
                  toast.error("Title is required");
                  return;
                }

                try {
                  setIsCreatingSubtask(true);

                  // Create FormData object
                  const formData = new FormData();
                  formData.append("title", editSubtask.title);
                  formData.append("description", editSubtask.description || "");
                  formData.append("status", editSubtask.status);
                  formData.append("priority", editSubtask.priority);
                  
                  if (editSubtask.deadline) {
                    const formattedDeadline = new Date(editSubtask.deadline).toISOString();
                    formData.append("deadline", formattedDeadline);
                  }
                  
                  formData.append("estimated_hours", editSubtask.estimated_hours.toString());

                  // Append files if any
                  if (selectedFiles && selectedFiles.length > 0) {
                    Array.from(selectedFiles).forEach((file) => {
                      formData.append("file_url", file);
                    });
                  }

                  // Send request to update subtask
                  const response = await axios.put(
                    `http://localhost:8003/api/subtasks/UpdateSubTask/${editingSubtaskId}`,
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );

                  if (response.status === 200 || response.status === 201) {
                    toast.success("Subtask updated successfully");
                    
                    // Reset form and close modal
                    setSelectedFiles(null);
                    setEditingSubtaskId(null);

                     const taskId = tasks.find(task => 
                      task.subtasks.some(subtask => subtask.id === editingSubtaskId)
                    )?.id;
                    
                    if (taskId) {
                      await fetchSubtasks(taskId);
                    }
                  } else {
                    toast.error("Failed to update subtask");
                  }
                } catch (error: any) {
                  console.error('Error details:', error.response?.data || error.message);
                  
                   if (error.response?.status === 200 || error.response?.status === 201) {
                    toast.success("Subtask updated successfully");
                    setSelectedFiles(null);
                    setEditingSubtaskId(null);

                     const taskId = tasks.find(task => 
                      task.subtasks.some(subtask => subtask.id === editingSubtaskId)
                    )?.id;
                    
                    if (taskId) {
                      await fetchSubtasks(taskId);
                    }
                  } else {
                    const errorMessage = error.response?.data?.message 
                      || error.response?.data?.error 
                      || error.message 
                      || "Failed to update subtask";
                    toast.error(`Error: ${errorMessage}`);
                  }
                } finally {
                  setIsCreatingSubtask(false);
                }
              }}
              disabled={!editSubtask.title || isCreatingSubtask}
              className="w-full py-2 bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreatingSubtask ? (
                <span className="flex items-center justify-center">
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
                  Updating...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Edit Task Form Modal */}
      {editingTaskId && (
        <>
          {/* Remove the dark overlay and backdrop blur */}
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
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    setEditingTaskId(null);
                    // Call the delete function here
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

                    // Prepare data for the API
                    const taskData = {
                      title: editTask.title,
                      description: editTask.description,
                      status: editTask.status,
                      priority: editTask.priority,
                      deadline: editTask.deadline
                        ? new Date(editTask.deadline).toISOString()
                        : null,
                      estimated_hours: editTask.estimated_hours,
                    };

                    // Call the API to update the task
                    const response = await axios.put(
                      `http://localhost:8003/api/task/updateTask/${editingTaskId}`,
                      taskData
                    );

                    if (response.data && response.data.success) {
                      toast.success("Task updated successfully");

                      // Refresh the task list to get the updated data from the server
                      fetchTasks(id);

                      // Close the edit modal
                      setEditingTaskId(null);
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
                            // Update progress based on new status
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
