import { useMemo, useState } from "react";
import type { User } from "firebase/auth";

type Props = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
};

function AuthMenu({
  configured,
  loading,
  user,
  error,
  onSignIn,
  onSignOut,
}: Props) {
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => {
    const label = user?.displayName || user?.email || "Admin";
    return label
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user]);

  return (
    <div className="auth-menu">
      <button
        type="button"
        className={`auth-avatar-btn ${user ? "signed-in" : ""}`}
        onClick={() => setOpen((current) => !current)}
        title={user ? "Open account menu" : "Open sign-in menu"}
      >
        <span>{user ? initials || "A" : "?"}</span>
      </button>

      {open ? (
        <div className="auth-dropdown">
          {!configured ? (
            <div className="auth-dropdown-copy">
              <strong>Firebase not configured</strong>
              <p>Add your Firebase keys in `.env.local` to enable sign-in.</p>
            </div>
          ) : user ? (
            <>
              <div className="auth-dropdown-copy">
                <strong>{user.displayName || "Signed in"}</strong>
                <p>{user.email || "Google account connected"}</p>
              </div>
              <button
                type="button"
                className="auth-dropdown-btn secondary"
                onClick={onSignOut}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="auth-dropdown-copy">
                <strong>Admin access</strong>
                <p>Sign in with Google to sync saved audio links.</p>
              </div>
              <button
                type="button"
                className="auth-dropdown-btn"
                onClick={onSignIn}
                disabled={loading}
              >
                {loading ? "Opening..." : "Continue With Google"}
              </button>
            </>
          )}

          {error ? <p className="auth-dropdown-error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export default AuthMenu;
