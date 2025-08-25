<?php

namespace App\Http\Controllers;

use App\Models\OvertimeRequest;
use App\Enums\OvertimeStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
class OvertimeRequestController extends Controller
{
    public function index(): Response
    {
        $overtimeRequests = OvertimeRequest::with(['user', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('OvertimeRequests/Index', [
            'overtimeRequests' => $overtimeRequests,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('OvertimeRequests/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'reason' => 'required|string|max:255',
            'total_hours' => 'required|numeric|min:0.5|max:24',
        ]);

        $user = User::find(Auth::id());
        $overtimeRequest = new OvertimeRequest($validated);
        $overtimeRequest->user_id = $user->id;
        $overtimeRequest->status = OvertimeStatus::PENDING;
        $overtimeRequest->approver_id = $user->manager_id;
        $overtimeRequest->save();

        return redirect()->route('overtime-requests.index')
            ->with('success', 'Overtime request created successfully.');
    }

    public function show(OvertimeRequest $overtimeRequest): Response
    {
        $overtimeRequest->load(['user', 'approver']);
        
        return Inertia::render('OvertimeRequests/Show', [
            'overtimeRequest' => $overtimeRequest,
        ]);
    }

    public function edit(OvertimeRequest $overtimeRequest): Response
    {
        abort_if(!$overtimeRequest->isPending(), 403, 'Cannot edit non-pending requests');
        abort_if($overtimeRequest->user_id !== Auth::id(), 403, 'Unauthorized');

        return Inertia::render('OvertimeRequests/Edit', [
            'overtimeRequest' => $overtimeRequest,
        ]);
    }

    public function update(Request $request, OvertimeRequest $overtimeRequest)
    {
        abort_if(!$overtimeRequest->isPending(), 403, 'Cannot update non-pending requests');
        abort_if($overtimeRequest->user_id !== Auth::id(), 403, 'Unauthorized');

        $validated = $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'reason' => 'required|string|max:255',
            'total_hours' => 'required|numeric|min:0.5|max:24',
        ]);

        $overtimeRequest->update($validated);

        return redirect()->route('overtime-requests.index')
            ->with('success', 'Overtime request updated successfully.');
    }

    public function destroy(OvertimeRequest $overtimeRequest)
    {
        abort_if(!$overtimeRequest->isPending(), 403, 'Cannot delete non-pending requests');
        abort_if($overtimeRequest->user_id !== Auth::id(), 403, 'Unauthorized');

        $overtimeRequest->delete();

        return redirect()->route('overtime-requests.index')
            ->with('success', 'Overtime request deleted successfully.');
    }

    public function approve(Request $request, OvertimeRequest $overtimeRequest)
    {
        abort_if(!$overtimeRequest->isPending(), 403, 'Cannot approve non-pending requests');
        
        $request->validate([
            'approver_note' => 'nullable|string|max:255',
        ]);

        $overtimeRequest->update([
            'status' => OvertimeStatus::APPROVED,
            'approver_id' => Auth::id(),
            'approved_at' => now(),
            'approver_note' => $request->approver_note,
        ]);

        return redirect()->route('overtime-requests.index')
            ->with('success', 'Overtime request approved successfully.');
    }

    public function reject(Request $request, OvertimeRequest $overtimeRequest)
    {
        abort_if(!$overtimeRequest->isPending(), 403, 'Cannot reject non-pending requests');

        $request->validate([
            'approver_note' => 'required|string|max:255',
        ]);

        $overtimeRequest->update([
            'status' => OvertimeStatus::REJECTED,
            'approver_id' => Auth::id(),
            'approved_at' => now(),
            'approver_note' => $request->approver_note,
        ]);

        return redirect()->route('overtime-requests.index')
            ->with('success', 'Overtime request rejected successfully.');
    }

    public function cancel(OvertimeRequest $overtimeRequest)
    {
        abort_if(!$overtimeRequest->isPending(), 403, 'Cannot cancel non-pending requests');
        abort_if($overtimeRequest->user_id !== Auth::id(), 403, 'Unauthorized');

        $overtimeRequest->update([
            'status' => OvertimeStatus::CANCELLED,
        ]);

        return redirect()->route('overtime-requests.index')
            ->with('success', 'Overtime request cancelled successfully.');
    }

    public function myRequests(): Response
    {
        $overtimeRequests = OvertimeRequest::with(['approver'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('OvertimeRequests/MyOvertimeRequests', [
            'overtimeRequests' => $overtimeRequests,
        ]);
    }

    public function pendingApprovals(): Response
    {
        // Get users where the current user is their manager
        $subordinateIds = User::where('manager_id', auth()->id())->pluck('id');

        $overtimeRequests = OvertimeRequest::with(['user'])
            ->whereIn('user_id', $subordinateIds)
            ->where('status', OvertimeStatus::PENDING)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('OvertimeRequests/PendingApprovals', [
            'overtimeRequests' => $overtimeRequests,
        ]);
    }
}
