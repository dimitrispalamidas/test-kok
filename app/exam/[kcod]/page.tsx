import { notFound } from 'next/navigation';
import { generateExam } from '@/actions/exam';
import { ExamClient } from '@/components/exam/ExamClient';
import { isExamCategory } from '@/lib/constants';

type ExamPageProps = {
  params: Promise<{ kcod: string }>;
};

export default async function ExamPage({ params }: ExamPageProps) {
  const { kcod: kcodParam } = await params;
  const kcod = Number(kcodParam);

  if (!isExamCategory(kcod)) {
    notFound();
  }

  let exam;
  try {
    exam = await generateExam(kcod);
  } catch {
    notFound();
  }

  return <ExamClient category={exam.category} questions={exam.questions} />;
}
