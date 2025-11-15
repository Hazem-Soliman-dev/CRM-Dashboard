import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users,
  UserCheck,
  Tag,
  DollarSign,
  Calendar,
  Wallet,
  Settings,
  FileText,
  HelpCircle,
  UserCog,
  Clock,
  X,
  AlertTriangle,
  Home,
  CheckSquare,
  Building2,
  ListChecks,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "../../contexts/ToastContext";
import { Button } from "../ui/Button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const allNavigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    module: "dashboard",
    roles: [
      "Admin",
      "Sales",
      "Reservation",
      "Finance",
      "Operations",
      "Customer",
    ],
  },
  {
    name: "Activities",
    href: "/activities",
    icon: Calendar,
    module: "activities",
    roles: ["Admin", "Operations", "Reservation"],
  },
  {
    name: "Deals",
    href: "/deals",
    icon: DollarSign,
    module: "deals",
    roles: ["Admin", "Sales"],
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Users,
    module: "leads",
    roles: ["Admin", "Sales"],
  },
  {
    name: "Listings",
    href: "/listings",
    icon: ListChecks,
    module: "listings",
    roles: ["Admin", "Sales", "Reservation", "Operations"],
  },
  {
    name: "Owners",
    href: "/owners",
    icon: Building2,
    module: "owners",
    roles: ["Admin", "Sales"],
  },
  {
    name: "Properties",
    href: "/properties",
    icon: Home,
    module: "properties",
    roles: ["Admin", "Operations", "Reservation"],
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    module: "tasks",
    roles: ["Admin", "Operations", "Reservation"],
  },
  {
    name: "Customers",
    href: "/customers",
    icon: UserCheck,
    module: "customers",
    roles: ["Admin", "Sales", "Customer"],
  },
  {
    name: "Categories",
    href: "/product-categories",
    icon: Tag,
    module: "categories",
    roles: ["Admin", "Operations"],
  },
  {
    name: "Accounting",
    href: "/finance",
    icon: Wallet,
    module: "finance",
    roles: ["Admin", "Finance"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    module: "reports",
    roles: ["Admin", "Finance", "Sales"],
  },
  {
    name: "Support",
    href: "/support",
    icon: HelpCircle,
    module: "support",
    roles: ["Admin", "Customer", "Sales", "Operations"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    module: "settings",
    roles: ["Admin"],
  },
  {
    name: "User Management",
    href: "/users",
    icon: UserCog,
    module: "users",
    roles: ["Admin"],
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Clock,
    module: "attendance",
    roles: ["Admin"],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { signOut, userRole } = useAuth();
  const { canAccessModule } = usePermissions();
  const navigate = useNavigate();
  const toast = useToastContext();

  const normalizedRole = userRole?.toLowerCase?.() || "";

  // Filter navigation based on user role
  const navigation = allNavigation.filter(
    (item) =>
      item.roles.some((role) => role.toLowerCase() === normalizedRole) &&
      canAccessModule(item.module)
  );

  const handleClearCache = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset the system? This will clear all demo data and log you out."
      )
    ) {
      try {
        // Clear localStorage
        localStorage.clear();

        // Show success message
        toast.success(
          "System Reset",
          "All demo data has been cleared successfully."
        );

        // Sign out and redirect to login
        await signOut();
        navigate("/login");

        // Reload the page to ensure clean state
        window.location.reload();
      } catch (error) {
        console.error("Error clearing cache:", error);
        toast.error("Reset Failed", "There was an error resetting the system.");
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 lg:justify-center">
          <img 
            src="/tourism%20logo.png" 
            alt="Tourism Logo" 
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-1 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                )
              }
              onClick={() => window.innerWidth < 1024 && onToggle()}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Clear Cache Button - Only for Admin */}
        {normalizedRole === "admin" && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Reset System</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
