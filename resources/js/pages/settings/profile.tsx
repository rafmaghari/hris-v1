import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    first_name: string;
    last_name: string;
    email: string;
};

type AvatarForm = {
    avatar: File | null;
};

// Create a separate avatar upload form that doesn't rely on Inertia's useForm
const AvatarUploadForm = ({
    avatarThumbUrl,
    user,
}: {
    avatarThumbUrl: string;
    user: {
        first_name: string;
        last_name: string;
    };
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Calculate the name from first_name and last_name
    const userName = `${user.first_name} ${user.last_name}`.trim();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setError(null); // Clear previous errors
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            // Use Inertia's router instead of fetch for proper CSRF handling
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            router.post(route('profile.update.avatar'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    // Successful upload
                    if (avatarInputRef.current) {
                        avatarInputRef.current.value = '';
                    }
                    setSelectedFile(null);
                },
                onError: (errors) => {
                    console.error('Avatar upload error:', errors);
                    if (errors.avatar) {
                        setError(errors.avatar);
                    } else {
                        setError('An error occurred while uploading the avatar.');
                    }
                },
                onFinish: () => {
                    setUploading(false);
                },
            });
        } catch (error) {
            console.error('Avatar upload error:', error);
            setError('An unexpected error occurred.');
            setUploading(false);
        }
    };

    const selectNewFile = () => {
        avatarInputRef.current?.click();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24">
                        <AvatarImage className="object-cover" src={avatarThumbUrl} alt={`${userName}'s avatar`} />
                        <AvatarFallback>{`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}</AvatarFallback>
                    </Avatar>
                </div>

                <div className="mt-4 sm:mt-0">
                    <Button type="button" variant="outline" onClick={selectNewFile} className="mr-4">
                        Choose image
                    </Button>

                    <input type="file" ref={avatarInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

                    {selectedFile && <span className="text-sm text-neutral-600">Selected: {selectedFile.name}</span>}
                </div>
            </div>

            {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="flex items-center gap-4">
                <Button type="submit" disabled={uploading || !selectedFile}>
                    {uploading ? 'Uploading...' : 'Save Avatar'}
                </Button>
            </div>
        </form>
    );
};

export default function Profile({
    mustVerifyEmail,
    status,
    avatarUrl,
    avatarThumbUrl,
    message,
    error,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    avatarUrl: string;
    avatarThumbUrl: string;
    message?: string;
    error?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile form
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        first_name: auth.user.first_name,
        last_name: auth.user.last_name,
        email: auth.user.email,
    });

    // Avatar form
    const {
        data: avatarData,
        setData: setAvatarData,
        patch: patchAvatar,
        errors: avatarErrors,
        processing: avatarProcessing,
        recentlySuccessful: avatarRecentlySuccessful,
        progress: avatarProgress,
    } = useForm<Required<AvatarForm>>({
        avatar: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const submitAvatar: FormEventHandler = (e) => {
        e.preventDefault();

        if (!avatarData.avatar) {
            return;
        }

        patchAvatar(route('profile.update.avatar'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                // Clear the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setAvatarData('avatar', null);
            },
            onError: (errors) => {
                console.error('Avatar upload error:', errors);
            },
        });
    };

    const selectNewAvatar = () => {
        fileInputRef.current?.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Avatar Section */}
                    <div className="space-y-6">
                        <HeadingSmall title="Profile Picture" description="Update your profile picture" />

                        {message && <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">{message}</div>}

                        {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

                        <AvatarUploadForm avatarThumbUrl={avatarThumbUrl} user={auth.user} />
                    </div>

                    {/* Profile Information Section */}
                    <div className="space-y-6">
                        <HeadingSmall title="Profile information" description="Update your name and email address" />

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First name</Label>

                                <Input
                                    id="first_name"
                                    className="mt-1 block w-full"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    required
                                    autoComplete="given-name"
                                    placeholder="First name"
                                />

                                <InputError className="mt-2" message={errors.first_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last name</Label>

                                <Input
                                    id="last_name"
                                    className="mt-1 block w-full"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    required
                                    autoComplete="family-name"
                                    placeholder="Last name"
                                />

                                <InputError className="mt-2" message={errors.last_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="text-muted-foreground -mt-4 text-sm">
                                        Your email address is unverified.{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            Click here to resend the verification email.
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has been sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save Profile</Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">Saved</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
