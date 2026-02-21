import { getPaste } from '@/app/actions/paste';
import PasteClientWrapper from '@/components/PasteClientWrapper';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function PastePage({ params }: { params: Promise<{ shortUrl: string }> }) {
    const { shortUrl } = await params;

    const result = await getPaste(shortUrl);

    if (!result.success) {
        return (
            <div className="flex-1 w-full flex items-center justify-center p-6 text-center">
                <div className="space-y-6 max-w-md">
                    <ShieldAlert className="w-16 h-16 mx-auto text-red-500" />
                    <h1 className="text-3xl font-bold text-slate-100">Paste Not Found</h1>
                    <p className="text-slate-400">The paste may have expired, burned after reading, or does not exist.</p>
                    <Link href="/" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300">
                        Create a new paste
                    </Link>
                </div>
            </div>
        );
    }

    return <PasteClientWrapper initialData={result} shortUrl={shortUrl} />;
}
