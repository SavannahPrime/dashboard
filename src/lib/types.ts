
import { LucideIcon } from "lucide-react";

export type NavItem = {
	title: string;
	href: string;
	disabled?: boolean;
	external?: boolean;
};

export type SidebarNavItem = {
	title: string;
	disabled?: boolean;
	external?: boolean;
	icon?: LucideIcon;
} & (
	| {
			href: string;
			items?: never;
	  }
	| {
			href?: string;
			items: NavLink[];
	  }
);

export type NavLink = {
	title: string;
	href: string;
	disabled?: boolean;
	external?: boolean;
};

export type SiteConfig = {
	name: string;
	description: string;
	url: string;
	ogImage: string;
	links: {
		twitter: string;
		github: string;
	};
};

export type DocsConfig = {
	mainNav: NavItem[];
	sidebarNav: SidebarNavItem[];
};

export type MarketingConfig = {
	mainNav: NavItem[];
};

type IconType = LucideIcon;

// Define the structure for the service options
export interface ServiceOption {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  features: string[];
  category?: string;
  icon?: IconType;  // Make icon optional
  name?: string;    // Add name field for Supabase compatibility
}

export interface Transaction {
  id: string;
  client_id: string;
  amount: number;
  date: string;
  status: string;
  service_name: string;
}

// Payment Type interface
export interface PaymentType {
  id: string;
  client_id: string;
  amount: number;
  status: string;
  method: string;
  description: string;
  date: string;
  type: string;
  invoice_number?: string;
}

// Support Ticket interface
export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  lastUpdated: string;
}

// Component props interfaces
export interface StatCardProps {
  title: string;
  value: string;
  description: string; // Make description required
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  highlighted?: boolean;
}

export interface ServiceCardProps {
  service: ServiceOption;
  onRemove: () => Promise<void>; // Make onRemove required
  isUpdating?: boolean;
}

export interface ServiceSelectionCardProps {
  service: ServiceOption;
  isSelected: boolean; // Make isSelected required
  onToggle: () => Promise<void>; // Make onToggle required
  isUpdating?: boolean;
}
