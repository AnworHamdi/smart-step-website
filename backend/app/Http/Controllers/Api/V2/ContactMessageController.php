<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Notifications\ContactReply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class ContactMessageController extends Controller
{
    /**
     * List all contact messages (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by email or name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $messages = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    /**
     * Store a new contact message (public).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $message = ContactMessage::create($validated);

        return response()->json([
            'data' => $message,
            'message' => 'Your message has been sent successfully.',
        ], 201);
    }

    /**
     * Show a single contact message.
     */
    public function show(ContactMessage $contactMessage): JsonResponse
    {
        // Mark as read when viewed
        $contactMessage->markAsRead();

        return response()->json([
            'data' => $contactMessage,
        ]);
    }

    /**
     * Update a contact message status.
     */
    public function update(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(['new', 'read', 'replied', 'archived'])],
        ]);

        $contactMessage->update($validated);

        return response()->json([
            'data' => $contactMessage->fresh(),
        ]);
    }

    /**
     * Delete a contact message.
     */
    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json(null, 204);
    }

    /**
     * Reply to a contact message.
     */
    public function reply(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $validated = $request->validate([
            'reply_message' => 'required|string|max:10000',
        ]);

        $contactMessage->reply($validated['reply_message']);

        // Send email notification
        Notification::route('mail', $contactMessage->email)
            ->notify(new ContactReply($contactMessage));

        return response()->json([
            'data' => $contactMessage->fresh(),
            'message' => 'Reply sent successfully.',
        ]);
    }
}
