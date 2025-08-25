<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'avatarUrl' => $user->avatar_url,
            'avatarThumbUrl' => $user->avatar_thumb_url,
            'message' => $request->session()->get('message'),
            'error' => $request->session()->get('error'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // We'll handle avatar uploads in a separate method now

        return to_route('profile.edit');
    }

    /**
     * Update the user's avatar.
     */
    public function updateAvatar(Request $request)
    {
        try {
            // Check if the file is present in the request
            if (! $request->hasFile('avatar')) {
                return back()->withErrors(['avatar' => 'No avatar file was uploaded.']);
            }

            // Check if the file is valid
            $file = $request->file('avatar');
            if (! $file->isValid()) {
                return back()->withErrors(['avatar' => 'The uploaded file is invalid: '.$file->getErrorMessage()]);
            }

            // Validate the file
            $validated = $request->validate([
                'avatar' => ['required', 'image', 'max:1024'],
            ]);

            $user = $request->user();

            // Clear previous avatars
            $user->clearMediaCollection('avatar');

            // Add the new avatar
            $user->addMediaFromRequest('avatar')
                ->toMediaCollection('avatar');

            return back()->with('message', 'Avatar updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['avatar' => 'Error uploading avatar: '.$e->getMessage()]);
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
