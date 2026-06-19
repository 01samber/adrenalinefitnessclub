"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingState } from "@/components/ui/LoadingState";

interface AuthGuardProps {
  requiredRole?: "OWNER" | "CLIENT";
  children: React.ReactNode;
}

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.replace("/unauthorized");
    }
  }, [session, status, requiredRole, router]);

  if (status === "loading") {
    return <LoadingState fullScreen message="Verifying session..." />;
  }

  if (!session?.user) {
    return <LoadingState fullScreen message="Redirecting to login..." />;
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return <LoadingState fullScreen message="Checking permissions..." />;
  }

  return <>{children}</>;
}
