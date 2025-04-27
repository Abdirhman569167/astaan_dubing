"use client";

import userAuth from '@/myStore/userAuth';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiClock, FiCalendar, FiFlag, FiCheckCircle, FiAlertCircle, FiFileText, FiExternalLink, FiEdit, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  task_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  estimated_hours: number;
  completed_at: string | null;
  createdAt: string;
  updatedAt: string;
  file_url: string;
}

export default function AssignedTasksPage() {
  const user = userAuth((state) => state.user);
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;

  const statusOptions = ["In Progress"];

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${taskUrl}/api/task-assignment/userAssignments/${user?.id}`);
      const data = await response.json();
      if (data.success) {
         const nonCompletedTasks = data.assignments.filter((task: Assignment) => task.status !== 'Completed');
        setTasks(nonCompletedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${taskUrl}/api/task-assignment/task_status_update/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Status updated successfully');
        fetchTasks(); // Refresh tasks
        setShowStatusModal(false);
        setSelectedStatus('');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'review':
        return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'high':
        return 'bg-orange-100 text-orange-800 ring-orange-600/20';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'low':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const parseFileUrls = (fileUrlString: string) => {
    try {
      return JSON.parse(fileUrlString);
    } catch (error) {
      console.error('Error parsing file URLs:', error);
      return [];
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status.toLowerCase() === filter.toLowerCase();
  });

  const getTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !selectedFiles) {
      toast.error('Please select files to submit');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    
    // Append the file to FormData with the correct field name
    if (selectedFiles[0]) {
      formData.append('file_url', selectedFiles[0]);
    }

    formData.append('updated_by', user?.id.toString() || '');
    formData.append('status', 'Completed');

    try {
      const response = await fetch(`${taskUrl}/api/task-assignment/submitTask/${selectedTask.id}`, {
        method: 'PUT', // Changed to PUT method
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Task submitted successfully');
        setShowModal(false);
        setSelectedFiles(null);
        fetchTasks(); // Refresh the task list
      } else {
        toast.error(data.message || 'Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Error submitting task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4e00]"></div>
          <p className="text-gray-500 font-medium">Loading tasks...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Assigned Tasks</h1>
              <p className="mt-1 text-gray-500">Manage and track your assigned tasks</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-[#ff4e00] text-white shadow-sm' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All Tasks
              </button>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === status.toLowerCase()
                      ? 'bg-[#ff4e00] text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 rounded-lg p-3">
                <FiFlag className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 
                      onClick={() => {
                        setSelectedTask(task);
                        setShowModal(true);
                      }}
                      className="text-lg font-semibold text-gray-900 group-hover:text-[#ff4e00] transition-colors cursor-pointer"
                    >
                      {task.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Task #{task.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setSelectedStatus(task.status);
                        setShowStatusModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Update Status"
                    >
                      <FiEdit className="h-4 w-4 text-gray-500" />
                    </button>
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
                  {task.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <FiCalendar className="h-4 w-4 text-gray-400" />
                      <span>{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      getTimeLeft(task.deadline) === 'Overdue' 
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}>
                      <FiClock className="h-4 w-4" />
                      <span>{getTimeLeft(task.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <FiFlag className="h-4 w-4" />
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  {parseFileUrls(task.file_url).length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <FiFileText className="h-4 w-4" />
                        <span>{parseFileUrls(task.file_url).length} attachment(s)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiClock className="mr-2 h-4 w-4" />
                    <span>Est: {task.estimated_hours}h</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowModal(true);
                    }}
                    className="text-sm font-medium text-[#ff4e00] hover:text-[#ff4e00]/80 transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FiAlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
            <p className="mt-2 text-gray-500">There are no tasks matching your current filter.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 text-[#ff4e00] font-medium hover:text-[#ff4e00]/80 transition-colors"
            >
              View all tasks
            </button>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Task Status</h3>
                <div className="space-y-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedStatus === status
                          ? 'bg-[#ff4e00]/10 text-[#ff4e00] border-2 border-[#ff4e00]'
                          : 'bg-white hover:bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          selectedStatus === status ? 'bg-[#ff4e00]' : 'bg-gray-300'
                        }`} />
                        {status}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      if (selectedTask && selectedStatus) {
                        updateTaskStatus(selectedTask.id, selectedStatus);
                      }
                    }}
                    disabled={isUpdating || !selectedStatus}
                    className="flex-1 bg-[#ff4e00] text-white py-2.5 px-4 rounded-lg hover:bg-[#ff4e00]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedStatus('');
                    }}
                    className="flex-1 bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Details Modal */}
        {showModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedTask.title}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Task #{selectedTask.id}</p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Deadline</h3>
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{format(new Date(selectedTask.deadline), 'MMM dd, yyyy')}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{getTimeLeft(selectedTask.deadline)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Time</h3>
                      <div className="flex items-center">
                        <FiClock className="mr-2 h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{selectedTask.estimated_hours} hours</p>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Attachments</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {parseFileUrls(selectedTask.file_url).map((url: string, index: number) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {url.split('/').pop()}
                          </span>
                          <FiExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      ))}
                      {parseFileUrls(selectedTask.file_url).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No attachments</p>
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
                      <p className="text-gray-900">{format(new Date(selectedTask.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                      <p className="text-gray-900">{format(new Date(selectedTask.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>

                  {/* Submit Task Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Task</h3>
                    
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        <div className="text-center">
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                            >
                              <span onClick={() => fileInputRef.current?.click()}>Select file</span>
                            </label>
                          </div>
                          <p className="text-xs leading-5 text-gray-600 mt-2">Upload your completed task file</p>
                        </div>

                        {selectedFiles && selectedFiles.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Selected File:</h4>
                            <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <FiFileText className="mr-2 h-4 w-4" />
                              <span className="flex-1 truncate">{selectedFiles[0].name}</span>
                              <button
                                onClick={() => setSelectedFiles(null)}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitTask}
                          disabled={isSubmitting || !selectedFiles}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Submitting...
                            </span>
                          ) : (
                            'Submit Task'
                          )}
                        </button>
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
