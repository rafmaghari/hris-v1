<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupRequest;
use App\Models\Group;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $groups = QueryBuilder::for(Group::class)
            ->allowedFilters([
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where('name', 'like', "%{$value}%");
                }),
            ])
            ->orderBy('id', 'desc')
            ->with('leader')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Groups/Index', [
            'groups' => $groups,
            'filters' => ['filter' => request()->get('filter') ?? ''],
        ]);
    }

    public function create()
    {
        $members = Member::select('id as value', 'first_name', 'last_name')
            ->get()
            ->map(function ($member) {
                return [
                    'value' => (string) $member->value,
                    'label' => $member->first_name . ' ' . $member->last_name,
                ];
            });

        return Inertia::render('Groups/Create', [
            'members' => $members,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:groups,name',
            'description' => 'nullable|string',
            'status' => 'required|in:1,2',
        ]);

        Group::create($validated);

        return redirect()->route('groups.index')
            ->with('success', 'Group created successfully.');
    }

    public function edit(Group $group)
    {
        $members = Member::select('id as value', 'first_name', 'last_name')
            ->get()
            ->map(function ($member) {
                return [
                    'value' => (string) $member->value,
                    'label' => $member->first_name . ' ' . $member->last_name,
                ];
            });

        return Inertia::render('Groups/Edit', [
            'group' => $group,
            'members' => $members,
        ]);
    }

    public function update(Request $request, Group $group): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:groups,name,' . $group->id,
            'description' => 'nullable|string',
            'status' => 'required|in:1,2',
        ]);

        $group->update($validated);

        return redirect()->route('groups.index')
            ->with('success', 'Group updated successfully.');
    }

    public function destroy(Group $group): RedirectResponse
    {
        $group->delete();

        return redirect()->route('groups.index')
            ->with('success', 'Group deleted successfully.');
    }
}
