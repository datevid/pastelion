import Link from 'next/link';
import { Linkedin, User, ShieldCheck, Github, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
    return (
        <main className="min-h-[calc(100-3.5rem)] flex items-center justify-center p-6 bg-background text-foreground transition-colors">
            <div className="max-w-2xl w-full space-y-8 text-center">
                <div className="space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-violet-500/20">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">About Pastelion</h1>
                    <p className="text-xl text-muted-foreground">
                        A simple, secure, and premium way to share code and text.
                    </p>
                </div>

                <div className="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">David León Vilca</h2>
                        <p className="text-primary font-medium">Ingeniero de Sistemas • Desarrollador Web</p>
                        <p className="text-muted-foreground">
                            Implementado con mucho cariño para ofrecer una experiencia segura y hermosa al compartir código.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Button asChild className="bg-[#0077b5] hover:bg-[#006097] text-white">
                            <Link href="https://www.linkedin.com/in/datevid/" target="_blank" rel="noopener noreferrer">
                                <Linkedin className="w-4 h-4 mr-2" />
                                LinkedIn
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-border hover:bg-muted">
                            <Link href="https://github.com/datevid" target="_blank" rel="noopener noreferrer">
                                <Github className="w-4 h-4 mr-2" />
                                GitHub
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-border hover:bg-muted">
                            <Link href="/">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Paste
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Consulting Section */}
                <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5 shadow-sm space-y-6 text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Asesoría y Soporte</h2>
                    </div>

                    <div className="space-y-4 text-sm leading-relaxed">
                        <p>
                            Si necesitas ayuda para instalar este proyecto, revisar tus propios desarrollos web, móviles o backend, o simplemente quieres escribir código juntos, estoy disponible para **asesorías por horas**.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-card p-4 rounded-xl border border-border">
                                <p className="font-bold text-lg text-primary">$45 USD <span className="text-xs text-muted-foreground font-normal">/ hora</span></p>
                                <p className="text-muted-foreground text-xs mt-1">Pago vía Crypto (Binance/USDT)</p>
                            </div>
                            <div className="bg-card p-4 rounded-xl border border-border">
                                <p className="font-bold">Sesión Grabada</p>
                                <p className="text-muted-foreground text-xs mt-1">Asistencia técnica y revisión de código en vivo.</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground">
                            Para agendar una sesión o consultar disponibilidad, puedes contactarme directamente por LinkedIn.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Hire me / Contrátame
                </p>
            </div>
        </main>
    );
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
