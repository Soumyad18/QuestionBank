import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Interview Question Bank",
  description: "Question Intelligence System for interview preparation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
