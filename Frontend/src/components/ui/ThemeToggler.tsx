import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

export const ThemeToggler = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="p-2 w-10 h-10 rounded-full"
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-700" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
            )}
        </Button>
    );
};
