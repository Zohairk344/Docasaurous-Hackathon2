import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { authClient } from '../lib/auth-client';
import { useHistory, useLocation } from '@docusaurus/router';
import { User, Mail, Lock, Cpu, Code, ArrowRight, Loader2, Check, X } from 'lucide-react'; // Added Check, X
import clsx from 'clsx';
import styles from './login.module.css';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();
  const location = useLocation();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Bonus Fields
  const [softExp, setSoftExp] = useState('');
  const [hardExp, setHardExp] = useState('');

  // Password Validation State
  const [pwdStrength, setPwdStrength] = useState(0);
  const [pwdCriteria, setPwdCriteria] = useState({
    length: false,
    number: false,
    special: false
  });

  // URL Check for "?mode=signup"
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'signup') {
      setIsSignup(true);
    }
  }, [location]);

  // Real-time Password Checker
  useEffect(() => {
    const criteria = {
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPwdCriteria(criteria);

    // Calculate Score (0 to 3)
    let score = 0;
    if (criteria.length) score++;
    if (criteria.number) score++;
    if (criteria.special) score++;
    setPwdStrength(score);

  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-validation for Signup
    if (isSignup && pwdStrength < 3) {
      setError("Please ensure your password meets all security requirements.");
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        await authClient.signUp.email({
          email, password, name,
          softwareExperience: softExp, hardwareExperience: hardExp,
        } as any, {
          onSuccess: () => {
            alert("Account created! You are now logged in.");
            history.push('/');
          },
          onError: (ctx) => setError(ctx.error.message),
        });
      } else {
        await authClient.signIn.email({
          email, password,
        }, {
          onSuccess: () => { history.push('/'); },
          onError: (ctx) => setError(ctx.error.message),
        });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isSignup ? "Join the Crew" : "Pilot Login"} description="Authentication Page">
      <div className={styles.pageBackground}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>{isSignup ? 'Initialize System' : 'Welcome Back, Pilot'}</h1>
            <p>{isSignup ? 'Create your profile to sync with the Neural Network.' : 'Authenticate to access restricted materials.'}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBox}>{error}</div>}

            {isSignup && (
              <div className={styles.inputGroup}>
                <User className={styles.icon} size={18} />
                <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}

            <div className={styles.inputGroup}>
              <Mail className={styles.icon} size={18} />
              <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className={styles.inputGroup}>
              <Lock className={styles.icon} size={18} />
              <input 
                type="password" placeholder="Password" 
                value={password} onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>

            {/* --- PASSWORD STRENGTH METER (Only show on Signup) --- */}
            {isSignup && (
              <div className={styles.pwdMeterContainer}>
                {/* Visual Bar */}
                <div className={styles.strengthTrack}>
                  <div 
                    className={styles.strengthFill} 
                    style={{ 
                      width: `${(pwdStrength / 3) * 100}%`,
                      background: pwdStrength === 1 ? '#ff5757' : pwdStrength === 2 ? '#ffa500' : '#00ff88'
                    }} 
                  />
                </div>
                
                {/* Requirements List */}
                <div className={styles.requirements}>
                  <div className={clsx(styles.reqItem, pwdCriteria.length && styles.reqMet)}>
                    {pwdCriteria.length ? <Check size={12}/> : <div className={styles.dot} />} 
                    At least 8 characters
                  </div>
                  <div className={clsx(styles.reqItem, pwdCriteria.number && styles.reqMet)}>
                    {pwdCriteria.number ? <Check size={12}/> : <div className={styles.dot} />} 
                    Contains a number
                  </div>
                  <div className={clsx(styles.reqItem, pwdCriteria.special && styles.reqMet)}>
                    {pwdCriteria.special ? <Check size={12}/> : <div className={styles.dot} />} 
                    Contains a special char (@$!%*?&)
                  </div>
                </div>
              </div>
            )}

            {isSignup && (
              <div className={styles.bonusSection}>
                <div className={styles.divider}><span>Background Check</span></div>
                <div className={styles.inputGroup}>
                  <Code className={styles.icon} size={18} />
                  <input placeholder="Software Skills (e.g. Python, ROS)" value={softExp} onChange={e => setSoftExp(e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <Cpu className={styles.icon} size={18} />
                  <input placeholder="Hardware Skills (e.g. Jetson, Arduino)" value={hardExp} onChange={e => setHardExp(e.target.value)} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? <Loader2 className={styles.spin} size={20} /> : (isSignup ? 'Register' : 'Connect')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className={styles.cardFooter}>
            {isSignup ? "Already have a connection?" : "Need clearance?"}
            <button onClick={() => setIsSignup(!isSignup)} className={styles.toggleBtn}>
              {isSignup ? "Login Here" : "Register Now"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}