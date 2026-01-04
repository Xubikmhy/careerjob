import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, variant = 'primary', className = '', isLoading = false, ...props }: any) => {
    const baseStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-h-[40px]";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm",
        danger: "bg-red-600 text-white hover:bg-red-700",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        ai: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : children}
        </button>
    );
};

export default Button;
