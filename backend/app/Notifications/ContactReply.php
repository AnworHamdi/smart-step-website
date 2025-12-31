<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactReply extends Notification implements ShouldQueue
{
    use Queueable;

    protected ContactMessage $contactMessage;

    public function __construct(ContactMessage $contactMessage)
    {
        $this->contactMessage = $contactMessage;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $appName = config('app.name', 'Smart Step');

        return (new MailMessage)
            ->subject("Re: {$this->contactMessage->subject}")
            ->greeting("Hello {$this->contactMessage->name}!")
            ->line("Thank you for contacting {$appName}. Here is our response to your message:")
            ->line('---')
            ->line("**Your message:**")
            ->line($this->contactMessage->message)
            ->line('---')
            ->line("**Our reply:**")
            ->line($this->contactMessage->reply_message)
            ->line('---')
            ->line("If you have any further questions, please don't hesitate to contact us again.");
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'contact_reply',
            'contact_message_id' => $this->contactMessage->id,
        ];
    }
}
