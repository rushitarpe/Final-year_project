import React from 'react';
import { cn } from '../../utils/utils';

const Input = React.forwardRef(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'flex h-11 w-full rounded-xl border bg-white/50 dark:bg-slate-900/50 px-4 py-2 text-sm',
                        'border-slate-300 dark:border-slate-700',
                        'placeholder-slate-400 dark:placeholder-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                        'transition-all duration-200 backdrop-blur-sm',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
                        className
                    )}
                    {...props}
                />
                {error && <span className="text-xs text-red-500 mt-1 flex items-center">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
