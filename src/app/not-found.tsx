import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-7xl font-semibold gradient-text">404</div>
        <div className="text-lg mt-4">This page doesn&apos;t exist.</div>
        <Link href="/" className="btn btn-brand mt-8 inline-flex">
          Go home
        </Link>
      </div>
    </div>
  );
}
