import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Company {
    label: string;
    platform_id: number;
    company_id: number;
    value: string;
    company_name: string;
    domain: string;
    type: string;
    roles: string[];
}

interface UserAccess {
    current_selected_access: {
        id: string;
        platform_id: number;
        company_id: number;
        roles: string[];
        permissions: string[];
    };
}

export function PlatformCompanyDropdown() {
    const { auth } = usePage<SharedData>().props;
    const platformCompanyRoles: Company[] = Array.isArray(auth.user?.companies) ? auth.user?.companies : [];
    const userAccess = auth.user?.access as UserAccess | undefined;

    // Find the exact matching company object based on platform_id and company_id
    const matchingCompany = userAccess
        ? platformCompanyRoles.find(
              (company) =>
                  company.platform_id === userAccess.current_selected_access.platform_id &&
                  company.company_id === userAccess.current_selected_access.company_id,
          )
        : undefined;

    // Use the exact value from the matching company if found
    const initialValue = matchingCompany?.value;

    // State to track the selected value
    const [selectedValue, setSelectedValue] = useState<string | undefined>(initialValue);

    const handleSelectionChange = (value: string) => {
        setSelectedValue(value);

        // Call the roles.select route with the combined platform-company value
        router.post(route('roles.select', value));
    };

    const clearSelection = () => {
        setSelectedValue(undefined);
        router.post(route('roles.clear'));
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform & Company</SidebarGroupLabel>
            <SidebarGroupContent>
                <Select value={selectedValue} onValueChange={handleSelectionChange} disabled={!platformCompanyRoles.length}>
                    <SelectTrigger className="line-clamp-1 w-full overflow-hidden text-ellipsis">
                        <SelectValue placeholder="Select a platform & company" />
                    </SelectTrigger>
                    <SelectContent>
                        {platformCompanyRoles.length > 0 ? (
                            platformCompanyRoles.map((company) => (
                                <SelectItem key={company.value} value={company.value}>
                                    {company.label}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="no-options" disabled>
                                No options available
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
                {!platformCompanyRoles.length && (
                    <div className="text-muted-foreground mt-2 px-3 py-2 text-sm">No access available. Please contact an administrator.</div>
                )}
                {selectedValue && platformCompanyRoles.length > 0 && (
                    <button onClick={clearSelection} className="mt-2 text-xs text-gray-500 hover:text-gray-700">
                        Clear selection
                    </button>
                )}
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
