import ApplicationLogo from '@/components/applicationLogo';
import { Button } from '@/components/ui/button';
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

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
                    <div className="mx-auto max-w-4xl">
                        <ApplicationLogo variant="dark" className="mx-auto mb-8 h-32 w-auto" />

                        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
                            Welcome to <span className="text-blue-600">CARAVEA</span>
                        </h1>

                        <p className="mb-8 text-xl leading-8 text-gray-600 sm:text-2xl">
                            Modern Human Resource Information System designed to streamline your HR operations.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button asChild size="lg" className="px-8 py-6 text-lg">
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                                <Link href="/register">Register</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
