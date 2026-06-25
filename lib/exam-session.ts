export const SIMULATION_EXAM_TITLE = 'Προσομοίωση Εξέτασης';
export const QUICK_TEST_TITLE = 'Γρήγορο Τεστ';

export const TEST_EXIT_CONFIRMATION = {
  quick: {
    title: 'Έξοδος από το τεστ;',
    message:
      'Δεν έχεις ολοκληρώσει το γρήγορο τεστ. Αν φύγεις τώρα, δεν θα καταγραφεί.',
    confirmLabel: 'Έξοδος',
    cancelLabel: 'Συνέχισε',
  },
  simulation: {
    title: 'Έξοδος από την προσομοίωση;',
    message:
      'Δεν έχεις ολοκληρώσει την προσομοίωση. Αν φύγεις τώρα, δεν θα καταγραφεί.',
    confirmLabel: 'Έξοδος',
    cancelLabel: 'Συνέχισε',
  },
} as const;

/** Legacy title used before simulation sessions were labeled explicitly. */
const LEGACY_SIMULATION_TITLES = ['Τυχαίο Τεστ'] as const;

export function isSimulationExamResult(entry: {
  title: string;
  duration_seconds?: number | null;
}): boolean {
  if (entry.duration_seconds != null) {
    return true;
  }

  return (
    entry.title === SIMULATION_EXAM_TITLE ||
    LEGACY_SIMULATION_TITLES.includes(
      entry.title as (typeof LEGACY_SIMULATION_TITLES)[number]
    )
  );
}

export function isQuickTestResult(entry: { title: string }): boolean {
  return entry.title === QUICK_TEST_TITLE;
}

export function isCountableTestResult(entry: {
  title: string;
  duration_seconds?: number | null;
}): boolean {
  return isQuickTestResult(entry) || isSimulationExamResult(entry);
}

export function getExamResultDisplayTitle(entry: {
  title: string;
  duration_seconds?: number | null;
}): string {
  if (isQuickTestResult(entry)) {
    return QUICK_TEST_TITLE;
  }

  if (isSimulationExamResult(entry)) {
    return 'Τεστ Προσομοίωσης';
  }

  return entry.title;
}
