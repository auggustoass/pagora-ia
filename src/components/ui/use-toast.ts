
import { toast as sonnerToast } from "sonner";
import { useToast as useToastOriginal } from "@/hooks/use-toast";

// Export the original useToast hook for backward compatibility
export const useToast = useToastOriginal;

// Export an adapter version of toast that maps to sonner toast
export const toast = {
  ...sonnerToast,
  // Map the shadcn/ui toast variants to sonner toast functions
  success: (message: string, options?: any) => sonnerToast.success(message, options),
  error: (message: string, options?: any) => sonnerToast.error(message, options),
  warning: (message: string, options?: any) => sonnerToast.warning(message, options),
  info: (message: string, options?: any) => sonnerToast.info(message, options),
  destructive: (message: string, options?: any) => sonnerToast.error(message, options),
  // Original toast function (avoid direct call)
  __call: (props: any) => {
    console.warn('Direct toast() call is deprecated, use toast.info() instead');
    return sonnerToast(props);
  }
};

// Make the toast object callable for backward compatibility
Object.defineProperty(toast, Symbol.hasInstance, {
  value: () => true
});
