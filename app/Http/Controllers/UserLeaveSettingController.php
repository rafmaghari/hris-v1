<?php
namespace App\Http\Controllers;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Http\Requests\UserLeaveSettingRequest;
use App\Models\LeaveSettingsTemplate;
use App\Models\User;
use App\Models\UserLeaveSetting;
use Inertia\Inertia;
use Inertia\Response;

class UserLeaveSettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $userLeaveSettings = UserLeaveSetting::with([
            'user:id,first_name,last_name,email',
            'leaveSettingsTemplate.leaveType:id,name',
        ])
            ->when(request()->input('filter.search'), function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                    ->orWhereHas('leaveSettingsTemplate', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('leaveSettingsTemplate.leaveType', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('UserLeaveSettings/Index', [
            'userLeaveSettings' => $userLeaveSettings,
            'filters'           => ['filter' => request()->get('filter') ?? ''],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $users = User::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();

        $leaveSettingsTemplates = LeaveSettingsTemplate::with('leaveType:id,name')
            ->select('id', 'name', 'leave_type_id', 'accrual_type', 'fixed_days', 'accrual_frequency', 'accrual_amount', 'max_cap', 'allow_carry_over', 'max_carry_over')
            ->orderBy('name')
            ->get();

        return Inertia::render('UserLeaveSettings/Create', [
            'users'                  => $users,
            'leaveSettingsTemplates' => $leaveSettingsTemplates,
            'accrualTypes'           => LeadAccrualType::options(),
            'accrualFrequencies'     => LeadAccrualFrequencyType::options(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserLeaveSettingRequest $request)
    {
        $validated = $request->validated();

        // Get template data to populate user leave setting
        $template = LeaveSettingsTemplate::findOrFail($validated['leave_settings_template_id']);

        // Merge template data with user input
        $data = array_merge($validated, [
            'accrual_type'      => $validated['accrual_type'] ?? $template->accrual_type,
            'accrual_frequency' => $validated['accrual_frequency'] ?? $template->accrual_frequency,
            'accrual_amount'    => $validated['accrual_amount'] ?? $template->accrual_amount,
            'max_cap'           => $template->max_cap ?? $validated['max_cap'],
            'allow_carry_over'  => $template->allow_carry_over,
            'max_carry_over'    => $template->max_carry_over ?? $validated['max_carry_over'] ?? 0,
        ]);

        UserLeaveSetting::create($data);

        return redirect()->route('user-leave-settings.index')
            ->with('success', 'User leave setting created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(UserLeaveSetting $userLeaveSetting): Response
    {
        $userLeaveSetting->load([
            'user:id,first_name,last_name,email',
            'leaveSettingsTemplate.leaveType:id,name',
        ]);

        // Get accrual logs for this user leave setting
        $accrualLogs = $userLeaveSetting->accrualLogs()
            ->orderBy('accrual_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('UserLeaveSettings/Show', [
            'userLeaveSetting' => $userLeaveSetting,
            'accrualLogs'      => $accrualLogs,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserLeaveSetting $userLeaveSetting): Response
    {
        $userLeaveSetting->load([
            'user:id,first_name,last_name,email',
            'leaveSettingsTemplate',
        ]);

        $users = User::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();

        $leaveSettingsTemplates = LeaveSettingsTemplate::with('leaveType:id,name')
            ->select('id', 'name', 'leave_type_id', 'accrual_type', 'fixed_days', 'accrual_frequency', 'accrual_amount', 'max_cap', 'allow_carry_over', 'max_carry_over')
            ->orderBy('name')
            ->get();

        // Get accrual logs for this user leave setting
        $accrualLogs = $userLeaveSetting->accrualLogs()
            ->orderBy('accrual_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('UserLeaveSettings/Edit', [
            'userLeaveSetting'       => $userLeaveSetting,
            'users'                  => $users,
            'leaveSettingsTemplates' => $leaveSettingsTemplates,
            'accrualTypes'           => LeadAccrualType::options(),
            'accrualFrequencies'     => LeadAccrualFrequencyType::options(),
            'accrualLogs'            => $accrualLogs,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserLeaveSettingRequest $request, UserLeaveSetting $userLeaveSetting)
    {
        $validated = $request->validated();

        // Get template data to populate user leave setting
        $template = LeaveSettingsTemplate::findOrFail($validated['leave_settings_template_id']);

        // Merge template data with user input
        $data = array_merge($validated, [
            'accrual_type'      => $validated['accrual_type'] ?? $template->accrual_type,
            'accrual_frequency' => $validated['accrual_frequency'] ?? $template->accrual_frequency,
            'accrual_amount'    => $validated['accrual_amount'] ?? $template->accrual_amount,
            'max_cap'           => $template->max_cap ?? $validated['max_cap'],
            'allow_carry_over'  => $template->allow_carry_over,
            'max_carry_over'    => $template->max_carry_over ?? $validated['max_carry_over'] ?? 0,
        ]);

        $userLeaveSetting->update($data);

        return redirect()->route('user-leave-settings.index')
            ->with('success', 'User leave setting updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserLeaveSetting $userLeaveSetting)
    {
        $userLeaveSetting->delete();

        return redirect()->route('user-leave-settings.index')
            ->with('success', 'User leave setting deleted successfully.');
    }
}
