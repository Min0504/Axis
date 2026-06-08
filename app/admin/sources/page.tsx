import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdminProductSourceReviewer from "@/components/admin-product-source-reviewer";

export const metadata: Metadata = { title: "Product Sources — Axis Admin" };

export default function AdminSourcesPage() {
  if (process.env.AXIS_ADMIN !== "1") notFound();

  return (
    <main className="container narrow">
      <p className="back-link">
        <Link href="/">← 홈으로</Link>
      </p>

      <section className="result-card admin-hero">
        <p className="label">Axis Admin</p>
        <h1>AI 공식 스펙 추출 점검</h1>
        <p className="result-conclusion">
          registry에 등록된 국가별 공식/수입처 페이지를 AI가 읽어 스펙을 추출하는지 확인합니다. 스펙은 DB에서 꺼내지 않습니다.
        </p>
      </section>

      <AdminProductSourceReviewer />
    </main>
  );
}
