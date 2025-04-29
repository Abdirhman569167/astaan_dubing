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
import { 
  Search, 
  Users, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Wallet, 
  TrendingUp, 
  BarChart2, 
  Download, 
  Filter,
  ChevronDown,
  Check
} from 'lucide-react';
import Link from "next/link";

interface PaymentRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  role: string;
  amount: number;
  payment_date: string;
  status: 'Pending' | 'Processed' | 'Declined';
  payment_type: 'Salary' | 'Commission' | 'Bonus';
  profile_image?: string;
}

export default function PayrollCommissionsPage() {
  // Mock data for demonstration
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("current-month");
  
  useEffect(() => {
    // Load mock data immediately without delay
    const loadMockData = () => {
      const mockData: PaymentRecord[] = [
        {
          id: 1,
          employee_id: 101,
          employee_name: "Ahmed Mohamed",
          role: "Translator",
          amount: 1250.00,
          payment_date: "2023-05-15T10:30:00",
          status: "Processed",
          payment_type: "Salary",
          profile_image: "https://randomuser.me/api/portraits/men/1.jpg"
        },
        {
          id: 2,
          employee_id: 102,
          employee_name: "Fatima Hassan",
          role: "Voice-over Artist",
          amount: 850.75,
          payment_date: "2023-05-15T11:20:00",
          status: "Processed",
          payment_type: "Commission",
          profile_image: "https://randomuser.me/api/portraits/women/2.jpg"
        },
        {
          id: 3,
          employee_id: 103,
          employee_name: "Omar Ali",
          role: "Editor",
          amount: 1600.00,
          payment_date: "2023-05-20T09:15:00",
          status: "Processed",
          payment_type: "Salary",
          profile_image: "https://randomuser.me/api/portraits/men/3.jpg"
        },
        {
          id: 4,
          employee_id: 104,
          employee_name: "Layla Abdi",
          role: "Supervisor",
          amount: 2100.50,
          payment_date: "2023-05-20T14:45:00",
          status: "Processed",
          payment_type: "Salary",
          profile_image: "https://randomuser.me/api/portraits/women/4.jpg"
        },
        {
          id: 5,
          employee_id: 105,
          employee_name: "Yusuf Mohamed",
          role: "Sound Engineer",
          amount: 950.25,
          payment_date: "2023-05-25T10:00:00",
          status: "Pending",
          payment_type: "Commission",
          profile_image: "https://randomuser.me/api/portraits/men/5.jpg"
        },
        {
          id: 6,
          employee_id: 106,
          employee_name: "Amina Hussein",
          role: "Translator",
          amount: 750.00,
          payment_date: "2023-05-25T13:30:00",
          status: "Pending",
          payment_type: "Bonus",
          profile_image: "https://randomuser.me/api/portraits/women/6.jpg"
        },
        {
          id: 7,
          employee_id: 107,
          employee_name: "Ibrahim Farah",
          role: "Editor",
          amount: 1450.00,
          payment_date: "2023-06-01T09:30:00",
          status: "Pending",
          payment_type: "Salary",
          profile_image: "https://randomuser.me/api/portraits/men/7.jpg"
        },
        {
          id: 8,
          employee_id: 108,
          employee_name: "Zainab Jama",
          role: "Voice-over Artist",
          amount: 800.50,
          payment_date: "2023-06-01T11:45:00",
          status: "Declined",
          payment_type: "Commission",
          profile_image: "https://randomuser.me/api/portraits/women/8.jpg"
        }
      ];
      
      setPaymentRecords(mockData);
      setLoading(false);
    };
    
    loadMockData();
  }, []);
  
  const filteredRecords = paymentRecords.filter(record => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Payment type filter
    const matchesPaymentType = paymentTypeFilter === "all" || 
      record.payment_type.toLowerCase() === paymentTypeFilter.toLowerCase();
    
    // Status filter
    const matchesStatus = statusFilter === "all" || 
      record.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Time filter (simplified for demo)
    let matchesTime = true;
    const paymentDate = new Date(record.payment_date);
    const currentDate = new Date();
    
    if (timeFilter === "current-month") {
      matchesTime = paymentDate.getMonth() === currentDate.getMonth() && 
                   paymentDate.getFullYear() === currentDate.getFullYear();
    } else if (timeFilter === "previous-month") {
      const prevMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
      const prevMonthYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
      matchesTime = paymentDate.getMonth() === prevMonth && 
                   paymentDate.getFullYear() === prevMonthYear;
    } else if (timeFilter === "last-quarter") {
      // Simplistic implementation for demo
      const threeMonthsAgo = new Date(currentDate);
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
      matchesTime = paymentDate >= threeMonthsAgo;
    }
    
    return matchesSearch && matchesPaymentType && matchesStatus && matchesTime;
  });
  
  // Calculate summary statistics
  const totalSalaries = filteredRecords
    .filter(record => record.payment_type === "Salary" && record.status !== "Declined")
    .reduce((sum, record) => sum + record.amount, 0);
    
  const totalCommissions = filteredRecords
    .filter(record => record.payment_type === "Commission" && record.status !== "Declined")
    .reduce((sum, record) => sum + record.amount, 0);
    
  const totalBonuses = filteredRecords
    .filter(record => record.payment_type === "Bonus" && record.status !== "Declined")
    .reduce((sum, record) => sum + record.amount, 0);
    
  const totalPending = filteredRecords
    .filter(record => record.status === "Pending")
    .reduce((sum, record) => sum + record.amount, 0);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Helper function to get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Processed":
        return "bg-green-50 text-green-700 border-green-200";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Declined":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  // Helper function to get payment type badge style
  const getPaymentTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Salary":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Commission":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Bonus":
        return "bg-teal-50 text-teal-700 border-teal-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-gray-700">Loading payroll data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payroll & Commissions</h1>
                <p className="text-sm text-gray-500 mt-1">Manage employee payments, salaries, and commissions</p>
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
                      <div className="text-sm font-medium text-gray-500">Total Salaries</div>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSalaries)}</div>
                      <div className="text-xs text-gray-500 mb-1">this period</div>
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
                      <div className="text-sm font-medium text-gray-500">Total Commissions</div>
                      <div className="p-2 bg-purple-50 rounded-full">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCommissions)}</div>
                      <div className="text-xs text-gray-500 mb-1">this period</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-teal-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Total Bonuses</div>
                      <div className="p-2 bg-teal-50 rounded-full">
                        <Wallet className="h-5 w-5 text-teal-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalBonuses)}</div>
                      <div className="text-xs text-gray-500 mb-1">this period</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-yellow-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Pending Payments</div>
                      <div className="p-2 bg-yellow-50 rounded-full">
                        <Calendar className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPending)}</div>
                      <div className="text-xs text-gray-500 mb-1">to be processed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search by name or role..." 
                    className="pl-10 border-gray-200 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                    <SelectTrigger className="w-full md:w-36 border-gray-200 bg-white">
                      <SelectValue placeholder="Payment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="commission">Commission</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-36 border-gray-200 bg-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-full md:w-40 border-gray-200 bg-white">
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current-month">Current Month</SelectItem>
                      <SelectItem value="previous-month">Previous Month</SelectItem>
                      <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <button className="px-4 py-2 flex items-center gap-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-gray-600">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Records Table */}
          <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-xl">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Payment Records</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Complete list of employee payments and transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50/80">
                        <TableHead className="py-3">Employee</TableHead>
                        <TableHead className="py-3">Role</TableHead>
                        <TableHead className="py-3">Payment Type</TableHead>
                        <TableHead className="py-3">Amount</TableHead>
                        <TableHead className="py-3">Date</TableHead>
                        <TableHead className="py-3">Status</TableHead>
                        <TableHead className="py-3 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage 
                                  src={record.profile_image} 
                                  alt={record.employee_name} 
                                />
                                <AvatarFallback className="bg-orange-100 text-orange-700">
                                  {record.employee_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">{record.employee_name}</div>
                                <div className="text-xs text-gray-500">ID: {record.employee_id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{record.role}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`rounded-full px-2 py-1 ${getPaymentTypeBadgeStyle(record.payment_type)}`}>
                              {record.payment_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(record.amount)}</TableCell>
                          <TableCell>{format(new Date(record.payment_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`rounded-full px-2 py-1 ${getStatusBadgeStyle(record.status)}`}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link 
                              href={`/Admin/Payroll-Commissions/${record.id}`}
                              className="px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 inline-block"
                            >
                              View Details
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No payment records found</h3>
                  <p className="text-gray-500 max-w-md">
                    {searchQuery ? 
                      `No results for "${searchQuery}"` : 
                      "Try adjusting your filters to find payment records"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
