'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSavedQuestionIds, toggleSavedQuestion } from '@/actions/user-data';
import { invalidateUserData } from '@/lib/invalidate-user-data';

export function useQuestionBookmarks() {
  const queryClient = useQueryClient();
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  useEffect(() => {
    getSavedQuestionIds().then((ids) => {
      setBookmarks(new Set(ids));
    });
  }, []);

  const toggleBookmark = async (
    qcod: number,
    options: { showToast?: boolean } = {}
  ) => {
    const { showToast = true } = options;
    const wasSaved = bookmarks.has(qcod);

    setBookmarks((prev) => {
      const next = new Set(prev);
      if (wasSaved) {
        next.delete(qcod);
      } else {
        next.add(qcod);
      }
      return next;
    });

    try {
      const saved = await toggleSavedQuestion(qcod);
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (saved) {
          next.add(qcod);
        } else {
          next.delete(qcod);
        }
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['saved-questions'] });
      invalidateUserData(queryClient);
      if (showToast) {
        toast.success(
          saved
            ? 'Αποθηκεύτηκε στις αγαπημένες'
            : 'Αφαιρέθηκε από τις αγαπημένες'
        );
      }
    } catch (error) {
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.add(qcod);
        } else {
          next.delete(qcod);
        }
        return next;
      });
      toast.error(
        error instanceof Error && error.message === 'Not authenticated'
          ? 'Συνδέσου για να αποθηκεύεις ερωτήσεις'
          : 'Σφάλμα αποθήκευσης'
      );
    }
  };

  return { bookmarks, toggleBookmark };
}
