import { Link, useLocation } from "react-router-dom";
import { FileText, Package, Plus, LogOut, Cloud } from "lucide-react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

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
  const { user, isAuthenticated, login, logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
  };

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

        {/* Bottom Section - User Profile or Login */}
        <div className="p-4 border-t border-border">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg border bg-card hover:bg-accent transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none mb-1 truncate">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Cloud className="h-3 w-3 text-green-600" />
                  <span>Synced</span>
                </div>
              </div>
              <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to sign out?</DialogTitle>
                    <DialogDescription>
                      You will be logged out of your account and will need to sign in again to access your cloud data.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsLogoutDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                    >
                      Sign out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold leading-none">
                    Login to access anywhere
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Sync your invoices across all your devices
                  </p>
                </div>
                <Button
                  onClick={login}
                  className="w-full gap-2"
                  size="sm"
                  variant="default"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Login in with Google
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

