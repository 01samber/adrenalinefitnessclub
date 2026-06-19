"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";

export default function UnauthorizedPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingState fullScreen message="Loading..." />;
  }

  const homeHref = !session?.user
    ? "/login"
    : session.user.role === "OWNER"
      ? "/owner/dashboard"
      : session.user.role === "CLIENT"
        ? "/client/dashboard"
        : "/login";

  const homeLabel = !session?.user
    ? "Go to login"
    : session.user.role === "OWNER"
      ? "Go to owner dashboard"
      : session.user.role === "CLIENT"
        ? "Go to client dashboard"
        : "Go to login";

  return (
    <div className="afc-gradient-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="afc-gradient-border w-full max-w-md">
        <Card
          accent="red"
          variant="elevated"
          className="rounded-[1.125rem] text-center"
          padding="lg"
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-afc-red/35 bg-afc-red/10 text-2xl"
            aria-hidden
          >
            ⛔
          </div>
          <h1 className="text-2xl font-bold text-afc-white">Access denied</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-afc-soft-grey">
            You do not have permission to access this page.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={homeHref} className="w-full sm:w-auto">
              <Button fullWidth className="sm:min-w-[200px]">
                {homeLabel}
              </Button>
            </Link>
            {session?.user ? (
              <LogoutButton variant="secondary" className="w-full sm:w-auto" />
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
