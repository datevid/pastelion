"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Copy, Download, Loader2, ShieldCheck, Plus, Share2, Pencil, Save, X, Code2, Link as LinkIcon, RefreshCcw } from 'lucide-react';
import { unlockPaste, updatePaste, getPaste } from '@/app/actions/paste';
import { toast } from 'sonner';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdSidebar from '@/components/AdSidebar';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Shared constants for editing
const POPULAR_LANGUAGES = [
    { value: 'plaintext', label: 'Plaintext' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'json', label: 'JSON' },
];
const MORE_LANGUAGES = [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'rust', label: 'Rust' },
    { value: 'go', label: 'Go' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'sql', label: 'SQL' },
    { value: 'shell', label: 'Shell/Bash' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },
    { value: 'php', label: 'PHP' },
    { value: 'csharp', label: 'C#' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'ruby', label: 'Ruby' },
];
const MAX_BYTES = 1 * 1024 * 1024;

export default function PasteClientWrapper({ initialData, shortUrl }: { initialData: any, shortUrl: string }) {
    const [password, setPassword] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [data, setData] = useState(initialData);

    // Edit mode states
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editLanguage, setEditLanguage] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const router = useRouter();
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const contentBytes = new TextEncoder().encode(editContent).length;
    const contentKb = (contentBytes / 1024).toFixed(2);
    const overLimit = contentBytes > MAX_BYTES;

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUnlocking(true);
        try {
            const res = await unlockPaste(shortUrl, password);
            if (res.success) {
                toast.success('Paste unlocked!');
                setData({ ...res, isProtected: false });
            } else {
                toast.error(res.error || 'Incorrect password');
            }
        } catch {
            toast.error('Unexpected error');
        } finally {
            setIsUnlocking(false);
        }
    };

    const copyContent = () => {
        if (data.content) {
            navigator.clipboard.writeText(data.content);
            toast.success('Content copied!');
        }
    };

    const downloadContent = () => {
        if (data.content) {
            const blob = new Blob([data.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pastelion-${shortUrl}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const toggleEdit = () => {
        if (!isEditing) {
            setEditContent(data.content || '');
            setEditLanguage(data.language || 'plaintext');
        }
        setIsEditing(!isEditing);
    };

    const saveChanges = async () => {
        if (!editContent.trim() || overLimit) return;
        setIsSaving(true);
        try {
            const res = await updatePaste({
                shortUrl,
                newContent: editContent,
                newLanguage: editLanguage,
                password: password || undefined
            });
            if (res.success) {
                toast.success('Changes saved securely!');
                setData({ ...data, content: editContent, language: editLanguage });
                setIsEditing(false);
            } else {
                toast.error(res.error || 'Failed to save changes');
            }
        } catch {
            toast.error('Unexpected error while saving');
        } finally {
            setIsSaving(false);
        }
    };

    const shareUrl = () => {
        if (navigator.share) {
            navigator.share({ title: 'Pastelion', url: currentUrl }).catch(() => { });
        } else {
            navigator.clipboard.writeText(currentUrl);
            toast.success('Link copied to clipboard!');
        }
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(currentUrl);
        toast.success('URL copied to clipboard!');
    };

    const refreshPaste = async () => {
        setIsRefreshing(true);
        try {
            let res;
            // If we are currently seeing content, it's either not protected OR already unlocked
            // So we can use the 'password' state to 'unlock' it again silently if it's protected
            if (initialData.isProtected) {
                res = await unlockPaste(shortUrl, password);
            } else {
                res = await getPaste(shortUrl);
            }

            if (res.success) {
                setData(res);
                toast.success('Updated from database');
            } else {
                toast.error(res.error || 'Failed to refresh');
            }
        } catch {
            toast.error('Unexpected error while refreshing');
        } finally {
            setIsRefreshing(false);
        }
    };

    /* ── Password Prompt ── */
    if (data.isProtected) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-between p-6 bg-background transition-colors duration-300">
                {/* Left spacer to balance AdSidebar on the right and center the card */}
                <div className="hidden lg:block w-72 xl:w-80 shrink-0" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-xl space-y-6"
                >
                    <div className="space-y-2 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Protected Paste</h1>
                        <p className="text-sm text-muted-foreground">This paste is encrypted. Enter the password to view it.</p>
                    </div>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 bg-background border-border text-foreground text-center text-lg placeholder:text-muted-foreground transition-all"
                            autoFocus
                        />
                        <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all" disabled={isUnlocking}>
                            {isUnlocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                            Unlock Paste
                        </Button>
                    </form>
                    <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        ← Create your own paste
                    </Link>
                </motion.div>

                <AdSidebar />
            </div>
        );
    }

    /* ── Viewer ── */
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 p-6 max-w-screen-xl mx-auto w-full transition-colors duration-300"
        >
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
                    {/* Toolbar */}
                    <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-foreground text-xs px-2 px-2 border border-border">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> New
                                </Button>
                            </Link>
                            {/* Language badge */}
                            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted border border-border px-2.5 py-1 rounded-full">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                {data.language || 'plaintext'}
                            </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={saveChanges}
                                        disabled={isSaving || overLimit}
                                        className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                                    >
                                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />} Save
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(false)}
                                        className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs border border-destructive/20"
                                    >
                                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {/* Refresh button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={refreshPaste}
                                        disabled={isRefreshing}
                                        className="h-7 text-emerald-600 dark:text-emerald-400 border-emerald-600/20 hover:bg-emerald-600/10 text-xs"
                                    >
                                        <RefreshCcw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                    {/* Edit button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setEditContent(data.content);
                                            setEditLanguage(data.language);
                                            setIsEditing(true);
                                        }}
                                        className="h-7 text-primary hover:text-primary hover:bg-primary/10 text-xs border border-primary/20"
                                    >
                                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                                    </Button>
                                    {/* Copy URL button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={copyUrl}
                                        className="h-7 text-muted-foreground hover:text-foreground hover:bg-muted text-xs border border-border"
                                    >
                                        <LinkIcon className="w-3.5 h-3.5 mr-1" /> Copy URL
                                    </Button>
                                    {/* Share button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={shareUrl}
                                        className="h-7 text-muted-foreground hover:text-foreground hover:bg-muted text-xs border border-border"
                                    >
                                        <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={copyContent}
                                        className="h-7 text-muted-foreground hover:text-foreground hover:bg-muted text-xs border border-border"
                                    >
                                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={downloadContent}
                                        className="h-7 text-muted-foreground hover:text-foreground hover:bg-muted text-xs border border-border"
                                    >
                                        <Download className="w-3.5 h-3.5 mr-1" /> RAW
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="flex-1 relative" style={{ height: '600px' }}>
                        <Editor
                            height="100%"
                            defaultLanguage="plaintext"
                            language={isEditing ? editLanguage : data.language}
                            theme={mounted ? (theme === 'dark' ? 'vs-dark' : 'light') : 'vs-dark'}
                            value={isEditing ? editContent : data.content}
                            onChange={(v) => setEditContent(v || '')}
                            options={{
                                readOnly: !isEditing,
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: 'var(--font-mono)',
                                padding: { top: 20, bottom: 20 },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                lineNumbers: 'on',
                                renderWhitespace: 'selection',
                                folding: true,
                            }}
                        />
                    </div>

                    {/* Options Row when Editing */}
                    {isEditing && (
                        <div className="px-5 py-3 border-t border-border bg-muted/20 flex gap-4">
                            {/* Left half: syntax pills */}
                            <div className="w-[70%] space-y-1.5">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Code2 className="w-3 h-3" /> Paste Syntax
                                </Label>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    {POPULAR_LANGUAGES.map(l => (
                                        <button
                                            key={l.value}
                                            onClick={() => setEditLanguage(l.value)}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${editLanguage === l.value
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                    {/* If a non-popular lang is selected, show it as active pill */}
                                    {MORE_LANGUAGES.some(l => l.value === editLanguage) && (
                                        <span className="px-3 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground shadow-sm">
                                            {MORE_LANGUAGES.find(l => l.value === editLanguage)?.label}
                                        </span>
                                    )}
                                    {/* Combobox for the rest */}
                                    <select
                                        value={MORE_LANGUAGES.some(l => l.value === editLanguage) ? editLanguage : ''}
                                        onChange={e => { if (e.target.value) setEditLanguage(e.target.value); }}
                                        className="h-7 rounded-md border border-border bg-background text-foreground text-xs px-2 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    >
                                        <option value="">More…</option>
                                        {MORE_LANGUAGES.map(l => (
                                            <option key={l.value} value={l.value}>{l.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Right half: size indicator */}
                            <div className="w-[30%] flex flex-col justify-end items-end">
                                <Label className="text-xs text-muted-foreground mb-1">Paste Size</Label>
                                <div className={`font-mono text-sm font-semibold ${overLimit ? 'text-destructive' : 'text-foreground'}`}>
                                    {contentKb} <span className="text-muted-foreground font-normal text-xs">KB / 1 MB</span>
                                </div>
                                <div className="w-full mt-2 rounded-full bg-muted h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${overLimit ? 'bg-destructive' : 'bg-primary'}`}
                                        style={{ width: `${Math.min(100, (contentBytes / (1024 * 1024)) * 100).toFixed(1)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ad Sidebar */}
                <AdSidebar />
            </div>
        </motion.div>
    );
}
