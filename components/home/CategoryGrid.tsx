'use client';

import { motion } from 'motion/react';
import type { CategoryWithStats } from '@/actions/categories';
import { CategoryCard } from '@/components/ui/CategoryCard';

type CategoryGridProps = {
  categories: CategoryWithStats[];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <motion.section
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {categories.map((category) => (
        <motion.div key={category.kcod} variants={itemVariants}>
          <CategoryCard category={category} />
        </motion.div>
      ))}
    </motion.section>
  );
}
