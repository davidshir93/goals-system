import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { ActionMenu } from "./ActionMenu";
import { LogoutIcon } from "./icons";

/* The avatar in the top bar: who you're signed in as, and Log out. */

const initialsOf = (name?: string | null, email?: string | null) => {
  const fromName = (name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  return (fromName || (email ?? "?").slice(0, 2)).toUpperCase();
};

export function AccountMenu() {
  const { t } = useTranslation();
  const { user, logOut } = useAuth();
  if (!user) return null;
  return (
    <ActionMenu
      label={t("nav.account")}
      triggerContent={initialsOf(user.displayName, user.email)}
      triggerClassName="type-caption-strong size-8 text-[var(--text-primary)]"
      triggerStyle={{ background: "var(--category-cobalt-bg)" }}
      header={<p className="type-caption truncate px-3 py-2 text-[var(--text-muted)]">{user.email}</p>}
      items={[{ label: t("nav.logout"), icon: <LogoutIcon className="rtl-flip" />, onSelect: () => void logOut() }]}
    />
  );
}
