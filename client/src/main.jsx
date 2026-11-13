import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import {
  ArrowRight, Bell, BookOpen, BriefcaseBusiness, CalendarDays, ChevronDown,
  Clock3, FlaskConical, GraduationCap, Home, Menu, Search, Users, X
} from 'lucide-react';
import './styles.css';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
const categories = [
  ['All Information', 'all', Home], ['Notices', 'notice', Bell], ['Events', 'event', CalendarDays],
  ['Placements', 'placement', BriefcaseBusiness], ['Faculty Availability', 'faculty', Users],
  ['Academic Resources', 'academic', BookOpen]
];

function AdminDashboard({ token, onBack }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setDashboard(data.data))
      .catch((requestError) => setError(requestError.response?.data?.error || 'Unable to load dashboard.'));
  }, [token]);
  return <div className="admin-page">
    <div className="admin-page-header"><div><span className="eyebrow">ADMINISTRATION</span><h1>Dashboard</h1><p>Manage and monitor campus information.</p></div><button className="back-button" onClick={onBack}>Back to campus</button></div>
    {error && <div className="notice-error">{error}</div>}
    {dashboard && <div className="stats-grid">{[['Total resources', dashboard.totalResources], ['Notices', dashboard.notices], ['Placements', dashboard.placements], ['Events', dashboard.events], ['Faculty availability', dashboard.faculty], ['Academic resources', dashboard.academicResources]].map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
    <div className="admin-card"><h2>Quick actions</h2><p>Resource management and indexing controls are ready for the administrator panel.</p><div className="admin-actions"><button>Manage resources</button><button>View indexing tasks</button><button>Rebuild search index</button></div></div>
  </div>;
}

function ResourceCard({ resource, onOpen }) {
  const icon = resource.category === 'event' ? <CalendarDays /> : resource.category === 'placement' ? <BriefcaseBusiness /> : resource.category === 'faculty' ? <Users /> : resource.category === 'academic' ? <BookOpen /> : <Bell />;
  return <article className="resource-card" onClick={() => onOpen(resource)}>
    <div className={`card-icon ${resource.category}`}>{icon}</div>
    <div className="card-content"><span className="label">{resource.resourceType || resource.category}</span><h3>{resource.title}</h3><p>{resource.description}</p>
      <div className="meta"><span>{resource.department || 'All Departments'}</span><span>{new Date(resource.publishedAt).toLocaleDateString()}</span></div>
    </div><ArrowRight className="card-arrow" size={18} />
  </article>;
}

function App() {
  const [resources, setResources] = useState([]);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('all');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [login, setLogin] = useState({ email: 'admin@example.com', password: 'Admin@123' });
  const [loginMessage, setLoginMessage] = useState('');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('ucisp_token'));

  useEffect(() => {
    api.get('/resources').then(({ data }) => setResources(data.data)).catch(() => setError('Connect the API and seed sample data to see campus information.'));
  }, []);

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q: query } });
        setResources(data.data.results.map((item) => item.resource));
        setError('');
      } catch { setError('Search is unavailable. Please try again.'); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const visible = useMemo(() => active === 'all' ? resources : resources.filter((resource) => resource.category === active), [active, resources]);
  const selectCategory = (category) => { setActive(category); setQuery(''); setMenuOpen(false); };
  const formatDate = (value) => value && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Date unavailable';
  const submitLogin = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email: login.email.trim().toLowerCase(), password: login.password });
      localStorage.setItem('ucisp_token', data.data.token);
      setAdminToken(data.data.token);
      setLoginOpen(false);
      setLoginMessage(`Welcome, ${data.data.user.name}`);
    } catch (requestError) {
      setLoginMessage(requestError.response?.data?.error || 'Invalid credentials or API unavailable.');
    }
  };

  if (adminToken) return <div className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark">U</span><span>UCISP</span></div><div className="header-actions"><button className="admin-link" onClick={() => { localStorage.removeItem('ucisp_token'); setAdminToken(null); }}>Logout <ArrowRight size={15} /></button></div></header><AdminDashboard token={adminToken} onBack={() => { localStorage.removeItem('ucisp_token'); setAdminToken(null); }} /></div>;

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">U</span><span>UCISP</span></div>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>{categories.slice(0, 5).map(([label, key]) => <button className={active === key ? 'active' : ''} onClick={() => selectCategory(key)} key={key}>{label}</button>)}</nav>
      <div className="header-actions"><button className="admin-link" onClick={() => { setLoginOpen(true); setLoginMessage(''); }}>Admin Login <ArrowRight size={15} /></button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
    </header>
    <main>
      <section className="hero-panel"><div className="hero-copy"><span className="eyebrow">UNIFIED COLLEGE INFORMATION</span><h1>Your campus.<br /><strong>One search away.</strong></h1><p>Find notices, events, placements, faculty availability, and academic resources from one trusted place.</p>
        <div className="hero-search"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes, events, placements, faculty..." /><button onClick={() => setQuery(query.trim())}>Search</button></div>
        <div className="quick-links">{categories.slice(1).map(([label, key, Icon]) => <button key={key} onClick={() => selectCategory(key)}><Icon size={16} />{label}</button>)}</div>
      </div><div className="campus-art"><div className="art-building"><span>COLLEGE</span><b>UCISP</b></div><div className="art-sun" /></div></section>
      <section className="content-section"><div className="section-heading"><div><span className="eyebrow">DISCOVER</span><h2>{active === 'all' ? 'Campus information' : categories.find((item) => item[1] === active)?.[0]}</h2></div><button className="sort-button">Sort by: Latest <ChevronDown size={16} /></button></div>
        {error && <div className="notice-error">{error}</div>}
        {!error && <div className="resource-grid">{visible.map((resource) => <ResourceCard key={resource._id} resource={resource} onOpen={setSelected} />)}</div>}
        {!error && !visible.length && <div className="empty-state">No information found for this category.</div>}
      </section>
    </main>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="detail-modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setSelected(null)}><X /></button><div className={`detail-icon ${selected.category}`}><GraduationCap /></div><span className="label">{selected.resourceType || selected.category}</span><h2>{selected.title}</h2><p>{selected.description}</p><div className="detail-list"><span><Clock3 size={16} /> Published {formatDate(selected.publishedAt)}</span><span><FlaskConical size={16} /> {selected.department || 'All Departments'}</span>{selected.metadata && Object.entries(selected.metadata).slice(0, 4).map(([key, value]) => <span key={key}><strong>{key.replace(/[A-Z]/g, ' $&')}:</strong> {String(value)}</span>)}</div></div></div>}
    {loginOpen && <div className="modal-backdrop" onClick={() => setLoginOpen(false)}><form className="login-modal" onSubmit={submitLogin} onClick={(event) => event.stopPropagation()}><button type="button" className="close-button" onClick={() => setLoginOpen(false)}><X /></button><div className="detail-icon placement"><GraduationCap /></div><span className="label">ADMINISTRATION</span><h2>Admin Login</h2><p>Manage campus information and indexing tasks.</p><label>Email<input type="email" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} required /></label><label>Password<input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} required /></label><button className="login-submit">Sign in <ArrowRight size={16} /></button>{loginMessage && <div className="login-message">{loginMessage}</div>}</form></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
