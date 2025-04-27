"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ListTodo, Timer, Eye, CheckCircle, BarChart2, ExternalLink, PieChart, TrendingUp, ClipboardCheck } from 'lucide-react';
import Link from "next/link";

interface TaskStatusUpdate {
  id: number;
  task_id: number;
  updated_by: number;
  status: string;
  updated_at: string;
  time_taken_in_hours: string | null;
  time_taken_in_minutes: number | null;
  "SubTask.id": number;
  "SubTask.title": string;
  "SubTask.status": string;
  "SubTask.priority": string;
  "SubTask.estimated_hours": number;
  "SubTask.description": string;
  "SubTask.deadline": string;
  assigned_user: string;
  profile_image: string;
}

interface User {
  id: number;
  username: string;
  profile_image: string;
}

interface UserWithStats extends User {
  completedTasks: number;
  totalHours: number;
  averageHours: number;
  rank: number;
  lastUpdated: string;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
}

export default function ReportsAnalyticsPage() {

  const taskServiceUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const userServiceUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  const [taskUpdates, setTaskUpdates] = useState<TaskStatusUpdate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskResponse, usersResponse] = await Promise.all([
          fetch(`${taskServiceUrl}/api/task-assignment/allTaskStatusUpdates`),
          fetch(`${userServiceUrl}/api/auth/users`),
        ]);

        const taskData = await taskResponse.json();
        const usersData = await usersResponse.json();
        
        // Process task updates to keep only the latest status for each task
        const taskUpdatesMap = new Map();
        const taskUpdatesArray = taskData.statusUpdates || [];
        
        // Sort by updated_at in descending order to get latest updates first
        taskUpdatesArray.sort((a: any, b: any) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        
        // Keep only the latest status update for each task
        const uniqueTaskUpdates = taskUpdatesArray.filter((update: any) => {
          const taskKey = `${update.task_id}-${update.assigned_user}`;
          if (!taskUpdatesMap.has(taskKey)) {
            taskUpdatesMap.set(taskKey, true);
            return true;
          }
          return false;
        });

        setTaskUpdates(uniqueTaskUpdates);

        const uniqueUsers = new Map();
        uniqueTaskUpdates.forEach((task: TaskStatusUpdate) => {
          if (!uniqueUsers.has(task.assigned_user)) {
            uniqueUsers.set(task.assigned_user, {
              id: task.updated_by,
              username: task.assigned_user,
              profile_image: task.profile_image,
            });
          }
        });
        
        setUsers(Array.from(uniqueUsers.values()));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

   const filteredUserStats = users
    .map((user) => {
      const userTasks = taskUpdates.filter(
        (task) => task.assigned_user === user.username
      );

      const completedTasks = userTasks.filter(
        (task) => task.status === "Completed"
      );

      const inProgressTasks = userTasks.filter(
        (task) => task.status === "In Progress"
      ).length;

      const todoTasks = userTasks.filter(
        (task) => task.status === "To Do"
      ).length;

      const reviewTasks = userTasks.filter(
        (task) => task.status === "Review"
      ).length;

      return {
        ...user,
        completedTasks: completedTasks.length,
        inProgressTasks,
        todoTasks,
        reviewTasks,
      };
    })
    .filter((user) => {
       const matchesSearch = searchQuery === "" || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase());

       let matchesStatus = true;
      if (selectedStatus !== "all") {
        switch (selectedStatus) {
          case "To Do":
            matchesStatus = user.todoTasks > 0;
            break;
          case "In Progress":
            matchesStatus = user.inProgressTasks > 0;
            break;
          case "Review":
            matchesStatus = user.reviewTasks > 0;
            break;
          case "Completed":
            matchesStatus = user.completedTasks > 0;
            break;
        }
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.completedTasks - a.completedTasks);

  // Calculate summary statistics
  const totalTodoTasks = filteredUserStats.reduce((sum, user) => sum + user.todoTasks, 0);
  const totalInProgressTasks = filteredUserStats.reduce((sum, user) => sum + user.inProgressTasks, 0);
  const totalReviewTasks = filteredUserStats.reduce((sum, user) => sum + user.reviewTasks, 0);
  const totalCompletedTasks = filteredUserStats.reduce((sum, user) => sum + user.completedTasks, 0);
  const totalTasks = totalTodoTasks + totalInProgressTasks + totalReviewTasks + totalCompletedTasks;
  const completionRate = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-gray-700">Loading analytics dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Track team performance and task progress</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Last updated: <span className="font-medium text-gray-700">{format(new Date(), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-blue-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Total Tasks</div>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <PieChart className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{totalTasks}</div>
                      <div className="text-sm text-gray-500 mb-1">assigned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-green-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Completion Rate</div>
                      <div className="p-2 bg-green-50 rounded-full">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
                      <div className="text-sm text-gray-500 mb-1">efficiency</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-purple-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Team Members</div>
                      <div className="p-2 bg-purple-50 rounded-full">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{filteredUserStats.length}</div>
                      <div className="text-sm text-gray-500 mb-1">active users</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-amber-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Completed Tasks</div>
                      <div className="p-2 bg-amber-50 rounded-full">
                        <ClipboardCheck className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{totalCompletedTasks}</div>
                      <div className="text-sm text-gray-500 mb-1">this period</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <BarChart2 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Task Status Distribution</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Current distribution of tasks by status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-3">
                    <ListTodo className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalTodoTasks}</div>
                  <div className="text-sm font-medium text-gray-500 mt-1">To Do</div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (totalTodoTasks / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-blue-100 rounded-full mb-3">
                    <Timer className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalInProgressTasks}</div>
                  <div className="text-sm font-medium text-blue-600 mt-1">In Progress</div>
                  <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (totalInProgressTasks / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-amber-100 rounded-full mb-3">
                    <Eye className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalReviewTasks}</div>
                  <div className="text-sm font-medium text-amber-600 mt-1">In Review</div>
                  <div className="mt-3 w-full bg-amber-200 rounded-full h-2">
                    <div 
                      className="bg-amber-600 h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (totalReviewTasks / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-green-100 rounded-full mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalCompletedTasks}</div>
                  <div className="text-sm font-medium text-green-600 mt-1">Completed</div>
                  <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (totalCompletedTasks / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1 border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full bg-transparent border-gray-200 rounded-xl h-12 text-base focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[200px] bg-transparent border-gray-200 rounded-xl h-12">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* User Task Summary Table */}
          <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">User Task Summary</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Overview of tasks by user</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead className="w-12 font-semibold text-gray-600">#</TableHead>
                      <TableHead className="font-semibold text-gray-600">User</TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <ListTodo className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          To Do
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-blue-100 rounded">
                            <Timer className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          In Progress
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-yellow-100 rounded">
                            <Eye className="h-3.5 w-3.5 text-yellow-500" />
                          </div>
                          Review
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-green-100 rounded">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          </div>
                          Completed
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUserStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 bg-gray-50/20">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100/80 rounded-full">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-1 text-center">
                              <p className="text-lg font-medium text-gray-600">No users found</p>
                              <p className="text-sm text-gray-500">Try adjusting your filters</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUserStats.map((user, index) => (
                        <TableRow 
                          key={user.id} 
                          className="hover:bg-blue-50/5 transition-colors duration-150 group border-b border-gray-100 last:border-0"
                        >
                          <TableCell className="font-medium text-gray-600">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
                                <AvatarImage src={user.profile_image} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                                  {user.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">{user.username}</div>
                                <div className="text-xs text-gray-500">User #{user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="px-4 py-1.5 bg-white font-medium border-gray-200 shadow-sm hover:shadow transition-shadow rounded-full">
                              {user.todoTasks}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="px-4 py-1.5 bg-white font-medium border-blue-200 shadow-sm hover:shadow transition-shadow rounded-full">
                              {user.inProgressTasks}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="px-4 py-1.5 bg-white font-medium border-yellow-200 shadow-sm hover:shadow transition-shadow rounded-full">
                              {user.reviewTasks}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="px-4 py-1.5 bg-white font-medium border-green-200 shadow-sm hover:shadow transition-shadow rounded-full">
                              {user.completedTasks}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/Admin/Reports-Analytics/${user.id}`}>
                              <button 
                                className="inline-flex items-center cursor-pointer gap-1.5 px-4 py-2 text-sm rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors shadow-sm hover:shadow"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Details
                              </button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
