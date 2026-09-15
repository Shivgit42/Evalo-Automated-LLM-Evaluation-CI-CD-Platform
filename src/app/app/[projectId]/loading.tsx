export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-48 bg-[color:var(--color-surface-2)] rounded-lg" />
      <div className="h-4 w-72 bg-[color:var(--color-surface-2)] rounded" />
      <div className="h-4 w-64 bg-[color:var(--color-surface-2)] rounded" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-[color:var(--color-surface-2)] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
