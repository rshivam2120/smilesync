import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Suspense fallback={<p className="text-center text-sm text-slate-500">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
