import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Evalo — LLM Eval CI/CD",
    template: "%s · Evalo",
  },
  description:
    "Every PR that touches your prompts auto-runs your eval suite. See pass/fail and quality regressions before you merge. Built for teams shipping LLM features at the speed of code.",
  keywords: ["LLM evaluation", "AI testing", "prompt regression", "CI/CD", "GitHub Actions"],
  authors: [{ name: "Evalo" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.jpg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Evalo — LLM Eval CI/CD",
    description: "Catch prompt regressions before they ship. Evals on every PR.",
    type: "website",
    images: [{ url: "/logo.jpg", width: 1024, height: 1024, alt: "Evalo" }],
  },
  twitter: {
    card: "summary",
    title: "Evalo — LLM Eval CI/CD",
    description: "Catch prompt regressions before they ship. Evals on every PR.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
