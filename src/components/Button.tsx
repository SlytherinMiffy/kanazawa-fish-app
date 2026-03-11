import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
    const baseStyle = "font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out";
    const variants = {
        primary: "bg-blue-500 hover:bg-blue-700 text-white",
        secondary: "bg-gray-300 hover:bg-gray-400 text-gray-800",
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
