export default function AdSidebar() {
    return (
        <aside className="hidden lg:flex w-72 xl:w-80 flex-col border-l border-border bg-background overflow-y-auto transition-colors duration-300">
            <div className="p-4 space-y-4 flex-1">
                {/* Placeholder Ad Card 1 */}
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="bg-muted/50 px-3 py-2 flex items-center justify-between border-b border-border">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Advertisement</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3 items-center text-center min-h-[200px] justify-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="text-white text-lg">📣</span>
                        </div>
                        <div>
                            <p className="text-foreground font-semibold text-sm">Your Ad Here</p>
                            <p className="text-muted-foreground text-xs mt-1">Reach thousands of developers daily</p>
                        </div>
                        <div className="w-full mt-2 h-px bg-border" />
                        <a
                            href="https://www.linkedin.com/in/datevid/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline underline-offset-4 font-medium"
                        >
                            Contáctame para anunciar →
                        </a>
                    </div>
                </div>

                {/* Ad Card 2 — Exchange */}
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="bg-muted/50 px-3 py-2 flex items-center justify-between border-b border-border">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Intercambio</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3 items-center text-center min-h-[200px] justify-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="text-white text-lg">🤝</span>
                        </div>
                        <div>
                            <p className="text-foreground font-semibold text-sm">¿Intercambiamos Anuncios?</p>
                            <p className="text-muted-foreground text-xs mt-1">Acepto intercambio de sitios para crecer juntos.</p>
                        </div>
                        <div className="w-full mt-2 h-px bg-border" />
                        <a
                            href="https://www.linkedin.com/in/datevid/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4 font-medium"
                        >
                            Contáctame en LinkedIn →
                        </a>
                    </div>
                </div>

                {/* Info box */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
                    <p className="text-xs text-primary font-bold">🔒 Military-grade encryption</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Your pastes are protected with AES-256-GCM. Even we can't read your content.
                    </p>
                </div>
            </div>
        </aside>
    );
}
