"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
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
import { 
  Search, 
  Users, 
  ListTodo, 
  Timer, 
  Eye, 
  CheckCircle, 
  BarChart2, 
  ExternalLink, 
  PieChart, 
  TrendingUp, 
  ClipboardCheck, 
  Download, 
  Calendar, 
  Edit,
  Save,
  X,
  DollarSign,
  Check
} from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  name: string;
  email: string;
  mobile: string;
  role: string;
  profile_image: string;
  created_at: string;
}

interface UserWithStats extends User {
  experienceLevel: string;
  totalHours: number;
  hourlyRate: number;
  monthlyCommission: number;
  accountNumber: number;
}

export default function ReportsAnalyticsPage() {

  const taskServiceUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const userServiceUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  const [taskUpdates, setTaskUpdates] = useState<TaskStatusUpdate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("current");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRate, setEditingRate] = useState<number>(0);
  const [customRates, setCustomRates] = useState<Map<number, number>>(new Map());

  // Generate last 12 months options
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    options.push({ value: "current", label: "Current Month" });
    
    for (let i = 1; i <= 12; i++) {
      const monthDate = subMonths(now, i);
      const monthValue = format(monthDate, "yyyy-MM");
      const monthLabel = format(monthDate, "MMMM yyyy");
      options.push({ value: monthValue, label: monthLabel });
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

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
          const taskKey = `${update.task_id}-${update.updated_by}`;
          if (!taskUpdatesMap.has(taskKey)) {
            taskUpdatesMap.set(taskKey, true);
            return true;
          }
          return false;
        });

        // Further filter to only keep tasks with "Completed" status
        const completedTasks = uniqueTaskUpdates.filter((task: TaskStatusUpdate) => task["SubTask.status"] === "Completed");
        
        setTaskUpdates(completedTasks);

        // Process users data
        if (usersData && usersData.users) {
          setUsers(usersData.users);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [taskServiceUrl, userServiceUrl]);

  // Filter tasks by selected month
  const getTasksForSelectedMonth = () => {
    if (selectedMonth === "current") {
      return taskUpdates;
    }
    
    const [year, month] = selectedMonth.split("-").map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    
    return taskUpdates.filter((task: TaskStatusUpdate) => {
      const taskDate = new Date(task.updated_at);
      return isWithinInterval(taskDate, { start: startDate, end: endDate });
    });
  };

  const filteredTasksByMonth = getTasksForSelectedMonth();
  
  // Get all users who have completed tasks in the selected month
  const usersWithCompletedTasks = users.filter(user => {
    return filteredTasksByMonth.some((task: TaskStatusUpdate) => task.updated_by === user.id);
  });

  // Function to get base rate for a role
  const getBaseRateForRole = (role: string): number => {
    switch (role) {
      case "Sound Engineer":
        return 6.00;
      case "Voice-over Artist":
        return 5.00;
      case "Translator":
        return 8.00;
      case "Admin":
        return 10.00;
      case "Film Dubbing Team":
        return 7.00;
      default:
        return 5.00; // Default rate
    }
  };

  // Function to get custom rate for a user (or default if not set)
  const getRateForUser = (userId: number, role: string): number => {
    return customRates.has(userId) ? customRates.get(userId)! : getBaseRateForRole(role);
  };

  // Start editing a user's rate
  const startEditingRate = (userId: number, currentRate: number) => {
    setEditingUserId(userId);
    setEditingRate(currentRate);
  };

  // Save the edited rate
  const saveRate = (userId: number) => {
    if (editingRate > 0) {
      setCustomRates(new Map(customRates.set(userId, editingRate)));
    }
    setEditingUserId(null);
  };

  // Cancel rate editing
  const cancelEditing = () => {
    setEditingUserId(null);
  };

  // Calculate user stats including work hours and earnings
  const usersWithStats = usersWithCompletedTasks.map(user => {
    // Get all tasks for this user in the selected month
    const userCompletedTasks = filteredTasksByMonth.filter(
      task => task.updated_by === user.id
    );
    
    // Calculate total hours from estimated_hours
    const totalHours = userCompletedTasks.reduce(
      (sum, task) => sum + (task["SubTask.estimated_hours"] || 0), 
      0
    );
    
    // Get hourly rate (custom or default based on role)
    const hourlyRate = getRateForUser(user.id, user.role);
    
    // Calculate commission
    const monthlyCommission = totalHours * hourlyRate;
    
    return {
      ...user,
      totalHours,
      hourlyRate,
      monthlyCommission,
      taskCount: userCompletedTasks.length
    };
  });

  // Filter by search query and selected role, then sort by monthly commission (descending)
  const filteredUsers = usersWithStats
    .filter(user => {
      const matchesSearch = searchQuery === "" || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || user.role === selectedStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.monthlyCommission - a.monthlyCommission);

  // Calculate total commission
  const totalCommission = filteredUsers.reduce(
    (sum, user) => sum + user.monthlyCommission, 
    0
  );

  // Function to handle downloading the data as CSV
  const handleDownload = () => {
    // Create CSV header
    const headers = ["NO", "Name", "Job Position", "Total Hours", "Rate ($/hour)", "Monthly Commission ($)"];
    
    // Map data to CSV rows
    const csvData = filteredUsers.map((user, index) => [
      index + 1,
      user.name,
      user.role,
      user.totalHours.toFixed(1),
      `$${user.hourlyRate.toFixed(2)}`,
      `$${user.monthlyCommission.toFixed(2)}`
    ]);
    
    // Add total row
    csvData.push([
      "",
      "TOTAL",
      "",
      filteredUsers.reduce((sum, u) => sum + u.totalHours, 0).toFixed(1),
      "",
      `$${totalCommission.toFixed(2)}`
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Set up download
    const month = selectedMonth === "current" 
      ? format(new Date(), "MMMM_yyyy") 
      : selectedMonth.replace("-", "_");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `team_commission_${month}.csv`);
    link.style.visibility = "hidden";
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                      <div className="text-sm font-medium text-gray-500">Total Staff</div>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <PieChart className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{filteredUsers.length}</div>
                      <div className="text-sm text-gray-500 mb-1">with completed tasks</div>
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
                      <div className="text-sm font-medium text-gray-500">Total Hours</div>
                      <div className="p-2 bg-green-50 rounded-full">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {filteredUsers.reduce((sum, u) => sum + u.totalHours, 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">hours worked</div>
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
                      <div className="text-sm font-medium text-gray-500">Average Rate</div>
                      <div className="p-2 bg-purple-50 rounded-full">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        ${filteredUsers.length > 0 
                            ? (filteredUsers.reduce((sum, u) => sum + u.hourlyRate, 0) / filteredUsers.length).toFixed(2) 
                            : "0.00"}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">per hour</div>
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
                      <div className="text-sm font-medium text-gray-500">Total Commission</div>
                      <div className="p-2 bg-amber-50 rounded-full">
                        <ClipboardCheck className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">${totalCommission.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 mb-1">this month</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1 border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name..."
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
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="Translator">Translators</SelectItem>
                    <SelectItem value="Voice-over Artist">Voice-over Artists</SelectItem>
                    <SelectItem value="Sound Engineer">Sound Engineers</SelectItem>
                    <SelectItem value="Admin">Admins</SelectItem>
                    <SelectItem value="Film Dubbing Team">Film Dubbing Team</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[200px] bg-transparent border-gray-200 rounded-xl h-12">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select month" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* User Task Summary Table */}
          <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Team Compensation Summary</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {selectedMonth === "current" 
                        ? "Current month - Staff with completed tasks" 
                        : `${monthOptions.find(m => m.value === selectedMonth)?.label} - Staff with completed tasks`}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={handleDownload}
                  variant="outline" 
                  className="px-4 py-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead className="w-12 font-semibold text-gray-600">NO</TableHead>
                      <TableHead className="font-semibold text-gray-600">Name</TableHead>
                      <TableHead className="font-semibold text-gray-600">Job Position</TableHead>
                      <TableHead className="font-semibold text-gray-600">Total Hours</TableHead>
                      <TableHead className="font-semibold text-gray-600">Rate ($/hour)</TableHead>
                      <TableHead className="font-semibold text-gray-600">Monthly Commission ($)</TableHead>
                      <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 bg-gray-50/20">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100/80 rounded-full">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-1 text-center">
                              <p className="text-lg font-medium text-gray-600">No staff found</p>
                              <p className="text-sm text-gray-500">No users with completed tasks match your filters</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <TableRow key={user.id} className="hover:bg-blue-50/5 transition-colors duration-150 group border-b border-gray-100">
                          <TableCell className="font-medium text-gray-600">{index + 1}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{user.totalHours.toFixed(1)}</TableCell>
                          <TableCell>
                            {editingUserId === user.id ? (
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={editingRate}
                                    onChange={(e) => setEditingRate(Number(e.target.value))}
                                    className="w-24 py-1 px-2 text-sm"
                                    step="0.01"
                                    min="0"
                                  />
                                </div>
                                <Button 
                                  onClick={() => saveRate(user.id)} 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-full p-0 hover:bg-green-100"
                                >
                                  <Check className="h-3.5 w-3.5 text-green-500" />
                                </Button>
                                <Button 
                                  onClick={cancelEditing} 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-6 w-6 rounded-full p-0 hover:bg-red-100"
                                >
                                  <X className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>US$ {user.hourlyRate.toFixed(2)}</span>
                                <Button
                                  onClick={() => startEditingRate(user.id, user.hourlyRate)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full p-0 hover:bg-blue-100"
                                >
                                  <Edit className="h-3.5 w-3.5 text-blue-500" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>US$ {user.monthlyCommission.toFixed(2)}</TableCell>
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
                    
                    {filteredUsers.length > 0 && (
                      <TableRow className="bg-gray-50/50 font-medium border-t-2 border-gray-200">
                        <TableCell colSpan={5} className="text-right pr-4 font-bold text-gray-700">
                          Total Monthly Commission:
                        </TableCell>
                        <TableCell className="font-bold">
                          US$ {totalCommission.toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 py-3 px-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Click the edit icon next to any rate to adjust the hourly rate for that employee.</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
