"use client";

import userAuth from '@/myStore/userAuth';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiArrowRight } from 'react-icons/fi';

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

export default function EditorPage() {
  const user = userAuth((state) => state.user);
  const [tasks, setTasks] = useState<TaskStatusUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    toDo: 0,
    overdue: 0
  });

  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${taskUrl}/api/task-assignment/allTaskStatusUpdates`);
      const data = await response.json();
      if (data.success) {
         const userTasks = data.statusUpdates.filter((task: TaskStatusUpdate) => 
          task.updated_by === user?.id
        );

         const latestTasks = Object.values(
          userTasks.reduce((acc: { [key: number]: TaskStatusUpdate }, task: TaskStatusUpdate) => {
            const subtaskId = task["SubTask.id"];
            if (!acc[subtaskId] || new Date(acc[subtaskId].updated_at) < new Date(task.updated_at)) {
              acc[subtaskId] = task;
            }
            return acc;
          }, {})
        ) as TaskStatusUpdate[];

         const stats = {
          total: latestTasks.length,
          completed: latestTasks.filter((task: TaskStatusUpdate) => task.status === 'Completed').length,
          inProgress: latestTasks.filter((task: TaskStatusUpdate) => task.status === 'In Progress').length,
          toDo: latestTasks.filter((task: TaskStatusUpdate) => task.status === 'To Do').length,
          overdue: latestTasks.filter((task: TaskStatusUpdate) => {
            const deadline = new Date(task["SubTask.deadline"]);
            const now = new Date();
            return deadline < now && task.status !== 'Completed';
          }).length
        };

        setTaskStats(stats);
        setTasks(latestTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'to do':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4e00]"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user?.profile_image || '/default-avatar.png'}
                  alt={user?.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
                <p className="text-sm text-gray-500">Dashboard overview</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FiCalendar className="h-4 w-4 mr-1.5" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiCheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">All assigned tasks</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-green-600">{taskStats.completed}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Successfully completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-[#ff4e00]">{taskStats.inProgress}</p>
              </div>
              <div className="p-2 bg-[#ff4e00]/10 rounded-lg">
                <FiClock className="h-5 w-5 text-[#ff4e00]" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Currently working</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">To Do</p>
                <p className="text-2xl font-semibold text-gray-900">{taskStats.toDo}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FiCalendar className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Pending tasks</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-semibold text-red-600">{taskStats.overdue}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <FiAlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Past deadline</p>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <a href="/Editor/My-Tasks" className="text-[#ff4e00] hover:text-[#ff4e00]/80 font-medium text-sm flex items-center gap-1">
                View all tasks
                <FiArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {tasks.slice(0, 5).map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'Completed' ? 'bg-green-500' :
                    task.status === 'In Progress' ? 'bg-[#ff4e00]' :
                    'bg-gray-300'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{task["SubTask.title"]}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">
                        Updated {format(new Date(task.updated_at), 'MMM dd, yyyy')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'In Progress' ? 'bg-[#ff4e00]/10 text-[#ff4e00]' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
                <a 
                  href={`/Editor/My-Tasks?task=${task.id}`}
                  className="text-gray-400 hover:text-[#ff4e00] transition-colors"
                >
                  <FiArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-10">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FiCheckCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">No tasks yet</h3>
                <p className="mt-1 text-xs text-gray-500">You haven't been assigned any tasks yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
