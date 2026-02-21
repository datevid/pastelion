"use client";

import Link from 'next/link';
import { ShieldCheck, Plus, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
            <nav className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <ShieldCheck className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="text-base font-bold tracking-tight bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
                        Pastelion
                    </span>
                </Link>

                {/* Center Links */}
                <div className="hidden md:flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Link href="/" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            New
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Link href="/how-it-works" className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            How it Works
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Link href="/about" className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            About
                        </Link>
                    </Button>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-medium">
                        <Link href="/">
                            <Plus className="w-4 h-4 mr-1" />
                            New Paste
                        </Link>
                    </Button>
                </div>
            </nav>
        </header>
    );
}
