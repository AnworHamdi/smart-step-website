<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\EmailSubscription;
use App\Notifications\BroadcastAnnouncement;
use App\Notifications\WelcomeSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class EmailSubscriptionController extends Controller
{
    /**
     * List all subscriptions (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $query = EmailSubscription::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by email or name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $subscriptions = $query->orderBy('subscribed_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $subscriptions->items(),
            'meta' => [
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
                'active_count' => EmailSubscription::active()->count(),
            ],
        ]);
    }

    /**
     * Subscribe a new email (public).
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:100',
        ]);

        // Check if already subscribed
        $existing = EmailSubscription::where('email', $validated['email'])->first();

        if ($existing) {
            if ($existing->status === 'active') {
                return response()->json([
                    'message' => 'This email is already subscribed.',
                ], 200);
            }

            // Resubscribe
            $existing->resubscribe();

            return response()->json([
                'data' => $existing->fresh(),
                'message' => 'Welcome back! You have been resubscribed.',
            ], 200);
        }

        $subscription = EmailSubscription::create([
            ...$validated,
            'subscribed_at' => now(),
        ]);

        // Send welcome email
        $subscription->notify(new WelcomeSubscriber($subscription->name));

        return response()->json([
            'data' => $subscription,
            'message' => 'Thank you for subscribing!',
        ], 201);
    }

    /**
     * Show a single subscription.
     */
    public function show(EmailSubscription $subscription): JsonResponse
    {
        return response()->json([
            'data' => $subscription,
        ]);
    }

    /**
     * Update a subscription status.
     */
    public function update(Request $request, EmailSubscription $subscription): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(['active', 'unsubscribed'])],
            'name' => 'sometimes|nullable|string|max:255',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'unsubscribed') {
            $subscription->unsubscribe();
        } else {
            $subscription->update($validated);
        }

        return response()->json([
            'data' => $subscription->fresh(),
        ]);
    }

    /**
     * Delete a subscription.
     */
    public function destroy(EmailSubscription $subscription): JsonResponse
    {
        $subscription->delete();

        return response()->json(null, 204);
    }

    /**
     * Broadcast announcement to all active subscribers.
     */
    public function broadcast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string|max:10000',
            'action_text' => 'nullable|string|max:100',
            'action_url' => 'nullable|url|max:255',
        ]);

        $subscribers = EmailSubscription::active()->get();

        if ($subscribers->isEmpty()) {
            return response()->json([
                'message' => 'No active subscribers to send to.',
            ], 200);
        }

        // Send to all subscribers
        Notification::send(
            $subscribers,
            new BroadcastAnnouncement(
                $validated['subject'],
                $validated['content'],
                $validated['action_text'] ?? null,
                $validated['action_url'] ?? null
            )
        );

        return response()->json([
            'message' => "Announcement sent to {$subscribers->count()} subscribers.",
            'recipients_count' => $subscribers->count(),
        ]);
    }
}
