import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold">Page not found</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        That page doesn&apos;t exist yet. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Back to home
      </Link>
    </div>
  );
}