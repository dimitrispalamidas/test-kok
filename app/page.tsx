import { getCategories } from '@/actions/categories';
import { CategoryCard } from '@/components/ui/CategoryCard';

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">ΚΟΚ Practice</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Smart εξάσκηση για τον Κώδικα Οδικής Κυκλοφορίας
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Επίλεξε κατηγορία και ξεκίνα εξεταστική προσομοίωση ή ελεύθερη
          εξάσκηση
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.kcod} category={category} />
        ))}
      </section>
    </main>
  );
}
