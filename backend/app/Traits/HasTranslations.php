<?php

namespace App\Traits;

use App\Models\Translation;

trait HasTranslations
{
    /**
     * Get all translations for this model.
     */
    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    /**
     * Get a translated value for a field.
     */
    public function getTranslation(string $field, string $locale = null): ?string
    {
        $locale = $locale ?? app()->getLocale();

        $translation = $this->translations()
            ->where('field', $field)
            ->where('locale', $locale)
            ->first();

        return $translation?->value;
    }

    /**
     * Set a translated value for a field.
     */
    public function setTranslation(string $field, string $locale, string $value): Translation
    {
        return $this->translations()->updateOrCreate(
            ['field' => $field, 'locale' => $locale],
            ['value' => $value]
        );
    }

    /**
     * Set translations for multiple locales.
     */
    public function setTranslations(string $field, array $translations): void
    {
        foreach ($translations as $locale => $value) {
            $this->setTranslation($field, $locale, $value);
        }
    }

    /**
     * Get all translations for a field as an array.
     */
    public function getTranslations(string $field): array
    {
        return $this->translations()
            ->where('field', $field)
            ->pluck('value', 'locale')
            ->toArray();
    }

    /**
     * Get the translated attribute with fallback.
     */
    public function translated(string $field, string $fallbackLocale = 'en'): ?string
    {
        $value = $this->getTranslation($field);

        if ($value === null && app()->getLocale() !== $fallbackLocale) {
            $value = $this->getTranslation($field, $fallbackLocale);
        }

        return $value;
    }
}
