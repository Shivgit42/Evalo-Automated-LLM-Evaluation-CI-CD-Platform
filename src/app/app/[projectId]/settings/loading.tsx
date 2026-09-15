export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-32 bg-[color:var(--color-surface-2)] rounded-lg" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 p-4 border border-[color:var(--color-border)] rounded-lg">
          <div className="h-4 w-40 bg-[color:var(--color-surface-2)] rounded" />
          <div className="h-3 w-64 bg-[color:var(--color-surface-2)] rounded" />
          <div className="h-8 w-32 bg-[color:var(--color-surface-2)] rounded-md mt-3" />
        </div>
      ))}
    </div>
  );
}
