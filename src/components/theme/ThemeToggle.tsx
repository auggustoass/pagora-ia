
import { useTheme } from "@/components/theme/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  
  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <div className="flex items-center space-x-2 bg-white/5 p-1.5 rounded-full">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch 
        checked={isDarkMode} 
        onCheckedChange={toggleTheme} 
        id="theme-toggle"
        className="data-[state=checked]:bg-primary"
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
