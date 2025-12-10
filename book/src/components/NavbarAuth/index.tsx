import React from 'react';
import Link from '@docusaurus/Link';
import { authClient } from '../../lib/auth-client'; // Adjust path if needed
import { LogOut, User } from 'lucide-react';
import styles from './styles.module.css'; // We'll create this next

export default function NavbarAuth() {
  // 1. Check if user is logged in
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload(); // Refresh page to reset state
        },
      },
    });
  };

  // 2. Loading State (optional, keep it simple)
  if (isPending) return null;

  // 3. LOGGED IN STATE
  if (session) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.userInfo}>
          <User size={16} className={styles.icon} />
          <span className={styles.userName}>{session.user.name}</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  // 4. LOGGED OUT STATE
  return (
    <Link to="/login" className="button button--secondary button--sm">
      Login / Signup
    </Link>
  );
}