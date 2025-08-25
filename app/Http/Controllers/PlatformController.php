<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlatformRequest;
use App\Models\Company;
use App\Models\Platform;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PlatformController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $platforms = QueryBuilder::for(Platform::class)
            ->allowedFilters([
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where('name', 'like', "%{$value}%")
                        ->orWhere('slug', 'like', "%{$value}%");
                }),
            ])
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Platforms/Index', [
            'platforms' => $platforms,
            'filters' => ['filter' => request()->get('filter') ?? ''],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $companies = Company::select('id', 'name')->get();

        return Inertia::render('Platforms/Create', [
            'companies' => $companies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PlatformRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Extract company IDs from the request
        $companyIds = $validated['company_ids'] ?? [];
        unset($validated['company_ids']);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $platform = Platform::create($validated);

        // Attach companies to the platform
        if (! empty($companyIds)) {
            $platform->companies()->attach($companyIds);
        }

        return redirect()->route('platforms.index')
            ->with('success', 'Platform created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Platform $platform): Response
    {
        $platform->load('companies');

        return Inertia::render('Platforms/Show', [
            'platform' => $platform,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Platform $platform): Response
    {
        $companies = Company::select('id', 'name')->get();
        $platform->load('companies');

        // Ensure all fields are properly loaded
        $platformData = $platform->toArray();

        return Inertia::render('Platforms/Edit', [
            'platform' => $platformData,
            'companies' => $companies->toArray(),
            'selectedCompanyIds' => $platform->companies->pluck('id')->toArray(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PlatformRequest $request, Platform $platform): RedirectResponse
    {
        $validated = $request->validated();

        // Extract company IDs from the request
        $companyIds = $validated['company_ids'] ?? [];
        unset($validated['company_ids']);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $platform->update($validated);

        // Sync companies
        $platform->companies()->sync($companyIds);

        return redirect()->route('platforms.edit', $platform->id)
            ->with('success', 'Platform updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Platform $platform): RedirectResponse
    {
        // Detach all relations before deleting
        $platform->companies()->detach();

        $platform->delete();

        return redirect()->route('platforms.index')
            ->with('success', 'Platform deleted successfully.');
    }

    /**
     * Regenerate the platform secret key.
     */
    public function regenerateSecretKey(Platform $platform)
    {
        $platform->secret_key = 'platform_key_'.Str::random(40);
        $platform->save();

        // redirect back to the edit page
        return redirect()->route('platforms.edit', $platform->id)
            ->with('success', 'Platform secret key regenerated successfully.');
    }
}
