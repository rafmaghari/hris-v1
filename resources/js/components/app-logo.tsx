import AppLogoIconSm from './app-logo-icon-sm';

export default function AppLogo() {
    const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

    return (
        <>
            <div className="text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-md">
                <AppLogoIconSm className="size-8 w-auto" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{appName}</span>
            </div>
        </>
    );
}
