import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({ isOpen, onClose, title, children }) => {
    // Prevent body scrolling when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">
                                <X className="w-5 h-5 text-slate-500" />
                            </Button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
