import { Link, useLocation } from "react-router-dom";
import { FileText, Package, Plus, ChevronUp } from "lucide-react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavItem[] = [
  {
    name: "Invoices",
    path: "/invoices",
    icon: FileText,
  },
  {
    name: "Manage Assets",
    path: "/assets",
    icon: Package,
  },
];

const createItems: NavItem[] = [
  {
    name: "Create Invoice",
    path: "/create-invoice",
    icon: Plus,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-border bg-background transition-colors">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="px-4 py-4 border-b border-border ml-3 mt-4 text-7xl">
          <Link
            to="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <img
              src="/logo-icon.webp"
              alt="Invoicely Logo"
              className="h-7 w-auto"
            />
            <span className="text-lg font-semibold text-foreground font-dm-sans ml-2">
              Invoicely
            </span>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-4 ml-2">
          <div className="space-y-6">
            {/* Navigation */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 ml-1 font-dm-sans">
                Navigation
              </h3>
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 font-medium text-sm font-dm-sans",
                          isActive
                            ? "bg-transparent text-blue-600 dark:text-blue-400"
                            : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Create Section */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 ml-1 font-dm-sans">
                Create
              </h3>
              <ul className="space-y-1">
                {createItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 font-medium text-sm font-dm-sans",
                          isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                            : "text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section - User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/logo-icon.webp" alt="User" />
              <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                M
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate font-dm-sans">
                M Mehdi
              </p>
              <p className="text-xs text-muted-foreground truncate font-dm-sans">
                mehdim12425@gmail.com
              </p>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </aside>
  );
}

