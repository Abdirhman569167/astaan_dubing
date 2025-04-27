"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingReuse from "@/components/LoadingReuse";
import { FiEdit, FiEye, FiTrash2, FiCalendar, FiClock, FiFlag, FiX, FiPlus, FiSearch, FiUpload, FiImage, FiFilter, FiInfo, FiLayers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import userAuth from "@/myStore/userAuth";
import { motion } from "framer-motion";

 const PROJECT_STATUSES = ["All", "Pending", "In Progress", "Completed"];
const PROJECT_PRIORITIES = ["All", "Low", "Medium", "High", "Critical"];

const getStatusColor = (status: string) => {
  switch(status) {
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
  switch(priority) {
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

const getPriorityDot = (priority: string) => {
  switch(priority) {
    case "Low":
      return "bg-green-500";
    case "Medium":
      return "bg-blue-500";
    case "High":
      return "bg-orange-500";
    case "Critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
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
  
  return { days: Math.abs(differenceDays), overdue: differenceDays < 0 };
};

 const AddTaskButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="border border-dashed border-gray-200 rounded-lg p-2.5 flex items-center justify-center mb-4 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-1.5 text-gray-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        <span className="text-sm">Add Task</span>
      </div>
    </div>
  );
};

 const KanbanCard = ({ 
  project, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  project: any; 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  const { days, overdue } = calculateDaysLeft(project.deadline);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all overflow-hidden">
       <div className="p-4">
        <div className="flex justify-between items-start mb-3">
           <div className="flex gap-2 items-center">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(project.priority)}`}></span>
            <h3 className="font-medium text-gray-800 line-clamp-1" title={project.name}>
              {project.name}
            </h3>
          </div>
          
           <div className={`text-xs px-2 py-0.5 rounded-full ${
            project.priority === "High" ? "bg-red-100 text-red-800" : 
            project.priority === "Medium" ? "bg-blue-100 text-blue-800" : 
            project.priority === "Low" ? "bg-green-100 text-green-800" : 
            "bg-gray-100 text-gray-800"
          }`}>
            {project.priority}
          </div>
        </div>
        
         <div className="text-xs text-gray-500 mb-3">
          {project.creator_name || "SOM"}
        </div>
        
         <div className="flex items-center text-xs text-gray-500 mb-3">
          <svg className="mr-1.5" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>Due {formatDate(project.deadline)}</span>
        </div>
        
         <div className="mb-3">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Project Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                project.progress <= 30 ? 'bg-red-500' : 
                project.progress <= 70 ? 'bg-orange-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
        
         <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
              +{Math.floor(Math.random() * 4) + 1}
            </div>
          </div>
          
           <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-gray-500">{Math.floor(Math.random() * 10)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-gray-500">{Math.floor(Math.random() * 5)}</span>
            </div>
          </div>
        </div>
      </div>
      
       <div className="flex justify-end gap-1 px-4 py-2 border-t border-gray-100">
        <button 
          onClick={onView}
          className="text-xs flex items-center justify-center gap-1 text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={onEdit}
          className="text-xs flex items-center justify-center gap-1 text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={onDelete}
          className="text-xs flex items-center justify-center gap-1 text-gray-500 hover:text-red-500 px-2 py-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
   const router = useRouter();
  
   const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [viewingProject, setViewingProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "list">("kanban");
  const user = userAuth((state) => state.user);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

  const getProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await axios.get(`${projectService}/api/project/allProjectList`);
      
      if (response.status === 200) {
         const projectsWithTimestamps = response.data.projects.map((project: any) => {
          if (project.project_image) {
            const timestamp = new Date().getTime();
            return {
              ...project,
              project_image: `${project.project_image}?t=${timestamp}`
            };
          }
          return project;
        });
        
        setProjectList(projectsWithTimestamps);
      } else {
        toast.error("Failed to load projects");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Server error";
      toast.error(message);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  const filteredProjects = projectList.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;
    const matchesPriority = selectedPriority === "All" || project.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

   const getCategorizedProjects = () => {
    const todoProjects = filteredProjects.filter(project => project.status === "Pending" || project.status === "To Do");
    const inProgressProjects = filteredProjects.filter(project => project.status === "In Progress" || project.status === "On Progress");
    const reviewProjects = filteredProjects.filter(project => project.status === "Review" || project.status === "In Review");
    const completedProjects = filteredProjects.filter(project => project.status === "Completed");
    
    return {
      todo: todoProjects,
      inProgress: inProgressProjects,
      review: reviewProjects,
      completed: completedProjects
    };
  };

   const handleViewProject = (projectId: number) => {
    router.push(`/Supervisor/Projects/${projectId}`);
  };

   const handleDeleteProject = async (projectId: number) => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${projectService}/api/project/projectDelete/${projectId}`);
      
      if (response.data.success) {
        toast.success("Project deleted successfully");
        getProjects();  
        setDeletingProject(null);
      } else {
        toast.error(response.data.message || "Failed to delete project");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete project";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

   const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedPriority("All");
  };

   const DeleteConfirmModal = ({ project, onClose, onConfirm }: { project: any; onClose: () => void; onConfirm: () => void }) => {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full p-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-center text-yellow-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-center mb-2">Are you sure you want to delete this project?</p>
            <p className="text-center font-semibold">{project.name}</p>
            <p className="text-center text-sm text-gray-500">This action cannot be undone.</p>
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
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleEditImageClick = () => {
    if (editFileInputRef.current) {
      editFileInputRef.current.click();
    }
  };

   const handleEditProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!editingProject) return;
    
    try {
      setIsSubmitting(true);
      
      const form = event.target as HTMLFormElement;
      const formData = new FormData();
      
       const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const deadline = (form.elements.namedItem('deadline') as HTMLInputElement).value;
      const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
      const priority = (form.elements.namedItem('priority') as HTMLSelectElement).value;
      const progress = (form.elements.namedItem('progress') as HTMLInputElement).value;
      const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
      
       formData.append('id', editingProject.id);
      formData.append('name', name);
      formData.append('deadline', deadline);
      formData.append('status', status);
      formData.append('priority', priority);
      formData.append('progress', progress);
      formData.append('description', description);
      
       if(selectedFile) {
        formData.append('project_image', selectedFile);
        console.log("Edit - File attached:", selectedFile.name, selectedFile.size);
      }
      
      console.log("Edit - Form data entries:", [...formData.entries()].map(entry => `${entry[0]}: ${entry[1]}`));
      
      const response = await axios.put(
        `${projectService}/api/project/updateProject/${editingProject.id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
       console.log("Project update response:", response.data);
      console.log("Response status:", response.status);
      
      if (response.data.success) {
        toast.success("Project updated successfully");
        
         await getProjects();
        
         setEditingProject(null);
        setPreviewImage(null);
        setSelectedFile(null);
      } else {
        toast.error(response.data.message || "Failed to update project");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update project";
      console.error("Project update error:", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
   const resetImageStates = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
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
    } else {
      setPreviewImage(null);
      setSelectedFile(null);
    }
  };
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

   const EditProjectModal = ({ project, onClose }: { project: any; onClose: () => void }) => {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-5xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Edit Project</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
          </div>
          
          <form ref={editFormRef} onSubmit={handleEditProject} className="space-y-4">
            <input type="hidden" name="id" value={project.id} />
            
            <div className="grid grid-cols-3 gap-6">
               <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={project.name}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      required
                      defaultValue={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      required
                      defaultValue={project.status}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      {PROJECT_STATUSES.filter(status => status !== "All").map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      required
                      defaultValue={project.priority}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      {PROJECT_PRIORITIES.filter(priority => priority !== "All").map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                    <input
                      type="number"
                      name="progress"
                      min="0"
                      max="100"
                      required
                      defaultValue={project.progress}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    defaultValue={project.description}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  ></textarea>
                </div>
              </div>
              
               <div className="col-span-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Image</label>
                  <div className="flex items-center">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      name="project_image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      onClick={handleEditImageClick}
                      className="flex items-center justify-center w-full border border-gray-300 border-dashed rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <FiUpload className="mr-2 text-gray-500" />
                      <span className="text-gray-500">Choose image</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  {previewImage ? (
                    <div className="relative w-full h-40 border rounded-md overflow-hidden">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setSelectedFile(null);
                          if (editFileInputRef.current) editFileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : project.project_image ? (
                    <div className="relative w-full h-40 border rounded-md overflow-hidden">
                      <img src={`${project.project_image}?t=${new Date().getTime()}`} alt={project.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white">
                        <div className="text-center">
                          <FiImage size={24} className="mx-auto mb-1" />
                          <p className="text-sm">Current image</p>
                          <p className="text-xs mt-1">Upload new to replace</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-40 border rounded-md flex items-center justify-center bg-gray-100 text-gray-400">
                      No Image Available
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#ff4e00] text-white rounded-md hover:bg-[#ff4e00]/90 transition-colors flex items-center"
              >
                {isSubmitting ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

   const handleAddProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const form = event.target as HTMLFormElement;
      const formData = new FormData();
      
       const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const deadline = (form.elements.namedItem('deadline') as HTMLInputElement).value;
      const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
      const priority = (form.elements.namedItem('priority') as HTMLSelectElement).value;
      const progress = (form.elements.namedItem('progress') as HTMLInputElement).value;
      const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
      
       formData.append('name', name);
      formData.append('description', description);
      formData.append('deadline', deadline);
      formData.append('created_by', user?.id?.toString() || "");
      formData.append('status', status);
      formData.append('priority', priority);
      formData.append('progress', progress);
      
       if(selectedFile) {
        formData.append('project_image', selectedFile);
        console.log("File attached:", selectedFile.name, selectedFile.size);
      }
      
      console.log("Form data entries:", [...formData.entries()].map(entry => `${entry[0]}: ${entry[1]}`));
      
      const response = await axios.post(
        `${projectService}/api/project/createProject`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        toast.success("Project created successfully");
        
         await getProjects();
        
         setShowAddModal(false);
        setPreviewImage(null);
        setSelectedFile(null);
      } else {
        toast.error(response.data.message || "Failed to create project");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create project";
      toast.error(message);
      console.error("Project creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

   const AddProjectModal = ({ onClose }: { onClose: () => void }) => {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-5xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Add New Project</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
          </div>
          
          <form ref={formRef} onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
               <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Enter project name"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      required
                      defaultValue="Pending"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      {PROJECT_STATUSES.filter(status => status !== "All").map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      required
                      defaultValue="Medium"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      {PROJECT_PRIORITIES.filter(priority => priority !== "All").map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                    <input
                      type="number"
                      name="progress"
                      min="0"
                      max="100"
                      required
                      defaultValue="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    placeholder="Enter project description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  ></textarea>
                </div>
              </div>
              
               <div className="col-span-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Image</label>
                  <div className="flex items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="project_image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="flex items-center justify-center w-full border border-gray-300 border-dashed rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <FiUpload className="mr-2 text-gray-500" />
                      <span className="text-gray-500">Choose image</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  {previewImage ? (
                    <div className="relative w-full h-40 border rounded-md overflow-hidden">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-40 border rounded-md flex items-center justify-center bg-gray-100 text-gray-400">
                      No Image Selected
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#ff4e00] text-white rounded-md hover:bg-[#ff4e00]/90 transition-colors flex items-center"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center">
              <FiLayers className="mr-3 text-[#ff4e00]" size={32} />
              <span>Projects</span>
            </h1>
            <p className="text-gray-500">
              UI Design / <span className="text-gray-700">Projects</span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-[#ff4e00] to-[#ff7e33] hover:from-[#ff4500] hover:to-[#ff7300] text-white flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-md"
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus size={18} />
            <span>Add Project</span>
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
           
          <div className="flex-grow"></div>
          
           <div className="flex items-center border border-gray-200 rounded-lg shadow-sm p-1 bg-white">
            <button 
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-sm ${viewMode === "kanban" ? "bg-gray-100 shadow-sm text-gray-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="6" height="18" rx="1" />
                <rect x="9" y="3" width="6" height="18" rx="1" />
                <rect x="15" y="3" width="6" height="18" rx="1" />
              </svg>
              Kanban
            </button>
            <button 
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-sm ${viewMode === "table" ? "bg-gray-100 shadow-sm text-gray-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              Table
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-sm ${viewMode === "list" ? "bg-gray-100 shadow-sm text-gray-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              List View
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="w-full md:w-1/3 mb-6 relative">
            <input
              type="text"
              placeholder="Search by project name or description..."
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100"
            >
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Status</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {PROJECT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Priority</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  {PROJECT_PRIORITIES.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  className="h-[42px] px-4 w-full border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-gray-700 flex justify-center items-center gap-2"
                  onClick={resetFilters}
                >
                  <FiX size={16} />
                  <span>Reset Filters</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

         <div className="mt-6">
          {loadingProjects ? (
            <div className="flex items-center justify-center py-16">
              <LoadingReuse />
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-md"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="text-[#ff4e00] font-medium hover:underline"
              >
                Clear filters
              </motion.button>
            </motion.div>
          ) : viewMode === "kanban" ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-2 gap-6">
               <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700">
                      <path d="M11 19.0001L3 19.0001C2.46957 19.0001 1.96086 18.7894 1.58579 18.4143C1.21071 18.0392 1 17.5305 1 17.0001L1 7.00012C1 6.46969 1.21071 5.96098 1.58579 5.58591C1.96086 5.21084 2.46957 5.00012 3 5.00012L17 5.00012C17.5304 5.00012 18.0391 5.21084 18.4142 5.58591C18.7893 5.96098 19 6.46969 19 7.00012L19 11.0001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17.5 15L20.5 18L23.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.5 21L20.5 21L20.5 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="font-medium text-gray-700">TO DO</h3>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{getCategorizedProjects().todo.length}</span>
                  </div>
                </div>

                 <AddTaskButton onClick={() => setShowAddModal(true)} />

                 <div className="space-y-3">
                  {getCategorizedProjects().todo.map((project, index) => (
                    <KanbanCard 
                      key={project.id} 
                      project={project} 
                      onView={() => handleViewProject(project.id)}
                      onEdit={() => setEditingProject(project)}
                      onDelete={() => setDeletingProject(project)}
                    />
                  ))}
                </div>
              </div>
              
               <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700">
                      <path d="M12 8.00012V12.0001L15 15.0001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12.0001C21 16.9707 16.9706 21.0001 12 21.0001C7.02944 21.0001 3 16.9707 3 12.0001C3 7.02956 7.02944 3.00012 12 3.00012C16.9706 3.00012 21 7.02956 21 12.0001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="font-medium text-gray-700">ON PROGRESS</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{getCategorizedProjects().inProgress.length}</span>
                  </div>
                </div>

                 <AddTaskButton onClick={() => setShowAddModal(true)} />

                 <div className="space-y-3">
                  {getCategorizedProjects().inProgress.map((project, index) => (
                    <KanbanCard 
                      key={project.id} 
                      project={project} 
                      onView={() => handleViewProject(project.id)}
                      onEdit={() => setEditingProject(project)}
                      onDelete={() => setDeletingProject(project)}
                    />
                  ))}
                </div>
              </div>
              
               <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700">
                      <path d="M9 12.0001L11 14.0001L15 10.0001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.53113 12.4173C3.35769 12.141 3.27097 12.0029 3.22487 11.8034C3.18353 11.6269 3.18353 11.3733 3.22487 11.1968C3.27097 10.9973 3.35769 10.8591 3.53113 10.5829C4.34555 9.2378 6.52074 5.90021 12 5.90021C17.4793 5.90021 19.6545 9.2378 20.4689 10.5829C20.6423 10.8591 20.729 10.9973 20.7751 11.1968C20.8165 11.3733 20.8165 11.6269 20.7751 11.8034C20.729 12.0029 20.6423 12.141 20.4689 12.4173C19.6545 13.7624 17.4793 17.1002 12 17.1002C6.52074 17.1002 4.34555 13.7624 3.53113 12.4173Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="font-medium text-gray-700">IN REVIEW</h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{getCategorizedProjects().review.length}</span>
                  </div>
                </div>

                 <AddTaskButton onClick={() => setShowAddModal(true)} />

                 <div className="space-y-3">
                  {getCategorizedProjects().review.map((project, index) => (
                    <KanbanCard 
                      key={project.id} 
                      project={project} 
                      onView={() => handleViewProject(project.id)}
                      onEdit={() => setEditingProject(project)}
                      onDelete={() => setDeletingProject(project)}
                    />
                  ))}
                </div>
              </div>
              
              {/* COMPLETED COLUMN */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700">
                      <path d="M20.6344 6.5H9.36556C8.88075 6.5 8.63834 6.5 8.46023 6.58824C8.30187 6.66637 8.21071 6.79219 8.16461 6.95054C8.12327 7.12866 8.12327 7.37106 8.16461 7.85588V20.1441C8.16461 20.6289 8.16461 20.8713 8.25285 21.0495C8.331 21.2078 8.45681 21.3336 8.61517 21.4118C8.79328 21.5 9.03569 21.5 9.52051 21.5H20.7894C21.2742 21.5 21.5166 21.5 21.6947 21.4118C21.8531 21.3336 21.9789 21.2078 22.0571 21.0495C22.1453 20.8713 22.1453 20.6289 22.1453 20.1441V7.85588C22.1453 7.37106 22.1453 7.12866 22.0571 6.95054C21.9789 6.79219 21.8531 6.66637 21.6947 6.58824C21.5166 6.5 21.2742 6.5 20.7894 6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M8.00969 6.50001C8.00969 4.61438 8.00969 3.67157 8.58486 3.0964C9.16003 2.52123 10.1028 2.52123 11.9885 2.52123C13.8741 2.52123 14.8169 2.52123 15.3921 3.0964C15.9673 3.67157 15.9673 4.61438 15.9673 6.50001" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M15 13H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="font-medium text-gray-700">COMPLETED</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{getCategorizedProjects().completed.length}</span>
                  </div>
                </div>

                {/* Add Task Button */}
                <AddTaskButton onClick={() => setShowAddModal(true)} />

                {/* Project Cards */}
                <div className="space-y-3">
                  {getCategorizedProjects().completed.map((project, index) => (
                    <KanbanCard 
                      key={project.id} 
                      project={project} 
                      onView={() => handleViewProject(project.id)}
                      onEdit={() => setEditingProject(project)}
                      onDelete={() => setDeletingProject(project)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => {
                const { days, overdue } = calculateDaysLeft(project.deadline);
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white overflow-hidden border border-gray-100 hover:border-[#ff4e00]/30 transition-all shadow-md hover:shadow-lg rounded-xl flex flex-col group"
                  >
                    <div className="h-48 overflow-hidden relative">
                      {project.project_image ? (
                        <img
                          src={`${project.project_image}?t=${new Date().getTime()}`}
                          alt={project.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/placeholder-image.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400">
                          <FiImage size={48} />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <div className="flex justify-between items-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className={`flex items-center gap-1.5 text-white text-xs`}>
                            <span className={`w-2 h-2 rounded-full ${getPriorityDot(project.priority)}`}></span>
                            {project.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1" title={project.name}>
                          {project.name}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4" title={project.description}>
                        {project.description}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <FiCalendar className="text-gray-400" size={14} />
                          <span className={`${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {formatDate(project.deadline)}
                            {overdue && (
                              <span className="ml-1.5 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full flex items-center w-fit mt-1">
                                <FiInfo size={10} className="mr-1" /> Overdue by {days} days
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        {project.creator_profile_image ? (
                          <img 
                            src={project.creator_profile_image} 
                            alt={project.creator_name}
                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/api/avatar?name=${encodeURIComponent(project.creator_name)}`;
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#ff4e00]/10 flex items-center justify-center text-xs text-[#ff4e00] font-medium">
                            {project.creator_name?.charAt(0) || "U"}
                          </div>
                        )}
                        <span className="text-xs text-gray-500">{project.creator_name}</span>
                      </div>
                    </div>
                    
                    <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                      <div className="flex justify-between gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleViewProject(project.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-gray-700 hover:text-[#ff4e00] px-3 py-2 border border-gray-200 rounded-md hover:border-[#ff4e00] transition-colors"
                        >
                          <FiEye size={16} />
                          <span className="text-sm">Details</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setEditingProject(project)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-gray-700 hover:text-[#ff4e00] px-3 py-2 border border-gray-200 rounded-md hover:border-[#ff4e00] transition-colors"
                        >
                          <FiEdit size={16} />
                          <span className="text-sm">Edit</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02, color: "#ef4444", borderColor: "#ef4444" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDeletingProject(project)}
                          className="flex items-center justify-center gap-1.5 text-gray-700 hover:text-red-600 px-3 py-2 border border-gray-200 rounded-md hover:border-red-600 transition-colors w-10"
                        >
                          <FiTrash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {deletingProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          onClick={() => setDeletingProject(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <DeleteConfirmModal 
              project={deletingProject}
              onClose={() => setDeletingProject(null)}
              onConfirm={() => handleDeleteProject(deletingProject.id)}
            />
          </motion.div>
        </motion.div>
      )}
      
      {editingProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          onClick={() => {
            setEditingProject(null);
            resetImageStates();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-5xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <EditProjectModal 
              project={editingProject}
              onClose={() => {
                setEditingProject(null);
                resetImageStates();
              }}
            />
          </motion.div>
        </motion.div>
      )}
      
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          onClick={() => {
            setShowAddModal(false);
            resetImageStates();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-5xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddProjectModal 
              onClose={() => {
                setShowAddModal(false);
                resetImageStates();
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}