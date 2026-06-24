export function PageHeader({ title, description, icon: Icon }) {
  return (
    <div className="mb-8 print:hidden">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="h-6 w-6" />
          </span>
        ) : null}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
      </div>
      {description ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}