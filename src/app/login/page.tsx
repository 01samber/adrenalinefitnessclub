"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoginGymBackdrop } from "@/components/login/LoginGymBackdrop";
import { resolveLoginErrorMessage } from "@/lib/login-errors";

function LoginLogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`afc-login-logo relative inline-flex h-[4.5rem] w-[4.5rem] items-center justify-center ${className}`}
    >
      <div
        className="afc-login-logo__plate absolute inset-0 rounded-lg bg-gradient-to-br from-afc-gold-hot via-afc-gold to-afc-panel-2"
        aria-hidden
      />
      <div
        className="afc-login-logo__pin absolute -right-1 -top-1 h-3 w-3 rounded-full bg-afc-green-neon shadow-[0_0_12px_var(--afc-green-glow)]"
        aria-hidden
      />
      <span className="afc-display relative text-lg font-bold text-afc-black">AFC</span>
    </div>
  );
}

function KickerReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");

  return (
    <p className={`afc-login-kicker-reveal ${className}`}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="afc-login-kicker-word"
          style={{ animationDelay: `${220 + index * 90}ms` }}
        >
          {word}
          {index < words.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </p>
  );
}

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

      if (!result?.ok) {
        setError(
          resolveLoginErrorMessage({
            error: result?.error,
            url: result?.url,
          }),
        );
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
    <div className="afc-login-page afc-gradient-bg relative flex min-h-screen min-h-[100dvh] flex-col overflow-hidden">
      <div className="afc-login-glow afc-login-glow--gold" aria-hidden />
      <div className="afc-login-glow afc-login-glow--green" aria-hidden />

      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        <section className="afc-login-hero hidden flex-1 lg:flex">
          <LoginGymBackdrop variant="hero" />

          <div className="afc-login-hero__content">
            <div
              className="afc-animate-enter"
              style={{ animationDelay: "80ms" }}
            >
              <LoginLogoMark />
            </div>

            <h1
              className="afc-display afc-login-headline-reveal text-4xl font-bold leading-[1.05] tracking-tight text-afc-white xl:text-5xl"
              style={{ animationDelay: "140ms" }}
            >
              Adrenaline Fitness Center
            </h1>

            <KickerReveal
              text="Train with intent."
              className="afc-display mt-5 text-xl font-semibold tracking-wide text-afc-gold"
            />

            <p
              className="afc-animate-enter mt-4 max-w-lg text-base leading-relaxed text-afc-muted"
              style={{ animationDelay: "300ms" }}
            >
              The club operating system for coaches who track every rep, every
              payment, and every athlete in one weight-room-grade command center.
            </p>

            <div
              className="afc-login-hero__lane afc-animate-enter mt-10"
              style={{ animationDelay: "380ms" }}
            >
              <p className="afc-login-hero__lane-kicker">Iron Lanes</p>
              <p className="afc-login-hero__lane-copy">
                One lane for owners. One lane for athletes. Every session logged,
                every roster move tracked.
              </p>
            </div>
          </div>
        </section>

        <section className="afc-login-form-col relative flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
            <LoginGymBackdrop variant="mobile" />
          </div>

          <div className="relative z-10 w-full max-w-md">
            <div className="afc-login-mobile-brand mb-6 text-center lg:hidden">
              <div
                className="afc-animate-enter mx-auto w-fit"
                style={{ animationDelay: "80ms" }}
              >
                <LoginLogoMark className="!h-14 !w-14 [&_.afc-display]:text-sm" />
              </div>
              <h1
                className="afc-display afc-login-headline-reveal mt-4 text-2xl font-bold tracking-tight text-afc-white"
                style={{ animationDelay: "140ms" }}
              >
                Adrenaline Fitness Center
              </h1>
              <KickerReveal
                text="Train with intent."
                className="afc-display mt-2 text-sm font-semibold text-afc-gold"
              />
            </div>

            <div
              className="afc-animate-enter"
              style={{ animationDelay: "280ms" }}
            >
              <div className="afc-gradient-border">
                <Card
                  accent="neutral"
                  variant="elevated"
                  title="Club access"
                  subtitle="Coach or athlete sign-in"
                  className="rounded-xl border-0 shadow-none"
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

                    <Button
                      type="submit"
                      fullWidth
                      loading={loading}
                      size="lg"
                      className="afc-login-submit"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </Card>
              </div>
            </div>

            {process.env.NODE_ENV === "development" ? (
              <details
                className="afc-login-dev afc-animate-enter mt-6"
                style={{ animationDelay: "360ms" }}
              >
                <summary className="afc-login-dev__summary">
                  <span className="afc-login-dev__badge">Dev only</span>
                  <span className="afc-login-dev__label">Local test accounts</span>
                </summary>
                <div className="afc-login-dev__body">
                  <p className="afc-login-dev__hint">
                    Development environment — never shown in production builds.
                  </p>
                  <ul className="afc-login-dev__list">
                    <li>
                      <span>Owner</span>
                      <code>anwargreige@afc.com / 1234</code>
                    </li>
                    <li>
                      <span>Admin</span>
                      <code>admin@afc.com / 1234</code>
                    </li>
                    <li>
                      <span>Client</span>
                      <code>client@afc.com / 1234</code>
                    </li>
                  </ul>
                </div>
              </details>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
