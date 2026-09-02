// LC-F5 DegradedBanner — non-blocking banner when AI is unavailable (US-10.2).
import { useCase } from "../state/CaseContext";
import { useI18n } from "../i18n";

export function DegradedBanner() {
  const { degraded } = useCase();
  const { t } = useI18n();
  if (!degraded) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm px-4 py-2" role="status" data-testid="degraded-banner">
      {t("degraded.message")}
    </div>
  );
}
