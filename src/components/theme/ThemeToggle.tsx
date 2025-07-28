
import { useTheme } from "@/components/theme/theme-provider";
import { Moon, Monitor } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isSystemMode, setIsSystemMode] = useState(theme === "system");
  
  useEffect(() => {
    setIsSystemMode(theme === "system");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isSystemMode ? "dark" : "system";
    setTheme(newTheme);
    setIsSystemMode(!isSystemMode);
  };
  
  return (
    <div className="flex items-center space-x-2 bg-card border border-border p-1.5 rounded-lg">
      <Moon className="h-4 w-4 text-muted-foreground" />
      <Switch 
        checked={isSystemMode} 
        onCheckedChange={toggleTheme} 
        id="theme-toggle"
        className="data-[state=checked]:bg-primary"
      />
      <Monitor className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
