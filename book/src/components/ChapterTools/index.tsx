import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Sparkles, Languages, RefreshCw, X, ArrowLeft, BookOpen, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useHistory } from '@docusaurus/router';
import { authClient } from '../../lib/auth-client'; // Ensure this path matches your project structure
import styles from './styles.module.css';

export default function ChapterTools() {
  const [loading, setLoading] = useState<'personalize' | 'translate' | null>(null);
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [mode, setMode] = useState<'beginner' | 'urdu' | null>(null);
  
  // AUTH CHECK: Check if user is logged in
  const { data: session } = authClient.useSession();
  const history = useHistory();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. SMART CONTENT READING
  const getPageContent = () => {
    // Grab the main container Docusaurus uses
    const contentElement = document.querySelector('.markdown') || document.querySelector('article');
    if (!contentElement) return '';

    // Create a copy so we don't mess up the actual page
    const clone = contentElement.cloneNode(true) as HTMLElement;

    // FIND AND REMOVE OURSELVES FROM THE CLONE
    // We search by the specific ID we assigned to the wrapper
    const toolbar = clone.querySelector('#chapter-tools-container');
    if (toolbar) {
        toolbar.remove();
    } else {
        // Fallback: remove by class name if ID lookup fails
        const toolbarByClass = clone.querySelector(`.${styles.wrapper}`);
        if (toolbarByClass) toolbarByClass.remove();
    }

    // Also remove any previous AI results to prevent "double generation"
    const oldResults = clone.querySelector('#ai-content-result');
    if (oldResults) oldResults.remove();

    // Clean up text
    return (clone.innerText || '').trim();
  };

  // 2. SAFE REPLACEMENT LOGIC
  useEffect(() => {
    if (!containerRef.current) return;

    // We get the immediate parent (usually the Markdown wrapper div)
    const parent = containerRef.current.parentElement;
    if (!parent) return;

    const siblings = Array.from(parent.children) as HTMLElement[];

    if (activeContent) {
      // HIDE everything that is NOT our toolbar
      siblings.forEach(child => {
        if (child !== containerRef.current) {
          child.style.display = 'none';
        }
      });
    } else {
      // RESTORE everything
      siblings.forEach(child => {
        child.style.display = '';
      });
    }

    // Cleanup when component unmounts
    return () => {
      siblings.forEach(child => child.style.display = '');
    };
  }, [activeContent]);

  const handleAction = async (action: 'personalize' | 'translate') => {
    // --- NEW: AUTH GUARD ---
    if (!session) {
      if (confirm("You must be logged in to use AI features. Would you like to login now?")) {
        history.push('/login');
      }
      return;
    }
    // -----------------------

    if (loading) return;

    const text = getPageContent();
    
    // Safety check: ensure we actually grabbed text
    if (!text || text.length < 20) {
      alert("Page content seems too short or empty. Please ensure you are on a chapter page.");
      return;
    }

    setLoading(action);
    setMode(null);
    setActiveContent(null);

    try {
      const endpoint = action === 'personalize' 
        ? 'https://renewed-courtesy-production.up.railway.app/api/rag/personalize'
        : 'https://renewed-courtesy-production.up.railway.app/api/rag/translate';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const data = await response.json();
      
      // Set content (this triggers the useEffect to hide original text)
      setActiveContent(data.content);
      setMode(action === 'personalize' ? 'beginner' : 'urdu');
      
      // Scroll up slightly so they see the header
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
      console.error(error);
      alert("AI Brain is offline. Please check your backend terminal.");
    } finally {
      setLoading(null);
    }
  };

  const reset = () => {
    setActiveContent(null);
    setMode(null);
  };

  return (
    <div ref={containerRef} id="chapter-tools-container" className={styles.wrapper}>
      
      {/* --- TOOLBAR HEADER --- */}
      <div className={clsx(styles.container, activeContent && styles.activeHeader)}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
             {/* Dynamic Icon based on State */}
             {!session ? <Lock size={20} color="#ff5757"/> : 
              mode === 'beginner' ? <Sparkles size={20} color="#00f3ff"/> : 
              mode === 'urdu' ? <Languages size={20} color="#00ff88"/> : 
              <BookOpen size={20} color="#fff"/>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ color: '#fff', fontSize: '1rem' }}>
              {!session ? 'AI Features Locked' : 
               mode === 'beginner' ? 'Beginner Mode Active' : 
               mode === 'urdu' ? 'Urdu Translation Active' : 'AI Learning Companion'}
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>
              {!session ? 'Sign in to use personalization' : 
               activeContent ? 'Original content hidden' : 'Powered by Gemini 2.5'}
            </span>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          {activeContent ? (
            <button onClick={reset} className={styles.resetBtn}>
              <ArrowLeft size={16} />
              Restore Original
            </button>
          ) : (
            <>
              {/* Beginner Button */}
              <button
                onClick={() => handleAction('personalize')}
                className={clsx(styles.actionBtn, styles.personalizeBtn)}
                disabled={loading !== null}
                style={!session ? {opacity: 0.6, cursor: 'not-allowed'} : {}}
              >
                {!session && <Lock size={12} style={{marginRight:4}} />}
                {loading === 'personalize' ? <RefreshCw className={styles.spin} size={16} /> : <Sparkles size={16} />}
                Beginner
              </button>

              {/* Translate Button */}
              <button
                onClick={() => handleAction('translate')}
                className={clsx(styles.actionBtn, styles.translateBtn)}
                disabled={loading !== null}
                style={!session ? {opacity: 0.6, cursor: 'not-allowed'} : {}}
              >
                {!session && <Lock size={12} style={{marginRight:4}} />}
                {loading === 'translate' ? <RefreshCw className={styles.spin} size={16} /> : <Languages size={16} />}
                Urdu / اردو
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- AI CONTENT RESULT --- */}
      {activeContent && (
        <div id="ai-content-result" className={styles.resultContainer}>
           <div className="markdown">
              <ReactMarkdown>{activeContent}</ReactMarkdown>
           </div>
           
           <div className={styles.footerNote}>
              <p>
                This content was generated by AI to help you learn. 
                <span onClick={reset} className={styles.link}> Click here to return to the original textbook.</span>
              </p>
           </div>
        </div>
      )}
    </div>
  );
}