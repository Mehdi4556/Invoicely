import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { GoArrowUpRight } from "react-icons/go";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-background border-b border-border transition-colors">
      <div className="flex items-center justify-between px-8 py-4 max-w-[1100px] mx-auto">
        {/* Left side: Logo and Brand */}
        <div className="flex items-center">
          <a
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <img src="/logo-icon.webp" alt="Invoicely Logo" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-foreground font-inter ml-2">Invoicely</span>
          </a>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Switch */}
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
            aria-label="Toggle theme"
          />

          {/* Main CTA Button */}
          <Link to="/create-invoice">
            <Button
              variant="ghost"
              className="text-foreground px-3 hover:bg-transparent hover:text-foreground cursor-pointer dark:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] dark:text-white"
            >
            Invoice It
            <div className="ml-1 h-5 w-5 rounded-full bg-gray-350 dark:bg-[#575757] flex items-center justify-center">
              <GoArrowUpRight className="h-1 w-1" />
            </div>
            </Button>
          </Link>

          {/* Profile Menu */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
