/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Award, Zap, BookOpen, Star, X, ExternalLink, RefreshCw } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, query } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface Highlight {
  label: string;
  val: string;
  icon: ReactNode;
  url?: string;
  image?: string;
}

export default function TrainerSection() {
  const credentials = [
    'TryHackMe — Top 1% Globally',
    'Global Rank #18562',
    '184 Rooms · 22 Badges Earned',
    'Advent of Cyber 2023 & 2025',
    'IBM SkillsBuild — Cyber Fundamentals',
    'HP Cybersecurity Awareness Certified',
    'Conducted Phishing Awareness Workshop'
  ];

  const [selectedItem, setSelectedItem] = useState<{ 
    type: 'image' | 'iframe'; 
    src: string; 
    title: string;
    externalUrl?: string;
  } | null>(null);

  const [highlights, setHighlights] = useState<Highlight[]>([
     { 
       label: 'Platform Rank', 
       val: 'Top 1% — TryHackMe', 
       icon: <Award size={18} className="text-cyber-teal" />,
       url: 'https://tryhackme.com/p/Vaibhav2502'
     },
     { label: 'Challenges', val: 'Advent of Cyber 2023 & 2025', icon: <Zap size={18} className="text-cyber-teal" /> },
     { label: 'Rooms Completed', val: '184 rooms · 22 badges', icon: <BookOpen size={18} className="text-cyber-teal" /> },
  ]);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked by your browser. Please allow popups or open this app in a new tab to sign in.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const seedCertifications = async () => {
    if (!user) {
      alert('Please sign in first to authorize the database write.');
      return;
    }
    try {
      const certs = [
        { 
          title: 'IBM Cyber Fundamentals', 
          imageUrl: 'https://images.credly.com/images/2244cadf-e823-4601-856d-244cadfe8231/Cybersecurity_Fundamentals.png',
          issuer: 'IBM'
        },
        { 
          title: 'HP Cyber Awareness', 
          imageUrl: 'https://www.hp.com/content/dam/sites/worldwide/hp-life/courses/thumbnails/Cybersecurity_Awareness.jpg',
          issuer: 'HP'
        }
      ];

      for (const cert of certs) {
        await addDoc(collection(db, 'certifications'), cert);
      }
      fetchCertifications();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'certifications');
    }
  };

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'certifications'));
      const querySnapshot = await getDocs(q);
      
      const certHighlights: Highlight[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          label: 'Certification',
          val: data.title,
          icon: <Star size={18} className="text-cyber-teal" />,
          image: data.imageUrl
        };
      });

      if (certHighlights.length === 0) {
        // Fallback to static if none in DB, but we keep them searchable
        setHighlights(prev => [
          ...prev.filter(h => h.label !== 'Certification'),
          { 
            label: 'Certification', 
            val: 'IBM Cyber Fundamentals', 
            icon: <Star size={18} className="text-cyber-teal" />,
            image: 'https://images.credly.com/images/2244cadf-e823-4601-856d-244cadfe8231/Cybersecurity_Fundamentals.png'
          },
          { 
            label: 'Certification', 
            val: 'HP Cyber Awareness', 
            icon: <Star size={18} className="text-cyber-teal" />,
            image: 'https://www.hp.com/content/dam/sites/worldwide/hp-life/courses/thumbnails/Cybersecurity_Awareness.jpg'
          }
        ]);
      } else {
        setHighlights(prev => [
          ...prev.filter(h => h.label !== 'Certification'),
          ...certHighlights
        ]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'certifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  return (
    <section id="trainer" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <p className="font-mono text-[10px] text-cyber-teal tracking-[0.2em] uppercase mb-4">// About the Trainer</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Led by an Offensive Security Enthusiast</h2>
            <p className="text-cyber-muted max-w-2xl text-lg">Not theory from a textbook — real knowledge from someone who actively practices ethical hacking and cybersecurity.</p>
          </div>
          <div className="flex flex-col gap-2">
            {!user ? (
              <button 
                onClick={handleLogin}
                disabled={authLoading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-cyber-teal border border-cyber-teal/30 rounded hover:bg-cyber-teal/10 transition-all opacity-50 hover:opacity-100 disabled:opacity-30 disabled:cursor-wait"
              >
                {authLoading ? 'Signing in...' : 'Login as Admin'}
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-mono text-cyber-teal">Admin: {user.email}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={seedCertifications}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-cyber-teal border border-cyber-teal/30 rounded hover:bg-cyber-teal/10 transition-all disabled:opacity-30"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Seed Database Certs
                  </button>
                  <button 
                    onClick={() => auth.signOut()}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[380px,1fr] gap-16 items-start">
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="glass-card !p-10 relative overflow-visible"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Zap size={120} />
            </div>

            <div className="w-24 h-24 rounded-full border-2 border-cyber-teal bg-cyber-bg-alt flex items-center justify-center font-mono text-3xl font-bold text-cyber-teal shadow-[0_0_30px_rgba(0,212,170,0.2)] mb-8 mx-auto">
              VC
            </div>
            
            <h3 className="text-2xl font-bold text-center mb-1">Vaibhav Chaurasiya</h3>
            <p className="font-mono text-[10px] text-cyber-teal tracking-[0.2em] uppercase text-center mb-8">&gt;_ Penetration Testing Enthusiast</p>
            
            <div className="space-y-3">
              {credentials.map((cred) => (
                <div key={cred} className="flex items-center gap-3 bg-cyber-bg-alt/50 border border-cyber-border rounded-lg px-4 py-3 text-sm">
                  <CheckCircle2 size={16} className="text-cyber-teal shrink-0" />
                  <span className="text-cyber-white/80">{cred}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-8">Passionate about cybersecurity education.</h3>
            <div className="space-y-6 text-cyber-white/70 text-lg leading-relaxed mb-12">
                <p>I'm Vaibhav Chaurasiya — a Penetration Testing Enthusiast who believes that awareness is the most powerful defense against cyber threats.</p>
                <p>I've spent hundreds of hours practicing on real hacking platforms, understanding exactly how attackers think and operate. I've already conducted successful workshops and received great feedback — which is why I'm bringing this to your school.</p>
                <p>My goal is simple: equip your students with the knowledge to protect themselves online, taught in a way that actually sticks.</p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {highlights.map((h, idx) => {
                    const isCert = h.label === 'Certification' && h.image;
                    
                    if (isCert) {
                      return (
                        <motion.div 
                          key={idx} 
                          initial="initial"
                          whileHover="hover"
                          onClick={() => setSelectedItem({ type: 'image', src: h.image!, title: h.val })}
                          className="relative h-[120px] overflow-hidden glass-card !p-0 group cursor-pointer border-cyber-border hover:border-cyber-teal/50 transition-colors"
                        >
                          {/* Top Shutter */}
                          <motion.div 
                            variants={{
                              initial: { y: 0 },
                              hover: { y: '-100%' }
                            }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-x-0 top-0 h-1/2 bg-cyber-bg-alt/90 backdrop-blur-sm p-6 pb-0 flex items-center gap-3 z-20 border-b border-cyber-border/20"
                          >
                            {h.icon}
                            <span className="font-mono text-[9px] text-cyber-muted tracking-[0.2em] uppercase">{h.label}</span>
                          </motion.div>

                          {/* Bottom Shutter */}
                          <motion.div 
                            variants={{
                              initial: { y: 0 },
                              hover: { y: '100%' }
                            }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-x-0 bottom-0 h-1/2 bg-cyber-bg-alt/90 backdrop-blur-sm p-6 pt-0 flex items-center z-20"
                          >
                            <p className="font-bold text-cyber-white group-hover:text-cyber-teal transition-colors tracking-tight line-clamp-1">{h.val}</p>
                          </motion.div>

                          {/* Revealed Cert Image */}
                          <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                            <img 
                              src={h.image} 
                              alt={h.val} 
                              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                               <div className="w-full h-full border border-cyber-teal/30 rounded flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                  <img 
                                    src={h.image} 
                                    className="max-w-[90%] max-h-[80%] object-contain shadow-2xl" 
                                    referrerPolicy="no-referrer"
                                  />
                               </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80" />
                            <div className="absolute bottom-2 right-3 font-mono text-[8px] text-cyber-teal/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to expand
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div 
                        key={idx} 
                        className={`glass-card !p-6 hover:border-cyber-teal/40 group transition-all relative overflow-hidden ${h.url ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                          if (h.url) setSelectedItem({ type: 'iframe', src: h.url, title: h.val, externalUrl: h.url });
                        }}
                      >
                         <div className="flex items-center gap-3 mb-3 relative z-10">
                            {h.icon}
                            <span className="font-mono text-[9px] text-cyber-muted tracking-[0.2em] uppercase">{h.label}</span>
                         </div>
                         
                         <div className="flex items-end justify-between relative z-10">
                          <p className="font-bold text-cyber-white group-hover:text-cyber-teal transition-colors underline decoration-transparent group-hover:decoration-cyber-teal/30 underline-offset-4">{h.val}</p>
                          {h.url && (
                            <ExternalLink size={14} className="text-cyber-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                         </div>
                      </motion.div>
                    );
                  })}
                </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Certificate/Link Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-14 left-0 right-0 flex justify-between items-center text-white">
                <h4 className="font-mono text-sm tracking-widest text-cyber-teal">{selectedItem.title}</h4>
                <div className="flex items-center gap-4">
                  {selectedItem.externalUrl && (
                    <a 
                      href={selectedItem.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-cyber-teal/10 border border-cyber-teal/30 rounded-lg text-cyber-teal hover:bg-cyber-teal/20 transition-all text-sm font-bold"
                    >
                      Open in New Tab <ExternalLink size={14} />
                    </a>
                  )}
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-white hover:text-cyber-teal transition-colors p-2"
                  >
                    <X size={32} />
                  </button>
                </div>
              </div>

              {selectedItem.type === 'image' ? (
                <img 
                  src={selectedItem.src} 
                  alt={selectedItem.title} 
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=1000&auto=format&fit=crop';
                  }}
                />
              ) : (
                <div className="w-full aspect-video bg-cyber-bg-alt rounded-lg border border-cyber-border overflow-hidden flex flex-col shadow-2xl">
                  <div className="bg-cyber-bg border-b border-cyber-border p-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto h-7 bg-black/40 rounded flex items-center px-3 gap-2">
                       <div className="w-2 h-2 rounded-full bg-cyber-teal animate-pulse" />
                       <span className="text-[10px] text-cyber-muted truncate font-mono">{selectedItem.src}</span>
                    </div>
                  </div>
                  <div className="flex-1 relative bg-white">
                    <iframe 
                      src={selectedItem.src} 
                      className="w-full h-full border-none"
                      title={selectedItem.title}
                    />
                    {/* Overlay for iframe interaction issues/security headers */}
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
