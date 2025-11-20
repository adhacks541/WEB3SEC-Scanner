'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Grid Animation */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Header */}
            <header className="z-10 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/80 backdrop-blur-md sticky top-0">
                <div className="container h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-[var(--neon-green)]" />
                        <h1 className="text-xl font-bold tracking-wider">
                            WEB3<span className="text-[var(--neon-green)]">SEC</span> SCANNER
                        </h1>
                    </div>
                    <nav className="flex gap-4 text-sm text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Scanner</a>
                        <a href="#" className="hover:text-white transition-colors">Vulnerabilities</a>
                        <a href="#" className="hover:text-white transition-colors">Docs</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 z-10 container py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="z-10 border-t border-[var(--panel-border)] py-6 text-center text-gray-500 text-sm">
                <p>SECURE YOUR SMART CONTRACTS</p>
            </footer>
        </div>
    );
}
