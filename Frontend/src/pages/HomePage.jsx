import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Activity, ArrowRight, Zap, Globe, ChevronDown } from 'lucide-react';

const HomePage = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Sora', sans-serif", background: 'var(--bg-base)' }}>

   

      {/* Navigation */}
      <nav className="glass-nav px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div style={{ background: 'linear-gradient(135deg, #38bdf8, #34d399)', borderRadius: '10px', padding: '6px' }}>
            <MapPin style={{ color: '#0d1b2a', width: '18px', height: '18px' }} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Smart<span className="gradient-text">Civic</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/login" className="nav-link">Log In</Link>
          <Link
            to="/register"
            className="btn-primary px-5 py-2.5 rounded-xl text-sm"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 aurora-bg grid-pattern">
        <section className="relative overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: '10%', left: '-5%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', right: '-5%', width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none'
          }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

              {/* Left */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div className="badge-live" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', width: 'fit-content' }}>
                  <div className="status-dot" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Live Platform · Indore, MP</span>
                </div>

                <h1 style={{
                  fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: 0
                }}>
                  Civic issues,<br />
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }} className="gradient-text">
                    resolved faster.
                  </span>
                </h1>

                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '460px', margin: 0 }}>
                  A transparent, AI-powered platform that routes your civic complaints to the right authorities — automatically, with real-time tracking.
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link
                    to="/register"
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', fontSize: '0.95rem', textDecoration: 'none' }}
                  >
                    Report an Issue
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="btn-ghost"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', fontSize: '0.95rem', textDecoration: 'none' }}
                  >
                    View Dashboard
                  </Link>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', gap: '32px', paddingTop: '8px' }}>
                  {[['2,400+', 'Issues Resolved'], ['94%', 'Satisfaction Rate'], ['<48h', 'Avg Response']].map(([val, label]) => (
                    <div key={label}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{val}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Mock UI Card */}
              <div style={{ position: 'relative' }}>
                {/* Decorative ring */}
                <div style={{
                  position: 'absolute', inset: '-16px',
                  border: '1px solid rgba(56,189,248,0.08)',
                  borderRadius: '28px', transform: 'rotate(2deg)'
                }} />

                <div className="glass-card" style={{ borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Map mockup */}
                  <div style={{
                    height: '180px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(52,211,153,0.05) 100%)',
                    border: '1px solid rgba(56,189,248,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Grid overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: 'linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)',
                      backgroundSize: '32px 32px'
                    }} />
                    {/* Map pin */}
                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                      <div style={{
                        width: '44px', height: '44px',
                        background: 'linear-gradient(135deg, #38bdf8, #34d399)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 8px',
                        boxShadow: '0 0 24px rgba(56,189,248,0.5)'
                      }}>
                        <MapPin style={{ color: '#0d1b2a', width: '20px', height: '20px' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 600 }}>Location Pinned</div>
                    </div>
                    {/* Pulsing ring */}
                    <div style={{
                      position: 'absolute',
                      width: '80px', height: '80px',
                      border: '2px solid rgba(56,189,248,0.3)',
                      borderRadius: '50%',
                      animation: 'pulse-dot 2s infinite',
                      top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }} />
                  </div>

                  {/* Complaint card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Pothole on MG Road</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>Reported 2 hours ago · Ward 14</div>
                    </div>
                    <div className="stat-pill">In Progress</div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolution Progress</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600 }}>72%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['High Priority', 'AI Assigned', 'Ward Authority'].map((tag) => (
                      <span key={tag} style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        padding: '3px 10px', borderRadius: '100px',
                        background: 'rgba(56,189,248,0.08)',
                        border: '1px solid rgba(56,189,248,0.15)',
                        color: 'var(--accent-teal)'
                      }}>{tag}</span>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Activity</div>
                    {[
                      { time: '14:32', event: 'Inspector dispatched', color: '#34d399' },
                      { time: '12:10', event: 'AI triage completed', color: '#38bdf8' },
                      { time: '10:05', event: 'Complaint submitted', color: '#f59e0b' },
                    ].map((item) => (
                      <div key={item.time} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}` }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1 }}>{item.event}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)' }}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>EXPLORE</span>
              <ChevronDown className="scroll-indicator" style={{ color: 'var(--text-muted)', width: '18px' }} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '96px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div className="section-label" style={{ marginBottom: '12px' }}>Platform Capabilities</div>
              <h2 style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                margin: '0 0 16px'
              }}>
                Built for real civic impact
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                Every layer of the platform is designed to reduce friction between citizens and the authorities who serve them.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                {
                  icon: <MapPin size={24} />,
                  iconBg: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(56,189,248,0.05))',
                  iconColor: '#38bdf8',
                  title: 'Precise Location Pinning',
                  desc: 'Integrated Leaflet maps ensure complaints are routed to the exact ward or district authority — no manual assignment needed.',
                  tag: 'Geospatial'
                },
                {
                  icon: <Zap size={24} />,
                  iconBg: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
                  iconColor: '#f59e0b',
                  title: 'AI Priority Triage',
                  desc: 'NLP-powered classification flags critical issues like water supply failures or open manholes for immediate escalation.',
                  tag: 'Intelligent'
                },
                {
                  icon: <ShieldCheck size={24} />,
                  iconBg: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.05))',
                  iconColor: '#34d399',
                  title: 'Transparent Tracking',
                  desc: 'Citizens follow every stage — submission to resolution — with photographic proof and timestamped updates from field authorities.',
                  tag: 'Accountability'
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="glass-card reveal"
                  style={{ borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px', cursor: 'default' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="feature-icon" style={{ background: f.iconBg }}>
                      <span style={{ color: f.iconColor }}>{f.icon}</span>
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase'
                    }}>{f.tag}</span>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 10px' }}>{f.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                  </div>
                  <div className="divider-line" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(52,211,153,0.06) 100%)',
              border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: '24px',
              padding: '64px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none'
              }} />
              <Globe style={{ color: 'var(--accent-teal)', margin: '0 auto 16px', width: '40px', height: '40px' }} />
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Your city. Your voice.
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: '0 auto 32px', maxWidth: '420px', lineHeight: 1.7 }}>
                Join thousands of citizens shaping better cities through transparent civic engagement.
              </p>
              <Link
                to="/register"
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 36px', borderRadius: '14px', fontSize: '1rem', textDecoration: 'none' }}
              >
                Start Reporting Free
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Smart<span className="gradient-text">Civic</span></span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>TechWolf</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2025 Smart Civic Portal. Hackathon Project.</span>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;