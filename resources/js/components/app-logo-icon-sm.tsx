import { SVGProps } from 'react';

export default function AppLogoIconSm(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* Simplified Hexagonal Hive Background */}
            <path d="M50 5L87.5 27.5V72.5L50 95L12.5 72.5V27.5L50 5Z" fill="#FFCC00" stroke="#000000" strokeWidth="2" />

            {/* Inner Hexagon */}
            <path d="M50 20L75 35V65L50 80L25 65V35L50 20Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />

            {/* Letters KH - Simplified */}
            <path d="M35 35V65M35 50L45 35M35 50L45 65" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M55 35V65M70 35V65M55 50H70" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
