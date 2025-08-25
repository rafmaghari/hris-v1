<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Platform;
use App\Models\PlatformCompanyUserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RoleSelectionController extends Controller
{
    /**
     * Select a platform and company for the current user.
     */
    public function select(Request $request, $platformCompanyValue): RedirectResponse
    {
        // Extract platform and company IDs from the value (format: "platform_id-company_id")
        $parts = explode('-', $platformCompanyValue);

        if (count($parts) !== 2) {
            return back()->with('error', 'Invalid selection format.');
        }

        [$platformId, $companyId] = $parts;

        // Verify that the platform and company exist
        $platform = Platform::find($platformId);
        $company = Company::find($companyId);

        if (! $platform || ! $company) {
            return back()->with('error', 'Invalid platform or company.');
        }

        // Verify that the user has access to this platform-company combination
        $hasAccess = PlatformCompanyUserRole::where('user_id', $request->user()->id)
            ->where('platform_id', $platformId)
            ->where('company_id', $companyId)
            ->exists();

        if (! $hasAccess) {
            return back()->with('error', 'You do not have access to this platform-company combination.');
        }

        // Update the user's selected platform and company
        $request->user()->update([
            'selected_platform_id' => $platformId,
            'selected_company_id' => $companyId,
        ]);

        return back()->with('success', 'Platform and company selected successfully.');
    }

    /**
     * Clear the selected platform and company for the current user.
     */
    public function clear(Request $request): RedirectResponse
    {
        // Clear the user's selected platform and company
        $request->user()->update([
            'selected_platform_id' => null,
            'selected_company_id' => null,
        ]);

        return back()->with('success', 'Selection cleared.');
    }
}
