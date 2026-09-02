import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useCase } from "../../state/CaseContext";
import { useI18n } from "../../i18n";
import { Card, Spinner, Button } from "../../components/ui";
import type { ProfileSummary } from "../../types/models";

export function LoginScreen() {
  const { selectProfile, profileId } = useCase();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profileId) { navigate("/dashboard", { replace: true }); return; }
    api.profiles().then((res) => {
      if (res.data) setProfiles(res.data);
      else setError(res.error ?? "Could not load profiles");
      setLoading(false);
    });
  }, [profileId, navigate]);

  const choose = async (id: string) => {
    await selectProfile(id);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-brand-dark mb-1">{t("app.title")}</h1>
        <p className="text-slate-500 mb-6">{t("login.title")}</p>
        {loading && <Spinner label={t("common.loading")} />}
        {error && (
          <Card>
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <Button onClick={() => location.reload()}>{t("common.retry")}</Button>
          </Card>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {profiles.map((p) => (
            <button
              key={p.profileId}
              data-testid={`login-profile-${p.profileId}`}
              onClick={() => choose(p.profileId)}
              className="text-left rounded-xl bg-white border border-slate-100 shadow-sm p-4 hover:border-brand transition"
            >
              <div className="font-medium text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">{p.youthType}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
