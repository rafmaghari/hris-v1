<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\Group;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Enums\Status;

class AttendanceController extends Controller
{
    public function create()
    {
        $groups = Group::query()
            ->select('id as value', 'name as label')
            ->where('status', Status::ACTIVE->value)
            ->get();

        $events = Event::query()
            ->select('id as value', 'name as label')
            ->where('status', Status::ACTIVE->value)
            ->where('event_date', '>=', now())
            ->get();

        return Inertia::render('Attendances/Create', [
            'groups' => $groups,
            'events' => $events,
        ]);
    }

    public function getMembers(Request $request)
    {
        $groupId = $request->input('group_id');
        
        $members = Member::where('group_id', $groupId)
            ->select('id', 'first_name', 'last_name')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->first_name . ' ' . $member->last_name,
                    'isPresent' => false
                ];
            });

        return response()->json($members);
    }

    public function store(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'event_id' => 'required|exists:events,id',
            'members' => 'required|array',
            'members.*.id' => 'required|exists:members,id',
            'members.*.isPresent' => 'required|boolean',
            'notes' => 'nullable|string'
        ], [
            'group_id.required' => 'Group is required',
            'group_id.exists' => 'Group not found',
            'event_id.required' => 'Event is required',
            'event_id.exists' => 'Event not found',
            'members.required' => 'Members are required',
        ]);

        try {
            DB::beginTransaction();

            // Create attendance record
            $attendance = Attendance::create([
                'group_id' => $request->group_id,
                'event_id' => $request->event_id,
                'notes' => $request->notes
            ]);

            // Create individual attendance records
            foreach ($request->members as $member) {
                $attendance->records()->create([
                    'member_id' => $member['id'],
                    'status' => $member['isPresent'] ? 1 : 2, // 1: Present, 2: Absent
                ]);
            }

            DB::commit();

            return redirect()->route('attendances.index')
                ->with('success', 'Attendance recorded successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to record attendance. Please try again.');
        }
    }

    public function index()
    {
        $attendances = Attendance::with(['group', 'event'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Attendances/Index', [
            'attendances' => $attendances
        ]);
    }

    public function show(Attendance $attendance)
    {
        $attendance->load(['group', 'event', 'records.member']);
        
        return Inertia::render('Attendances/Show', [
            'attendance' => $attendance
        ]);
    }

    public function updateRecord(Request $request, $recordId)
    {
        $request->validate([
            'status' => 'required|in:1,2',
        ]);

        $record = \App\Models\AttendanceRecord::findOrFail($recordId);
        $record->update([
            'status' => $request->status,
        ]);

        return response()->json(['success' => true]);
    }
}
