<?php

namespace App\Http\Middleware;

use App\Actions\User\GetUserAccessAction;
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
        $userAccess = [];

        if ($request->user()) {
            $userAccess = (new GetUserAccessAction)->execute($request->user());
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    ...$request->user()->toArray(),
                    'avatar_url' => $request->user()->avatar_url ?? null,
                    // 'system_ecosystem_token' => session('system_ecosystem_token'),
                    'companies' => $userAccess['platform_company_roles'] ?? [],
                    'access' => $userAccess['access'] ?? null,
                    'roles' => $request->user()->roles->pluck('name')->toArray(),
                    'permissions' => $request->user()->permissions->pluck('name')->toArray(),
                ] : null,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
