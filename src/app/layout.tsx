import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evalo — GitHub-native evals for AI features",
  description:
    "Every PR that touches your prompts auto-runs your eval suite. See pass/fail and quality regressions before you merge. Built for teams shipping LLM features at the speed of code.",
  openGraph: {
    title: "Evalo — GitHub-native evals for AI features",
    description: "Catch prompt regressions before they ship. Evals on every PR.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
