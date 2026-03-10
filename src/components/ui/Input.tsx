"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-foreground
            placeholder:text-text-secondary/50
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
            transition-all duration-200 ${error ? "border-red-400" : ""} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
