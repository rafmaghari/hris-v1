<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PositionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Positions/Index', [
            'positions' => Position::query()
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
        return Inertia::render('Positions/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'status' => ['required', 'integer', 'in:1,2'],
        ]);

        Position::create($validated);

        return redirect()->route('positions.index')
            ->with('success', 'Position created successfully.');
    }

    public function edit(Position $position): Response
    {
        return Inertia::render('Positions/Edit', [
            'position' => $position,
        ]);
    }

    public function update(Request $request, Position $position): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $position->update($validated);

        return redirect()->route('positions.index')
            ->with('success', 'Position updated successfully.');
    }

    public function destroy(Position $position): RedirectResponse
    {
        $position->delete();

        return redirect()->route('positions.index')
            ->with('success', 'Position deleted successfully.');
    }
}
