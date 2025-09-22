const ApplicationLogo = ({ className, variant = 'light' }: { className?: string; variant?: 'light' | 'dark' }) => {
    const logoPath = variant === 'light' ? '/icons/caravea-logo.png' : '/icons/caravea-logo.png';
    return <img src={logoPath} alt="App Logo" className={className} />;
};

export default ApplicationLogo;
