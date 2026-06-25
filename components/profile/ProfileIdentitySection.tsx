'use client';

import { Camera, CircleUser, Loader2, LogOut, Pencil, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadAvatar } from '@/actions/profile-insights';
import { SoundPreferencesSection } from '@/components/profile/SoundPreferencesSection';
import type { SoundPreferences } from '@/lib/sound-library';
import { cn } from '@/lib/utils';

type ProfileIdentitySectionProps = {
  username: string;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
  isDefaultUsername: boolean;
  usernameInput: string;
  savingUsername: boolean;
  loggingOut: boolean;
  soundPreferences: SoundPreferences;
  onUsernameChange: (value: string) => void;
  onSaveUsername: () => Promise<void>;
  onSignOut: () => void;
  onAvatarUpdated: (url: string) => void;
  onSoundPreferencesChange: (preferences: SoundPreferences) => void;
};

export function ProfileIdentitySection({
  username,
  email,
  avatarUrl,
  memberSince,
  isDefaultUsername,
  usernameInput,
  savingUsername,
  loggingOut,
  onUsernameChange,
  onSaveUsername,
  onSignOut,
  onAvatarUpdated,
  soundPreferences,
  onSoundPreferencesChange,
}: ProfileIdentitySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(isDefaultUsername);

  useEffect(() => {
    if (isDefaultUsername) {
      setIsEditingNickname(true);
    }
  }, [isDefaultUsername]);

  const trimmedInput = usernameInput.trim();
  const hasChanges = trimmedInput !== username;
  const canSave = trimmedInput.length >= 2 && hasChanges;

  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set('avatar', file);
    setUploadingAvatar(true);

    try {
      const url = await uploadAvatar(formData);
      onAvatarUpdated(url);
      toast.success('Η φωτογραφία ενημερώθηκε');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Σφάλμα ανεβάσματος');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleCancelEdit = () => {
    onUsernameChange(username);
    setIsEditingNickname(false);
  };

  const handleSaveNickname = async () => {
    if (!canSave) return;

    try {
      await onSaveUsername();
      setIsEditingNickname(false);
    } catch {
      // Parent shows toast
    }
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAvatar}
          className="group relative shrink-0"
          aria-label="Αλλαγή φωτογραφίας προφίλ"
        >
          <span className="flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-primary/15 text-primary">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={64}
                height={64}
                className="size-full object-cover"
                unoptimized
              />
            ) : (
              <User className="size-7" />
            )}
          </span>
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-2xl',
              'bg-black/50 opacity-0 transition-opacity group-hover:opacity-100',
              uploadingAvatar && 'opacity-100'
            )}
          >
            {uploadingAvatar ? (
              <Loader2 className="size-5 animate-spin text-white" />
            ) : (
              <Camera className="size-5 text-white" />
            )}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleAvatarSelect}
          />
        </button>

        <div className="min-w-0 flex-1">
          <p className="card-title truncate">{username}</p>
          <p className="card-subtitle truncate">{email}</p>
          <p className="card-subtitle truncate">Μέλος από {memberSince}</p>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          disabled={loggingOut}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5',
            'text-sm font-medium text-muted-foreground transition-colors hover:bg-accent',
            'disabled:opacity-50'
          )}
        >
          <LogOut className="size-4" />
          Αποσύνδεση
        </button>
      </div>

      <div className="mt-4 border-t border-border/40 pt-4">
        {!isEditingNickname ? (
          <div className="flex items-start gap-3">
            <CircleUser className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="card-title">Nickname</p>
              <p className="card-subtitle truncate">{username}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingNickname(true)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 px-3 py-2',
                'text-sm font-medium text-muted-foreground transition-colors',
                'hover:border-primary/30 hover:bg-accent/30 hover:text-foreground'
              )}
            >
              <Pencil className="size-4" />
              Αλλαγή
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <CircleUser className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1 space-y-3">
            {isDefaultUsername && (
              <p className="card-subtitle">
                Όρισε ένα nickname για να εμφανίζεσαι στην κατάταξη.
              </p>
            )}
            <div>
              <label htmlFor="profile-nickname" className="card-title">
                Nickname
              </label>
              <input
                id="profile-nickname"
                type="text"
                value={usernameInput}
                onChange={(event) => onUsernameChange(event.target.value)}
                maxLength={20}
                placeholder="π.χ. palamidas777"
                autoFocus={!isDefaultUsername}
                className={cn(
                  'mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base',
                  'outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                )}
              />
              <p className="mt-1.5 card-subtitle">
                2–20 χαρακτήρες · γράμματα, αριθμοί και _
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveNickname}
                disabled={savingUsername || !canSave}
                className={cn(
                  'rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground',
                  'transition-all hover:brightness-110 disabled:opacity-50'
                )}
              >
                {savingUsername ? 'Αποθήκευση…' : 'Αποθήκευση nickname'}
              </button>
              {!isDefaultUsername && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingUsername}
                  className={cn(
                    'rounded-xl border border-border/60 px-4 py-2 text-sm font-medium',
                    'text-muted-foreground transition-colors hover:bg-accent/30',
                    'disabled:opacity-50'
                  )}
                >
                  Ακύρωση
                </button>
              )}
            </div>
            </div>
          </div>
        )}
      </div>

      <SoundPreferencesSection
        preferences={soundPreferences}
        onPreferencesChange={onSoundPreferencesChange}
      />
    </section>
  );
}
