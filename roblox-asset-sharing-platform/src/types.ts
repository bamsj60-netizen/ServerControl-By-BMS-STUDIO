export type UserRole = 'user' | 'creator' | 'admin' | 'owner';
export type AssetStatus = 'pending' | 'approved' | 'rejected';
export type MessageType = 'info' | 'warning' | 'notification' | 'system' | 'chat';

export interface Tag {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon?: string;
  createdBy: string;
}

export interface UserProfile {
  displayName: string;
  bio: string;
  avatar: string;
  banner: string;
  bannerColor: string;
  accentColor: string;
  discordLink: string;
  twitterLink: string;
  youtubeLink: string;
  websiteLink: string;
  robloxProfile: string;
  pronouns: string;
  location: string;
  customStatus: string;
  statusEmoji: string;
  aboutMe: string;
  showcaseAssets: string[];
  theme: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  profile: UserProfile;
  tags: string[];
  following: string[];
  followers: string[];
  purchasedAssets: string[];
  balance: number;
  joinDate: string;
  lastSeen: string;
  isOnline: boolean;
  blacklistedBy: string[];
  customerOf: string[];
}

export interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  creatorId: string;
  price: number;
  isFree: boolean;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  ratings: { userId: string; score: number; comment: string }[];
  status: AssetStatus;
  rejectReason?: string;
  createdAt: string;
  fileSize: string;
  thumbnail: string;
  images: string[];
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  type: MessageType;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  channel: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  targetId: string;
  subject: string;
  status: 'open' | 'resolved' | 'closed';
  messages: { userId: string; content: string; createdAt: string }[];
  createdAt: string;
}

export interface OTPData {
  code: string;
  email: string;
  expiresAt: number;
  purpose: 'register' | 'reset' | 'verify';
}
