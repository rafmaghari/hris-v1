import ApplicationLogo from '@/components/applicationLogo';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface PageProps extends SharedData {
    app: {
        name: string;
    };
}

export default function Welcome() {
    const { app } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#f5f5f5] text-black">
                <ApplicationLogo variant="dark" className="h-40 w-auto" />
                <h1 className="text-4xl font-bold tracking-tight">Welcome to HPCINC</h1>
                <div className="flex gap-4">
                    <Link
                        href="/login"
                        className="rounded-md border border-black bg-transparent px-6 py-2.5 text-black transition-all hover:bg-black hover:text-[#f5f5f5]"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-md border border-black bg-black px-6 py-2.5 text-[#f5f5f5] transition-all hover:bg-transparent hover:text-black"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </>
    );
}
