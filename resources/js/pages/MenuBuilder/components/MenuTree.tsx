import { Button } from '@/components/ui/button';
import { Permission } from '@/types';
import { GripVertical, Plus, SquarePen, Trash } from 'lucide-react';

// Define the Menu type
export interface Menu {
    id: number;
    name: string;
    slug: string;
    url: string | null;
    order: number;
    is_active: boolean;
    children?: Menu[];
    permissions?: Permission[];
}

interface MenuTreeProps {
    menus: Menu[];
    onAddSubMenu: (menu: Menu) => void;
    onEditMenu: (menu: Menu) => void;
    onDeleteMenu: (menuId: number) => void;
    isSubmitting: boolean;
}

export default function MenuTree({ menus, onAddSubMenu, onEditMenu, onDeleteMenu, isSubmitting }: MenuTreeProps) {
    const renderMenuItems = (items: Menu[], level = 0, parentId: number | null = null) => {
        return items.map((menu) => (
            <div key={menu.id}>
                <div
                    className={`mb-2 flex items-center rounded-md border p-2 ${
                        level === 0 ? 'bg-gray-50' : level === 1 ? 'ml-8 bg-gray-100' : 'ml-16 bg-gray-200'
                    }`}
                >
                    <div className="mr-2">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="flex flex-1 items-center">
                        <span className={menu.is_active ? '' : 'text-gray-400 line-through'}>{menu.name}</span>
                        {menu.url && <span className="ml-2 text-xs text-gray-500">{menu.url}</span>}
                    </div>

                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={() => onAddSubMenu(menu)} title="Add Sub Menu">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => onEditMenu(menu)}>
                            <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => onDeleteMenu(menu.id)} disabled={isSubmitting}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {menu.children && menu.children.length > 0 && <div className={`ml-4`}>{renderMenuItems(menu.children, level + 1, menu.id)}</div>}
            </div>
        ));
    };

    return (
        <div className="menu-tree space-y-2">
            {menus.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No menus found. Create your first menu item.</div>
            ) : (
                renderMenuItems(menus)
            )}
        </div>
    );
}
