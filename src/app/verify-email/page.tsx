import { Suspense } from 'react';
import VerifyEmailForm from './VerifyEmailForm';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}