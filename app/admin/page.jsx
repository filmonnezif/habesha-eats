'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  Lock, Eye, EyeOff, Search, MapPin, 
  Settings, LogOut, Info, ShieldAlert, CheckCircle, Clock 
} from 'lucide-react';
import './[slug]/admin.css';

export default function AdminPortalPage() {
  const { language } = useLanguage();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Data states
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Check super admin session on mount
  useEffect(() => {
    const isAuthed = localStorage.getItem('session_super_admin');
    if (isAuthed === 'true') {
      setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, []);

  // Fetch all restaurants for super admin view
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadRestaurants() {
      try {
        const res = await fetch('/api/restaurants');
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data);
        }
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRestaurants();
  }, [isAuthenticated]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    // Verify against default super admin credentials
    if (username === 'Habesha' && password === '1234') {
      localStorage.setItem('session_super_admin', 'true');
      setIsAuthenticated(true);
      setAuthLoading(false);
    } else {
      setTimeout(() => {
        setAuthError('Invalid administrator credentials.');
        setAuthLoading(false);
      }, 600);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_super_admin');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.cuisines?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalCount = restaurants.length;
  const activeCount = restaurants.filter(r => r.status === 'ACTIVE').length;
  const pendingCount = restaurants.filter(r => r.status === 'PENDING').length;

  if (authChecking) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  // LOGIN GATE
  if (!isAuthenticated) {
    return (
      <div className="high-end-login-container">
        <div className="admin-bg-orb partner-bg-orb-1" />
        <div className="admin-bg-orb partner-bg-orb-2" />
        
        <div className="high-end-login-card text-center">
          <div className="login-lock-circle">
            <Lock size={32} className="text-gold" />
          </div>
          <h1 className="high-end-login-title mt-4">Master Admin Panel</h1>
          <p className="high-end-login-subtitle">Sign in with default credentials to manage all listings.</p>

          {authError && (
            <div className="partner-error alert-error mb-4">❌ {authError}</div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="high-end-field text-left">
              <label>Admin Username</label>
              <div className="high-end-input-wrapper">
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                  placeholder="e.g. Habesha"
                  className="high-end-input"
                />
              </div>
            </div>
            
            <div className="high-end-field text-left">
              <label>Admin Password</label>
              <div className="high-end-input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="••••"
                  className="high-end-input"
                />
                <button
                  type="button"
                  className="high-end-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="high-end-btn-submit mt-6" disabled={authLoading}>
              {authLoading ? 'Authenticating...' : 'Unlock Panel'}
            </button>
          </form>
          
          <div className="mt-6">
            <Link href="/discover" className="partner-btn-outline partner-btn-full text-xs">
              Back to Discover
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header glass-panel">
        <div className="admin-header-left">
          <Link href="/discover" className="admin-back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="admin-title">Master Admin Dashboard</h1>
            <div className="admin-subtitle">
              <span>Manage & update all 58+ registered restaurants</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout flex items-center gap-1">
          <LogOut size={16} /> Lock / Log Out
        </button>
      </header>

      {/* Main Content */}
      <main className="admin-content">
        
        {/* Statistics Widgets */}
        <div className="admin-grid mb-6">
          <div className="admin-card glass-panel flex justify-between items-center">
            <div>
              <h3 className="admin-card-subtitle text-xs uppercase tracking-wider text-gray-400">Total Listings</h3>
              <p className="admin-stat-value text-3xl font-extrabold">{totalCount}</p>
            </div>
            <div className="stat-icon-bg bg-blue-10">🏢</div>
          </div>
          <div className="admin-card glass-panel flex justify-between items-center">
            <div>
              <h3 className="admin-card-subtitle text-xs uppercase tracking-wider text-gray-400">Active Listings</h3>
              <p className="admin-stat-value text-3xl font-extrabold text-green">{activeCount}</p>
            </div>
            <div className="stat-icon-bg bg-green-10">✓</div>
          </div>
          <div className="admin-card glass-panel flex justify-between items-center">
            <div>
              <h3 className="admin-card-subtitle text-xs uppercase tracking-wider text-gray-400">Pending Approvals</h3>
              <p className="admin-stat-value text-3xl font-extrabold text-gold">{pendingCount}</p>
            </div>
            <div className="stat-icon-bg bg-gold-10">⏳</div>
          </div>
        </div>

        {/* Controls (Search & Filters) */}
        <div className="admin-card glass-panel mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="input-icon-wrapper flex-1">
              <Search size={18} className="input-icon" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search restaurants by name, cuisine specialty..."
                className="w-full pl-10"
              />
            </div>
            
            <div className="partner-chip-group">
              <button 
                type="button" 
                className={`partner-chip ${statusFilter === 'ALL' ? 'partner-chip-active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All ({totalCount})
              </button>
              <button 
                type="button" 
                className={`partner-chip ${statusFilter === 'ACTIVE' ? 'partner-chip-active' : ''}`}
                onClick={() => setStatusFilter('ACTIVE')}
              >
                Active ({activeCount})
              </button>
              <button 
                type="button" 
                className={`partner-chip ${statusFilter === 'PENDING' ? 'partner-chip-active' : ''}`}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Restaurants Listings Grid */}
        {loading ? (
          <div className="text-center py-10">
            <div className="admin-spinner mx-auto mb-4" />
            <p className="text-gray-400">Fetching listings...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="admin-card glass-panel text-center py-12">
            <ShieldAlert size={40} className="text-gold mx-auto mb-3" />
            <h3 className="text-lg font-bold">No Listings Found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map(r => (
              <div key={r.id} className="admin-card glass-panel flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`admin-status-badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-pending'}`}>
                      {r.status}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{r.type?.name}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={r.heroImage} 
                      alt={r.name} 
                      className="w-12 h-12 object-cover rounded-xl border border-white-10" 
                    />
                    <div>
                      <h4 className="font-extrabold text-base text-white capitalize leading-tight">{r.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-1 italic mt-0.5">{r.tagline || 'No tagline set'}</p>
                    </div>
                  </div>

                  <div className="border-t border-white-05 pt-3 mt-3 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin size={13} className="text-green" />
                      <span>{r.branches?.length || 0} branches ({r.emirate || 'N/A'})</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {r.cuisines?.slice(0, 3).map(c => (
                        <span key={c} className="text-[10px] bg-white-05 px-2 py-0.5 rounded-md text-gray-300">
                          {c}
                        </span>
                      ))}
                      {r.cuisines?.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{r.cuisines.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white-05">
                  <Link 
                    href={`/admin/${r.slug}`}
                    className="partner-btn-primary w-full text-center flex items-center justify-center gap-1.5 text-xs py-2"
                  >
                    <Settings size={14} /> Manage Listing & Menu
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
