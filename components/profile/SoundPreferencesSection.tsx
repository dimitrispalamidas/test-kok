'use client';

import { ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateSoundPreferences } from '@/actions/user-data';
import { previewSound } from '@/lib/sound-effects';
import {
  SOUND_CATEGORY_LABELS,
  SOUND_LIBRARY,
  type SoundCategory,
  type SoundPreferences,
} from '@/lib/sound-library';
import { cn } from '@/lib/utils';

type SoundPreferencesSectionProps = {
  preferences: SoundPreferences;
  onPreferencesChange: (preferences: SoundPreferences) => void;
};

function SoundToggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? 'Απενεργοποίηση ήχων' : 'Ενεργοποίηση ήχων'}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!enabled);
      }}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        enabled ? 'bg-primary' : 'bg-muted-foreground/25',
        disabled && 'opacity-60'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
          enabled && 'translate-x-5'
        )}
      />
    </button>
  );
}

export function SoundPreferencesSection({
  preferences,
  onPreferencesChange,
}: SoundPreferencesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savingCategory, setSavingCategory] = useState<SoundCategory | null>(
    null
  );
  const [savingEnabled, setSavingEnabled] = useState(false);

  const persistPreferences = async (
    nextPreferences: SoundPreferences,
    rollback: SoundPreferences
  ) => {
    try {
      await updateSoundPreferences(nextPreferences);
    } catch (error) {
      onPreferencesChange(rollback);
      toast.error(
        error instanceof Error ? error.message : 'Σφάλμα αποθήκευσης ήχου'
      );
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    const previous = preferences;
    const nextPreferences: SoundPreferences = { ...preferences, enabled };

    onPreferencesChange(nextPreferences);
    setSavingEnabled(true);

    try {
      await persistPreferences(nextPreferences, previous);
    } finally {
      setSavingEnabled(false);
    }
  };

  const handleSelect = async (category: SoundCategory, variantId: number) => {
    if (preferences[category] === variantId) {
      previewSound(category, variantId);
      return;
    }

    const nextPreferences: SoundPreferences = {
      ...preferences,
      [category]: variantId,
    };

    onPreferencesChange(nextPreferences);
    previewSound(category, variantId);
    setSavingCategory(category);

    try {
      await persistPreferences(nextPreferences, preferences);
    } finally {
      setSavingCategory(null);
    }
  };

  const VolumeIcon = preferences.enabled ? Volume2 : VolumeX;

  return (
    <div className="mt-6 border-t border-border/40 pt-5">
      <div className="flex items-start gap-3">
        <VolumeIcon
          className={cn(
            'mt-0.5 size-5 shrink-0',
            preferences.enabled ? 'text-primary' : 'text-muted-foreground'
          )}
        />

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          className="min-w-0 flex-1 text-left transition-colors hover:opacity-90"
        >
          <p className="card-title">Ήχοι εφαρμογής</p>
          <p className="card-subtitle">
            Διάλεξε τον ήχο για κάθε γεγονός · πάτα για preview
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-2.5 pt-0.5">
          <SoundToggle
            enabled={preferences.enabled}
            disabled={savingEnabled}
            onChange={handleToggleEnabled}
          />
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Κλείσιμο επιλογών ήχου' : 'Άνοιγμα επιλογών ήχου'}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                'size-5 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className={cn(
            'mt-5 space-y-4',
            !preferences.enabled && 'opacity-60'
          )}
        >
          {(Object.keys(SOUND_LIBRARY) as SoundCategory[]).map((category) => {
            const isSaving = savingCategory === category;

            return (
              <div key={category} className="space-y-2">
                <p className="card-field-label">
                  {SOUND_CATEGORY_LABELS[category]}
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {SOUND_LIBRARY[category].map((variant) => {
                    const selected = preferences[category] === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSelect(category, variant.id)}
                        className={cn(
                          'rounded-xl border px-1 py-2.5 text-center text-sm font-semibold transition-colors',
                          selected
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border/60 bg-background/40 text-muted-foreground hover:border-primary/30 hover:bg-accent/30',
                          isSaving && 'opacity-60'
                        )}
                        aria-pressed={selected}
                        aria-label={`${SOUND_CATEGORY_LABELS[category]} — ${variant.label}`}
                      >
                        {variant.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
