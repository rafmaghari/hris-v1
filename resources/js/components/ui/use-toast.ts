import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export function toast({ title, description, action, variant }: ToastProps) {
  return sonnerToast(title, {
    description,
    action,
    className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : undefined,
  });
}

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    error: (message: string) => {
      return sonnerToast.error(message);
    },
    success: (message: string) => {
      return sonnerToast.success(message);
    },
  };
} 