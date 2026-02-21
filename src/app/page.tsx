"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Lock, LockOpen, ShieldCheck, Loader2, Clock, Code2 } from 'lucide-react';
import { createPaste } from '@/app/actions/paste';
import { toast } from 'sonner';
import AdSidebar from '@/components/AdSidebar';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Shown as quick-pick pills
const POPULAR_LANGUAGES = [
  { value: 'plaintext', label: 'Plaintext' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'json', label: 'JSON' },
];

// Available in the "More..." combobox
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

const EXPIRATIONS = [
  { label: 'Never', value: 'never' },
  { label: '1h', value: '1h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

const MAX_BYTES = 1 * 1024 * 1024; // 1 MB

export default function HomePage() {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [password, setPassword] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(true); // ON by default
  const [expiration, setExpiration] = useState('never');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [burnAfterReading] = useState(false);

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const router = useRouter();

  // Load forked content if any
  useEffect(() => {
    const forked = sessionStorage.getItem('pastelion_fork');
    if (forked) {
      try {
        const { content: forkedContent, language: forkedLang } = JSON.parse(forked);
        if (forkedContent) setContent(forkedContent);
        if (forkedLang) setLanguage(forkedLang);
      } catch (e) {
        console.error('Failed to parse fork data', e);
      }
      sessionStorage.removeItem('securepaste_fork');
    }
  }, []);

  const contentBytes = new TextEncoder().encode(content).length;
  const contentKb = (contentBytes / 1024).toFixed(2);
  const overLimit = contentBytes > MAX_BYTES;

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }
    if (overLimit) {
      toast.error('Content exceeds 1 MB limit');
      return;
    }
    if (passwordEnabled && !password.trim()) {
      toast.error('Enter a password or disable password protection');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createPaste({
        content,
        language,
        password: passwordEnabled && password ? password : undefined,
        burnAfterReading,
      });
      if (result.success && result.shortUrl) {
        toast.success('Paste created!');
        router.push(`/${result.shortUrl}`);
      } else {
        toast.error(result.error || 'Failed to create paste');
      }
    } catch {
      toast.error('Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Main Editor ── */
  return (
    <div className="flex flex-col gap-12 p-6 max-w-screen-xl mx-auto w-full transition-colors">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Card */}
        <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-3.5 border-b border-border flex items-center bg-muted/20">
            <h1 className="text-sm font-semibold text-foreground">
              Pastelion — <span className="text-muted-foreground font-normal">New Paste</span>
            </h1>
          </div>

          {/* Monaco Editor */}
          <div className="border-b border-border" style={{ height: '380px' }}>
            <Editor
              height="100%"
              defaultLanguage="plaintext"
              language={language}
              theme={mounted ? (theme === 'dark' ? 'vs-dark' : 'light') : 'vs-dark'}
              value={content}
              onChange={(v) => setContent(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'var(--font-mono)',
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbersMinChars: 3,
                renderLineHighlight: 'gutter',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
              }}
            />
          </div>

          {/* Options Row 1 — Syntax */}
          <div className="px-5 py-3 border-b border-border flex gap-4 bg-muted/10">
            {/* Left half: syntax pills */}
            <div className="w-[70%] space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Code2 className="w-3 h-3" /> Paste Syntax
              </Label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {POPULAR_LANGUAGES.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLanguage(l.value)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${language === l.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                  >
                    {l.label}
                  </button>
                ))}
                {/* If a non-popular lang is selected, show it as active pill */}
                {MORE_LANGUAGES.some(l => l.value === language) && (
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground shadow-sm">
                    {MORE_LANGUAGES.find(l => l.value === language)?.label}
                  </span>
                )}
                {/* Combobox for the rest */}
                <select
                  value={MORE_LANGUAGES.some(l => l.value === language) ? language : ''}
                  onChange={e => { if (e.target.value) setLanguage(e.target.value); }}
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

          {/* Options Row 2 — Expiration */}
          <div className="px-5 py-3 border-b border-border space-y-1 bg-muted/5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Expiration
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {EXPIRATIONS.map(e => (
                <button
                  key={e.value}
                  onClick={() => setExpiration(e.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${expiration === e.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options Row 3 — Password */}
          <div className="px-5 py-3 border-b border-border space-y-2 bg-muted/10">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                {passwordEnabled ? <Lock className="w-3 h-3 text-primary" /> : <LockOpen className="w-3 h-3" />}
                Password Protection
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{passwordEnabled ? 'On' : 'Off'}</span>
                <Switch
                  checked={passwordEnabled}
                  onCheckedChange={(v) => {
                    setPasswordEnabled(v);
                    if (!v) setPassword('');
                  }}
                />
              </div>
            </div>
            {passwordEnabled && (
              <Input
                type="password"
                placeholder="Enter a password for this paste…"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-8 text-sm"
              />
            )}
          </div>

          {/* Submit */}
          <div className="px-5 py-4 bg-muted/20">
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 disabled:opacity-40"
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || overLimit}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Create Secure Paste
            </Button>
          </div>
        </div>

        {/* Ad Sidebar */}
        <AdSidebar />
      </div>

      {/* FAQ Section */}
      <div className="w-full bg-muted/20 border-t border-border py-20 px-6 transition-colors">
        <div className="max-w-screen-xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight italic">Frequently Asked <span className="text-primary italic">Questions</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto italic">
              Everything you need to know about our secure sharing platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card shadow-sm italic transition-colors">
              <h3 className="font-bold text-lg italic">Is it really secure?</h3>
              <p className="text-muted-foreground leading-relaxed italic">
                Yes. We use industry-standard AES-256-GCM encryption. Your content is encrypted before storage, and the keys are managed using envelope encryption. Only the physical holder of the password (if set) can unlock the content.
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card shadow-sm italic transition-colors">
              <h3 className="font-bold text-lg">Who can see my pastes?</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you set a password, only people who know that password can view the content. Not even our database administrators can read your raw data, as it is stored in an encrypted format.
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card shadow-sm italic transition-colors">
              <h3 className="font-bold text-lg">How long do pastes last?</h3>
              <p className="text-muted-foreground leading-relaxed">
                By default, pastes expire after 30 days and are automatically deleted. You can also choose shorter periods or use "Burn after reading" to delete them immediately after the first view.
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card shadow-sm italic transition-colors">
              <h3 className="font-bold text-lg">Can I edit a paste?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes! As long as you have the password (if the paste is protected), you can enter edit mode and save changes directly to the same URL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
