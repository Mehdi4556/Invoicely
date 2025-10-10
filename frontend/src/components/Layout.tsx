import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Switch } from "./ui/switch";
import { useState } from "react";

export default function Layout() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-60">
        {/* Theme Toggle - Fixed Position */}
        <div className="fixed top-4 right-8 z-50">
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>
        
        {/* Main Content */}
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

