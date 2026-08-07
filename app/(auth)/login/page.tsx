import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      description="Access your KDP BookForge AI dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium underline">
            Create one
          </Link>
          <div className="mt-2">
            <Link href="/forgot-password" className="underline">
              Forgot password?
            </Link>
          </div>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
