import { toast } from "sonner";

export const useToast = () => {
    const showSuccess = (message, options = {}) => {
        toast.success(message, {
            duration: 4000,
            style: {
                background: "#a7b89a",
                color: "#4a4238",
                border: "1px solid #8fa382",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
            },
            ...options,
        });
    };

    const showError = (message, options = {}) => {
        toast.error(message, {
            duration: 6000,
            style: {
                background: "#b5847a",
                color: "#f4f1e8",
                border: "1px solid #9d6b61",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
            },
            ...options,
        });
    };

    const showInfo = (message, options = {}) => {
        toast.info(message, {
            duration: 4000,
            style: {
                background: "#f4f1e8",
                color: "#4a4238",
                border: "1px solid #d4d0c4",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
            },
            ...options,
        });
    };

    const showWarning = (message, options = {}) => {
        toast.warning(message, {
            duration: 5000,
            style: {
                background: "#c4a887",
                color: "#4a4238",
                border: "1px solid #ab956f",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
            },
            ...options,
        });
    };

    return {
        showSuccess,
        showError,
        showInfo,
        showWarning,
    };
};
