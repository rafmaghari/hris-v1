<?php
namespace App\Http\Middleware;

use App\Actions\User\GetUserAccessAction;
use App\Enums\LeaveRequestStatus;
use App\Enums\OvertimeStatus;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $userAccess         = [];
        $overtimeCounts     = null;
        $leaveRequestCounts = null;

        if ($request->user()) {
            $userAccess = (new GetUserAccessAction)->execute($request->user());

            // Calculate overtime counts for the authenticated user
            $myPendingRequests = OvertimeRequest::where('user_id', $request->user()->id)
                ->where('status', OvertimeStatus::PENDING)
                ->count();

            $myPendingLeaveRequests = LeaveRequest::where('user_id', $request->user()->id)
                ->where('status', LeaveRequestStatus::PENDING)
                ->count();

            // Get users where the current user is their manager
            $subordinateIds   = User::where('manager_id', $request->user()->id)->pluck('id');
            $pendingApprovals = OvertimeRequest::whereIn('user_id', $subordinateIds)
                ->where('status', OvertimeStatus::PENDING)
                ->count();

            $pendingApprovalsLeaveRequests = LeaveRequest::whereIn('user_id', $subordinateIds)
                ->where('status', LeaveRequestStatus::PENDING)
                ->count();

            $overtimeCounts = [
                'myPendingRequests' => $myPendingRequests,
                'pendingApprovals'  => $pendingApprovals,
            ];

            $leaveRequestCounts = [
                'myPendingRequests' => $myPendingLeaveRequests,
                'pendingApprovals'  => $pendingApprovalsLeaveRequests,
            ];
        }

        return [
             ...parent::share($request),
            'name'               => config('app.name'),
            'auth'               => [
                'user' => $request->user() ? [
                     ...$request->user()->toArray(),
                    'avatar_url'  => $request->user()->avatar_url ?? null,
                    // 'system_ecosystem_token' => session('system_ecosystem_token'),
                    'companies'   => $userAccess['platform_company_roles'] ?? [],
                    'access'      => $userAccess['access'] ?? null,
                    'roles'       => $request->user()->roles->pluck('name')->toArray(),
                    'permissions' => $request->user()->permissions->pluck('name')->toArray(),
                ] : null,
            ],
            'ziggy'              => fn(): array             => [
                 ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen'        => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'overtimeCounts'     => $overtimeCounts,
            'leaveRequestCounts' => $leaveRequestCounts,
        ];
    }
}
