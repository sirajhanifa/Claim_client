import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
};

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    className = '',
    type = 'button',
}) => {
    const baseStyle =
        'rounded-md font-medium flex items-center justify-center gap-2 transition-all duration-200';
    const disabledStyle = disabled || loading ? 'opacity-60 cursor-not-allowed' : '';

    return (
        <button
            onClick={onClick} type={type}
            disabled={disabled || loading}
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabledStyle} ${className}`}
        >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
};

export default Button;
