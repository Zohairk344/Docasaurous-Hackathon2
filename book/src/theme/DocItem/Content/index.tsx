import React from 'react';
import Content from '@theme-original/DocItem/Content';
import { useLocation } from '@docusaurus/router';
import { authClient } from '@site/src/lib/auth-client';
import Paywall from '@site/src/components/Paywall';

export default function ContentWrapper(props) {
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();

  // DEBUG: Open your browser console (F12) to see this
  console.log("Paywall Check:", { path: location.pathname, loggedIn: !!session });

  // 1. Define Free Pages
  // Check if we are on the Intro page OR the root docs path
  const currentPath = location.pathname.toLowerCase();
  const isIntroPage = 
    currentPath.endsWith('/intro') || 
    currentPath === '/docs' || 
    currentPath === '/docs/';

  // 2. Loading State
  if (isPending) return null;

  // 3. Access Granted (Logged in OR Intro page)
  if (session || isIntroPage) {
    return (
      <div className="access-granted-wrapper">
        <Content {...props} />
      </div>
    );
  }

  // 4. Access Denied (Guest on locked page)
  return (
    <div style={{ border: '5px solid red' }}> {/* VISUAL DEBUGGER */}
      <Paywall />
    </div>
  );
}