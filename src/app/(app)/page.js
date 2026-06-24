import Link from "next/link";
import { navItems } from "@/lib/nav";

const features = navItems.filter((item) => item.href !== "/");

export default function DashboardPage() {
  return (
    <div>
      <section className="mb-10">
        <p className="animate-fade-up text-sm font-medium uppercase tracking-[0.2em] text-accent">
          For students, by students
        </p>
        <h1
          className="animate-fade-up mt-3 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          style={{ animationDelay: "60ms" }}
        >
          Don&apos;t fear your future.{" "}
          <span className="text-primary">Build it.</span>
        </h1>
        <p
          className="animate-fade-up mt-4 max-w-xl text-muted-foreground"
          style={{ animationDelay: "120ms" }}
        >
          Pick a place to start. Everything you need to explore careers, learn
          skills, build a resume, and practice with confidence is right here.
        </p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="animate-fade-up group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ animationDelay: `${180 + i * 60}ms` }}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">
                {item.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
