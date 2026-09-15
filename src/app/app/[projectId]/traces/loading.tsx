export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-40 bg-[color:var(--color-surface-2)] rounded-lg" />
      <div className="h-4 w-56 bg-[color:var(--color-surface-2)] rounded" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-[color:var(--color-surface-2)] rounded-md" />
        ))}
      </div>
    </div>
  );
}
