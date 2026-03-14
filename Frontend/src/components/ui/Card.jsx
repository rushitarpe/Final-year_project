import React from 'react';
import { cn } from '../../utils/utils';

const Card = React.forwardRef(
    ({ className, glass = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl border transition-all duration-300',
                    glass
                        ? 'glass-card dark:bg-slate-900/80'
                        : 'bg-white border-slate-200 dark:border-slate-800 dark:bg-slate-800/50 shadow-xl',
                    className
                )}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';

export { Card };
