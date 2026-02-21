import Link from 'next/link';
import { ShieldAlert, ShieldCheck, Lock, Eye, Key } from 'lucide-react';

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen py-20 px-6 bg-background text-foreground transition-colors">
            <div className="max-w-4xl mx-auto space-y-16">
                <header className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent">
                        How Pastelion Works
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Security shouldn't be a black box. Here is a breakdown of how we protect your information using modern cryptography.
                    </p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-bold">1. Content Encryption</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you submit a paste, we generate a unique 256-bit symmetric key. Your content is encrypted using <Link href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard" className="text-violet-600 hover:underline" target="_blank">AES-256</Link> in <Link href="https://en.wikipedia.org/wiki/Galois/Counter_Mode" className="text-violet-600 hover:underline" target="_blank">GCM mode</Link>.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Key className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold">2. Envelope Encryption</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            To keep the encryption key safe, we don't store it in plain text. Instead, we encrypt it with a Master Key stored in the server's secure environment variables before saving it to the database.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold">3. Access Control</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you set a password, we hash it using <strong>scrypt</strong>. Only users who provide the correct password can trigger the server-side decryption flow.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold">4. Zero Persistence</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            With "Burn after reading", the record is permanently deleted from our database the moment it's successfully decrypted and viewed once.
                        </p>
                    </div>
                </section>

                <footer className="text-center p-8 border border-border rounded-2xl bg-muted/30">
                    <p className="text-muted-foreground">
                        Still have questions? Check out our <Link href="/" className="font-bold text-foreground hover:underline">FAQ</Link> on the main page.
                    </p>
                </footer>
            </div>
        </main>
    );
}
