import { User, Asset, Tag, Message, ChatMessage, SupportTicket } from './types';

const defaultProfile = {
  displayName: '',
  bio: '',
  avatar: '',
  banner: '',
  bannerColor: '#1a1a2e',
  accentColor: '#e2231a',
  discordLink: '',
  twitterLink: '',
  youtubeLink: '',
  websiteLink: '',
  robloxProfile: '',
  pronouns: '',
  location: '',
  customStatus: '',
  statusEmoji: '',
  aboutMe: '',
  showcaseAssets: [],
  theme: 'default',
};

export const OWNER_ACCOUNT: User = {
  id: 'owner-001',
  username: 'bmsstudiowebowner',
  email: 'bambangspeed36@gmail.com',
  password: 'bmsstudioweb_zxasqw_12345',
  role: 'owner',
  profile: {
    ...defaultProfile,
    displayName: 'BMS Studio',
    bio: 'Platform Owner & Lead Developer of ROBLOX STUDIO ASSET',
    avatar: '',
    bannerColor: '#0a0a0a',
    accentColor: '#e2231a',
    discordLink: 'https://discord.gg/bmsstudio',
    aboutMe: 'Welcome to ROBLOX STUDIO ASSET! I am the owner and creator of this platform.',
    customStatus: 'Managing the platform',
  },
  tags: ['tag-owner'],
  following: [],
  followers: [],
  purchasedAssets: [],
  balance: 999999,
  joinDate: '2024-01-01',
  lastSeen: new Date().toISOString(),
  isOnline: true,
  blacklistedBy: [],
  customerOf: [],
};

export const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-owner', name: 'OWNER', color: '#e2231a', textColor: '#ffffff', icon: 'crown', createdBy: 'owner-001' },
  { id: 'tag-admin', name: 'ADMIN', color: '#f59e0b', textColor: '#000000', icon: 'shield', createdBy: 'owner-001' },
  { id: 'tag-verified', name: 'Verified Creator', color: '#3b82f6', textColor: '#ffffff', icon: 'check-circle', createdBy: 'owner-001' },
  { id: 'tag-top', name: 'Top Creator', color: '#8b5cf6', textColor: '#ffffff', icon: 'star', createdBy: 'owner-001' },
  { id: 'tag-special', name: 'Special User', color: '#ec4899', textColor: '#ffffff', icon: 'sparkles', createdBy: 'owner-001' },
  { id: 'tag-community', name: 'Community', color: '#10b981', textColor: '#ffffff', icon: 'users', createdBy: 'owner-001' },
  { id: 'tag-new', name: 'New Member', color: '#6b7280', textColor: '#ffffff', icon: 'user-plus', createdBy: 'owner-001' },
  { id: 'tag-official', name: 'Official', color: '#e2231a', textColor: '#ffffff', icon: 'badge-check', createdBy: 'owner-001' },
];

export const SAMPLE_ASSETS: Asset[] = [
  {
    id: 'asset-1', title: 'Low Poly City Pack', description: 'Complete low poly city environment with buildings, roads, vehicles, and props. Perfect for building your Roblox city game!',
    category: 'Environment', tags: ['low-poly', 'city', 'buildings'], creatorId: 'owner-001',
    price: 0, isFree: true, downloadCount: 1247, rating: 4.8, ratingCount: 89,
    ratings: [], status: 'approved', createdAt: '2024-06-01', fileSize: '12.5 MB',
    thumbnail: '', images: [],
  },
  {
    id: 'asset-2', title: 'Fantasy Sword Collection', description: 'A collection of 20 unique fantasy swords with custom animations. Each sword has unique VFX and sound effects.',
    category: 'Weapons', tags: ['fantasy', 'swords', 'weapons', 'animated'], creatorId: 'owner-001',
    price: 250, isFree: false, downloadCount: 567, rating: 4.9, ratingCount: 45,
    ratings: [], status: 'approved', createdAt: '2024-05-15', fileSize: '8.3 MB',
    thumbnail: '', images: [],
  },
  {
    id: 'asset-3', title: 'UI Kit - Modern Roblox', description: 'Professional UI kit with buttons, frames, menus, and more. Fully customizable with clean design.',
    category: 'UI', tags: ['ui', 'modern', 'clean', 'buttons'], creatorId: 'owner-001',
    price: 0, isFree: true, downloadCount: 2341, rating: 4.7, ratingCount: 156,
    ratings: [], status: 'approved', createdAt: '2024-04-20', fileSize: '3.1 MB',
    thumbnail: '', images: [],
  },
  {
    id: 'asset-4', title: 'Advanced Combat System', description: 'Full combat system with combo attacks, blocking, dodging, and special abilities. Easy to integrate into any game.',
    category: 'Scripts', tags: ['combat', 'system', 'advanced', 'pvp'], creatorId: 'owner-001',
    price: 500, isFree: false, downloadCount: 312, rating: 4.6, ratingCount: 28,
    ratings: [], status: 'approved', createdAt: '2024-03-10', fileSize: '1.8 MB',
    thumbnail: '', images: [],
  },
  {
    id: 'asset-5', title: 'Nature Environment Pack', description: 'Beautiful nature assets including trees, rocks, grass, flowers, and terrain textures for outdoor environments.',
    category: 'Environment', tags: ['nature', 'trees', 'outdoor', 'terrain'], creatorId: 'owner-001',
    price: 150, isFree: false, downloadCount: 891, rating: 4.5, ratingCount: 67,
    ratings: [], status: 'approved', createdAt: '2024-07-01', fileSize: '25.6 MB',
    thumbnail: '', images: [],
  },
  {
    id: 'asset-6', title: 'Character Animation Pack', description: 'Over 50 character animations including idle, walk, run, jump, dance, and emotes. Compatible with R15.',
    category: 'Animations', tags: ['animation', 'character', 'r15', 'emotes'], creatorId: 'owner-001',
    price: 0, isFree: true, downloadCount: 3456, rating: 4.9, ratingCount: 234,
    ratings: [], status: 'approved', createdAt: '2024-02-14', fileSize: '5.2 MB',
    thumbnail: '', images: [],
  },
];

export const CATEGORIES = ['All', 'Environment', 'Weapons', 'UI', 'Scripts', 'Animations', 'Models', 'Audio', 'Particles', 'Plugins', 'Other'];

export const ASSET_THUMBNAILS: Record<string, string> = {
  'Environment': 'https://img.icons8.com/fluency/96/landscape.png',
  'Weapons': 'https://img.icons8.com/fluency/96/sword.png',
  'UI': 'https://img.icons8.com/fluency/96/dashboard-layout.png',
  'Scripts': 'https://img.icons8.com/fluency/96/source-code.png',
  'Animations': 'https://img.icons8.com/fluency/96/animation.png',
  'Models': 'https://img.icons8.com/fluency/96/3d-model.png',
  'Audio': 'https://img.icons8.com/fluency/96/audio-wave.png',
  'Particles': 'https://img.icons8.com/fluency/96/sparkling.png',
  'Plugins': 'https://img.icons8.com/fluency/96/plugin.png',
  'Other': 'https://img.icons8.com/fluency/96/box.png',
};

export function getDefaultProfile(): typeof defaultProfile {
  return { ...defaultProfile };
}

export function createId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getInitialData() {
  return {
    users: [OWNER_ACCOUNT] as User[],
    assets: [...SAMPLE_ASSETS] as Asset[],
    tags: [...DEFAULT_TAGS] as Tag[],
    messages: [] as Message[],
    chatMessages: [] as ChatMessage[],
    supportTickets: [] as SupportTicket[],
  };
}
