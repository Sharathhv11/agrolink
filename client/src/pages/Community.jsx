import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  ArrowLeft, Send, X, Heart, Users, Plus,
  ChevronDown, Loader2, Camera, Search,
  LogIn, LogOut as LogOutIcon, Crown, Hash
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const COLOR_MAP = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   ring: 'ring-amber-300',   activeBg: 'bg-amber-100',   gradient: 'from-amber-500 to-yellow-400',  btnBg: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-300', activeBg: 'bg-emerald-100', gradient: 'from-emerald-500 to-green-400', btnBg: 'bg-emerald-500' },
  green:   { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-700',   ring: 'ring-green-300',   activeBg: 'bg-green-100',   gradient: 'from-green-500 to-emerald-400', btnBg: 'bg-green-500' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    ring: 'ring-rose-300',    activeBg: 'bg-rose-100',    gradient: 'from-rose-500 to-pink-400',    btnBg: 'bg-rose-500' },
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     ring: 'ring-sky-300',     activeBg: 'bg-sky-100',     gradient: 'from-sky-500 to-blue-400',     btnBg: 'bg-sky-500' },
  lime:    { bg: 'bg-lime-50',    border: 'border-lime-200',    text: 'text-lime-700',    ring: 'ring-lime-300',    activeBg: 'bg-lime-100',    gradient: 'from-lime-500 to-green-400',   btnBg: 'bg-lime-500' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  ring: 'ring-violet-300',  activeBg: 'bg-violet-100',  gradient: 'from-violet-500 to-purple-400', btnBg: 'bg-violet-500' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  ring: 'ring-orange-300',  activeBg: 'bg-orange-100',  gradient: 'from-orange-500 to-amber-400',  btnBg: 'bg-orange-500' },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700',    ring: 'ring-teal-300',    activeBg: 'bg-teal-100',    gradient: 'from-teal-500 to-cyan-400',    btnBg: 'bg-teal-500' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  ring: 'ring-indigo-300',  activeBg: 'bg-indigo-100',  gradient: 'from-indigo-500 to-blue-400',  btnBg: 'bg-indigo-500' },
  pink:    { bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700',    ring: 'ring-pink-300',    activeBg: 'bg-pink-100',    gradient: 'from-pink-500 to-rose-400',    btnBg: 'bg-pink-500' },
  cyan:    { bg: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700',    ring: 'ring-cyan-300',    activeBg: 'bg-cyan-100',    gradient: 'from-cyan-500 to-teal-400',    btnBg: 'bg-cyan-500' },
};

const ICON_OPTIONS = ['🌾','🍚','🥬','🍎','🏵️','🎋','🌱','🌻','🌽','🍇','🫘','🥭','🍋','☕','🥥','🌶️','🍌','🧅','🥔','🍅','💬','🤝','🛠️','📢'];
const COLOR_OPTIONS = Object.keys(COLOR_MAP);

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getCategoryLabel(cat) {
  if (!cat) return 'Member';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Community() {
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Views: 'list' (community list), 'chat' (inside a community)
  const [view, setView] = useState('list');
  const [communities, setCommunities] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUser, setTypingUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('my'); // 'my' or 'all'

  // Create community form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🌱');
  const [newColor, setNewColor] = useState('emerald');
  const [creating, setCreating] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const colors = activeCommunity ? (COLOR_MAP[activeCommunity.color] || COLOR_MAP.emerald) : COLOR_MAP.emerald;

  // ── Scroll to bottom ──
  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, 100);
  }, []);

  // ── Fetch communities ──
  const fetchCommunities = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const endpoint = viewMode === 'my' ? '/community/groups/my' : '/community/groups';
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCommunities(data);
      }
    } catch (err) {
      console.error('Failed to fetch communities:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, [token, viewMode]);

  useEffect(() => {
    if (token) fetchCommunities();
  }, [fetchCommunities, token]);

  // ── Fetch messages ──
  const fetchMessages = useCallback(async (slug) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/community/messages?community=${slug}&limit=80`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        scrollToBottom(false);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [token, scrollToBottom]);

  // ── Socket.IO ──
  useEffect(() => {
    if (!token || !user || !activeCommunity) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-community', { community: activeCommunity.slug, user: { name: user.name, _id: user._id } });
    });

    socket.on('message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    socket.on('online-count', ({ count }) => setOnlineCount(count));

    socket.on('user-typing', ({ user: typUser }) => {
      setTypingUser(typUser?.name || 'Someone');
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    });

    socket.on('user-stop-typing', () => setTypingUser(null));

    fetchMessages(activeCommunity.slug);

    return () => { socket.disconnect(); };
  }, [activeCommunity, token, user]);

  // ── Enter a community ──
  const enterCommunity = (community) => {
    setActiveCommunity(community);
    setMessages([]);
    setView('chat');
  };

  // ── Back to list ──
  const backToList = () => {
    setView('list');
    setActiveCommunity(null);
    setMessages([]);
    if (socketRef.current) socketRef.current.disconnect();
    fetchCommunities();
  };

  // ── Create community ──
  const createCommunity = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/community/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim(), icon: newIcon, color: newColor }),
      });
      if (res.ok) {
        const group = await res.json();
        setShowCreateModal(false);
        setNewName(''); setNewDesc(''); setNewIcon('🌱'); setNewColor('emerald');
        fetchCommunities();
        enterCommunity(group);
      }
    } catch (err) {
      console.error('Failed to create community:', err);
    } finally {
      setCreating(false);
    }
  };

  // ── Join community ──
  const joinCommunity = async (groupId) => {
    try {
      await fetch(`${API_URL}/community/groups/${groupId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCommunities();
    } catch (err) {
      console.error('Failed to join:', err);
    }
  };

  // ── Leave community ──
  const leaveCommunity = async (groupId) => {
    try {
      await fetch(`${API_URL}/community/groups/${groupId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCommunities();
    } catch (err) {
      console.error('Failed to leave:', err);
    }
  };

  // ── Send message ──
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text && !imageFile) return;
    setSending(true);
    try {
      let savedMessage;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('community', activeCommunity.slug);
        if (text) formData.append('text', text);
        const res = await fetch(`${API_URL}/community/messages/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) savedMessage = await res.json();
      } else {
        const res = await fetch(`${API_URL}/community/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ community: activeCommunity.slug, text }),
        });
        if (res.ok) savedMessage = await res.json();
      }
      if (savedMessage && socketRef.current) {
        socketRef.current.emit('new-message', savedMessage);
      }
      setInputText(''); setImageFile(null); setImagePreview(null);
      scrollToBottom();
      if (socketRef.current) socketRef.current.emit('stop-typing', { community: activeCommunity.slug });
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socketRef.current && activeCommunity) {
      socketRef.current.emit('typing', { community: activeCommunity.slug, user: { name: user?.name } });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop-typing', { community: activeCommunity.slug });
      }, 2000);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLike = async (msgId) => {
    try {
      await fetch(`${API_URL}/community/messages/${msgId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev =>
        prev.map(m => {
          if (m._id === msgId) {
            const likes = m.likes || [];
            const userId = user?._id;
            const already = likes.includes(userId);
            return { ...m, likes: already ? likes.filter(id => id !== userId) : [...likes, userId] };
          }
          return m;
        })
      );
    } catch (err) { console.error('Like failed:', err); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isOwnMessage = (msg) => msg.sender === user?._id;

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ═══════════════════════════════════════════
  //  COMMUNITY LIST VIEW
  // ═══════════════════════════════════════════
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="flex items-center justify-between h-[64px] px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/home')} className="p-2 -ml-1 rounded-xl hover:bg-slate-100 transition-colors active:scale-95">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  {language === 'en' ? 'Community' : 'ಸಮುದಾಯ'}
                </h1>
                <p className="text-[11px] font-semibold text-slate-400 -mt-0.5">
                  {language === 'en' ? `${communities.length} communities` : `${communities.length} ಸಮುದಾಯಗಳು`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[13px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {language === 'en' ? 'Create' : 'ರಚಿಸಿ'}
            </button>
          </div>
        </header>

        {/* Tabs + Search */}
        <div className="px-4 sm:px-6 pt-4 pb-2 space-y-3">
          {/* Toggle: My / All */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('my')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all ${viewMode === 'my' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'en' ? '🏠 My Communities' : '🏠 ನನ್ನ ಸಮುದಾಯಗಳು'}
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all ${viewMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {language === 'en' ? '🌍 Explore All' : '🌍 ಎಲ್ಲವನ್ನೂ ಅನ್ವೇಷಿಸಿ'}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search communities...' : 'ಸಮುದಾಯಗಳನ್ನು ಹುಡುಕಿ...'}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-[14px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
            />
          </div>
        </div>

        {/* Community Cards */}
        <div className="px-4 sm:px-6 py-3 pb-32 space-y-3">
          {loadingGroups ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              <span className="text-sm font-semibold text-slate-400">Loading...</span>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl">🔍</div>
              <p className="text-sm font-semibold text-slate-400 text-center">
                {language === 'en' ? 'No communities found' : 'ಯಾವುದೇ ಸಮುದಾಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm"
              >
                {language === 'en' ? 'Create one now →' : 'ಈಗ ಒಂದನ್ನು ರಚಿಸಿ →'}
              </button>
            </div>
          ) : (
            filteredCommunities.map((comm, idx) => {
              const cColors = COLOR_MAP[comm.color] || COLOR_MAP.emerald;
              return (
                <div
                  key={comm._id || idx}
                  className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all animate-[fade-in-up_0.4s_ease-out] overflow-hidden"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                >
                  {/* Gradient top accent */}
                  <div className={`h-1.5 bg-gradient-to-r ${cColors.gradient}`} />

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl ${cColors.bg} ${cColors.border} border flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                        {comm.icon || '🌱'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-extrabold text-[15px] text-slate-900 tracking-tight truncate flex items-center gap-2">
                              {comm.name}
                              {comm.isDefault && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md font-black uppercase tracking-wide">Official</span>
                              )}
                            </h3>
                            <p className="text-[12px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                              {comm.description || (language === 'en' ? 'Community for all workers' : 'ಎಲ್ಲಾ ಕೆಲಸಗಾರರಿಗಾಗಿ ಸಮುದಾಯ')}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[12px] font-bold text-slate-500">
                              {comm.memberCount || 0} {language === 'en' ? 'members' : 'ಸದಸ್ಯರು'}
                            </span>
                          </div>
                          {comm.creatorName && !comm.isDefault && (
                            <div className="flex items-center gap-1.5">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[12px] font-semibold text-slate-400 truncate max-w-[100px]">
                                {comm.creatorName}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          {comm.isMember || comm.isDefault ? (
                            <>
                              <button
                                onClick={() => enterCommunity(comm)}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r ${cColors.gradient} shadow-sm hover:shadow-md transition-all active:scale-[0.97]`}
                              >
                                {language === 'en' ? 'Open Chat →' : 'ಚಾಟ್ ತೆರೆಯಿರಿ →'}
                              </button>
                              {!comm.isDefault && (
                                <button
                                  onClick={() => leaveCommunity(comm._id)}
                                  className="py-2.5 px-3 rounded-xl text-[12px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors active:scale-95"
                                  title="Leave"
                                >
                                  <LogOutIcon className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => joinCommunity(comm._id)}
                              className="flex-1 py-2.5 px-4 rounded-xl text-[13px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-[0.97] flex items-center justify-center gap-2"
                            >
                              <LogIn className="w-4 h-4" />
                              {language === 'en' ? 'Join Community' : 'ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ═══════════ CREATE COMMUNITY MODAL ═══════════ */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4 animate-[fade-in-up_0.2s_ease-out]" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Modal header gradient */}
              <div className={`h-2 bg-gradient-to-r ${(COLOR_MAP[newColor] || COLOR_MAP.emerald).gradient}`} />

              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xl text-slate-900 tracking-tight">
                    {language === 'en' ? 'Create Community' : 'ಸಮುದಾಯ ರಚಿಸಿ'}
                  </h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Preview */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-14 h-14 rounded-2xl ${(COLOR_MAP[newColor] || COLOR_MAP.emerald).bg} ${(COLOR_MAP[newColor] || COLOR_MAP.emerald).border} border flex items-center justify-center text-2xl shadow-sm`}>
                      {newIcon}
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-slate-900 tracking-tight">{newName || (language === 'en' ? 'Community Name' : 'ಸಮುದಾಯ ಹೆಸರು')}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{newDesc || (language === 'en' ? 'Add a description' : 'ವಿವರಣೆ ಸೇರಿಸಿ')}</p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                      {language === 'en' ? 'Name *' : 'ಹೆಸರು *'}
                    </label>
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder={language === 'en' ? 'e.g., Mango Farmers Hub' : 'ಉದಾ., ಮಾವು ರೈತರ ಕೇಂದ್ರ'}
                      maxLength={60}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                      {language === 'en' ? 'Description' : 'ವಿವರಣೆ'}
                    </label>
                    <input
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      placeholder={language === 'en' ? 'Short description...' : 'ಸಣ್ಣ ವಿವರಣೆ...'}
                      maxLength={200}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                    />
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                      {language === 'en' ? 'Icon' : 'ಐಕಾನ್'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setNewIcon(icon)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all active:scale-90 ${newIcon === icon ? `${(COLOR_MAP[newColor] || COLOR_MAP.emerald).bg} ring-2 ${(COLOR_MAP[newColor] || COLOR_MAP.emerald).ring} shadow-sm` : 'bg-slate-50 hover:bg-slate-100'}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">
                      {language === 'en' ? 'Theme Color' : 'ಥೀಮ್ ಬಣ್ಣ'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewColor(c)}
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${COLOR_MAP[c].gradient} transition-all active:scale-90 ${newColor === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-60 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={createCommunity}
                    disabled={!newName.trim() || creating}
                    className={`w-full py-3.5 rounded-xl font-bold text-[14px] transition-all active:scale-[0.97] ${newName.trim() ? 'bg-slate-900 text-white shadow-md hover:shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    {creating ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating...</span>
                    ) : (
                      language === 'en' ? '✨ Create Community' : '✨ ಸಮುದಾಯ ರಚಿಸಿ'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  CHAT VIEW
  // ═══════════════════════════════════════════
  return (
    <div className="fixed inset-0 flex flex-col bg-[#FAFAFA] font-sans text-slate-900 overflow-hidden">

      {/* ─── CHAT HEADER ─── */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200/60 z-30">
        <div className="flex items-center justify-between h-[64px] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={backToList} className="p-2 -ml-1 rounded-xl hover:bg-slate-100 transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className={`w-10 h-10 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center text-xl shadow-sm`}>
              {activeCommunity?.icon || '🌱'}
            </div>
            <div>
              <h1 className="font-extrabold text-[15px] text-slate-900 tracking-tight truncate max-w-[180px] sm:max-w-none">
                {activeCommunity?.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-600">{onlineCount} online</span>
                <span className="text-[11px] text-slate-300">•</span>
                <span className="text-[11px] font-semibold text-slate-400">{activeCommunity?.memberCount || 0} members</span>
              </div>
            </div>
          </div>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors">
            <Users className="w-4.5 h-4.5 text-slate-500" />
          </button>
        </div>
      </header>

      {/* ─── MESSAGES ─── */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className={`w-16 h-16 rounded-3xl ${colors.bg} ${colors.border} border flex items-center justify-center text-3xl animate-bounce`}>
              {activeCommunity?.icon || '🌱'}
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span className="text-sm font-semibold text-slate-400">Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-4xl shadow-lg`}>
              {activeCommunity?.icon || '🌱'}
            </div>
            <h2 className="font-black text-xl text-slate-900 tracking-tight text-center">
              {language === 'en' ? `Welcome to ${activeCommunity?.name}!` : `${activeCommunity?.name} ಗೆ ಸ್ವಾಗತ!`}
            </h2>
            <p className="text-sm text-slate-400 font-medium text-center max-w-xs">
              {language === 'en'
                ? 'Be the first to start a conversation. Share tips, ask questions, or post updates!'
                : 'ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ. ಸಲಹೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ, ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ!'}
            </p>
          </div>
        ) : (
          <div className="px-4 sm:px-6 py-4 space-y-1">
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-500 tracking-tight">
                {activeCommunity?.name} • {language === 'en' ? 'Community Chat' : 'ಸಮುದಾಯ ಚಾಟ್'}
              </span>
            </div>

            {messages.map((msg, idx) => {
              const own = isOwnMessage(msg);
              const showAvatar = !own && (idx === 0 || messages[idx - 1]?.sender !== msg.sender);
              const showName = showAvatar;
              const isConsecutive = idx > 0 && messages[idx - 1]?.sender === msg.sender;

              return (
                <div key={msg._id || idx} className={`flex ${own ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-3'} animate-[fade-in-up_0.3s_ease-out]`}>
                  {!own && (
                    <div className="w-8 flex-shrink-0 mr-2 mt-auto">
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm">
                          {msg.senderAvatar ? (
                            <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[11px] font-black text-slate-600">{msg.senderName?.charAt(0) || '?'}</span>
                          )}
                        </div>
                      ) : <div className="w-8" />}
                    </div>
                  )}
                  <div className={`max-w-[75%] sm:max-w-[65%] group ${own ? 'items-end' : 'items-start'}`}>
                    {showName && !own && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <span className="text-[12px] font-bold text-slate-700 tracking-tight">{msg.senderName}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>{getCategoryLabel(msg.senderCategory)}</span>
                      </div>
                    )}
                    <div className={`relative px-4 py-2.5 transition-all ${
                      own ? 'bg-slate-900 text-white rounded-2xl rounded-br-md shadow-sm' : 'bg-white text-slate-800 rounded-2xl rounded-bl-md border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                    }`}>
                      {msg.type === 'image' && msg.imageUrl && (
                        <button onClick={() => setShowImageViewer(msg.imageUrl.startsWith('http') ? msg.imageUrl : `${SOCKET_URL}${msg.imageUrl}`)} className="block mb-2 -mx-1 -mt-0.5">
                          <img src={msg.imageUrl.startsWith('http') ? msg.imageUrl : `${SOCKET_URL}${msg.imageUrl}`} alt="shared" className="max-w-full rounded-xl max-h-60 object-cover hover:opacity-90 transition-opacity cursor-pointer" loading="lazy" />
                        </button>
                      )}
                      {msg.text && (
                        <p className={`text-[14px] leading-relaxed font-medium break-words whitespace-pre-wrap ${own ? 'text-white' : 'text-slate-800'}`}>{msg.text}</p>
                      )}
                      <div className={`flex items-center gap-2 mt-1.5 ${own ? 'justify-end' : 'justify-between'}`}>
                        <span className="text-[10px] font-semibold text-slate-400">{formatTime(msg.createdAt)}</span>
                        <button onClick={() => handleLike(msg._id)} className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Heart className={`w-3 h-3 transition-colors ${msg.likes?.includes(user?._id) ? 'text-rose-500 fill-rose-500' : own ? 'text-slate-400 hover:text-rose-400' : 'text-slate-300 hover:text-rose-400'}`} />
                          {msg.likes?.length > 0 && <span className="text-[10px] font-bold text-slate-400">{msg.likes.length}</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {typingUser && (
              <div className="flex items-center gap-2 mt-3 ml-10 animate-[fade-in-up_0.2s_ease-out]">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 ml-1">{typingUser}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ─── IMAGE PREVIEW ─── */}
      {imagePreview && (
        <div className="flex-shrink-0 bg-white border-t border-slate-200/60 px-4 py-3 animate-[fade-in-up_0.2s_ease-out]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{language === 'en' ? 'Image ready to send' : 'ಚಿತ್ರ ಕಳುಹಿಸಲು ಸಿದ್ಧ'}</span>
          </div>
        </div>
      )}

      {/* ─── INPUT BAR ─── */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200/60 px-3 sm:px-5 py-3">
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-3 rounded-xl hover:bg-slate-100 transition-colors active:scale-95 mb-0.5">
            <Camera className="w-5 h-5 text-slate-400" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={language === 'en' ? 'Type a message...' : 'ಸಂದೇಶ ಬರೆಯಿರಿ...'}
              rows={1}
              className="w-full resize-none bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all"
              style={{ maxHeight: '120px', minHeight: '48px' }}
              onInput={(e) => { e.target.style.height = '48px'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={sending || (!inputText.trim() && !imageFile)}
            className={`flex-shrink-0 p-3 rounded-xl transition-all active:scale-90 mb-0.5 ${inputText.trim() || imageFile ? 'bg-slate-900 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── IMAGE VIEWER ─── */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-[fade-in-up_0.2s_ease-out]" onClick={() => setShowImageViewer(null)}>
          <button onClick={() => setShowImageViewer(null)} className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10">
            <X className="w-6 h-6" />
          </button>
          <img src={showImageViewer} alt="Full view" className="max-w-full max-h-full object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
