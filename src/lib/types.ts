
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
