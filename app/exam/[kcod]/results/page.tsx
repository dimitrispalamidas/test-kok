import { notFound } from 'next/navigation';
import { ExamResultsClient } from '@/components/exam/ExamResultsClient';
import { isExamCategory } from '@/lib/constants';

type ExamResultsPageProps = {
  params: Promise<{ kcod: string }>;
};

export default async function ExamResultsPage({
  params,
}: ExamResultsPageProps) {
  const { kcod: kcodParam } = await params;
  const kcod = Number(kcodParam);

  if (!isExamCategory(kcod)) {
    notFound();
  }

  return <ExamResultsClient kcod={kcod} />;
}
