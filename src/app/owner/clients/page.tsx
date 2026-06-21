"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ClientStatusActions } from "@/components/owner/ClientStatusActions";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/DataRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import { Select } from "@/components/ui/Select";
import { ApiClientError, apiGet } from "@/lib/api-client";
import { ownerSidebarItems } from "@/lib/owner-sidebar";
import type {
  ClientListStatusFilter,
  OwnerClientListItem,
  OwnerClientsData,
} from "@/types/api";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

const STATUS_OPTIONS: { value: ClientListStatusFilter; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "FROZEN", label: "Frozen" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DELETED", label: "Deleted" },
];

function toApiStatus(status: ClientListStatusFilter): string | undefined {
  if (!status) return undefined;
  if (status === "INACTIVE") return "SUSPENDED";
  return status;
}

function buildClientsUrl(
  page: number,
  search: string,
  status: ClientListStatusFilter,
): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }

  const apiStatus = toApiStatus(status);
  if (apiStatus) {
    params.set("status", apiStatus);
  }

  return `/api/owner/clients?${params.toString()}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function displayUserStatus(status: string) {
  if (status === "SUSPENDED") return "INACTIVE";
  return status;
}

function statusBadgeVariant(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "FROZEN":
      return "warning";
    case "DELETED":
      return "danger";
    default:
      return "neutral";
  }
}

function countByStatus(items: OwnerClientListItem[], status: string) {
  return items.filter((item) => item.user.status === status).length;
}

function ClientsTableSkeleton() {
  return (
    <div className="hidden xl:block">
      <div className="afc-surface afc-roster-board">
        <div className="afc-roster-scroll">
          <div className="animate-pulse space-y-0 min-w-[1120px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex gap-4 border-b border-afc-border-grey/50 px-5 py-4 last:border-b-0"
            >
              <div className="h-4 w-32 rounded bg-afc-border-grey/40" />
              <div className="h-4 w-24 rounded bg-afc-border-grey/30" />
              <div className="h-4 w-16 rounded bg-afc-border-grey/30" />
              <div className="h-4 w-28 rounded bg-afc-border-grey/30" />
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientCardsSkeleton() {
  return (
    <div className="space-y-4 xl:hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="afc-surface animate-pulse p-5">
          <div className="mb-3 h-5 w-40 rounded bg-afc-border-grey/40" />
          <div className="mb-2 h-4 w-56 rounded bg-afc-border-grey/30" />
          <div className="h-4 w-32 rounded bg-afc-border-grey/30" />
        </div>
      ))}
    </div>
  );
}

interface ClientRowProps {
  client: OwnerClientListItem;
}

function ClientMobileCard({
  client,
  onStatusChanged,
}: ClientRowProps & { onStatusChanged: (message: string) => void }) {
  const { user, profile, assignedPlan } = client;
  const planName = assignedPlan?.name ?? "No plan assigned";

  return (
    <article className="afc-squad-card afc-surface--hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-afc-white">
            {user.fullName}
          </h3>
          <p className="mt-1 truncate text-sm text-afc-soft-grey">{user.email}</p>
        </div>
        <Badge variant={statusBadgeVariant(user.status)}>
          {displayUserStatus(user.status)}
        </Badge>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-afc-soft-grey">Phone</dt>
          <dd className="text-right font-medium text-afc-white">
            {user.phoneNumber ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-afc-soft-grey">Plan</dt>
          <dd className="max-w-[55%] truncate text-right font-medium text-afc-white">
            {planName}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-afc-soft-grey">Subscription</dt>
          <dd>
            <Badge variant="neutral">No data</Badge>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-afc-soft-grey">Latest payment</dt>
          <dd>
            <Badge variant="neutral">No data</Badge>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-afc-soft-grey">Latest measurement</dt>
          <dd>
            <Badge variant="neutral">No data</Badge>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-afc-soft-grey">Joined</dt>
          <dd className="font-medium text-afc-white">
            {formatDate(profile?.joinDate)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-afc-border-grey/60 pt-4">
        <ClientStatusActions
          clientId={user.id}
          clientName={user.fullName}
          userStatus={user.status}
          onStatusChanged={onStatusChanged}
        />
      </div>
    </article>
  );
}

function ClientDesktopRow({
  client,
  onStatusChanged,
}: ClientRowProps & { onStatusChanged: (message: string) => void }) {
  const { user, profile, assignedPlan } = client;
  const planName = assignedPlan?.name ?? "—";

  return (
    <tr className="afc-roster-row border-b border-afc-border-grey/50 last:border-b-0">
      <td className="px-5 py-4">
        <div className="min-w-0">
          <p className="font-semibold text-afc-white">{user.fullName}</p>
          <p className="mt-0.5 truncate text-sm text-afc-soft-grey">
            {user.email}
          </p>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-afc-light-grey">
        {user.phoneNumber ?? "—"}
      </td>
      <td className="px-4 py-4">
        <Badge variant={statusBadgeVariant(user.status)}>
          {displayUserStatus(user.status)}
        </Badge>
      </td>
      <td className="max-w-[10rem] px-4 py-4 text-sm text-afc-light-grey">
        <span className="line-clamp-2">{planName}</span>
      </td>
      <td className="px-4 py-4">
        <Badge variant="neutral">No data</Badge>
      </td>
      <td className="px-4 py-4">
        <Badge variant="neutral">No data</Badge>
      </td>
      <td className="px-4 py-4">
        <Badge variant="neutral">No data</Badge>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-afc-soft-grey">
        {formatDate(profile?.joinDate)}
      </td>
      <td className="afc-roster-actions whitespace-nowrap px-4 py-4">
        <ClientStatusActions
          clientId={user.id}
          clientName={user.fullName}
          userStatus={user.status}
          layout="inline"
          onStatusChanged={onStatusChanged}
        />
      </td>
    </tr>
  );
}

function ClientsContent() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientListStatusFilter>("");
  const [data, setData] = useState<OwnerClientsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchClients() {
      setError("");
      setLoading(true);

      try {
        const result = await apiGet<OwnerClientsData>(
          buildClientsUrl(page, debouncedSearch, statusFilter),
        );
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiClientError && err.status === 401) {
            setError("Session expired. Please sign in again.");
          } else if (err instanceof ApiClientError && err.status === 403) {
            setError("You do not have permission to view clients.");
          } else {
            setError(
              err instanceof Error ? err.message : "Failed to load clients.",
            );
          }
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchClients();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, statusFilter, reloadKey]);

  const handleStatusChanged = (message: string) => {
    setSuccessMessage(message);
    setReloadKey((key) => key + 1);
  };

  const handleRefresh = () => {
    setReloadKey((key) => key + 1);
  };

  const handleStatusChange = (value: ClientListStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("");
    setPage(1);
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const activeOnPage = countByStatus(items, "ACTIVE");
  const frozenOnPage = countByStatus(items, "FROZEN");

  const hasFilters = Boolean(debouncedSearch.trim() || statusFilter);
  const showingLabel = pagination
    ? `${items.length} of ${pagination.total}`
    : "—";

  const canGoPrevious = (pagination?.page ?? 1) > 1;
  const canGoNext =
    pagination != null &&
    pagination.totalPages > 0 &&
    pagination.page < pagination.totalPages;

  return (
    <AppShell
      title="Squad Management"
      subtitle="Manage athletes, memberships, and training progress."
      sidebarItems={ownerSidebarItems}
      brandSubtitle="Coach Mode"
    >
      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="afc-glass inline-flex w-fit items-center gap-2 rounded-full border border-afc-border-grey/80 px-3 py-1.5">
            <span className="afc-status-pulse shrink-0" aria-hidden />
            <span className="text-xs text-afc-soft-grey">
              Live data ·{" "}
              <code className="font-mono text-afc-green">GET /api/owner/clients</code>
            </span>
          </div>
        </div>

        {successMessage ? (
          <div
            className="rounded-xl border border-afc-green/40 bg-afc-green/10 px-4 py-3 text-sm text-afc-green-neon"
            role="status"
          >
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Squad size"
            value={pagination?.total ?? 0}
            hint={hasFilters ? "Matching scout filters" : "Full roster"}
            accent="accent"
            loading={loading && !data}
          />
          <StatCard
            label="Active athletes"
            value={activeOnPage}
            hint="On current page"
            accent="success"
            loading={loading && !data}
          />
          <StatCard
            label="Frozen roster"
            value={frozenOnPage}
            hint="On current page"
            accent="danger"
            loading={loading && !data}
          />
          <StatCard
            label="Scout results"
            value={showingLabel}
            hint={
              pagination
                ? `Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`
                : undefined
            }
            accent="neutral"
            loading={loading && !data}
          />
        </div>

        <div className="afc-surface p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="client-search"
                  className="text-sm font-medium text-afc-light-grey"
                >
                  Search squad
                </label>
                <input
                  id="client-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Name, email, or phone"
                  className="min-h-[44px] w-full rounded-xl border border-afc-border-grey bg-afc-black/40 px-4 py-2.5 text-sm text-afc-white placeholder:text-afc-soft-grey/50 focus:border-afc-red focus:outline-none focus:ring-2 focus:ring-afc-red/25"
                />
              </div>

              <Select
                id="client-status"
                label="Status"
                value={statusFilter}
                onChange={(value) =>
                  handleStatusChange(value as ClientListStatusFilter)
                }
                options={STATUS_OPTIONS}
                usePlaceholderOption={false}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
              <Link href="/owner/clients/new">
                <Button type="button" variant="primary" size="md">
                  Add Client
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={handleRefresh} />
        ) : loading && !data ? (
          <>
            <ClientsTableSkeleton />
            <ClientCardsSkeleton />
          </>
        ) : items.length === 0 ? (
          <EmptyState
            message={
              hasFilters
                ? "No clients found. Try clearing your search or status filter."
                : "No clients found in the system yet."
            }
          />
        ) : (
          <>
            <div className="hidden xl:block">
              <div className="afc-surface afc-roster-board">
                <p className="afc-roster-scroll-hint 2xl:hidden">
                  Scroll sideways to view all roster details
                </p>
                <div
                  className="afc-roster-scroll afc-scrollbar"
                  tabIndex={0}
                  role="region"
                  aria-label="Squad roster table — scroll horizontally for all columns"
                >
                  <table className="afc-roster-table">
                    <thead>
                      <tr className="border-b border-afc-border-grey/70 bg-afc-black/30">
                        <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Client
                        </th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Phone
                        </th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Status
                        </th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Assigned plan
                        </th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Active subscription
                        </th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Latest payment
                        </th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Latest measurement
                        </th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Join date
                        </th>
                        <th className="afc-roster-actions-head px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((client) => (
                        <ClientDesktopRow
                          key={client.user.id}
                          client={client}
                          onStatusChanged={handleStatusChanged}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4 xl:hidden">
              {items.map((client) => (
                <ClientMobileCard
                  key={client.user.id}
                  client={client}
                  onStatusChanged={handleStatusChanged}
                />
              ))}
            </div>
          </>
        )}

        {!error && pagination && pagination.total > 0 ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-afc-soft-grey">
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)} ·{" "}
              {pagination.total} total
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={!canGoPrevious || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={!canGoNext || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}

        {!error && hasFilters && items.length === 0 && !loading ? (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

export default function OwnerClientsPage() {
  return (
    <AuthGuard requiredRole="OWNER">
      <ClientsContent />
    </AuthGuard>
  );
}
