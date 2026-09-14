import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <div className="text-lg font-medium">Dataset not found</div>
      <div className="text-sm text-[color:var(--color-text-dim)] mt-2">
        It may have been deleted or you don&apos;t have access.
      </div>
      <Link href="/app" className="btn btn-secondary mt-6 inline-flex">
        Back to projects
      </Link>
    </div>
  );
}
