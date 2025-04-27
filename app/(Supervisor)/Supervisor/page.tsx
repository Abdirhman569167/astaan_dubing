"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBell,
  FiMessageSquare,
  FiInfo,
  FiAlertTriangle,
  FiCalendar,
} from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'message' | 'info';
  title: string;
  message: string;
  time: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    completedTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    reviewTasks: 0,
    weeklyChanges: {
      users: 0,
      completed: 0,
      todo: 0,
      inProgress: 0,
      review: 0
    }
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [taskPerformance, setTaskPerformance] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completed: [0, 0, 0, 0, 0],
    pending: [0, 0, 0, 0, 0],
    overdue: [0, 0, 0, 0, 0]
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  // Update API endpoints to match what you've provided
  const userServiceUrl = 'http://localhost:8001';
  const projectServiceUrl = 'http://localhost:8002';
  const taskServiceUrl = 'http://localhost:8003';

  // Helper function to safely format dates and handle invalid dates
  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch (e) {
      return null;
    }
  };

  // Helper function to get day representation (0-6 for days of week)
  const getDayOfWeek = (date: Date) => {
    return date.getDay();
  };

  // Helper function to get date string in YYYY-MM-DD format
  const getDateString = (date: Date | null) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await axios.get(`${userServiceUrl}/api/auth/users`);
        const users = usersResponse.data.users || [];
        
        // Fetch tasks - update to handle the new response structure
        const tasksResponse = await axios.get(`${taskServiceUrl}/api/task/allTasks`);
        const tasks = tasksResponse.data.success ? tasksResponse.data.tasks : [];

        // Fetch projects
        const projectsResponse = await axios.get(`${projectServiceUrl}/api/project/allProjectList`);
        const projects = projectsResponse.data.projects || [];

        // Calculate task statistics based on specific status values
        const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length || 0;
        const todoTasks = tasks.filter((t: any) => t.status === 'To Do').length || 0;
        const inProgressTasks = tasks.filter((t: any) => t.status === 'In Progress').length || 0;
        const reviewTasks = tasks.filter((t: any) => t.status === 'Review').length || 0;
        
        // Calculate weekly changes (example implementation - replace with real calculation)
        const weeklyChanges = {
          users: 2,
          completed: 23,
          todo: -2,
          inProgress: -3,
          review: 0
        };

        setStats({
          totalUsers: users.length || 0,
          completedTasks,
          todoTasks,
          inProgressTasks,
          reviewTasks,
          weeklyChanges
        });

        // Get recent projects and tasks
        const validProjects = projects.filter((p: any) => p.createdAt && !isNaN(new Date(p.createdAt).getTime()));
        const validTasks = tasks.filter((t: any) => t.createdAt && !isNaN(new Date(t.createdAt).getTime()));
        
        const sortedProjects = [...validProjects].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const sortedTasks = [...validTasks].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setRecentProjects(sortedProjects.slice(0, 2));
        setRecentTasks(sortedTasks.slice(0, 3));

        // Generate real notifications from recent tasks and projects
        const realNotifications: Notification[] = [];
        let newCount = 0;
        
        // Add project notifications
        if (sortedProjects.length > 0) {
          newCount++;
          realNotifications.push({
            id: 1,
            type: 'success',
            title: 'New Project Update',
            message: `The project "${sortedProjects[0].name}" has been created`,
            time: 'Just now'
          });
        }

        // Add task notifications
        sortedTasks.slice(0, 2).forEach((task, index) => {
          if (index === 0) newCount++;
          realNotifications.push({
            id: 2 + index,
            type: 'message',
            title: 'New Task Added',
            message: `"${task.title}" has been added to your tasks`,
            time: index === 0 ? '5 minutes ago' : '1 hour ago'
          });
        });

        // Add deadline notifications for upcoming deadlines
        const currentDate = new Date();
        const upcomingDeadlines = tasks.filter((task: any) => {
          const deadline = formatDate(task.deadline);
          if (!deadline) return false;
          
          const diffDays = Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= 7 && task.status !== 'Completed';
        });

        if (upcomingDeadlines.length > 0) {
          realNotifications.push({
            id: 4,
            type: 'warning',
            title: 'Deadline Approaching',
            message: `"${upcomingDeadlines[0].title}" is due in ${Math.ceil((formatDate(upcomingDeadlines[0].deadline)!.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))} days`,
            time: '2 hours ago'
          });
        }

        // Add notification for tasks with status "Review"
        if (reviewTasks > 0) {
          const reviewTaskList = tasks.filter((task: any) => task.status === 'Review');
          if (reviewTaskList.length > 0) {
            realNotifications.push({
              id: 5,
              type: 'warning',
              title: 'Task Under Review',
              message: `"${reviewTaskList[0].title}" is waiting for review`,
              time: '3 hours ago'
            });
          }
        }

        setNotifications(realNotifications);
        // Set new notification count based on actual data
        setNewNotificationsCount(newCount);

        // Generate task performance data from real data
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayLabels = [];
        const completedData = [];
        const pendingData = [];
        const overdueData = [];

        // Get the last 5 weekdays (including today)
        for (let i = 4; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dayLabels.push(weekdays[date.getDay()]);

          // Date string for comparison
          const dayStr = getDateString(date);
          
          // Count tasks completed on this day
          const dayCompletedTasks = tasks.filter((task: any) => {
            const completedDate = formatDate(task.completedAt || task.updatedAt);
            return completedDate && 
                  getDateString(completedDate) === dayStr && 
                  task.status === 'Completed';
          }).length;

          // Count tasks by status created on this day
          const dayTodoTasks = tasks.filter((task: any) => {
            const createdDate = formatDate(task.createdAt);
            return createdDate && 
                  getDateString(createdDate) === dayStr && 
                  task.status === 'To Do';
          }).length;

          const dayInProgressTasks = tasks.filter((task: any) => {
            const createdDate = formatDate(task.createdAt);
            return createdDate && 
                  getDateString(createdDate) === dayStr && 
                  task.status === 'In Progress';
          }).length;
          
          const dayReviewTasks = tasks.filter((task: any) => {
            const createdDate = formatDate(task.createdAt);
            return createdDate && 
                  getDateString(createdDate) === dayStr && 
                  task.status === 'Review';
          }).length;

          completedData.push(dayCompletedTasks);
          pendingData.push(dayTodoTasks + dayInProgressTasks + dayReviewTasks);
          overdueData.push(0); // We're not tracking overdue tasks anymore
        }

        setTaskPerformance({
          labels: dayLabels,
          completed: completedData,
          pending: pendingData,
          overdue: overdueData
        });

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to static data if API fails
        setTaskPerformance({
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          completed: [4, 3, 5, 6, 4],
          pending: [2, 4, 3, 2, 3],
          overdue: [1, 2, 0, 1, 2]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <FiAlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'message':
        return <FiMessageSquare className="h-5 w-5 text-purple-500" />;
      case 'info':
        return <FiInfo className="h-5 w-5 text-blue-500" />;
      default:
        return <FiInfo className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBackground = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-amber-50';
      case 'message':
        return 'bg-white';
      case 'info':
        return 'bg-white';
      default:
        return 'bg-white';
    }
  };

  // Chart data
  const chartData = {
    labels: taskPerformance.labels,
    datasets: [
      {
        label: 'Completed',
        data: taskPerformance.completed,
        backgroundColor: '#3DD598',
        borderWidth: 0,
        borderRadius: 4,
        barThickness: 15,
      },
      {
        label: 'Pending',
        data: taskPerformance.pending,
        backgroundColor: '#FFB648',
        borderWidth: 0,
        borderRadius: 4,
        barThickness: 15,
      },
      {
        label: 'Overdue',
        data: taskPerformance.overdue,
        backgroundColor: '#FF5E5E',
        borderWidth: 0,
        borderRadius: 4,
        barThickness: 15,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 8,
        ticks: {
          stepSize: 2,
        },
        grid: {
          color: '#EEEEEE',
          borderDash: [5, 5],
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                <p className={`text-sm mt-2 ${getChangeColor(stats.weeklyChanges.users)}`}>
                  {stats.weeklyChanges.users > 0 ? '+' : ''}{stats.weeklyChanges.users} this week
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* To Do Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">To Do Tasks</h3>
                <p className="text-3xl font-bold mt-2">{stats.todoTasks}</p>
                <p className={`text-sm mt-2 ${getChangeColor(stats.weeklyChanges.todo)}`}>
                  {stats.weeklyChanges.todo > 0 ? '+' : ''}{stats.weeklyChanges.todo} this week
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <FiClock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* In Progress Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">In Progress Tasks</h3>
                <p className="text-3xl font-bold mt-2">{stats.inProgressTasks}</p>
                <p className={`text-sm mt-2 ${getChangeColor(stats.weeklyChanges.inProgress)}`}>
                  {stats.weeklyChanges.inProgress > 0 ? '+' : ''}{stats.weeklyChanges.inProgress} this week
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Review Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Under Review Tasks</h3>
                <p className="text-3xl font-bold mt-2">{stats.reviewTasks}</p>
                <p className={`text-sm mt-2 ${getChangeColor(stats.weeklyChanges.review)}`}>
                  {stats.weeklyChanges.review > 0 ? '+' : ''}{stats.weeklyChanges.review} this week
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiAlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Completed Tasks</h3>
                <p className="text-3xl font-bold mt-2">{stats.completedTasks}</p>
                <p className={`text-sm mt-2 ${getChangeColor(stats.weeklyChanges.completed)}`}>
                  {stats.weeklyChanges.completed > 0 ? '+' : ''}{stats.weeklyChanges.completed} this week
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Task Performance and Notifications Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900">Task Performance</h2>
            
            <div className="flex items-center my-4">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm text-gray-600">Overdue</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">Notifications Update</h2>
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {newNotificationsCount} new
                </span>
              </div>
              <FiBell className="h-6 w-6 text-gray-400" />
            </div>
            
            <div>
              {/* New Project Update */}
              {recentProjects.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-start bg-green-50">
                  <div className="flex-shrink-0 mt-1 mr-4">
                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">New Project Update</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      The project "{recentProjects[0]?.name || 'New Project'}" has been created
                    </p>
                  </div>
                </div>
              )}
              
              {/* Deadline Approaching */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-start bg-amber-50">
                <div className="flex-shrink-0 mt-1 mr-4">
                  <FiAlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Deadline Approaching</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {recentTasks.length > 0 
                      ? `"${recentTasks[0]?.title}" deadline in ${recentTasks[0]?.deadline ? Math.max(1, Math.ceil((new Date(recentTasks[0]?.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 2} days`
                      : "VFX rendering deadline in 2 days"}
                  </p>
                </div>
              </div>
              
              {/* New Comment */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4">
                  <FiMessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">New Comment</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {recentTasks.length > 1 
                      ? `New comment on "${recentTasks[1]?.title}"`
                      : "Director left feedback on the latest cut"}
                  </p>
                </div>
              </div>
              
              {/* System Update */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4">
                  <FiInfo className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">System Update</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">New rendering farm capacity available</p>
                </div>
              </div>
              
              {/* Resource Alert */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-start bg-amber-50">
                <div className="flex-shrink-0 mt-1 mr-4">
                  <FiAlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Resource Alert</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Storage space running low - 85% used</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
