"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-md hover:shadow-lg",
      secondary: "bg-secondary text-white hover:opacity-90 active:scale-95",
      ghost: "bg-transparent text-foreground hover:bg-black/5",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm min-h-[36px]",
      md: "px-5 py-2.5 text-base min-h-[44px]",
      lg: "px-8 py-3 text-lg min-h-[52px]",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
