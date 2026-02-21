import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Menu, X, Sun, Moon, Home, Package, Upload, User as UserIcon, Settings,
  Shield, Crown, Star, Download, Eye, MessageSquare, Bell, LogOut,
  Grid3X3, List, Plus, Trash2, Check, AlertTriangle,
  Send, ChevronRight, ExternalLink, Lock, Mail, Key, RefreshCw,
  Users, TrendingUp, DollarSign, Award, Sparkles, Tag, Palette,
  CheckCircle, XCircle, Clock, Edit3, Globe, MapPin, Link2, Hash,
  MessageCircle, Headphones, ShoppingCart, BarChart3, Zap,
  UserPlus, UserCheck, BadgeCheck, ArrowLeft, Info,
} from 'lucide-react';
import {
  User, Asset, Tag as TagType, Message, ChatMessage, SupportTicket,
  OTPData, AssetStatus,
} from './types';
import {
  OWNER_ACCOUNT, DEFAULT_TAGS, SAMPLE_ASSETS, CATEGORIES, ASSET_THUMBNAILS,
  getDefaultProfile, createId, generateOTP,
} from './store';

type Page = 'home' | 'browse' | 'asset-detail' | 'upload' | 'profile' | 'edit-profile' |
  'user-profile' | 'my-assets' | 'sales' | 'admin' | 'login' | 'register' |
  'forgot-password' | 'tutorial' | 'messages' | 'global-chat' | 'support' | 'support-chat';

export function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [page, setPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([OWNER_ACCOUNT]);
  const [assets, setAssets] = useState<Asset[]>([...SAMPLE_ASSETS]);
  const [tags, setTags] = useState<TagType[]>([...DEFAULT_TAGS]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: string }[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest');
  const [otpData, setOtpData] = useState<OTPData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const notify = useCallback((text: string, type = 'info') => {
    const id = createId();
    setNotifications(p => [...p, { id, text, type }]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 5000);
  }, []);

  const navigateTo = useCallback((p: Page, assetId?: string, userId?: string) => {
    setPage(p);
    if (assetId) setSelectedAssetId(assetId);
    if (userId) setSelectedUserId(userId);
    setMobileMenu(false);
    window.scrollTo(0, 0);
  }, []);

  const unreadMessages = currentUser
    ? messages.filter(m => m.toId === currentUser.id && !m.read).length
    : 0;

  // Theme classes
  const bg = darkMode ? 'bg-black' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const cardBorder = darkMode ? 'border-zinc-800' : 'border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-zinc-400' : 'text-gray-500';
  const textMuted = darkMode ? 'text-zinc-500' : 'text-gray-400';
  const inputBg = darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900';
  const hoverBg = darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';

  // ==================== COMPONENTS ====================

  const TagBadge = ({ tagId }: { tagId: string }) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return null;
    const IconComp = tag.icon === 'crown' ? Crown : tag.icon === 'shield' ? Shield :
      tag.icon === 'check-circle' ? CheckCircle : tag.icon === 'star' ? Star :
      tag.icon === 'sparkles' ? Sparkles : tag.icon === 'users' ? Users :
      tag.icon === 'user-plus' ? UserPlus : tag.icon === 'badge-check' ? BadgeCheck : Award;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: tag.color, color: tag.textColor }}>
        <IconComp size={10} />
        {tag.name}
      </span>
    );
  };

  const UserAvatar = ({ user, size = 40 }: { user: User; size?: number }) => {
    const isCreatorOrAbove = user.role !== 'user';
    const borderColor = user.role === 'owner' ? '#e2231a' : user.role === 'admin' ? '#f59e0b' :
      user.role === 'creator' ? '#3b82f6' : '#6b7280';
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div className={`rounded-full overflow-hidden flex items-center justify-center font-bold ${darkMode ? 'bg-zinc-700 text-white' : 'bg-gray-200 text-gray-700'}`}
          style={{ width: size, height: size, border: isCreatorOrAbove ? `2px solid ${borderColor}` : 'none',
            fontSize: size * 0.4 }}>
          {user.profile.avatar ? (
            <img src={user.profile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            user.profile.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()
          )}
        </div>
        {user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2"
            style={{ borderColor: darkMode ? '#000' : '#fff' }} />
        )}
      </div>
    );
  };

  const AssetCard = ({ asset }: { asset: Asset }) => {
    const creator = users.find(u => u.id === asset.creatorId);
    const thumb = asset.thumbnail || ASSET_THUMBNAILS[asset.category] || ASSET_THUMBNAILS['Other'];
    return (
      <div className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}
        onClick={() => navigateTo('asset-detail', asset.id)}>
        <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden">
          <img src={thumb} alt={asset.title} className="w-16 h-16 opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 transition-transform duration-300" />
          {!asset.isFree && (
            <div className="absolute top-2 right-2 bg-roblox text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <DollarSign size={10} />R$ {asset.price}
            </div>
          )}
          {asset.isFree && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">FREE</div>
          )}
          <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs">{asset.category}</div>
        </div>
        <div className="p-4">
          <h3 className={`font-semibold ${textPrimary} truncate`}>{asset.title}</h3>
          <p className={`text-sm ${textSecondary} mt-1 line-clamp-2`}>{asset.description}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {creator && <UserAvatar user={creator} size={20} />}
              <span className={`text-xs ${textSecondary}`}>{creator?.profile.displayName || creator?.username}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className={`flex items-center gap-1 ${textMuted}`}>
                <Star size={12} className="text-yellow-500 fill-yellow-500" />{asset.rating.toFixed(1)}
              </span>
              <span className={`flex items-center gap-1 ${textMuted}`}>
                <Download size={12} />{asset.downloadCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AssetListItem = ({ asset }: { asset: Asset }) => {
    const creator = users.find(u => u.id === asset.creatorId);
    const thumb = asset.thumbnail || ASSET_THUMBNAILS[asset.category] || ASSET_THUMBNAILS['Other'];
    return (
      <div className={`${cardBg} border ${cardBorder} rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg flex gap-4 items-center`}
        onClick={() => navigateTo('asset-detail', asset.id)}>
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center flex-shrink-0">
          <img src={thumb} alt="" className="w-10 h-10 opacity-70" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${textPrimary} truncate`}>{asset.title}</h3>
          <p className={`text-sm ${textSecondary} truncate`}>{asset.description}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs ${textMuted}`}>{asset.category}</span>
            <span className={`text-xs ${textMuted} flex items-center gap-1`}><Star size={10} className="text-yellow-500 fill-yellow-500" />{asset.rating.toFixed(1)}</span>
            <span className={`text-xs ${textMuted} flex items-center gap-1`}><Download size={10} />{asset.downloadCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {creator && <span className={`text-xs ${textSecondary}`}>{creator.profile.displayName || creator.username}</span>}
          {asset.isFree ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold">FREE</span>
          ) : (
            <span className="bg-roblox text-white px-3 py-1 rounded-lg text-xs font-bold">R$ {asset.price}</span>
          )}
        </div>
      </div>
    );
  };

  // ==================== NOTIFICATION BAR ====================
  const NotificationBar = () => (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {notifications.map(n => (
        <div key={n.id} className={`animate-slideIn rounded-lg p-4 shadow-xl border flex items-start gap-3 ${
          n.type === 'success' ? 'bg-green-900 border-green-700 text-green-100' :
          n.type === 'error' ? 'bg-red-900 border-red-700 text-red-100' :
          n.type === 'warning' ? 'bg-yellow-900 border-yellow-700 text-yellow-100' :
          n.type === 'otp' ? 'bg-blue-900 border-blue-700 text-blue-100' :
          darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          {n.type === 'otp' ? <Key size={18} /> : n.type === 'success' ? <CheckCircle size={18} /> :
            n.type === 'error' ? <XCircle size={18} /> : n.type === 'warning' ? <AlertTriangle size={18} /> :
            <Info size={18} />}
          <p className="text-sm flex-1">{n.text}</p>
          <button onClick={() => setNotifications(p => p.filter(x => x.id !== n.id))}><X size={14} /></button>
        </div>
      ))}
    </div>
  );

  // ==================== HEADER ====================
  const Header = () => (
    <header className={`sticky top-0 z-50 ${darkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-xl border-b ${cardBorder}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
          <div className="w-9 h-9 bg-roblox rounded-lg flex items-center justify-center animate-pulse-glow">
            <Package size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className={`text-lg font-bold ${textPrimary} leading-tight`}>ROBLOX STUDIO</h1>
            <p className="text-[10px] text-roblox font-semibold tracking-widest -mt-1">ASSET PLATFORM</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Home', icon: Home, p: 'home' as Page },
            { label: 'Browse', icon: Search, p: 'browse' as Page },
            { label: 'Tutorial', icon: Info, p: 'tutorial' as Page },
          ].map(item => (
            <button key={item.label} onClick={() => navigateTo(item.p)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                page === item.p ? 'bg-roblox text-white' : `${textSecondary} ${hoverBg}`}`}>
              <item.icon size={16} />{item.label}
            </button>
          ))}
          {currentUser && (currentUser.role === 'creator' || currentUser.role === 'admin' || currentUser.role === 'owner') && (
            <button onClick={() => navigateTo('upload')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                page === 'upload' ? 'bg-roblox text-white' : `${textSecondary} ${hoverBg}`}`}>
              <Upload size={16} />Upload
            </button>
          )}
          {currentUser && (
            <>
              <button onClick={() => navigateTo('global-chat')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === 'global-chat' ? 'bg-roblox text-white' : `${textSecondary} ${hoverBg}`}`}>
                <MessageCircle size={16} />Chat
              </button>
              <button onClick={() => navigateTo('support')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === 'support' ? 'bg-roblox text-white' : `${textSecondary} ${hoverBg}`}`}>
                <Headphones size={16} />Support
              </button>
            </>
          )}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner') && (
            <button onClick={() => navigateTo('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                page === 'admin' ? 'bg-roblox text-white' : `${textSecondary} ${hoverBg}`}`}>
              <Shield size={16} />Admin
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button onClick={() => navigateTo('messages')} className={`p-2 rounded-lg ${hoverBg} ${textSecondary} relative`}>
                <Bell size={18} />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-roblox text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadMessages}
                  </span>
                )}
              </button>
              <button onClick={() => navigateTo('profile')} className="flex items-center gap-2">
                <UserAvatar user={currentUser} size={32} />
                <span className={`hidden md:block text-sm font-medium ${textPrimary}`}>
                  {currentUser.profile.displayName || currentUser.username}
                </span>
              </button>
              <button onClick={() => { setCurrentUser(null); navigateTo('home'); notify('Logged out successfully', 'success'); }}
                className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={() => navigateTo('login')}
              className="bg-roblox hover:bg-roblox-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Sign In
            </button>
          )}

          <button onClick={() => setMobileMenu(!mobileMenu)} className={`md:hidden p-2 rounded-lg ${hoverBg} ${textSecondary}`}>
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenu && (
        <div className={`md:hidden ${cardBg} border-t ${cardBorder} p-4 space-y-1 animate-fadeIn`}>
          {[
            { label: 'Home', icon: Home, p: 'home' as Page, show: true },
            { label: 'Browse Assets', icon: Search, p: 'browse' as Page, show: true },
            { label: 'Tutorial', icon: Info, p: 'tutorial' as Page, show: true },
            { label: 'Upload Asset', icon: Upload, p: 'upload' as Page, show: !!currentUser && currentUser.role !== 'user' },
            { label: 'Global Chat', icon: MessageCircle, p: 'global-chat' as Page, show: !!currentUser },
            { label: 'Support', icon: Headphones, p: 'support' as Page, show: !!currentUser },
            { label: 'My Assets', icon: Package, p: 'my-assets' as Page, show: !!currentUser && currentUser.role !== 'user' },
            { label: 'Sales', icon: BarChart3, p: 'sales' as Page, show: !!currentUser && currentUser.role !== 'user' },
            { label: 'Messages', icon: MessageSquare, p: 'messages' as Page, show: !!currentUser },
            { label: 'Profile', icon: UserIcon, p: 'profile' as Page, show: !!currentUser },
            { label: 'Admin Panel', icon: Shield, p: 'admin' as Page, show: !!currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner') },
          ].filter(i => i.show).map(item => (
            <button key={item.label} onClick={() => navigateTo(item.p)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                page === item.p ? 'bg-roblox text-white' : `${textSecondary} ${hoverBg}`}`}>
              <item.icon size={18} />{item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );

  // ==================== AUTH PAGES ====================
  const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const handleLogin = () => {
      const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
      if (user) {
        setCurrentUser({ ...user, isOnline: true, lastSeen: new Date().toISOString() });
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isOnline: true, lastSeen: new Date().toISOString() } : u));
        notify(`Welcome back, ${user.profile.displayName || user.username}!`, 'success');
        navigateTo('home');
      } else {
        notify('Invalid username/email or password', 'error');
      }
    };
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-8 w-full max-w-md animate-fadeIn`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-roblox rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Package size={32} className="text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Welcome Back</h2>
            <p className={`${textSecondary} mt-1`}>Sign in to your account</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Username or Email</label>
              <div className="relative">
                <UserIcon size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}
                  placeholder="Enter username or email" />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Password</label>
              <div className="relative">
                <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}
                  placeholder="Enter password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button onClick={() => setShowPw(!showPw)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
                  <Eye size={16} />
                </button>
              </div>
            </div>
            <button onClick={handleLogin}
              className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-lg font-semibold transition-colors">
              Sign In
            </button>
            <div className="flex items-center justify-between">
              <button onClick={() => navigateTo('forgot-password')}
                className="text-sm text-roblox hover:underline">Forgot Password?</button>
              <button onClick={() => navigateTo('register')}
                className="text-sm text-roblox hover:underline">Create Account</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [role, setRole] = useState<'user' | 'creator'>('user');
    const [otpInput, setOtpInput] = useState('');
    const [localOtp, setLocalOtp] = useState('');

    const handleSendOtp = () => {
      if (!username || !email || !password) { notify('Fill in all fields', 'error'); return; }
      if (password !== confirmPw) { notify('Passwords do not match', 'error'); return; }
      if (password.length < 6) { notify('Password must be at least 6 characters', 'error'); return; }
      if (users.find(u => u.username === username)) { notify('Username already taken', 'error'); return; }
      if (users.find(u => u.email === email)) { notify('Email already registered', 'error'); return; }
      const code = generateOTP();
      setLocalOtp(code);
      setOtpData({ code, email, expiresAt: Date.now() + 300000, purpose: 'register' });
      notify(`OTP Code: ${code} (sent to ${email})`, 'otp');
      setStep(2);
    };

    const handleVerify = () => {
      if (otpInput !== localOtp) { notify('Invalid OTP code', 'error'); return; }
      if (Date.now() > (otpData?.expiresAt || 0)) { notify('OTP expired, please resend', 'error'); return; }
      const newUser: User = {
        id: createId(), username, email, password, role,
        profile: { ...getDefaultProfile(), displayName: username },
        tags: ['tag-new'], following: [], followers: [], purchasedAssets: [],
        balance: 0, joinDate: new Date().toISOString().split('T')[0],
        lastSeen: new Date().toISOString(), isOnline: true,
        blacklistedBy: [], customerOf: [],
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setOtpData(null);
      notify('Account created successfully!', 'success');
      navigateTo('home');
    };

    const resendOtp = () => {
      const code = generateOTP();
      setLocalOtp(code);
      setOtpData({ code, email, expiresAt: Date.now() + 300000, purpose: 'register' });
      notify(`New OTP Code: ${code}`, 'otp');
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-8 w-full max-w-md animate-fadeIn`}>
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Create Account</h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s ? 'bg-roblox text-white' : darkMode ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-200 text-gray-500'}`}>
                    {step > s ? <Check size={16} /> : s}
                  </div>
                  {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-roblox' : darkMode ? 'bg-zinc-700' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Confirm Password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['user', 'creator'] as const).map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        role === r ? 'border-roblox bg-roblox/10' : `${cardBorder} ${hoverBg}`}`}>
                      {r === 'user' ? <UserIcon size={24} className={`mx-auto mb-2 ${role === r ? 'text-roblox' : textSecondary}`} /> :
                        <Palette size={24} className={`mx-auto mb-2 ${role === r ? 'text-roblox' : textSecondary}`} />}
                      <p className={`text-sm font-semibold ${role === r ? 'text-roblox' : textPrimary}`}>{r === 'user' ? 'User' : 'Creator'}</p>
                      <p className={`text-xs ${textMuted} mt-1`}>{r === 'user' ? 'Browse & download' : 'Upload & sell assets'}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSendOtp}
                className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-lg font-semibold">Continue</button>
              <p className={`text-center text-sm ${textSecondary}`}>
                Already have an account? <button onClick={() => navigateTo('login')} className="text-roblox hover:underline">Sign In</button>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className={`${darkMode ? 'bg-zinc-800' : 'bg-blue-50'} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={18} className="text-roblox" />
                  <span className={`text-sm font-semibold ${textPrimary}`}>Verify Your Email</span>
                </div>
                <p className={`text-xs ${textSecondary}`}>We sent a 6-digit code to <strong>{email}</strong></p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Enter OTP Code</label>
                <input type="text" value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-roblox`}
                  maxLength={6} placeholder="000000" />
              </div>
              <button onClick={handleVerify}
                className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-lg font-semibold">Verify & Create Account</button>
              <button onClick={resendOtp}
                className={`w-full py-2 text-sm ${textSecondary} hover:text-roblox flex items-center justify-center gap-2`}>
                <RefreshCw size={14} />Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [localOtp, setLocalOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    const handleSendOtp = () => {
      const user = users.find(u => u.email === email);
      if (!user) { notify('Email not found', 'error'); return; }
      const code = generateOTP();
      setLocalOtp(code);
      setOtpData({ code, email, expiresAt: Date.now() + 300000, purpose: 'reset' });
      notify(`OTP Code: ${code} (sent to ${email})`, 'otp');
      setStep(2);
    };

    const handleVerifyOtp = () => {
      if (otpInput !== localOtp) { notify('Invalid OTP code', 'error'); return; }
      if (Date.now() > (otpData?.expiresAt || 0)) { notify('OTP expired', 'error'); return; }
      setStep(3);
    };

    const handleResetPassword = () => {
      if (newPassword.length < 6) { notify('Password must be at least 6 characters', 'error'); return; }
      if (newPassword !== confirmPw) { notify('Passwords do not match', 'error'); return; }
      setUsers(prev => prev.map(u => u.email === email ? { ...u, password: newPassword } : u));
      setOtpData(null);
      notify('Password reset successfully! Please sign in.', 'success');
      navigateTo('login');
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-8 w-full max-w-md animate-fadeIn`}>
          <button onClick={() => navigateTo('login')} className={`flex items-center gap-2 ${textSecondary} hover:text-roblox text-sm mb-6`}>
            <ArrowLeft size={16} />Back to Login
          </button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-roblox/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key size={32} className="text-roblox" />
            </div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Reset Password</h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s ? 'bg-roblox text-white' : darkMode ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-200 text-gray-500'}`}>
                    {step > s ? <Check size={16} /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-roblox' : darkMode ? 'bg-zinc-700' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className={`w-full ${inputBg} border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}
                    placeholder="Enter your registered email" />
                </div>
              </div>
              <button onClick={handleSendOtp}
                className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-lg font-semibold">Send OTP</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className={`${darkMode ? 'bg-zinc-800' : 'bg-blue-50'} rounded-xl p-4`}>
                <p className={`text-sm ${textSecondary}`}>Enter the 6-digit code sent to <strong className={textPrimary}>{email}</strong></p>
              </div>
              <input type="text" value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-roblox`}
                maxLength={6} placeholder="000000" />
              <button onClick={handleVerifyOtp}
                className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-lg font-semibold">Verify OTP</button>
              <button onClick={() => { const c = generateOTP(); setLocalOtp(c); notify(`New OTP: ${c}`, 'otp'); }}
                className={`w-full py-2 text-sm ${textSecondary} hover:text-roblox flex items-center justify-center gap-2`}>
                <RefreshCw size={14} />Resend Code
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Confirm Password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <button onClick={handleResetPassword}
                className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-lg font-semibold">Reset Password</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== HOME PAGE ====================
  const HomePage = () => {
    const approvedAssets = assets.filter(a => a.status === 'approved');
    const topAssets = [...approvedAssets].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 6);
    const newAssets = [...approvedAssets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
    const paidAssets = approvedAssets.filter(a => !a.isFree).slice(0, 6);
    return (
      <div className="animate-fadeIn">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className={`${darkMode ? 'bg-gradient-to-br from-black via-zinc-900 to-black' : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'} py-20 px-4`}>
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-roblox/10 border border-roblox/30 rounded-full px-4 py-2 mb-6">
                <Zap size={14} className="text-roblox" />
                <span className="text-sm text-roblox font-medium">The #1 Roblox Studio Asset Platform</span>
              </div>
              <h1 className={`text-4xl md:text-6xl font-black ${textPrimary} mb-4`}>
                Share, Discover & Sell<br />
                <span className="text-roblox">Roblox Studio Assets</span>
              </h1>
              <p className={`text-lg ${textSecondary} max-w-2xl mx-auto mb-8`}>
                Join thousands of creators and developers. Upload your creations, discover amazing assets, and build incredible Roblox experiences.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => navigateTo('browse')}
                  className="bg-roblox hover:bg-roblox-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center gap-2">
                  <Search size={20} />Browse Assets
                </button>
                {!currentUser && (
                  <button onClick={() => navigateTo('register')}
                    className={`${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105`}>
                    Get Started Free
                  </button>
                )}
              </div>
              <div className="flex items-center justify-center gap-8 mt-12">
                {[
                  { label: 'Assets', value: approvedAssets.length.toString(), icon: Package },
                  { label: 'Creators', value: users.filter(u => u.role === 'creator' || u.role === 'owner').length.toString(), icon: Users },
                  { label: 'Downloads', value: approvedAssets.reduce((a, b) => a + b.downloadCount, 0).toLocaleString(), icon: Download },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <stat.icon size={20} className="text-roblox mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
                    <p className={`text-xs ${textSecondary}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
          {/* Categories */}
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary} mb-6`}>Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); navigateTo('browse'); }}
                  className={`${cardBg} border ${cardBorder} rounded-xl p-6 text-center transition-all hover:scale-105 hover:border-roblox group`}>
                  <img src={ASSET_THUMBNAILS[cat]} alt={cat} className="w-12 h-12 mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <p className={`text-sm font-semibold ${textPrimary}`}>{cat}</p>
                  <p className={`text-xs ${textMuted} mt-1`}>{approvedAssets.filter(a => a.category === cat).length} assets</p>
                </button>
              ))}
            </div>
          </div>

          {/* Popular */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}><TrendingUp size={24} className="text-roblox" />Popular Assets</h2>
              <button onClick={() => { setSortBy('popular'); navigateTo('browse'); }} className="text-sm text-roblox hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topAssets.map(a => <AssetCard key={a.id} asset={a} />)}
            </div>
          </div>

          {/* New */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}><Sparkles size={24} className="text-roblox" />New Assets</h2>
              <button onClick={() => { setSortBy('newest'); navigateTo('browse'); }} className="text-sm text-roblox hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newAssets.map(a => <AssetCard key={a.id} asset={a} />)}
            </div>
          </div>

          {/* Premium */}
          {paidAssets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}><DollarSign size={24} className="text-roblox" />Premium Assets</h2>
                <button onClick={() => { setPriceFilter('paid'); navigateTo('browse'); }} className="text-sm text-roblox hover:underline flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paidAssets.map(a => <AssetCard key={a.id} asset={a} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== BROWSE PAGE ====================
  const BrowsePage = () => {
    const approvedAssets = assets.filter(a => a.status === 'approved');
    let filtered = approvedAssets;
    if (searchQuery) filtered = filtered.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory !== 'All') filtered = filtered.filter(a => a.category === selectedCategory);
    if (priceFilter === 'free') filtered = filtered.filter(a => a.isFree);
    if (priceFilter === 'paid') filtered = filtered.filter(a => !a.isFree);
    if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === 'popular') filtered.sort((a, b) => b.downloadCount - a.downloadCount);
    if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-6`}>Browse Assets</h1>

        <div className={`${cardBg} border ${cardBorder} rounded-xl p-4 mb-6`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className={`w-full ${inputBg} border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}
                placeholder="Search assets..." />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                className={`${inputBg} border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={priceFilter} onChange={e => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                className={`${inputBg} border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}>
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'newest' | 'popular' | 'rating')}
                className={`${inputBg} border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: darkMode ? '#3f3f46' : '#d1d5db' }}>
                <button onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-roblox text-white' : `${inputBg}`}`}><Grid3X3 size={16} /></button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-roblox text-white' : `${inputBg}`}`}><List size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        <p className={`text-sm ${textSecondary} mb-4`}>{filtered.length} assets found</p>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => <AssetCard key={a.id} asset={a} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => <AssetListItem key={a.id} asset={a} />)}
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Package size={48} className={`mx-auto ${textMuted} mb-4`} />
            <p className={`${textSecondary} text-lg`}>No assets found</p>
          </div>
        )}
      </div>
    );
  };

  // ==================== ASSET DETAIL ====================
  const AssetDetailPage = () => {
    const asset = assets.find(a => a.id === selectedAssetId);
    const [ratingScore, setRatingScore] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    if (!asset) return <div className={`text-center py-20 ${textSecondary}`}>Asset not found</div>;
    const creator = users.find(u => u.id === asset.creatorId);
    const canDownload = asset.isFree || (currentUser && currentUser.purchasedAssets.includes(asset.id));
    const canDelete = currentUser && (currentUser.id === asset.creatorId || currentUser.role === 'admin' || currentUser.role === 'owner');
    const thumb = asset.thumbnail || ASSET_THUMBNAILS[asset.category] || ASSET_THUMBNAILS['Other'];

    const handlePurchase = () => {
      if (!currentUser) { navigateTo('login'); return; }
      if (currentUser.balance < asset.price) { notify('Insufficient balance', 'error'); return; }
      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - asset.price, purchasedAssets: [...prev.purchasedAssets, asset.id] } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: u.balance - asset.price, purchasedAssets: [...u.purchasedAssets, asset.id] } : u));
      if (creator) {
        setUsers(prev => prev.map(u => u.id === creator.id ? { ...u, balance: u.balance + asset.price * 0.9 } : u));
      }
      if (!currentUser.customerOf.includes(asset.creatorId)) {
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, customerOf: [...u.customerOf, asset.creatorId] } : u));
      }
      notify('Asset purchased successfully!', 'success');
    };

    const handleDownload = () => {
      if (!currentUser) { navigateTo('login'); return; }
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, downloadCount: a.downloadCount + 1 } : a));
      notify(`Downloading ${asset.title}...`, 'success');
    };

    const handleRate = () => {
      if (!currentUser) { navigateTo('login'); return; }
      const existing = asset.ratings.findIndex(r => r.userId === currentUser.id);
      const newRatings = [...asset.ratings];
      if (existing >= 0) newRatings[existing] = { userId: currentUser.id, score: ratingScore, comment: ratingComment };
      else newRatings.push({ userId: currentUser.id, score: ratingScore, comment: ratingComment });
      const avg = newRatings.reduce((a, b) => a + b.score, 0) / newRatings.length;
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, ratings: newRatings, rating: avg, ratingCount: newRatings.length } : a));
      notify('Rating submitted!', 'success');
      setRatingComment('');
    };

    const handleDelete = () => {
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      notify('Asset deleted', 'success');
      navigateTo('browse');
    };

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
        <button onClick={() => navigateTo('browse')} className={`flex items-center gap-2 ${textSecondary} hover:text-roblox text-sm mb-6`}>
          <ArrowLeft size={16} />Back to Browse
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden`}>
              <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <img src={thumb} alt={asset.title} className="w-24 h-24 opacity-50" />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-roblox/10 text-roblox px-3 py-1 rounded-full text-xs font-medium">{asset.category}</span>
                  {asset.tags.map(t => (
                    <span key={t} className={`${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-600'} px-3 py-1 rounded-full text-xs`}>#{t}</span>
                  ))}
                </div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>{asset.title}</h1>
                <p className={`${textSecondary} leading-relaxed`}>{asset.description}</p>
              </div>
            </div>

            {/* Reviews */}
            <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Reviews ({asset.ratingCount})</h3>
              {currentUser && (
                <div className={`${darkMode ? 'bg-zinc-800' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm ${textSecondary}`}>Your Rating:</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setRatingScore(s)}>
                          <Star size={20} className={s <= ratingScore ? 'text-yellow-500 fill-yellow-500' : textMuted} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)}
                    className={`w-full ${inputBg} border rounded-lg px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-roblox`}
                    rows={2} placeholder="Write a review..." />
                  <button onClick={handleRate} className="mt-2 bg-roblox hover:bg-roblox-dark text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Submit Review
                  </button>
                </div>
              )}
              <div className="space-y-4">
                {asset.ratings.map((r, i) => {
                  const reviewer = users.find(u => u.id === r.userId);
                  return (
                    <div key={i} className={`border-b ${cardBorder} pb-4 last:border-0`}>
                      <div className="flex items-center gap-3 mb-2">
                        {reviewer && <UserAvatar user={reviewer} size={28} />}
                        <span className={`text-sm font-medium ${textPrimary}`}>{reviewer?.profile.displayName || reviewer?.username}</span>
                        <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.score ? 'text-yellow-500 fill-yellow-500' : textMuted} />)}</div>
                      </div>
                      {r.comment && <p className={`text-sm ${textSecondary} ml-10`}>{r.comment}</p>}
                    </div>
                  );
                })}
                {asset.ratings.length === 0 && <p className={`text-sm ${textMuted} text-center py-4`}>No reviews yet</p>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
              <div className="text-center mb-4">
                {asset.isFree ? (
                  <p className="text-3xl font-bold text-green-500">FREE</p>
                ) : (
                  <p className="text-3xl font-bold text-roblox">R$ {asset.price}</p>
                )}
              </div>
              {canDownload ? (
                <button onClick={handleDownload} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Download size={18} />Download
                </button>
              ) : (
                <button onClick={handlePurchase} className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />Purchase
                </button>
              )}
              {canDelete && (
                <button onClick={handleDelete} className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
                  <Trash2 size={16} />Delete Asset
                </button>
              )}
              <div className={`mt-4 space-y-3 text-sm ${textSecondary}`}>
                <div className="flex justify-between"><span>Downloads</span><span className={textPrimary}>{asset.downloadCount}</span></div>
                <div className="flex justify-between"><span>Rating</span><span className={`${textPrimary} flex items-center gap-1`}><Star size={12} className="text-yellow-500 fill-yellow-500" />{asset.rating.toFixed(1)} ({asset.ratingCount})</span></div>
                <div className="flex justify-between"><span>File Size</span><span className={textPrimary}>{asset.fileSize}</span></div>
                <div className="flex justify-between"><span>Published</span><span className={textPrimary}>{asset.createdAt}</span></div>
              </div>
            </div>

            {creator && (
              <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
                <h3 className={`text-sm font-semibold ${textSecondary} mb-3`}>CREATOR</h3>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('user-profile', undefined, creator.id)}>
                  <UserAvatar user={creator} size={48} />
                  <div>
                    <p className={`font-semibold ${textPrimary}`}>{creator.profile.displayName || creator.username}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {creator.tags.slice(0, 2).map(t => <TagBadge key={t} tagId={t} />)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==================== UPLOAD PAGE ====================
  const UploadPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Models');
    const [assetTags, setAssetTags] = useState('');
    const [price, setPrice] = useState('0');
    const [isFree, setIsFree] = useState(true);

    if (!currentUser || currentUser.role === 'user') return (
      <div className="text-center py-20">
        <Lock size={48} className="text-roblox mx-auto mb-4" />
        <p className={`${textPrimary} text-xl font-bold`}>Creator Access Required</p>
        <p className={`${textSecondary} mt-2`}>Only creators can upload assets</p>
      </div>
    );

    const handleUpload = () => {
      if (!title || !description) { notify('Fill in all required fields', 'error'); return; }
      const newAsset: Asset = {
        id: createId(), title, description, category,
        tags: assetTags.split(',').map(t => t.trim()).filter(Boolean),
        creatorId: currentUser.id, price: isFree ? 0 : parseInt(price) || 0,
        isFree, downloadCount: 0, rating: 0, ratingCount: 0, ratings: [],
        status: currentUser.role === 'owner' ? 'approved' : 'pending',
        createdAt: new Date().toISOString().split('T')[0], fileSize: `${(Math.random() * 20 + 1).toFixed(1)} MB`,
        thumbnail: '', images: [],
      };
      setAssets(prev => [...prev, newAsset]);
      notify(currentUser.role === 'owner' ? 'Asset published!' : 'Asset submitted for review!', 'success');
      navigateTo('my-assets');
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Upload Asset</h1>
        <p className={`${textSecondary} mb-8`}>Share your creation with the community</p>
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 space-y-6`}>
          <div className={`border-2 border-dashed ${darkMode ? 'border-zinc-700' : 'border-gray-300'} rounded-xl p-8 text-center`}>
            <Upload size={40} className={`${textMuted} mx-auto mb-3`} />
            <p className={`${textSecondary} text-sm`}>Drag & drop your asset file here or click to browse</p>
            <button className="mt-3 bg-roblox hover:bg-roblox-dark text-white px-4 py-2 rounded-lg text-sm font-medium">Choose File</button>
          </div>
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-roblox`} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Tags (comma separated)</label>
              <input type="text" value={assetTags} onChange={e => setAssetTags(e.target.value)}
                className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} placeholder="tag1, tag2" />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Pricing</label>
            <div className="flex gap-4 mb-3">
              <button onClick={() => setIsFree(true)} className={`flex-1 py-3 rounded-xl font-medium text-sm border transition-all ${isFree ? 'border-green-500 bg-green-500/10 text-green-500' : `${cardBorder} ${textSecondary}`}`}>
                Free
              </button>
              <button onClick={() => setIsFree(false)} className={`flex-1 py-3 rounded-xl font-medium text-sm border transition-all ${!isFree ? 'border-roblox bg-roblox/10 text-roblox' : `${cardBorder} ${textSecondary}`}`}>
                Paid
              </button>
            </div>
            {!isFree && (
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted} text-sm font-medium`}>R$</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} min="1" />
              </div>
            )}
          </div>
          <button onClick={handleUpload}
            className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <Upload size={18} />Upload Asset
          </button>
        </div>
      </div>
    );
  };

  // ==================== PROFILE PAGE ====================
  const ProfilePage = () => {
    if (!currentUser) return null;
    const myAssets = assets.filter(a => a.creatorId === currentUser.id);
    const totalDownloads = myAssets.reduce((a, b) => a + b.downloadCount, 0);
    const isCreatorOrAbove = currentUser.role !== 'user';

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-20">
          <div className="h-48 md:h-56" style={{ background: currentUser.profile.banner ? `url(${currentUser.profile.banner}) center/cover` : `linear-gradient(135deg, ${currentUser.profile.bannerColor}, #000)` }} />
          <div className="absolute -bottom-16 left-6 flex items-end gap-4">
            <div className="relative">
              <UserAvatar user={currentUser} size={96} />
              {currentUser.profile.customStatus && (
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${darkMode ? 'bg-zinc-800' : 'bg-white'} px-2 py-0.5 rounded-full text-[10px] ${textSecondary} border ${cardBorder} whitespace-nowrap`}>
                  {currentUser.profile.statusEmoji} {currentUser.profile.customStatus}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => navigateTo('edit-profile')}
            className="absolute bottom-4 right-4 bg-roblox hover:bg-roblox-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Edit3 size={14} />Edit Profile
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{currentUser.profile.displayName || currentUser.username}</h2>
            {currentUser.tags.map(t => <TagBadge key={t} tagId={t} />)}
          </div>
          <p className={`${textMuted} text-sm`}>@{currentUser.username}</p>
          {currentUser.profile.pronouns && <p className={`text-xs ${textMuted} mt-1`}>{currentUser.profile.pronouns}</p>}
          {currentUser.profile.bio && <p className={`${textSecondary} mt-3`}>{currentUser.profile.bio}</p>}

          {/* About Me */}
          {currentUser.profile.aboutMe && (
            <div className={`${darkMode ? 'bg-zinc-800' : 'bg-gray-50'} rounded-xl p-4 mt-4`}>
              <h4 className={`text-sm font-semibold ${textPrimary} mb-2`}>About Me</h4>
              <p className={`text-sm ${textSecondary} whitespace-pre-wrap`}>{currentUser.profile.aboutMe}</p>
            </div>
          )}

          {/* Social Links - Creator/Staff only get full links */}
          <div className="flex flex-wrap gap-3 mt-4">
            {currentUser.profile.location && (
              <span className={`flex items-center gap-1 text-sm ${textMuted}`}><MapPin size={14} />{currentUser.profile.location}</span>
            )}
            {isCreatorOrAbove && currentUser.profile.discordLink && (
              <a href={currentUser.profile.discordLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-indigo-400 hover:underline"><Hash size={14} />Discord</a>
            )}
            {isCreatorOrAbove && currentUser.profile.twitterLink && (
              <a href={currentUser.profile.twitterLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-400 hover:underline"><ExternalLink size={14} />Twitter</a>
            )}
            {isCreatorOrAbove && currentUser.profile.youtubeLink && (
              <a href={currentUser.profile.youtubeLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-red-400 hover:underline"><ExternalLink size={14} />YouTube</a>
            )}
            {isCreatorOrAbove && currentUser.profile.websiteLink && (
              <a href={currentUser.profile.websiteLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-roblox hover:underline"><Globe size={14} />Website</a>
            )}
            {isCreatorOrAbove && currentUser.profile.robloxProfile && (
              <a href={currentUser.profile.robloxProfile} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-green-400 hover:underline"><ExternalLink size={14} />Roblox</a>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Following', value: currentUser.following.length },
              { label: 'Followers', value: currentUser.followers.length },
              { label: 'Assets', value: myAssets.length },
              { label: 'Downloads', value: totalDownloads },
            ].map(s => (
              <div key={s.label} className={`${cardBg} border ${cardBorder} rounded-xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${textPrimary}`}>{s.value}</p>
                <p className={`text-xs ${textSecondary}`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'My Assets', icon: Package, p: 'my-assets' as Page, show: isCreatorOrAbove },
              { label: 'Sales', icon: BarChart3, p: 'sales' as Page, show: isCreatorOrAbove },
              { label: 'Messages', icon: MessageSquare, p: 'messages' as Page, show: true },
              { label: 'Settings', icon: Settings, p: 'edit-profile' as Page, show: true },
            ].filter(i => i.show).map(item => (
              <button key={item.label} onClick={() => navigateTo(item.p)}
                className={`${cardBg} border ${cardBorder} rounded-xl p-4 text-center transition-all hover:border-roblox ${hoverBg}`}>
                <item.icon size={24} className="text-roblox mx-auto mb-2" />
                <p className={`text-sm font-medium ${textPrimary}`}>{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ==================== EDIT PROFILE PAGE ====================
  const EditProfilePage = () => {
    if (!currentUser) return null;
    const isCreatorOrAbove = currentUser.role !== 'user';
    const [p, setP] = useState({ ...currentUser.profile });
    const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });

    const handleSave = () => {
      setCurrentUser(prev => prev ? { ...prev, profile: p } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, profile: p } : u));
      notify('Profile updated!', 'success');
      navigateTo('profile');
    };

    const handleChangePw = () => {
      if (pw.current !== currentUser.password) { notify('Current password incorrect', 'error'); return; }
      if (pw.newPw.length < 6) { notify('New password must be at least 6 characters', 'error'); return; }
      if (pw.newPw !== pw.confirm) { notify('Passwords do not match', 'error'); return; }
      setCurrentUser(prev => prev ? { ...prev, password: pw.newPw } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, password: pw.newPw } : u));
      setPw({ current: '', newPw: '', confirm: '' });
      notify('Password changed successfully!', 'success');
    };

    const Field = ({ label, value, onChange, placeholder = '', type = 'text', disabled = false }: {
      label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
    }) => (
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
          className={`w-full ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
      </div>
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
        <button onClick={() => navigateTo('profile')} className={`flex items-center gap-2 ${textSecondary} hover:text-roblox text-sm mb-6`}>
          <ArrowLeft size={16} />Back to Profile
        </button>
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Edit Profile</h1>
        <p className={`${textSecondary} mb-8`}>{isCreatorOrAbove ? 'Full customization available for creators & staff' : 'Basic customization for users'}</p>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}><UserIcon size={20} className="text-roblox" />Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Display Name" value={p.displayName} onChange={v => setP({...p, displayName: v})} />
              <Field label="Pronouns" value={p.pronouns} onChange={v => setP({...p, pronouns: v})} placeholder="e.g. he/him" />
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Bio</label>
                <textarea value={p.bio} onChange={e => setP({...p, bio: e.target.value})}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-roblox`} rows={2} />
              </div>
              <Field label="Location" value={p.location} onChange={v => setP({...p, location: v})} placeholder="City, Country" />
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Custom Status</label>
                <div className="flex gap-2">
                  <input type="text" value={p.statusEmoji} onChange={e => setP({...p, statusEmoji: e.target.value})} placeholder="😊"
                    className={`w-14 ${inputBg} border rounded-lg px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-roblox`} />
                  <input type="text" value={p.customStatus} onChange={e => setP({...p, customStatus: e.target.value})} placeholder="What are you up to?"
                    className={`flex-1 ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
                </div>
              </div>
            </div>
          </div>

          {/* Appearance - Creator+ */}
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-1 flex items-center gap-2`}>
              <Palette size={20} className="text-roblox" />Appearance
              {!isCreatorOrAbove && <span className="text-xs bg-roblox/10 text-roblox px-2 py-0.5 rounded-full ml-2">Creator Only</span>}
            </h3>
            <p className={`text-xs ${textMuted} mb-4`}>{isCreatorOrAbove ? 'Customize your profile appearance' : 'Upgrade to Creator to unlock full customization'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Avatar URL" value={p.avatar} onChange={v => setP({...p, avatar: v})} placeholder="https://..." />
              <Field label="Banner Image URL" value={p.banner} onChange={v => setP({...p, banner: v})} placeholder="https://..." disabled={!isCreatorOrAbove} />
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Banner Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={p.bannerColor} onChange={e => setP({...p, bannerColor: e.target.value})} disabled={!isCreatorOrAbove}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                  <input type="text" value={p.bannerColor} onChange={e => setP({...p, bannerColor: e.target.value})} disabled={!isCreatorOrAbove}
                    className={`flex-1 ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox ${!isCreatorOrAbove ? 'opacity-50' : ''}`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={p.accentColor} onChange={e => setP({...p, accentColor: e.target.value})} disabled={!isCreatorOrAbove}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                  <input type="text" value={p.accentColor} onChange={e => setP({...p, accentColor: e.target.value})} disabled={!isCreatorOrAbove}
                    className={`flex-1 ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox ${!isCreatorOrAbove ? 'opacity-50' : ''}`} />
                </div>
              </div>
            </div>
          </div>

          {/* About Me */}
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <Info size={20} className="text-roblox" />About Me
              {!isCreatorOrAbove && <span className="text-xs bg-roblox/10 text-roblox px-2 py-0.5 rounded-full ml-2">Creator Only</span>}
            </h3>
            <textarea value={p.aboutMe} onChange={e => setP({...p, aboutMe: e.target.value})} disabled={!isCreatorOrAbove}
              className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-roblox ${!isCreatorOrAbove ? 'opacity-50' : ''}`}
              rows={4} placeholder="Tell the community about yourself..." />
          </div>

          {/* Social Links - Creator+ */}
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-1 flex items-center gap-2`}>
              <Link2 size={20} className="text-roblox" />Social Links
              {!isCreatorOrAbove && <span className="text-xs bg-roblox/10 text-roblox px-2 py-0.5 rounded-full ml-2">Creator Only</span>}
            </h3>
            <p className={`text-xs ${textMuted} mb-4`}>{isCreatorOrAbove ? 'Connect your social profiles' : 'Upgrade to Creator to add social links'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Discord Server Link" value={p.discordLink} onChange={v => setP({...p, discordLink: v})} placeholder="https://discord.gg/..." disabled={!isCreatorOrAbove} />
              <Field label="Twitter / X" value={p.twitterLink} onChange={v => setP({...p, twitterLink: v})} placeholder="https://twitter.com/..." disabled={!isCreatorOrAbove} />
              <Field label="YouTube Channel" value={p.youtubeLink} onChange={v => setP({...p, youtubeLink: v})} placeholder="https://youtube.com/..." disabled={!isCreatorOrAbove} />
              <Field label="Website" value={p.websiteLink} onChange={v => setP({...p, websiteLink: v})} placeholder="https://..." disabled={!isCreatorOrAbove} />
              <Field label="Roblox Profile" value={p.robloxProfile} onChange={v => setP({...p, robloxProfile: v})} placeholder="https://roblox.com/users/..." disabled={!isCreatorOrAbove} />
            </div>
          </div>

          {/* Change Password */}
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}><Lock size={20} className="text-roblox" />Change Password</h3>
            <div className="space-y-4">
              <Field label="Current Password" value={pw.current} onChange={v => setPw({...pw, current: v})} type="password" />
              <Field label="New Password" value={pw.newPw} onChange={v => setPw({...pw, newPw: v})} type="password" />
              <Field label="Confirm New Password" value={pw.confirm} onChange={v => setPw({...pw, confirm: v})} type="password" />
              <button onClick={handleChangePw}
                className="bg-roblox hover:bg-roblox-dark text-white px-6 py-2.5 rounded-lg font-medium text-sm">Change Password</button>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleSave} className="flex-1 bg-roblox hover:bg-roblox-dark text-white py-3 rounded-xl font-bold">Save Changes</button>
            <button onClick={() => navigateTo('profile')} className={`px-6 py-3 rounded-xl font-medium border ${cardBorder} ${textSecondary} ${hoverBg}`}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== USER PROFILE PAGE ====================
  const UserProfilePage = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return <div className={`text-center py-20 ${textSecondary}`}>User not found</div>;
    const userAssets = assets.filter(a => a.creatorId === user.id && a.status === 'approved');
    const isFollowing = currentUser?.following.includes(user.id);
    const isCreatorOrAbove = user.role !== 'user';

    const handleFollow = () => {
      if (!currentUser) { navigateTo('login'); return; }
      if (isFollowing) {
        setCurrentUser(prev => prev ? { ...prev, following: prev.following.filter(id => id !== user.id) } : null);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, following: u.following.filter(id => id !== user.id) } :
          u.id === user.id ? { ...u, followers: u.followers.filter(id => id !== currentUser.id) } : u));
      } else {
        setCurrentUser(prev => prev ? { ...prev, following: [...prev.following, user.id] } : null);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, following: [...u.following, user.id] } :
          u.id === user.id ? { ...u, followers: [...u.followers, currentUser.id] } : u));
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="relative rounded-2xl overflow-hidden mb-20">
          <div className="h-48 md:h-56" style={{ background: user.profile.banner ? `url(${user.profile.banner}) center/cover` : `linear-gradient(135deg, ${user.profile.bannerColor}, #000)` }} />
          <div className="absolute -bottom-16 left-6">
            <UserAvatar user={user} size={96} />
          </div>
          {currentUser && currentUser.id !== user.id && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button onClick={handleFollow}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  isFollowing ? `${cardBg} border ${cardBorder} ${textPrimary}` : 'bg-roblox text-white'}`}>
                {isFollowing ? <><UserCheck size={14} />Following</> : <><UserPlus size={14} />Follow</>}
              </button>
              <button onClick={() => {
                setSelectedTicketId('');
                const existingTicket = supportTickets.find(t => t.userId === currentUser.id && t.targetId === user.id && t.status === 'open');
                if (existingTicket) {
                  setSelectedTicketId(existingTicket.id);
                  navigateTo('support-chat');
                } else {
                  const newTicket: SupportTicket = {
                    id: createId(), userId: currentUser.id, targetId: user.id,
                    subject: `Chat with ${user.profile.displayName || user.username}`,
                    status: 'open', messages: [], createdAt: new Date().toISOString(),
                  };
                  setSupportTickets(prev => [...prev, newTicket]);
                  setSelectedTicketId(newTicket.id);
                  navigateTo('support-chat');
                }
              }} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${cardBg} border ${cardBorder} ${textPrimary}`}>
                <MessageCircle size={14} />Message
              </button>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{user.profile.displayName || user.username}</h2>
            {user.tags.map(t => <TagBadge key={t} tagId={t} />)}
          </div>
          <p className={`${textMuted} text-sm`}>@{user.username}</p>
          {user.profile.pronouns && <p className={`text-xs ${textMuted} mt-1`}>{user.profile.pronouns}</p>}
          {user.profile.bio && <p className={`${textSecondary} mt-3`}>{user.profile.bio}</p>}
          {user.profile.aboutMe && (
            <div className={`${darkMode ? 'bg-zinc-800' : 'bg-gray-50'} rounded-xl p-4 mt-4`}>
              <h4 className={`text-sm font-semibold ${textPrimary} mb-2`}>About Me</h4>
              <p className={`text-sm ${textSecondary} whitespace-pre-wrap`}>{user.profile.aboutMe}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            {user.profile.location && <span className={`flex items-center gap-1 text-sm ${textMuted}`}><MapPin size={14} />{user.profile.location}</span>}
            {isCreatorOrAbove && user.profile.discordLink && (
              <a href={user.profile.discordLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-indigo-400 hover:underline"><Hash size={14} />Discord</a>
            )}
            {isCreatorOrAbove && user.profile.twitterLink && (
              <a href={user.profile.twitterLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-400 hover:underline"><ExternalLink size={14} />Twitter</a>
            )}
            {isCreatorOrAbove && user.profile.youtubeLink && (
              <a href={user.profile.youtubeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-red-400 hover:underline"><ExternalLink size={14} />YouTube</a>
            )}
            {isCreatorOrAbove && user.profile.websiteLink && (
              <a href={user.profile.websiteLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-roblox hover:underline"><Globe size={14} />Website</a>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className={`${cardBg} border ${cardBorder} rounded-xl p-4 text-center`}><p className={`text-2xl font-bold ${textPrimary}`}>{user.followers.length}</p><p className={`text-xs ${textSecondary}`}>Followers</p></div>
            <div className={`${cardBg} border ${cardBorder} rounded-xl p-4 text-center`}><p className={`text-2xl font-bold ${textPrimary}`}>{userAssets.length}</p><p className={`text-xs ${textSecondary}`}>Assets</p></div>
            <div className={`${cardBg} border ${cardBorder} rounded-xl p-4 text-center`}><p className={`text-2xl font-bold ${textPrimary}`}>{userAssets.reduce((a,b) => a + b.downloadCount, 0)}</p><p className={`text-xs ${textSecondary}`}>Downloads</p></div>
          </div>
          {userAssets.length > 0 && (
            <div className="mt-8">
              <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Assets by {user.profile.displayName || user.username}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userAssets.map(a => <AssetCard key={a.id} asset={a} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== MY ASSETS ====================
  const MyAssetsPage = () => {
    if (!currentUser) return null;
    const myAssets = assets.filter(a => a.creatorId === currentUser.id);
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-6`}>My Assets</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAssets.map(a => (
            <div key={a.id} className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden`}>
              <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <img src={ASSET_THUMBNAILS[a.category] || ASSET_THUMBNAILS['Other']} alt="" className="w-12 h-12 opacity-50" />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${
                  a.status === 'approved' ? 'bg-green-500 text-white' : a.status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
                  {a.status.toUpperCase()}
                </div>
              </div>
              <div className="p-4">
                <h3 className={`font-semibold ${textPrimary}`}>{a.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm ${textSecondary}`}>{a.isFree ? 'Free' : `R$ ${a.price}`}</span>
                  <span className={`text-sm ${textMuted} flex items-center gap-1`}><Download size={12} />{a.downloadCount}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigateTo('asset-detail', a.id)} className="flex-1 bg-roblox hover:bg-roblox-dark text-white py-2 rounded-lg text-xs font-medium">View</button>
                  <button onClick={() => { setAssets(prev => prev.filter(x => x.id !== a.id)); notify('Asset deleted', 'success'); }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs"><Trash2 size={12} /></button>
                </div>
                {a.rejectReason && <p className="text-xs text-red-400 mt-2">Reason: {a.rejectReason}</p>}
              </div>
            </div>
          ))}
        </div>
        {myAssets.length === 0 && (
          <div className="text-center py-20">
            <Package size={48} className={`mx-auto ${textMuted} mb-4`} />
            <p className={`${textSecondary}`}>No assets yet</p>
            <button onClick={() => navigateTo('upload')} className="mt-4 bg-roblox hover:bg-roblox-dark text-white px-6 py-2 rounded-lg text-sm font-medium">Upload Your First Asset</button>
          </div>
        )}
      </div>
    );
  };

  // ==================== SALES PAGE ====================
  const SalesPage = () => {
    if (!currentUser) return null;
    const myAssets = assets.filter(a => a.creatorId === currentUser.id);
    const totalRevenue = myAssets.filter(a => !a.isFree).reduce((acc, a) => acc + a.downloadCount * a.price * 0.9, 0);
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-6`}>Sales Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <DollarSign size={24} className="text-roblox mb-2" />
            <p className={`text-3xl font-bold ${textPrimary}`}>R$ {totalRevenue.toFixed(0)}</p>
            <p className={`text-sm ${textSecondary}`}>Total Revenue</p>
          </div>
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <Package size={24} className="text-roblox mb-2" />
            <p className={`text-3xl font-bold ${textPrimary}`}>{myAssets.length}</p>
            <p className={`text-sm ${textSecondary}`}>Total Assets</p>
          </div>
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <Download size={24} className="text-roblox mb-2" />
            <p className={`text-3xl font-bold ${textPrimary}`}>{myAssets.reduce((a, b) => a + b.downloadCount, 0)}</p>
            <p className={`text-sm ${textSecondary}`}>Total Downloads</p>
          </div>
        </div>
        <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden`}>
          <div className="p-4 border-b border-zinc-800">
            <h3 className={`font-bold ${textPrimary}`}>Asset Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={darkMode ? 'bg-zinc-800' : 'bg-gray-50'}>
                  <th className={`text-left px-4 py-3 ${textSecondary} font-medium`}>Asset</th>
                  <th className={`text-left px-4 py-3 ${textSecondary} font-medium`}>Price</th>
                  <th className={`text-left px-4 py-3 ${textSecondary} font-medium`}>Downloads</th>
                  <th className={`text-left px-4 py-3 ${textSecondary} font-medium`}>Rating</th>
                  <th className={`text-left px-4 py-3 ${textSecondary} font-medium`}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {myAssets.map(a => (
                  <tr key={a.id} className={`border-t ${cardBorder} ${hoverBg} cursor-pointer`} onClick={() => navigateTo('asset-detail', a.id)}>
                    <td className={`px-4 py-3 ${textPrimary} font-medium`}>{a.title}</td>
                    <td className={`px-4 py-3 ${a.isFree ? 'text-green-500' : 'text-roblox'}`}>{a.isFree ? 'Free' : `R$ ${a.price}`}</td>
                    <td className={`px-4 py-3 ${textSecondary}`}>{a.downloadCount}</td>
                    <td className={`px-4 py-3 ${textSecondary} flex items-center gap-1`}><Star size={12} className="text-yellow-500 fill-yellow-500" />{a.rating.toFixed(1)}</td>
                    <td className={`px-4 py-3 ${textPrimary} font-medium`}>{a.isFree ? '-' : `R$ ${(a.downloadCount * a.price * 0.9).toFixed(0)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MESSAGES PAGE ====================
  const MessagesPage = () => {
    if (!currentUser) return null;
    const [replyTo, setReplyTo] = useState('');
    const [replyText, setReplyText] = useState('');
    const myMessages = messages.filter(m => m.toId === currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleMarkRead = (id: string) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    };

    const handleReply = () => {
      if (!replyText.trim()) return;
      const newMsg: Message = {
        id: createId(), fromId: currentUser.id, toId: replyTo, content: replyText,
        type: 'chat', read: false, createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      setReplyText('');
      setReplyTo('');
      notify('Message sent!', 'success');
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
          <Bell size={28} className="text-roblox" />Messages
          {unreadMessages > 0 && <span className="bg-roblox text-white text-sm px-3 py-1 rounded-full">{unreadMessages} new</span>}
        </h1>
        <div className="space-y-3">
          {myMessages.map(m => {
            const sender = users.find(u => u.id === m.fromId);
            return (
              <div key={m.id} className={`${cardBg} border ${m.read ? cardBorder : 'border-roblox'} rounded-xl p-4 transition-all`}
                onClick={() => handleMarkRead(m.id)}>
                <div className="flex items-start gap-3">
                  {sender && <UserAvatar user={sender} size={36} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${textPrimary}`}>{sender?.profile.displayName || sender?.username}</span>
                      {sender && sender.tags.slice(0, 1).map(t => <TagBadge key={t} tagId={t} />)}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                        m.type === 'info' ? 'bg-blue-500/10 text-blue-500' :
                        m.type === 'system' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-green-500/10 text-green-500'}`}>
                        {m.type}
                      </span>
                      {!m.read && <span className="w-2 h-2 bg-roblox rounded-full" />}
                    </div>
                    <p className={`text-sm ${textSecondary} mt-1`}>{m.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs ${textMuted}`}>{new Date(m.createdAt).toLocaleString()}</span>
                      <button onClick={(e) => { e.stopPropagation(); setReplyTo(m.fromId); }}
                        className="text-xs text-roblox hover:underline">Reply</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {myMessages.length === 0 && (
            <div className="text-center py-20"><MessageSquare size={48} className={`mx-auto ${textMuted} mb-4`} /><p className={textSecondary}>No messages</p></div>
          )}
        </div>
        {replyTo && (
          <div className={`fixed bottom-0 left-0 right-0 ${cardBg} border-t ${cardBorder} p-4 z-50`}>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm ${textSecondary}`}>Replying to {users.find(u => u.id === replyTo)?.username}</span>
                <button onClick={() => setReplyTo('')} className={textMuted}><X size={14} /></button>
              </div>
              <div className="flex gap-2">
                <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                  className={`flex-1 ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}
                  placeholder="Type your reply..." onKeyDown={e => e.key === 'Enter' && handleReply()} />
                <button onClick={handleReply} className="bg-roblox hover:bg-roblox-dark text-white p-2.5 rounded-lg"><Send size={18} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== GLOBAL CHAT ====================
  const GlobalChatPage = () => {
    if (!currentUser) return null;
    const [msg, setMsg] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);
    const [channel, setChannel] = useState('general');
    const channels = ['general', 'showcase', 'help', 'off-topic'];

    const filteredChats = chatMessages.filter(c => c.channel === channel).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    useEffect(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [filteredChats.length]);

    const handleSend = () => {
      if (!msg.trim()) return;
      const newChat: ChatMessage = {
        id: createId(), userId: currentUser.id, content: msg,
        createdAt: new Date().toISOString(), channel,
      };
      setChatMessages(prev => [...prev, newChat]);
      setMsg('');
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
          <MessageCircle size={28} className="text-roblox" />Global Chat
        </h1>
        <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden flex flex-col md:flex-row`} style={{ height: '70vh' }}>
          {/* Channels */}
          <div className={`w-full md:w-48 border-b md:border-b-0 md:border-r ${cardBorder} p-3 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible`}>
            <p className={`text-xs font-bold ${textMuted} uppercase px-2 py-1 hidden md:block`}>Channels</p>
            {channels.map(ch => (
              <button key={ch} onClick={() => setChannel(ch)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  channel === ch ? 'bg-roblox text-white' : `${textSecondary} ${hoverBg}`}`}>
                <Hash size={14} />{ch}
              </button>
            ))}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className={`p-3 border-b ${cardBorder} flex items-center gap-2`}>
              <Hash size={18} className="text-roblox" />
              <span className={`font-semibold ${textPrimary}`}>{channel}</span>
              <span className={`text-xs ${textMuted}`}>• {filteredChats.length} messages</span>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredChats.map(c => {
                const sender = users.find(u => u.id === c.userId);
                const isMe = c.userId === currentUser.id;
                return (
                  <div key={c.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {sender && <UserAvatar user={sender} size={36} />}
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-sm font-semibold ${textPrimary} cursor-pointer hover:underline`}
                          onClick={() => sender && navigateTo('user-profile', undefined, sender.id)}>
                          {sender?.profile.displayName || sender?.username}
                        </span>
                        {sender && sender.tags.slice(0, 2).map(t => <TagBadge key={t} tagId={t} />)}
                        <span className={`text-xs ${textMuted}`}>{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className={`rounded-2xl px-4 py-2 text-sm ${
                        isMe ? 'bg-roblox text-white rounded-tr-sm' : `${darkMode ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'} rounded-tl-sm`}`}>
                        {c.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredChats.length === 0 && (
                <div className="text-center py-20">
                  <MessageCircle size={40} className={textMuted} />
                  <p className={`${textSecondary} mt-2`}>No messages in #{channel} yet. Start the conversation!</p>
                </div>
              )}
            </div>
            <div className={`p-3 border-t ${cardBorder}`}>
              <div className="flex gap-2">
                <input type="text" value={msg} onChange={e => setMsg(e.target.value)}
                  className={`flex-1 ${inputBg} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}
                  placeholder={`Message #${channel}...`}
                  onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <button onClick={handleSend} className="bg-roblox hover:bg-roblox-dark text-white p-2.5 rounded-xl"><Send size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== SUPPORT PAGE ====================
  const SupportPage = () => {
    if (!currentUser) return null;
    const [subject, setSubject] = useState('');
    const [targetType, setTargetType] = useState<'staff' | 'creator'>('staff');
    const [targetCreatorId, setTargetCreatorId] = useState('');
    const myTickets = supportTickets.filter(t => t.userId === currentUser.id || t.targetId === currentUser.id);
    const creators = users.filter(u => u.role === 'creator' || u.role === 'admin' || u.role === 'owner');

    const handleCreateTicket = () => {
      if (!subject) { notify('Enter a subject', 'error'); return; }
      const targetId = targetType === 'staff' ? OWNER_ACCOUNT.id : targetCreatorId;
      if (!targetId) { notify('Select a creator', 'error'); return; }
      const newTicket: SupportTicket = {
        id: createId(), userId: currentUser.id, targetId, subject,
        status: 'open', messages: [], createdAt: new Date().toISOString(),
      };
      setSupportTickets(prev => [...prev, newTicket]);
      setSelectedTicketId(newTicket.id);
      setSubject('');
      notify('Support ticket created!', 'success');
      navigateTo('support-chat');
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
          <Headphones size={28} className="text-roblox" />Customer Service
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <h3 className={`font-bold ${textPrimary} mb-4`}>New Support Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Contact</label>
                <div className="flex gap-2">
                  <button onClick={() => setTargetType('staff')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${targetType === 'staff' ? 'border-roblox bg-roblox/10 text-roblox' : `${cardBorder} ${textSecondary}`}`}>
                    Staff
                  </button>
                  <button onClick={() => setTargetType('creator')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${targetType === 'creator' ? 'border-roblox bg-roblox/10 text-roblox' : `${cardBorder} ${textSecondary}`}`}>
                    Creator
                  </button>
                </div>
              </div>
              {targetType === 'creator' && (
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Select Creator</label>
                  <select value={targetCreatorId} onChange={e => setTargetCreatorId(e.target.value)}
                    className={`w-full ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}>
                    <option value="">Choose...</option>
                    {creators.map(c => <option key={c.id} value={c.id}>{c.profile.displayName || c.username}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}
                  placeholder="What do you need help with?" />
              </div>
              <button onClick={handleCreateTicket}
                className="w-full bg-roblox hover:bg-roblox-dark text-white py-2.5 rounded-lg font-medium text-sm">Create Ticket</button>
            </div>
          </div>

          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <h3 className={`font-bold ${textPrimary} mb-4`}>Your Tickets</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {myTickets.map(t => {
                const target = users.find(u => u.id === (t.userId === currentUser.id ? t.targetId : t.userId));
                return (
                  <button key={t.id} onClick={() => { setSelectedTicketId(t.id); navigateTo('support-chat'); }}
                    className={`w-full text-left ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-3 transition-all`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${textPrimary}`}>{t.subject}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.status === 'open' ? 'bg-green-500/10 text-green-500' : t.status === 'resolved' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className={`text-xs ${textMuted} mt-1`}>with {target?.profile.displayName || target?.username} • {t.messages.length} messages</p>
                  </button>
                );
              })}
              {myTickets.length === 0 && <p className={`text-sm ${textMuted} text-center py-8`}>No tickets yet</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== SUPPORT CHAT ====================
  const SupportChatPage = () => {
    if (!currentUser) return null;
    const ticket = supportTickets.find(t => t.id === selectedTicketId);
    const [msg, setMsg] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [ticket?.messages.length]);

    if (!ticket) return <div className={`text-center py-20 ${textSecondary}`}>Ticket not found</div>;
    const otherUser = users.find(u => u.id === (ticket.userId === currentUser.id ? ticket.targetId : ticket.userId));

    const handleSend = () => {
      if (!msg.trim()) return;
      setSupportTickets(prev => prev.map(t => t.id === ticket.id ? {
        ...t, messages: [...t.messages, { userId: currentUser.id, content: msg, createdAt: new Date().toISOString() }]
      } : t));
      setMsg('');
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
        <button onClick={() => navigateTo('support')} className={`flex items-center gap-2 ${textSecondary} hover:text-roblox text-sm mb-4`}>
          <ArrowLeft size={16} />Back to Support
        </button>
        <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden flex flex-col`} style={{ height: '70vh' }}>
          <div className={`p-4 border-b ${cardBorder} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              {otherUser && <UserAvatar user={otherUser} size={36} />}
              <div>
                <p className={`font-semibold ${textPrimary} text-sm`}>{ticket.subject}</p>
                <p className={`text-xs ${textMuted}`}>with {otherUser?.profile.displayName || otherUser?.username}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              ticket.status === 'open' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {ticket.status}
            </span>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {ticket.messages.map((m, i) => {
              const sender = users.find(u => u.id === m.userId);
              const isMe = m.userId === currentUser.id;
              return (
                <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {sender && <UserAvatar user={sender} size={28} />}
                  <div className={`max-w-[75%]`}>
                    <div className={`flex items-center gap-2 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-xs font-medium ${textPrimary}`}>{sender?.profile.displayName || sender?.username}</span>
                      {sender && sender.tags.slice(0, 1).map(t => <TagBadge key={t} tagId={t} />)}
                    </div>
                    <div className={`rounded-2xl px-4 py-2 text-sm ${
                      isMe ? 'bg-roblox text-white rounded-tr-sm' : `${darkMode ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'} rounded-tl-sm`}`}>
                      {m.content}
                    </div>
                    <span className={`text-xs ${textMuted} mt-0.5 block ${isMe ? 'text-right' : ''}`}>
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {ticket.messages.length === 0 && (
              <div className="text-center py-12"><Headphones size={40} className={textMuted} /><p className={`${textSecondary} mt-2`}>Start the conversation</p></div>
            )}
          </div>
          {ticket.status === 'open' && (
            <div className={`p-3 border-t ${cardBorder}`}>
              <div className="flex gap-2">
                <input type="text" value={msg} onChange={e => setMsg(e.target.value)}
                  className={`flex-1 ${inputBg} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}
                  placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <button onClick={handleSend} className="bg-roblox hover:bg-roblox-dark text-white p-2.5 rounded-xl"><Send size={18} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== ADMIN PAGE ====================
  const AdminPage = () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) return null;
    const [tab, setTab] = useState<'overview' | 'pending' | 'users' | 'tags' | 'messages' | 'create-admin'>('overview');
    const [msgTo, setMsgTo] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [msgType, setMsgType] = useState<'info' | 'warning' | 'notification' | 'system'>('info');
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#e2231a');
    const [newTagTextColor, setNewTagTextColor] = useState('#ffffff');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    const pendingAssets = assets.filter(a => a.status === 'pending');
    const allUsers = users.filter(u => u.id !== currentUser.id);

    const tabs = [
      { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
      { id: 'pending' as const, label: 'Pending', icon: Clock, count: pendingAssets.length },
      { id: 'users' as const, label: 'Users', icon: Users },
      { id: 'tags' as const, label: 'Tags', icon: Tag },
      { id: 'messages' as const, label: 'Messages', icon: Send },
      ...(currentUser.role === 'owner' ? [{ id: 'create-admin' as const, label: 'Create Admin', icon: Shield }] : []),
    ];

    const handleApprove = (id: string) => {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' as AssetStatus } : a));
      notify('Asset approved!', 'success');
    };

    const handleReject = (id: string) => {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' as AssetStatus, rejectReason } : a));
      setRejectReason('');
      notify('Asset rejected', 'warning');
    };

    const handleDeleteAsset = (id: string) => {
      setAssets(prev => prev.filter(a => a.id !== id));
      notify('Asset deleted', 'success');
    };

    const handleSendMsg = () => {
      if (!msgTo || !msgContent) { notify('Fill in all fields', 'error'); return; }
      const newMsg: Message = {
        id: createId(), fromId: currentUser.id, toId: msgTo, content: msgContent,
        type: msgType, read: false, createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      setMsgContent('');
      notify('Message sent!', 'success');
    };

    const handleCreateTag = () => {
      if (!newTagName) { notify('Enter tag name', 'error'); return; }
      const newTag: TagType = {
        id: createId(), name: newTagName, color: newTagColor,
        textColor: newTagTextColor, createdBy: currentUser.id,
      };
      setTags(prev => [...prev, newTag]);
      setNewTagName('');
      notify('Tag created!', 'success');
    };

    const handleAssignTag = (userId: string, tagId: string) => {
      setUsers(prev => prev.map(u => u.id === userId ?
        { ...u, tags: u.tags.includes(tagId) ? u.tags.filter(t => t !== tagId) : [...u.tags, tagId] } : u));
      if (currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, tags: prev.tags.includes(tagId) ? prev.tags.filter(t => t !== tagId) : [...prev.tags, tagId] } : null);
      }
    };

    const handleCreateAdmin = () => {
      if (!adminUsername || !adminEmail || !adminPassword) { notify('Fill in all fields', 'error'); return; }
      if (users.find(u => u.username === adminUsername)) { notify('Username taken', 'error'); return; }
      const newAdmin: User = {
        id: createId(), username: adminUsername, email: adminEmail, password: adminPassword, role: 'admin',
        profile: { ...getDefaultProfile(), displayName: adminUsername },
        tags: ['tag-admin'], following: [], followers: [], purchasedAssets: [],
        balance: 0, joinDate: new Date().toISOString().split('T')[0],
        lastSeen: new Date().toISOString(), isOnline: false,
        blacklistedBy: [], customerOf: [],
      };
      setUsers(prev => [...prev, newAdmin]);
      setAdminUsername(''); setAdminEmail(''); setAdminPassword('');
      notify('Admin account created!', 'success');
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
          <Shield size={28} className="text-roblox" />Admin Panel
          <TagBadge tagId={currentUser.role === 'owner' ? 'tag-owner' : 'tag-admin'} />
        </h1>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-roblox text-white' : `${cardBg} border ${cardBorder} ${textSecondary} ${hoverBg}`}`}>
              <t.icon size={16} />{t.label}
              {'count' in t && t.count && t.count > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
                { label: 'Total Assets', value: assets.length, icon: Package, color: 'text-green-500' },
                { label: 'Pending', value: pendingAssets.length, icon: Clock, color: 'text-yellow-500' },
                { label: 'Downloads', value: assets.reduce((a, b) => a + b.downloadCount, 0), icon: Download, color: 'text-roblox' },
              ].map(s => (
                <div key={s.label} className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
                  <s.icon size={24} className={`${s.color} mb-2`} />
                  <p className={`text-3xl font-bold ${textPrimary}`}>{s.value}</p>
                  <p className={`text-sm ${textSecondary}`}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
              <h3 className={`font-bold ${textPrimary} mb-4`}>Recent Assets</h3>
              <div className="space-y-2">
                {assets.slice(-5).reverse().map(a => {
                  const cr = users.find(u => u.id === a.creatorId);
                  return (
                    <div key={a.id} className={`flex items-center justify-between ${darkMode ? 'bg-zinc-800' : 'bg-gray-50'} rounded-xl p-3`}>
                      <div className="flex items-center gap-3">
                        <img src={ASSET_THUMBNAILS[a.category] || ASSET_THUMBNAILS['Other']} alt="" className="w-8 h-8 opacity-60" />
                        <div>
                          <p className={`text-sm font-medium ${textPrimary}`}>{a.title}</p>
                          <p className={`text-xs ${textMuted}`}>by {cr?.username} • {a.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          a.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                          a.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                          {a.status}
                        </span>
                        <button onClick={() => handleDeleteAsset(a.id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'pending' && (
          <div className="space-y-4">
            {pendingAssets.map(a => {
              const cr = users.find(u => u.id === a.creatorId);
              return (
                <div key={a.id} className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center flex-shrink-0">
                      <img src={ASSET_THUMBNAILS[a.category] || ASSET_THUMBNAILS['Other']} alt="" className="w-10 h-10 opacity-60" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${textPrimary}`}>{a.title}</h3>
                      <p className={`text-sm ${textSecondary} mt-1`}>{a.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {cr && <span className={`text-xs ${textMuted}`}>by {cr.username}</span>}
                        <span className={`text-xs ${textMuted}`}>{a.category}</span>
                        <span className={`text-xs ${a.isFree ? 'text-green-500' : 'text-roblox'}`}>{a.isFree ? 'Free' : `R$ ${a.price}`}</span>
                      </div>
                      <div className="mt-3">
                        <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                          className={`w-full ${inputBg} border rounded-lg px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-roblox`}
                          placeholder="Rejection reason (optional)" />
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(a.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1">
                            <Check size={14} />Approve
                          </button>
                          <button onClick={() => handleReject(a.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1">
                            <XCircle size={14} />Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {pendingAssets.length === 0 && (
              <div className="text-center py-20"><CheckCircle size={48} className="text-green-500 mx-auto mb-4" /><p className={textSecondary}>All assets reviewed!</p></div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            {allUsers.map(u => (
              <div key={u.id} className={`${cardBg} border ${cardBorder} rounded-xl p-4`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('user-profile', undefined, u.id)}>
                    <UserAvatar user={u} size={40} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold ${textPrimary}`}>{u.profile.displayName || u.username}</span>
                        <span className={`text-xs ${textMuted}`}>@{u.username}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          u.role === 'owner' ? 'bg-red-500/10 text-red-500' :
                          u.role === 'admin' ? 'bg-yellow-500/10 text-yellow-500' :
                          u.role === 'creator' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          {u.role}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {u.tags.map(t => <TagBadge key={t} tagId={t} />)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select onChange={e => { if (e.target.value) handleAssignTag(u.id, e.target.value); e.target.value = ''; }}
                      className={`${inputBg} border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-roblox`}>
                      <option value="">Assign Tag...</option>
                      {tags.map(t => <option key={t.id} value={t.id}>{u.tags.includes(t.id) ? '✓ ' : ''}{t.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'tags' && (
          <div className="space-y-6">
            <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
              <h3 className={`font-bold ${textPrimary} mb-4`}>Create Custom Tag</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Tag Name"
                  className={`${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
                <div className="flex gap-2 items-center">
                  <label className={`text-sm ${textSecondary}`}>BG:</label>
                  <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <label className={`text-sm ${textSecondary}`}>Text:</label>
                  <input type="color" value={newTagTextColor} onChange={e => setNewTagTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                </div>
                <button onClick={handleCreateTag} className="bg-roblox hover:bg-roblox-dark text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                  <Plus size={16} />Create Tag
                </button>
              </div>
              <div className="mt-4">
                <p className={`text-sm ${textSecondary} mb-2`}>Preview:</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: newTagColor, color: newTagTextColor }}>
                  <Award size={12} />{newTagName || 'Tag Name'}
                </span>
              </div>
            </div>
            <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
              <h3 className={`font-bold ${textPrimary} mb-4`}>All Tags</h3>
              <div className="flex flex-wrap gap-3">
                {tags.map(t => (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: t.color, color: t.textColor }}>
                      <Award size={12} />{t.name}
                    </span>
                    {t.createdBy === currentUser.id && (
                      <button onClick={() => setTags(prev => prev.filter(x => x.id !== t.id))} className="text-red-500 hover:text-red-400"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'messages' && (
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <h3 className={`font-bold ${textPrimary} mb-4`}>Send Message</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>To</label>
                <select value={msgTo} onChange={e => setMsgTo(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`}>
                  <option value="">Select user...</option>
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.profile.displayName || u.username} (@{u.username})</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Type</label>
                <div className="flex gap-2 flex-wrap">
                  {(['info', 'warning', 'notification', 'system'] as const).map(t => (
                    <button key={t} onClick={() => setMsgType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        msgType === t ? 'border-roblox bg-roblox/10 text-roblox' : `${cardBorder} ${textSecondary}`}`}>
                      {t === 'info' ? '📘' : t === 'warning' ? '⚠️' : t === 'notification' ? '🔔' : '⚙️'} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Message</label>
                <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-roblox`} rows={4} />
              </div>
              <button onClick={handleSendMsg}
                className="bg-roblox hover:bg-roblox-dark text-white px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2">
                <Send size={16} />Send Message
              </button>
            </div>
          </div>
        )}

        {tab === 'create-admin' && currentUser.role === 'owner' && (
          <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 max-w-lg`}>
            <h3 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2`}><Shield size={20} className="text-roblox" />Create Admin Account</h3>
            <p className={`text-xs ${textMuted} mb-6`}>Only the owner can create admin accounts. Admins cannot create other admins.</p>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Username</label>
                <input type="text" value={adminUsername} onChange={e => setAdminUsername(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Email</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Password</label>
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roblox`} />
              </div>
              <button onClick={handleCreateAdmin}
                className="w-full bg-roblox hover:bg-roblox-dark text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                <Shield size={18} />Create Admin
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== TUTORIAL PAGE ====================
  const TutorialPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Getting Started</h1>
      <p className={`${textSecondary} mb-8`}>Learn how to use ROBLOX STUDIO ASSET platform</p>

      <div className="space-y-6">
        {[
          {
            title: 'User Guide',
            icon: UserIcon,
            color: 'bg-blue-500',
            steps: [
              'Create a free User account to browse and download assets.',
              'Browse the marketplace by category, search, or filter by price.',
              'Download free assets instantly or purchase premium assets.',
              'Rate and review assets to help the community.',
              'Follow your favorite creators to stay updated.',
              'Use Global Chat to interact with the community.',
              'Contact creators or staff via Customer Service for support.',
              'Customize your basic profile with display name, avatar, bio, and location.',
            ],
          },
          {
            title: 'Creator Guide',
            icon: Palette,
            color: 'bg-purple-500',
            steps: [
              'Register as a Creator to unlock full features (like Discord Nitro!).',
              'Upload assets for free or set a price to sell them.',
              'All uploads are reviewed by admins before being published.',
              'Customize your full profile: banner, colors, social links, Discord, about me, and more.',
              'Track your sales, downloads, and revenue in the Sales Dashboard.',
              'Manage your assets and update them anytime.',
              'Use Customer Service to chat with your customers in real-time.',
              'Assign custom tags to your buyers (e.g., "Customer of YourName").',
              'Build your reputation through ratings and followers.',
            ],
          },
          {
            title: 'Admin Guide',
            icon: Shield,
            color: 'bg-yellow-500',
            steps: [
              'Admins are created by the platform owner from the Admin Panel.',
              'Review pending assets and approve or reject them based on community standards.',
              'Send private messages to creators for warnings, information, or notifications.',
              'Create and assign custom tags/roles to users and creators (like Discord roles).',
              'Remove assets that violate community guidelines.',
              'Monitor platform statistics and user activity.',
              'Note: Admins cannot create other admin accounts — only the owner can.',
            ],
          },
          {
            title: 'Owner Guide',
            icon: Crown,
            color: 'bg-red-500',
            steps: [
              'The owner has full control over the platform.',
              'Create admin accounts from the Admin Panel > "Create Admin" tab.',
              'All admin features are available plus admin account management.',
              'Manage the tag/role system to create custom badges.',
              'Monitor all platform activity and maintain community standards.',
              'Send announcements and messages to any user on the platform.',
            ],
          },
        ].map(section => (
          <div key={section.title} className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${section.color} rounded-xl flex items-center justify-center`}>
                <section.icon size={20} className="text-white" />
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{section.title}</h2>
            </div>
            <div className="space-y-3">
              {section.steps.map((step, i) => (
                <div key={i} className={`flex gap-3 items-start ${darkMode ? 'bg-zinc-800' : 'bg-gray-50'} rounded-xl p-3`}>
                  <span className="w-6 h-6 rounded-full bg-roblox text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <p className={`text-sm ${textSecondary}`}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* FAQ */}
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6`}>
          <h2 className={`text-xl font-bold ${textPrimary} mb-4`}>FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I reset my password?', a: 'Click "Forgot Password?" on the login page. Enter your email, verify with OTP code, and set a new password.' },
              { q: 'Why is my uploaded asset not showing?', a: 'All assets must be reviewed and approved by admins before they appear in the marketplace.' },
              { q: 'How do I become a Creator?', a: 'Select "Creator" when registering your account. Creators get full profile customization and can upload/sell assets.' },
              { q: 'Can Users upgrade to Creator?', a: 'Currently, you would need to create a new account with the Creator role.' },
              { q: 'How does the tag/role system work?', a: 'Admins and the owner can create custom tags and assign them to any user. Tags appear as colored badges on your profile and in chat.' },
              { q: 'How do payments work?', a: 'Creators receive 90% of each sale. The platform takes a 10% commission.' },
              { q: 'What is Customer Service?', a: 'It is a real-time chat system where you can contact staff or creators directly for support, issues, or questions.' },
              { q: 'What is Global Chat?', a: 'Global Chat allows all users, creators, and staff to interact in public channels. Your role tags are visible so everyone can see who you are!' },
            ].map((faq, i) => (
              <div key={i} className={`${darkMode ? 'bg-zinc-800' : 'bg-gray-50'} rounded-xl p-4`}>
                <p className={`font-semibold text-sm ${textPrimary} mb-1`}>{faq.q}</p>
                <p className={`text-sm ${textSecondary}`}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== FOOTER ====================
  const Footer = () => (
    <footer className={`${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} border-t ${cardBorder} mt-16`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-roblox rounded-lg flex items-center justify-center"><Package size={16} className="text-white" /></div>
              <span className={`font-bold ${textPrimary}`}>RSA</span>
            </div>
            <p className={`text-sm ${textSecondary}`}>The #1 platform for sharing and selling Roblox Studio assets.</p>
          </div>
          <div>
            <h4 className={`font-semibold ${textPrimary} mb-3 text-sm`}>Platform</h4>
            <div className="space-y-2">
              {['Browse Assets', 'Upload', 'Tutorial'].map(l => (
                <p key={l} className={`text-sm ${textSecondary} hover:text-roblox cursor-pointer`}>{l}</p>
              ))}
            </div>
          </div>
          <div>
            <h4 className={`font-semibold ${textPrimary} mb-3 text-sm`}>Community</h4>
            <div className="space-y-2">
              {['Global Chat', 'Support', 'Creators'].map(l => (
                <p key={l} className={`text-sm ${textSecondary} hover:text-roblox cursor-pointer`}>{l}</p>
              ))}
            </div>
          </div>
          <div>
            <h4 className={`font-semibold ${textPrimary} mb-3 text-sm`}>Legal</h4>
            <div className="space-y-2">
              {['Terms of Service', 'Privacy Policy', 'Community Guidelines'].map(l => (
                <p key={l} className={`text-sm ${textSecondary} hover:text-roblox cursor-pointer`}>{l}</p>
              ))}
            </div>
          </div>
        </div>
        <div className={`border-t ${cardBorder} mt-8 pt-8 text-center`}>
          <p className={`text-sm ${textMuted}`}>© 2024 ROBLOX STUDIO ASSET. All rights reserved. Built by BMS Studio.</p>
        </div>
      </div>
    </footer>
  );

  // ==================== RENDER ====================
  return (
    <div className={`min-h-screen ${bg} ${textPrimary} transition-colors duration-300`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <NotificationBar />
      <Header />
      <main className="min-h-[80vh]">
        {page === 'home' && <HomePage />}
        {page === 'browse' && <BrowsePage />}
        {page === 'asset-detail' && <AssetDetailPage />}
        {page === 'upload' && <UploadPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'edit-profile' && <EditProfilePage />}
        {page === 'user-profile' && <UserProfilePage />}
        {page === 'my-assets' && <MyAssetsPage />}
        {page === 'sales' && <SalesPage />}
        {page === 'admin' && <AdminPage />}
        {page === 'login' && <LoginPage />}
        {page === 'register' && <RegisterPage />}
        {page === 'forgot-password' && <ForgotPasswordPage />}
        {page === 'tutorial' && <TutorialPage />}
        {page === 'messages' && <MessagesPage />}
        {page === 'global-chat' && <GlobalChatPage />}
        {page === 'support' && <SupportPage />}
        {page === 'support-chat' && <SupportChatPage />}
      </main>
      <Footer />
    </div>
  );
}
