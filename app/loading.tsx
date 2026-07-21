import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export default async function Loading() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="container narrow">
      <p className="hint">{t.error.loading}</p>
    </main>
  );
}
