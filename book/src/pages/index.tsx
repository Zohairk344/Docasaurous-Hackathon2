import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ArrowRight, Cpu, Globe, Brain, Terminal, Loader2 } from 'lucide-react';
import { authClient } from '../lib/auth-client'; // Import Auth Client

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  
  // CHECK AUTH STATUS
  const { data: session, isPending } = authClient.useSession();

  return (
    <Layout
      title={`Master ${siteConfig.title}`}
      description="The ultimate guide to building Embodied AI and Humanoid Robotics.">
      
      <main>
        {/* --- HERO SECTION --- */}
        <section className="hero-section">
          {/* Animated Background */}
          <div className="hero-grid" />
          
          <div className="hero-content">
            <h1 className="hero-title">
              Build the Body.<br />
              Code the Brain.
            </h1>
            <p className="hero-subtitle">
              Your comprehensive journey into <strong>Physical AI</strong>. 
              From ROS 2 fundamentals to advanced Humanoid control and Vision-Language-Action models.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
              {/* Primary Button always shows */}
              <Link to="/docs/intro" className="cta-button btn-primary">
                {session ? 'Continue Learning' : 'Start Learning'} <ArrowRight size={20} />
              </Link>

              {/* Secondary Button: HIDE IF LOGGED IN */}
              {!isPending && !session && (
                <Link to="/login?mode=signup" className="cta-button btn-secondary">
                  Join Course
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="features-section">
          <div className="feature-container">
            
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#00f3ff' }}>
                <Globe />
              </div>
              <h3>Physical AI Foundations</h3>
              <p>
                Understand how intelligence meets the real world. Master perception, reasoning, and actuation constraints.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#00ff88' }}>
                <Terminal />
              </div>
              <h3>ROS 2 & Gazebo</h3>
              <p>
                Get hands-on with the industry standard Robot Operating System. Build modular nodes and simulate robots.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#bd00ff' }}>
                <Brain />
              </div>
              <h3>Humanoids & VLAs</h3>
              <p>
                Dive into the cutting edge. Learn how Vision-Language-Action models enable humanoids to act.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#ff5757' }}>
                <Cpu />
              </div>
              <h3>Interactive AI Tutor</h3>
              <p>
                Stuck on a concept? Use our built-in RAG Chatbot and Personalization tools to simplify topics instantly.
              </p>
            </div>

          </div>
        </section>
      </main>
    </Layout>
  );
}