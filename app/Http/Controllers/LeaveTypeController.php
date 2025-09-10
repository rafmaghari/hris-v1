<?php

namespace App\Http\Controllers;

use App\Models\LeaveType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveTypeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('LeaveTypes/Index', [
            'leaveTypes' => LeaveType::query()
                ->when(request()->input('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%");
                })
                ->paginate(10)
                ->withQueryString(),
            'filters' => request()->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('LeaveTypes/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'status' => ['required', 'integer', 'in:1,2'],
        ]);

        LeaveType::create($validated);

        return redirect()->route('leave-types.index')
            ->with('success', 'Leave type created successfully.');
    }

    public function show(LeaveType $leaveType)
    {
        //
    }

    public function edit(LeaveType $leaveType): Response
    {
        return Inertia::render('LeaveTypes/Edit', [
            'leaveType' => $leaveType,
        ]);
    }

    public function update(Request $request, LeaveType $leaveType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'status' => ['required', 'integer', 'in:1,2'],
        ]);

        $leaveType->update($validated);

        return redirect()->route('leave-types.index')
            ->with('success', 'Leave type updated successfully.');
    }

    public function destroy(LeaveType $leaveType): RedirectResponse
    {
        $leaveType->delete();

        return redirect()->route('leave-types.index')
            ->with('success', 'Leave type deleted successfully.');
    }
}
