const ApplicationLogo = ({ className, variant = 'light' }: { className?: string; variant?: 'light' | 'dark' }) => {
    const logoPath = variant === 'light' ? '/icons/hpci-logo-white.png' : '/icons/hpci-logo.png';
    return <img src={logoPath} alt="App Logo" className={className} />;
};

export default ApplicationLogo;
