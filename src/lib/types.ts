
export interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  date: string;
}

export interface PaymentType {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  description: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message?: string; // Making message optional to match current implementation
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdated: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActive: string;
  permissions: string[];
  profileImage?: string;
  performance?: EmployeePerformance;
}

export interface EmployeePerformance {
  productivityScore: number;
  tasksCompletionRate: number;
  meetingAttendance: number;
  onTimeDeliveries: number;
  clientSatisfaction: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  employeeCount: number;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'to-do' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignees: {
    id: number;
    name: string;
    image: string;
  }[];
  dueDate: string;
  comments: number;
  attachments: number;
  department: string;
  created: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  selectedServices: string[];
  subscriptionStatus: string;
  status: string;
  profileImage?: string;
  role?: string;
  // Add missing properties that are being used
  subscriptionExpiry?: string;
  phone?: string;
  address?: string;
}

// Enhanced interfaces for Finance component
export interface RevenueData {
  month: string;
  amount: number;
  name?: string;
  revenue?: number;
  year?: number;
  total?: number;
  growth?: number;
  byMonth?: { name: string; revenue: number; }[];
}

export interface FinancialSummary {
  totalRevenue: number;
  totalClients: number;
  averageRevenue: number;
  byMonth: { name: string; revenue: number; }[];
  total: number;
  growth: number;
  completed?: number;
  failed?: number;
  avgOrderValue?: number;
}

export interface TransactionSummary {
  completed: number;
  failed: number;
  avgOrderValue: number;
}

export interface UserStats {
  total: number;
  active: number;
  growth: number;
  totalUsers?: number;
  activeUsers?: number;
  newUsersThisMonth?: number;
}
