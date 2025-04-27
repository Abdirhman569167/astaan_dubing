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
import { Search, Users, ListTodo, Timer, Eye, CheckCircle, BarChart2, ExternalLink, Trophy, Medal, TrendingUp } from 'lucide-react';
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

export default function UserRangs() {

  const taskServiceUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const userServiceUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  const [taskUpdates, setTaskUpdates] = useState<TaskStatusUpdate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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

  // Calculate total tasks for all users
  const totalTasks = filteredUserStats.reduce((sum, user) => 
    sum + user.todoTasks + user.inProgressTasks + user.reviewTasks + user.completedTasks, 0);
  
  // Get top 3 users by completed tasks
  const topUsers = [...filteredUserStats].slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-gray-700">Loading user rankings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8">
          {/* Search and filter controls */}
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
                  <SelectTrigger className="w-48 bg-transparent border-gray-200 rounded-xl h-12">
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

          {/* Top performers */}
          {topUsers.length > 0 && (
            <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b border-gray-100 py-5 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <Trophy className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Users with the most completed tasks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topUsers.map((user, index) => {
                    let badgeColor = "bg-gray-100";
                    let iconColor = "text-gray-600";
                    let medalIcon = <Medal className="h-5 w-5" />;
                    
                    if (index === 0) {
                      badgeColor = "bg-amber-100";
                      iconColor = "text-amber-600";
                    } else if (index === 1) {
                      badgeColor = "bg-gray-200";
                      iconColor = "text-gray-700";
                    } else if (index === 2) {
                      badgeColor = "bg-amber-50";
                      iconColor = "text-amber-500";
                    }
                    
                    return (
                      <div key={user.id} className="flex flex-col items-center bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className={`p-2 ${badgeColor} rounded-full mb-4`}>
                          <div className={iconColor}>
                            {medalIcon}
                          </div>
                        </div>
                        <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                          <AvatarImage src={user.profile_image} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
                            {user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="mt-4 text-center">
                          <div className="font-semibold text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500 mt-1">#{index + 1} Rank</div>
                        </div>
                        <div className="mt-4 w-full flex justify-between items-center">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Completed</div>
                            <div className="font-bold text-lg text-blue-600">{user.completedTasks}</div>
                          </div>
                          <div className="h-6 border-r border-gray-200"></div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="font-bold text-lg">{user.todoTasks + user.inProgressTasks + user.reviewTasks + user.completedTasks}</div>
                          </div>
                          <div className="h-6 border-r border-gray-200"></div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Rate</div>
                            <div className="font-bold text-lg text-green-600">
                              {Math.round((user.completedTasks / (user.todoTasks + user.inProgressTasks + user.reviewTasks + user.completedTasks || 1)) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* User rankings table */}
          <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">User Performance Rankings</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Overview of tasks by user</CardDescription>
                  </div>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-blue-700">Total Tasks: {totalTasks}</span>
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
                      filteredUserStats.map((user, index) => {
                        const isTop3 = index < 3;
                        const totalUserTasks = user.todoTasks + user.inProgressTasks + user.reviewTasks + user.completedTasks;
                        const completionRate = totalUserTasks > 0 
                          ? Math.round((user.completedTasks / totalUserTasks) * 100) 
                          : 0;
                        
                        return (
                          <TableRow 
                            key={user.id} 
                            className={`hover:bg-blue-50/10 transition-colors duration-200 border-b border-gray-100 last:border-0
                              ${hoveredRow === index ? 'bg-blue-50/5' : ''} 
                              ${isTop3 ? 'bg-gradient-to-r from-amber-50/40 to-transparent' : ''}`}
                            onMouseEnter={() => setHoveredRow(index)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            <TableCell className="font-medium text-gray-600">
                              {isTop3 && (
                                <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full 
                                  ${index === 0 ? 'bg-amber-100 text-amber-700' : 
                                    index === 1 ? 'bg-gray-200 text-gray-700' : 
                                    'bg-amber-50 text-amber-600'} mr-2 text-xs font-bold`}>
                                  {index + 1}
                                </div>
                              )}
                              {!isTop3 && (index + 1)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
                                    <AvatarImage src={user.profile_image} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                                      {user.username[0].toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isTop3 && (
                                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
                                      ${index === 0 ? 'bg-amber-400' : 
                                        index === 1 ? 'bg-gray-400' : 
                                        'bg-amber-300'}`}>
                                      <Trophy className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 flex items-center gap-1">
                                    {user.username}
                                    {completionRate >= 80 && (
                                      <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        High Performer
                                      </span>
                                    )}
                                  </div>
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
                              <div className="flex flex-col gap-1">
                                <Badge variant="outline" className="px-4 py-1.5 bg-white font-medium border-green-200 shadow-sm hover:shadow transition-shadow rounded-full">
                                  {user.completedTasks}
                                </Badge>
                                {totalUserTasks > 0 && (
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                    <div 
                                      className="bg-green-500 h-1.5 rounded-full" 
                                      style={{ width: `${completionRate}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>
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
                        );
                      })
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
