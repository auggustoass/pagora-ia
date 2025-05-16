
import { toast as sonnerToast } from "sonner";
import { useToast as useToastOriginal } from "@/hooks/use-toast";

// Export the original useToast hook for backward compatibility
export const useToast = useToastOriginal;

// Create a proxy function that can be called directly or via methods
const toastFn = (props: any) => sonnerToast(props);

// Extend the toast function with all the methods from sonnerToast
export const toast = Object.assign(toastFn, {
  ...sonnerToast,
  // Map the shadcn/ui toast variants to sonner toast functions
  success: (message: string, options?: any) => sonnerToast.success(message, options),
  error: (message: string, options?: any) => sonnerToast.error(message, options),
  warning: (message: string, options?: any) => sonnerToast.warning(message, options),
  info: (message: string, options?: any) => sonnerToast.info(message, options),
  destructive: (message: string, options?: any) => sonnerToast.error(message, options),
});
