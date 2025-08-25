import { toast } from 'sonner';

type ToastOptions = {
    duration?: number;
    id?: string;
    description?: string;
    [key: string]: any;
};

type ToastMessage = {
    title?: string;
    description?: string;
};

export function useToast() {
    const showSuccess = (message: string | ToastMessage, options?: ToastOptions) => {
        if (typeof message === 'string') {
            toast.success(message, options);
        } else {
            toast.success(message.title || 'Success', {
                description: message.description,
                ...options,
            });
        }
    };

    const showError = (message: string | ToastMessage, options?: ToastOptions) => {
        if (typeof message === 'string') {
            toast.error(message, options);
        } else {
            toast.error(message.title || 'Error', {
                description: message.description,
                ...options,
            });
        }
    };

    const showInfo = (message: string | ToastMessage, options?: ToastOptions) => {
        if (typeof message === 'string') {
            toast(message, options);
        } else {
            toast(message.title || 'Info', {
                description: message.description,
                ...options,
            });
        }
    };

    const showWarning = (message: string | ToastMessage, options?: ToastOptions) => {
        if (typeof message === 'string') {
            toast.warning(message, options);
        } else {
            toast.warning(message.title || 'Warning', {
                description: message.description,
                ...options,
            });
        }
    };

    // Predefined messages for common operations
    const itemCreated = (itemName: string, itemType = 'Item') => {
        showSuccess({
            title: `${itemType} created successfully`,
            description: `${itemName} has been added.`,
        });
    };

    const itemUpdated = (itemName: string, itemType = 'Item') => {
        showSuccess({
            title: `${itemType} updated successfully`,
            description: `Changes to ${itemName} have been saved.`,
        });
    };

    const itemDeleted = (itemName: string, itemType = 'Item') => {
        showSuccess({
            title: `${itemType} deleted successfully`,
            description: `${itemName} has been removed.`,
        });
    };

    return {
        success: showSuccess,
        error: showError,
        info: showInfo,
        warning: showWarning,
        itemCreated,
        itemUpdated,
        itemDeleted,
    };
}
