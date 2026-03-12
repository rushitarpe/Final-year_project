import React from 'react';
import { cn } from '../../utils/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, glass = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl border transition-all duration-300',
                    glass
                        ? 'glass-card dark:glass-card-dark'
                        : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700/50 shadow-xl',
                    className
                )}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';

export { Card };
