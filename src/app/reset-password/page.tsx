import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}