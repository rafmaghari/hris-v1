import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
    avatar_url?: string;
    avatar_thumb_url?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
    manager?: {
        id: number;
        name: string;
    } | null;
    platform_companies?: Array<{
        id: number;
        platform_id: number;
        company_id: number;
        platform: {
            id: number;
            name: string;
        };
        company: {
            id: number;
            name: string;
        };
    }>;
    platform_company_roles?: Array<{
        label: string;
        value: number;
    }>;
    access?: {
        id: number;
        platform: string;
        company: string;
        role: string;
        permissions: string[];
    } | null;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Platform {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    url: string | null;
    secret_key: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Company {
    id: number;
    name: string;
    domain: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}
