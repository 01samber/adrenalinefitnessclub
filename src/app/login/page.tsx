"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      setPassword("");

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      const session = await getSession();

      if (!session?.user?.role) {
        router.push("/unauthorized");
        return;
      }

      if (session.user.role === "OWNER") {
        router.push("/owner/dashboard");
        return;
      }

      if (session.user.role === "CLIENT") {
        router.push("/client/dashboard");
        return;
      }

      router.push("/unauthorized");
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="afc-gradient-bg relative flex min-h-screen flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-afc-red/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-afc-green/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-px w-[min(90%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-afc-red/30 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        <section className="hidden flex-1 flex-col justify-center px-10 py-16 xl:px-20 xl:py-24 lg:flex">
          <div className="max-w-xl">
            <div className="relative mb-10 inline-flex h-[4.5rem] w-[4.5rem] items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-afc-red via-afc-red-dark to-afc-panel-grey" />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-afc-green shadow-[0_0_12px_var(--afc-green-glow)]" />
              <span className="relative text-base font-black tracking-tight text-afc-white">
                AFC
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-afc-white xl:text-5xl">
              Adrenaline Fitness Center
            </h1>
            <p className="mt-5 text-xl font-medium text-afc-light-grey">
              Your training business, organized with precision.
            </p>
            <p className="mt-4 text-base leading-relaxed text-afc-soft-grey">
              Manage clients, bookings, payments, and performance from one
              focused system built for coaches who demand clarity.
            </p>
            <div className="mt-12 grid gap-3">
              <div className="afc-glass flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-afc-soft-grey">
                <span className="afc-status-pulse shrink-0" aria-hidden />
                Live backend · Neon PostgreSQL
              </div>
              <div className="flex items-center gap-3 text-sm text-afc-soft-grey">
                <span className="h-2 w-2 rounded-full bg-afc-red shadow-[0_0_8px_var(--afc-red-glow)]" />
                Performance cockpit for owners & athletes
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-afc-red to-afc-red-dark" />
                <span className="relative text-xs font-black text-afc-white">AFC</span>
              </div>
              <h1 className="text-2xl font-bold text-afc-white">
                Adrenaline Fitness Center
              </h1>
              <p className="mt-2 text-sm text-afc-soft-grey">
                Your training business, organized with precision.
              </p>
            </div>

            <div className="afc-gradient-border">
              <Card
                accent="red"
                variant="elevated"
                title="Sign in"
                subtitle="Owner or client dashboard access"
                className="rounded-[1.125rem] border-0 shadow-none"
              >
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@afc.com"
                    disabled={loading}
                  />
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                  />

                  {error ? (
                    <p
                      className="rounded-xl border border-afc-red/40 bg-afc-red/10 px-4 py-3 text-sm text-red-300"
                      role="alert"
                    >
                      {error}
                    </p>
                  ) : null}

                  <Button type="submit" fullWidth loading={loading} size="lg">
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Card>
            </div>

            <Card
              padding="sm"
              variant="glass"
              accent="neutral"
              className="mt-4"
              title="Local test accounts"
              subtitle="Development environment only"
            >
              <ul className="space-y-2.5 text-xs text-afc-soft-grey">
                <li className="grid grid-cols-[4rem_1fr] gap-2 border-b border-afc-border-grey/50 pb-2">
                  <span className="font-medium text-afc-light-grey">Owner</span>
                  <span className="text-right">anwargreige@afc.com / 1234</span>
                </li>
                <li className="grid grid-cols-[4rem_1fr] gap-2 border-b border-afc-border-grey/50 pb-2">
                  <span className="font-medium text-afc-light-grey">Admin</span>
                  <span className="text-right">admin@afc.com / 1234</span>
                </li>
                <li className="grid grid-cols-[4rem_1fr] gap-2">
                  <span className="font-medium text-afc-light-grey">Client</span>
                  <span className="text-right">client@afc.com / 1234</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
