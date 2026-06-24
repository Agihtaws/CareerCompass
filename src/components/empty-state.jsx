export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      {Icon ? (
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="h-7 w-7" />
        </span>
      ) : null}
      <h2 className="mt-5 font-display text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}