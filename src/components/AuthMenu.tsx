import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const avatarUrl = useMemo(() => {
    return (
      user?.photoURL ||
      user?.providerData.find((profile) => profile.photoURL)?.photoURL ||
      null
    );
  }, [user]);

  const showAvatarImage = Boolean(user && avatarUrl && !avatarFailed);

  const initials = useMemo(() => {
    const label = user?.displayName || user?.email || "Admin";
    return label
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSignIn = async () => {
    await onSignIn();
    setOpen(false);
  };

  const handleSignOut = async () => {
    await onSignOut();
    setOpen(false);
  };

  return (
    <div className="auth-menu" ref={menuRef}>
      <button
        type="button"
        className={`auth-avatar-btn ${user ? "signed-in" : ""}`}
        onClick={() => setOpen((current) => !current)}
        title={user ? "Open account menu" : "Open sign-in menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        {showAvatarImage ? (
          <img
            src={avatarUrl ?? ""}
            alt={user?.displayName ? `${user.displayName} avatar` : "Account avatar"}
            referrerPolicy="no-referrer"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span>{user ? initials || "A" : "?"}</span>
        )}
      </button>

      {open ? (
        <div className="auth-dropdown" id={menuId} role="menu">
          {!configured ? (
            <div className="auth-dropdown-copy" role="status">
              <strong>Firebase not configured</strong>
              <p>Add your Firebase keys in `.env.local` to enable sign-in.</p>
            </div>
          ) : user ? (
            <>
              <div className="auth-dropdown-profile">
                {showAvatarImage ? (
                  <img
                    src={avatarUrl ?? ""}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <span>{initials || "A"}</span>
                )}
              </div>
              <div className="auth-dropdown-copy" role="status">
                <strong>{user.displayName || "Signed in"}</strong>
                <p>{user.email || "Google account connected"}</p>
              </div>
              <button
                type="button"
                className="auth-dropdown-btn secondary"
                onClick={handleSignOut}
                role="menuitem"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="auth-dropdown-copy" role="status">
                <strong>Admin access</strong>
                <p>Sign in with Google to sync saved audio links.</p>
              </div>
              <button
                type="button"
                className="auth-dropdown-btn"
                onClick={handleSignIn}
                disabled={loading}
                role="menuitem"
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
