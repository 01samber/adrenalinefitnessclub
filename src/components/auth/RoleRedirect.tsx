"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingState } from "@/components/ui/LoadingState";

export function RoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (session.user.role === "OWNER") {
      router.replace("/owner/dashboard");
      return;
    }

    if (session.user.role === "CLIENT") {
      router.replace("/client/dashboard");
      return;
    }

    router.replace("/unauthorized");
  }, [session, status, router]);

  return <LoadingState fullScreen message="Redirecting..." />;
}
