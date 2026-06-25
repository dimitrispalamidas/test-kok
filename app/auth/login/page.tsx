import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/server';

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="mb-8">
        <Image
          src="/logo-1.png"
          alt="Ταμπουρεάς Σχολή Οδηγών"
          width={180}
          height={46}
          className="h-12 w-auto"
          priority
        />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-xl">
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
