<?php
namespace App\Http\Controllers;

use App\Enums\LeaveRequestStatus;
use App\Models\LeaveAccrualLog;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\UserLeaveSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestController extends Controller
{
    public function index(): Response
    {
        $leaveRequests = LeaveRequest::with(['user', 'approver', 'userLeaveSetting.leaveSettingsTemplate.leaveType'])
            ->when(request()->input('filter.search'), function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhereHas('userLeaveSetting.leaveSettingsTemplate.leaveType', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('LeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
            'filters'       => ['filter' => request()->get('filter') ?? ''],
        ]);
    }

    public function create(): Response
    {
        $userLeaveSettings = UserLeaveSetting::with(['leaveSettingsTemplate.leaveType'])
            ->where('user_id', Auth::id())
            ->get();

        return Inertia::render('LeaveRequests/Create', [
            'userLeaveSettings' => $userLeaveSettings,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_leave_setting_id' => 'required|exists:user_leave_settings,id',
            'start_date'            => 'required|date|after_or_equal:today',
            'end_date'              => 'required|date|after_or_equal:start_date',
            'days_requested'        => 'required|numeric|min:0.5',
            'reason'                => 'required|string|max:500',
        ]);

        // Verify the user leave setting belongs to the authenticated user
        $userLeaveSetting = UserLeaveSetting::where('id', $validated['user_leave_setting_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Check if user has sufficient balance
        if ($userLeaveSetting->current_balance < $validated['days_requested']) {
            return back()->withErrors([
                'days_requested' => 'Insufficient leave balance. Current balance: ' . $userLeaveSetting->current_balance . ' days',
            ])->withInput();
        }

        $user                  = User::find(Auth::id());
        $leaveRequest          = new LeaveRequest($validated);
        $leaveRequest->user_id = $user->id;
        $leaveRequest->status  = LeaveRequestStatus::PENDING;
        $leaveRequest->save();

        return redirect()->route('leave-requests.index')
            ->with('success', 'Leave request created successfully.');
    }

    public function show(LeaveRequest $leaveRequest): Response
    {
        $leaveRequest->load(['user', 'approver', 'userLeaveSetting.leaveSettingsTemplate.leaveType']);

        return Inertia::render('LeaveRequests/Show', [
            'leaveRequest' => $leaveRequest,
        ]);
    }

    public function edit(LeaveRequest $leaveRequest): Response
    {
        abort_if(! $leaveRequest->isPending(), 403, 'Cannot edit non-pending requests');
        abort_if($leaveRequest->user_id !== Auth::id(), 403, 'Unauthorized');

        $userLeaveSettings = UserLeaveSetting::with(['leaveSettingsTemplate.leaveType'])
            ->where('user_id', Auth::id())
            ->get();

        return Inertia::render('LeaveRequests/Edit', [
            'leaveRequest'      => $leaveRequest,
            'userLeaveSettings' => $userLeaveSettings,
        ]);
    }

    public function update(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        abort_if(! $leaveRequest->isPending(), 403, 'Cannot update non-pending requests');
        abort_if($leaveRequest->user_id !== Auth::id(), 403, 'Unauthorized');

        $validated = $request->validate([
            'user_leave_setting_id' => 'required|exists:user_leave_settings,id',
            'start_date'            => 'required|date|after_or_equal:today',
            'end_date'              => 'required|date|after_or_equal:start_date',
            'days_requested'        => 'required|numeric|min:0.5',
            'reason'                => 'required|string|max:500',
        ]);

        // Verify the user leave setting belongs to the authenticated user
        $userLeaveSetting = UserLeaveSetting::where('id', $validated['user_leave_setting_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Check if user has sufficient balance
        if ($userLeaveSetting->current_balance < $validated['days_requested']) {
            return back()->withErrors([
                'days_requested' => 'Insufficient leave balance. Current balance: ' . $userLeaveSetting->current_balance . ' days',
            ])->withInput();
        }

        $leaveRequest->update($validated);

        return redirect()->route('leave-requests.index')
            ->with('success', 'Leave request updated successfully.');
    }

    public function destroy(LeaveRequest $leaveRequest): RedirectResponse
    {
        abort_if(! $leaveRequest->isPending(), 403, 'Cannot delete non-pending requests');
        abort_if($leaveRequest->user_id !== Auth::id(), 403, 'Unauthorized');

        $leaveRequest->delete();

        return redirect()->route('leave-requests.index')
            ->with('success', 'Leave request deleted successfully.');
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        abort_if(! $leaveRequest->isPending(), 403, 'Cannot approve non-pending requests');

        $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $leaveRequest) {
            // Deduct leave balance
            $userLeaveSetting = $leaveRequest->userLeaveSetting;
            $newBalance       = $userLeaveSetting->current_balance - $leaveRequest->days_requested;
            $userLeaveSetting->update(['current_balance' => $newBalance]);

            // Create deduction log
            LeaveAccrualLog::create([
                'user_leave_setting_id' => $userLeaveSetting->id,
                'user_id'               => $leaveRequest->user_id,
                'type'                  => LeaveAccrualLog::TYPE_DEDUCTION,
                'amount'                => -$leaveRequest->days_requested,
                'balance_before'        => $userLeaveSetting->current_balance + $leaveRequest->days_requested,
                'balance_after'         => $newBalance,
                'description'           => 'Leave request approved',
                'metadata'              => [
                    'leave_request_id' => $leaveRequest->id,
                    'start_date'       => $leaveRequest->start_date->toDateString(),
                    'end_date'         => $leaveRequest->end_date->toDateString(),
                    'reason'           => $leaveRequest->reason,
                ],
                'accrual_date'          => now(),
                'processed_at'          => now(),
            ]);

            // Update leave request
            $leaveRequest->update([
                'status'      => LeaveRequestStatus::APPROVED,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'remarks'     => $request->remarks,
            ]);
        });

        return redirect()->route('leave-requests.index')
            ->with('success', 'Leave request approved successfully.');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        abort_if(! $leaveRequest->isPending(), 403, 'Cannot reject non-pending requests');

        $request->validate([
            'remarks' => 'required|string|max:500',
        ]);

        $leaveRequest->update([
            'status'      => LeaveRequestStatus::REJECTED,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'remarks'     => $request->remarks,
        ]);

        return redirect()->route('leave-requests.index')
            ->with('success', 'Leave request rejected successfully.');
    }

    public function cancel(LeaveRequest $leaveRequest): RedirectResponse
    {
        abort_if(! $leaveRequest->isPending(), 403, 'Cannot cancel non-pending requests');
        abort_if($leaveRequest->user_id !== Auth::id(), 403, 'Unauthorized');

        $leaveRequest->update([
            'status' => LeaveRequestStatus::CANCELLED,
        ]);

        return redirect()->route('leave-requests.index')
            ->with('success', 'Leave request cancelled successfully.');
    }

    public function myRequests(): Response
    {
        $leaveRequests = LeaveRequest::with(['approver', 'userLeaveSetting.leaveSettingsTemplate.leaveType'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('LeaveRequests/MyRequests', [
            'leaveRequests' => $leaveRequests,
        ]);
    }

    public function pendingApprovals(): Response
    {
        // Get users where the current user is their manager
        $subordinateIds = User::where('manager_id', auth()->id())->pluck('id');

        $leaveRequests = LeaveRequest::with(['user', 'userLeaveSetting.leaveSettingsTemplate.leaveType'])
            ->whereIn('user_id', $subordinateIds)
            ->where('status', LeaveRequestStatus::PENDING)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('LeaveRequests/PendingApprovals', [
            'leaveRequests' => $leaveRequests,
        ]);
    }
}
