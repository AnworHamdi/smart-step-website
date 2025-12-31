<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeSubscriber extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $subscriberName;

    public function __construct(string $subscriberName = null)
    {
        $this->subscriberName = $subscriberName ?? 'Subscriber';
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $appName = config('app.name', 'Smart Step');

        return (new MailMessage)
            ->subject("Welcome to {$appName}!")
            ->greeting("Hello {$this->subscriberName}!")
            ->line("Thank you for subscribing to our newsletter.")
            ->line("You'll now receive updates about our latest news, products, and exclusive offers.")
            ->line("We're excited to have you as part of our community!")
            ->action('Visit Our Website', config('app.url'))
            ->line("If you didn't subscribe, you can safely ignore this email.");
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'welcome_subscriber',
            'subscriber_name' => $this->subscriberName,
        ];
    }
}
