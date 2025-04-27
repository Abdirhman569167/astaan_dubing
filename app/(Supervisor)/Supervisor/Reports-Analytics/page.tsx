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
import { Search, Users, ListTodo, Timer, Eye, CheckCircle, BarChart2 } from 'lucide-react';

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
        taskUpdatesArray.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        
        // Keep only the latest status update for each task
        const uniqueTaskUpdates = taskUpdatesArray.filter(update => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
       <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-500">Track team performance and task progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-6">
        <div className="flex flex-col gap-6">
           <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-1 border border-gray-100">
              <CardContent className="p-4">
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
            <Card className="border border-gray-100">
              <CardContent className="p-4">
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

           <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">User Task Summary</CardTitle>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUserStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16 bg-gray-50/20">
                          <div className="flex flex-col items-center gap-3">
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
                          className="hover:bg-blue-50/5 transition-colors duration-150 group"
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
