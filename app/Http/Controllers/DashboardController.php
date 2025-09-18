<?php
namespace App\Http\Controllers;

use App\Enums\LeaveRequestStatus;
use App\Enums\OvertimeStatus;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $currentUser  = Auth::user();
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth();
        $endOfMonth   = $currentMonth->copy()->endOfMonth();

        // Determine user IDs to filter by based on role
        $userIds = $this->getUserIdsBasedOnRole($currentUser);

        // Get leave requests for current month
        $leaveRequestsQuery = LeaveRequest::with([
            'user:id,first_name,last_name,email',
            'userLeaveSetting.leaveSettingsTemplate.leaveType:id,name',
            'approver:id,first_name,last_name',
        ])
            ->where(function ($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                    ->orWhereBetween('end_date', [$startOfMonth, $endOfMonth])
                    ->orWhere(function ($q) use ($startOfMonth, $endOfMonth) {
                        $q->where('start_date', '<=', $startOfMonth)
                            ->where('end_date', '>=', $endOfMonth);
                    });
            });

        // Apply user filtering based on role
        if ($userIds !== null) {
            $leaveRequestsQuery->whereIn('user_id', $userIds);
        }

        $leaveRequests = $leaveRequestsQuery
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Get overtime requests for current month
        $overtimeRequestsQuery = OvertimeRequest::with([
            'user:id,first_name,last_name,email',
            'approver:id,first_name,last_name',
        ])
            ->whereBetween('date', [$startOfMonth, $endOfMonth]);

        // Apply user filtering based on role
        if ($userIds !== null) {
            $overtimeRequestsQuery->whereIn('user_id', $userIds);
        }

        $overtimeRequests = $overtimeRequestsQuery
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Calculate stats
        $leaveStats = [
            'total'    => $leaveRequests->count(),
            'pending'  => $leaveRequests->filter(function ($request) {
                return $request->status === LeaveRequestStatus::PENDING;
            })->count(),
            'approved' => $leaveRequests->filter(function ($request) {
                return $request->status === LeaveRequestStatus::APPROVED;
            })->count(),
            'rejected' => $leaveRequests->filter(function ($request) {
                return $request->status === LeaveRequestStatus::REJECTED;
            })->count(),
        ];

        $overtimeStats = [
            'total'       => $overtimeRequests->count(),
            'pending'     => $overtimeRequests->filter(function ($request) {
                return $request->status === OvertimeStatus::PENDING;
            })->count(),
            'approved'    => $overtimeRequests->filter(function ($request) {
                return $request->status === OvertimeStatus::APPROVED;
            })->count(),
            'rejected'    => $overtimeRequests->filter(function ($request) {
                return $request->status === OvertimeStatus::REJECTED;
            })->count(),
            'total_hours' => $overtimeRequests->filter(function ($request) {
                return $request->status === OvertimeStatus::APPROVED;
            })->sum('total_hours'),
        ];

        // Determine view scope for frontend
        $viewScope = $this->getViewScope($currentUser);

        return Inertia::render('dashboard', [
            'leaveRequests'    => $leaveRequests,
            'overtimeRequests' => $overtimeRequests,
            'leaveStats'       => $leaveStats,
            'overtimeStats'    => $overtimeStats,
            'currentMonth'     => $currentMonth->format('F Y'),
            'viewScope'        => $viewScope,
        ]);
    }

    /**
     * Get user IDs to filter by based on the current user's role
     * Returns null for super admin (no filtering), array of user IDs for others
     */
    private function getUserIdsBasedOnRole($user): ?array
    {
        // Super admin can see everything
        if ($user->hasRole('super_admin') || $user->hasRole('admin')) {
            return null;
        }

        // Manager can see their subordinates' data + their own
        if ($user->hasRole('manager') || $user->subordinates()->exists()) {
            $subordinateIds = $user->subordinates()->pluck('id')->toArray();
            return array_merge([$user->id], $subordinateIds);
        }

        // Regular user can only see their own data
        return [$user->id];
    }

    /**
     * Get the view scope description for the frontend
     */
    private function getViewScope($user): array
    {
        if ($user->hasRole('super_admin') || $user->hasRole('admin')) {
            return [
                'type'        => 'admin',
                'description' => 'All employees',
                'userCount'   => null, // Will be all users
            ];
        }

        if ($user->hasRole('manager') || $user->subordinates()->exists()) {
            $subordinateCount = $user->subordinates()->count();
            return [
                'type'        => 'manager',
                'description' => $subordinateCount > 0
                    ? "Your team ({$subordinateCount} members) and yourself"
                    : 'Your data only',
                'userCount' => $subordinateCount + 1,
            ];
        }

        return [
            'type'        => 'user',
            'description' => 'Your data only',
            'userCount'   => 1,
        ];
    }
}
