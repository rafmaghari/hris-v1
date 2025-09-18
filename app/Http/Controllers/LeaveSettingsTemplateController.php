<?php
namespace App\Http\Controllers;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Enums\Status;
use App\Http\Requests\LeaveSettingsTemplateRequest;
use App\Models\LeaveSettingsTemplate;
use App\Models\LeaveType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveSettingsTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('LeaveSettingsTemplate/Index', [
            'templates' => LeaveSettingsTemplate::query()
                ->with('leaveType')
                ->when(request()->input('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%");
                })
                ->paginate(10)
                ->withQueryString(),
            'filters' => request()->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $leaveTypes = LeaveType::all();

        return Inertia::render('LeaveSettingsTemplate/Create', [
            'leaveTypes'         => $leaveTypes,
            'accrualTypes'       => LeadAccrualType::options(),
            'accrualFrequencies' => LeadAccrualFrequencyType::options(),
            'statusOptions'      => Status::options(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(LeaveSettingsTemplateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        LeaveSettingsTemplate::create($validated);

        return redirect()->route('leave-settings-templates.index')
            ->with('success', 'Leave Settings Template created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LeaveSettingsTemplate $leaveSettingsTemplate): Response
    {
        $leaveTypes = LeaveType::all();

        return Inertia::render('LeaveSettingsTemplate/Edit', [
            'template'           => $leaveSettingsTemplate->load('leaveType'),
            'leaveTypes'         => $leaveTypes,
            'accrualTypes'       => LeadAccrualType::options(),
            'accrualFrequencies' => LeadAccrualFrequencyType::options(),
            'statusOptions'      => Status::options(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(LeaveSettingsTemplateRequest $request, LeaveSettingsTemplate $leaveSettingsTemplate): RedirectResponse
    {
        $validated = $request->validated();

        $leaveSettingsTemplate->update($validated);

        return redirect()->route('leave-settings-templates.index')
            ->with('success', 'Leave Settings Template updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LeaveSettingsTemplate $leaveSettingsTemplate): RedirectResponse
    {
        $leaveSettingsTemplate->delete();

        return redirect()->route('leave-settings-templates.index')
            ->with('success', 'Leave Settings Template deleted successfully.');
    }
}
