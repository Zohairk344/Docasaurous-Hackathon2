import React from 'react';
import Link from '@docusaurus/Link';
import { Lock } from 'lucide-react';

export default function Paywall() {
  return (
    <div style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      background: 'rgba(30, 30, 35, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      margin: '2rem 0',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'rgba(255, 87, 87, 0.1)',
        width: '60px', height: '60px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem auto'
      }}>
        <Lock size={30} color="#ff5757" />
      </div>
      
      <h2>Chapter Locked</h2>
      <p style={{ color: '#aaa', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
        This content is part of the full curriculum. Please sign in (it's free!) to access the complete Physical AI textbook and use the AI tutor features.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/login" className="button button--primary button--lg">
          Login to Continue
        </Link>
        <Link to="/login?mode=signup" className="button button--secondary button--lg">
          Create Account
        </Link>
      </div>
    </div>
  );
}