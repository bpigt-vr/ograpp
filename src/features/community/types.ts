export type CommunityPostKind = 'announcement' | 'discussion' | 'poll' | 'remix' | 'challenge';

export type PollOption = { id: string; label: string };

export type Poll = {
  question: string;
  options: PollOption[];
  closesAt?: number;
};

export type Challenge = {
  metric: 'journalStreak' | 'journalEntries' | 'listens';
  target: number;
  rewardPoints: number;
};

export type ModerationMark = {
  removedAt: number;
  removedBy: string;
  reason: string;
};

export type CommunityPost = {
  id: string;
  kind: CommunityPostKind;
  authorId: string;
  authorName: string;
  authorIsArtist: boolean;
  createdAt: number;
  title?: string;
  body: string;
  poll?: Poll;
  challenge?: Challenge;
  memberOnly?: boolean;
  pinned?: boolean;
  hidden: boolean;
  reports: number;
  moderation?: ModerationMark | null;
};

export type CommunityComment = {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorIsArtist: boolean;
  body: string;
  createdAt: number;
  hidden: boolean;
  reports: number;
  moderation?: ModerationMark | null;
};

export type ReportReason = 'harassment' | 'spam' | 'hate' | 'sexual' | 'self-harm' | 'other';

export type Report = {
  id: string;
  targetType: 'post' | 'comment';
  targetId: string;
  targetAuthor: string;
  excerpt: string;
  reason: ReportReason;
  note?: string;
  createdAt: number;
  status: 'open' | 'resolved' | 'dismissed';
  resolution?: string;
};

export type MemberRestriction = {
  userId: string;
  displayName: string;
  kind: 'mute' | 'ban';
  reason: string;
  createdAt: number;
  until: number | null;
};

export type ModerationLogEntry = {
  id: string;
  at: number;
  actor: 'moderator' | 'automation';
  action:
    | 'remove-post'
    | 'remove-comment'
    | 'restore-post'
    | 'restore-comment'
    | 'mute-member'
    | 'ban-member'
    | 'lift-restriction'
    | 'add-filter-term'
    | 'remove-filter-term'
    | 'update-policy'
    | 'resolve-report'
    | 'dismiss-report'
    | 'change-passphrase'
    | 'unlock';
  detail: string;
  targetId?: string;
};

export type PollVote = { postId: string; optionId: string; at: number };
