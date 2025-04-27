"use client";

import userAuth from '@/myStore/userAuth';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface TaskStatusUpdate {
  id: number;
  task_id: number;
  updated_by: number;
  status: string;
  updated_at: string;
  time_taken_in_hours: string | null;
  time_taken_in_minutes: number | null;
  createdAt: string;
  updatedAt: string;
  "SubTask.id": number;
  "SubTask.task_id": number;
  "SubTask.title": string;
  "SubTask.description": string;
  "SubTask.status": string;
  "SubTask.priority": string;
  "SubTask.deadline": string;
  "SubTask.estimated_hours": number;
  "SubTask.file_url": string;
  "SubTask.completed_at": string | null;
  "SubTask.createdAt": string;
  "SubTask.updatedAt": string;
  assigned_user: string;
  profile_image: string;
}

export default function MyTasksPage() {
  const user = userAuth((state) => state.user);
  const [tasks, setTasks] = useState<TaskStatusUpdate[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskStatusUpdate[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskStatusUpdate | null>(null);
  const [showModal, setShowModal] = useState(false);

  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedMonth, selectedStatus]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${taskUrl}/api/task-assignment/allTaskStatusUpdates`);
      const data = await response.json();
      if (data.success) {
         const userCompletedTasks = data.statusUpdates.filter((task: TaskStatusUpdate) => 
          task.updated_by === user?.id && task.status === 'Completed'
        );

         const latestTasks = Object.values(
          userCompletedTasks.reduce((acc: { [key: number]: TaskStatusUpdate }, task: TaskStatusUpdate) => {
            const subtaskId = task["SubTask.id"];
            if (!acc[subtaskId] || new Date(acc[subtaskId].updated_at) < new Date(task.updated_at)) {
              acc[subtaskId] = task;
            }
            return acc;
          }, {})
        ) as TaskStatusUpdate[];

        setTasks(latestTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (selectedMonth) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.updated_at);
        return taskDate.getMonth() === selectedMonth.getMonth() &&
               taskDate.getFullYear() === selectedMonth.getFullYear();
      });
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    setFilteredTasks(filtered);
  };

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'bg-gray-500 text-white';
    
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-500 text-white';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in progress':
        return 'bg-blue-500 text-white';
      case 'to do':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const parseFileUrls = (fileUrlString: string | undefined) => {
    if (!fileUrlString) return [];
    
    try {
      const cleanString = fileUrlString.replace(/\\/g, '').replace(/"\[/g, '[').replace(/\]"/g, ']');
      return JSON.parse(cleanString);
    } catch (error) {
      console.error('Error parsing file URLs:', error);
      return [];
    }
  };

  const handleTaskClick = (task: TaskStatusUpdate) => {
    console.log('Raw file_url:', task["SubTask.file_url"]);
    const parsedFiles = parseFileUrls(task["SubTask.file_url"]);
    console.log('Parsed files:', parsedFiles);
    setSelectedTask(task);
    setShowModal(true);
  };

  const getMimeType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      default:
        return 'application/octet-stream';
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.startsWith('video/')) {
      return '🎥';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('excel') || mimeType.includes('sheet')) {
      return '📊';
    } else {
      return '📁';
    }
  };

  const FilePreview = ({ url, mimeType, fileName }: { url: string; mimeType: string; fileName: string }) => {
    if (mimeType.startsWith('image/')) {
      return (
        <div className="relative group w-full h-48 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={url}
            alt={fileName}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg transition-opacity duration-200"
            >
              View Full Size
            </a>
          </div>
        </div>
      );
    } else if (mimeType.startsWith('video/')) {
      return (
        <div className="w-full rounded-lg overflow-hidden bg-black">
          <video controls className="w-full">
            <source src={url} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        >
          <span className="text-2xl">{getFileIcon(mimeType)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
            <p className="text-xs text-gray-500">Click to view</p>
          </div>
        </a>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4e00]"></div>
          <p className="text-gray-500 font-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
              <p className="mt-1 text-gray-500">Track and manage your completed tasks</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 min-w-[200px]">
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {selectedMonth ? format(selectedMonth, 'MMMM yyyy') : "Select Month"}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCalendar && (
                  <div className="absolute z-10 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-[280px] right-0">
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => {
                        const date = new Date(selectedMonth?.getFullYear() || new Date().getFullYear(), i);
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedMonth(date);
                              setShowCalendar(false);
                            }}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                              selectedMonth?.getMonth() === i 
                                ? 'bg-[#ff4e00] text-white' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {format(date, 'MMM')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 rounded-lg p-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredTasks.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={task.profile_image || '/default-avatar.png'}
                        alt={task.assigned_user || 'User'}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#ff4e00] transition-colors">
                        {task["SubTask.title"] || 'Untitled Task'}
                      </h2>
                      <p className="text-sm text-gray-500">{task.assigned_user || 'Unassigned'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(task.status)}`}>
                    {task.status || 'Unknown'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
                  {task["SubTask.description"] || 'No description'}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(task["SubTask.priority"])}`}>
                      {task["SubTask.priority"] || 'No priority'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {task["SubTask.deadline"] ? format(new Date(task["SubTask.deadline"]), 'MMM dd') : 'No deadline'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {task["SubTask.estimated_hours"]}h
                      </span>
                    </div>
                  </div>

                  {task.time_taken_in_hours && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        Took: {task.time_taken_in_hours}h {task.time_taken_in_minutes || 0}m
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your filters to find more tasks</p>
            <button
              onClick={() => {
                setSelectedMonth(new Date());
                setSelectedStatus("all");
              }}
              className="mt-4 text-[#ff4e00] font-medium hover:text-[#ff4e00]/80 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Task Details Modal */}
        {showModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedTask.profile_image || '/default-avatar.png'}
                      alt={selectedTask.assigned_user}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedTask["SubTask.title"]}</h2>
                    <p className="text-sm text-gray-500">Assigned to {selectedTask.assigned_user}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-4">{selectedTask["SubTask.description"]}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                      <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
                      <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(selectedTask["SubTask.priority"])}`}>
                        {selectedTask["SubTask.priority"]}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Deadline</h3>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-900">{format(new Date(selectedTask["SubTask.deadline"]), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Hours</h3>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-900">{selectedTask["SubTask.estimated_hours"]} hours</span>
                      </div>
                    </div>
                  </div>

                  {selectedTask.time_taken_in_hours && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Time Taken</h3>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-900">
                          {selectedTask.time_taken_in_hours} hours {selectedTask.time_taken_in_minutes} minutes
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Attached Files */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Attached Files</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {parseFileUrls(selectedTask["SubTask.file_url"]).map((fileUrl: string, index: number) => {
                        const fileName = fileUrl.split('/').pop() || '';
                        const mimeType = getMimeType(fileName);
                        
                        return (
                          <div key={index} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <FilePreview
                              url={fileUrl}
                              mimeType={mimeType}
                              fileName={fileName}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {parseFileUrls(selectedTask["SubTask.file_url"]).length === 0 && (
                      <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-100">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No files attached to this task</p>
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-900">{format(new Date(selectedTask["SubTask.createdAt"]), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-900">{format(new Date(selectedTask["SubTask.updatedAt"]), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
