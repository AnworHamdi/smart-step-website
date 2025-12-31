<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BroadcastAnnouncement extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $subject;
    protected string $content;
    protected ?string $actionText;
    protected ?string $actionUrl;

    public function __construct(
        string $subject,
        string $content,
        ?string $actionText = null,
        ?string $actionUrl = null
    ) {
        $this->subject = $subject;
        $this->content = $content;
        $this->actionText = $actionText;
        $this->actionUrl = $actionUrl;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $subscriberName = $notifiable->name ?? 'Subscriber';
        $message = (new MailMessage)
            ->subject($this->subject)
            ->greeting("Hello {$subscriberName}!")
            ->line($this->content);

        if ($this->actionText && $this->actionUrl) {
            $message->action($this->actionText, $this->actionUrl);
        }

        return $message->line('Thank you for being part of our community!');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'broadcast_announcement',
            'subject' => $this->subject,
            'content' => $this->content,
        ];
    }
}
