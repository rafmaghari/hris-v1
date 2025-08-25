import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Member {
    id: number;
    name: string;
    isPresent: boolean;
}

interface SelectOption {
    value: string;
    label: string;
}

interface AttendanceFormProps {
    data: {
        group_id: string;
        event_id: string;
        members: Array<{
            id: number;
            isPresent: boolean;
        }>;
        notes: string;
    };
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    groups: SelectOption[];
    events: SelectOption[];
}

export default function AttendanceForm({ data, setData, errors, processing, onSubmit, groups, events }: AttendanceFormProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    const handleGroupChange = async (value: string) => {
        setData('group_id', value);
        if (value) {
            try {
                const response = await axios.get<Member[]>(route('attendances.members', { group_id: value }));
                setMembers(response.data);
                setData(
                    'members',
                    response.data.map((m) => ({ id: m.id, isPresent: false })),
                );
            } catch (error) {
                console.error('Failed to fetch members:', error);
            }
        } else {
            setMembers([]);
            setData('members', []);
        }
    };

    const handleMemberToggle = (memberId: number) => {
        const updatedMembers = members.map((member) => (member.id === memberId ? { ...member, isPresent: !member.isPresent } : member));
        setMembers(updatedMembers);
        setData(
            'members',
            updatedMembers.map((m) => ({ id: m.id, isPresent: m.isPresent })),
        );
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        const updatedMembers = members.map((member) => ({
            ...member,
            isPresent: newSelectAll,
        }));
        setMembers(updatedMembers);
        setData(
            'members',
            updatedMembers.map((m) => ({ id: m.id, isPresent: m.isPresent })),
        );
    };

    return (
        <form onSubmit={onSubmit}>
            <Card className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Group</label>
                        <Select value={data.group_id ? String(data.group_id) : ''} onValueChange={handleGroupChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((group) => (
                                    <SelectItem key={group.value} value={String(group.value)}>
                                        {group.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.group_id && <p className="text-sm text-red-500">{errors.group_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Event</label>
                        <Select value={data.event_id ? String(data.event_id) : ''} onValueChange={(value) => setData('event_id', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events.map((event) => (
                                    <SelectItem key={event.value} value={String(event.value)}>
                                        {event.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.event_id && <p className="text-sm text-red-500">{errors.event_id}</p>}
                    </div>
                </div>

                {members.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAll} />
                            <label htmlFor="select-all" className="text-sm font-medium">
                                Select All (Selected Members will be marked as Present)
                            </label>
                        </div>

                        <div className="space-y-2">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`member-${member.id}`}
                                        checked={member.isPresent}
                                        onCheckedChange={() => handleMemberToggle(member.id)}
                                    />
                                    <label htmlFor={`member-${member.id}`} className="text-sm font-medium">
                                        {member.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        Record Attendance
                    </Button>
                </div>
            </Card>
        </form>
    );
}
