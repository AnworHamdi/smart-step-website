<?php

namespace App\Models;

use App\Exceptions\UserDeletionException;
use App\Notifications\Auth\ResetPasswordNotification;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Database\Eloquent\Collection|\App\Models\Role[] $roles
 *
 * @method static \Illuminate\Database\Eloquent\Model|self create(array $attributes = [])
 */
class User extends Authenticatable
{
    use HasApiTokens, HasRoles, Notifiable, HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_image',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    public function password(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => Hash::make($value)
        );
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function scopeName(Builder $query, string $value): Builder
    {
        return $query->where('users.name', 'LIKE', "%{$value}%", 'or');
    }

    public function scopeEmail(Builder $query, string $value): Builder
    {
        return $query->where('users.email', 'LIKE', "%{$value}%", 'or');
    }

    public function scopeRoles(Builder $query, string $value): Builder
    {
        return $query->orWhereHas('roles', function ($query) use ($value) {
            $query->where('roles.name', 'LIKE', "%$value%");
        });
    }

    /**
     * Delete the user.
     *
     * @return bool|null
     * @throws UserDeletionException
     */
    public function delete(): ?bool
    {
        if ($this->id === auth()->id()) {
            throw new UserDeletionException();
        }

        return parent::delete();
    }

}
