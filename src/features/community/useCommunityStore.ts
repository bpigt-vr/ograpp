import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildSeedPosts } from '@/data/communitySeed';
import { newId } from '@/lib/ids';
import { StorageKeys } from '@/lib/storage';
import { hashPassphrase, verifyPassphrase } from '@/lib/vault';
import {
  analyzeContent,
  DEFAULT_FILTER_TERMS,
  DEFAULT_POLICY,
  type FilterMode,
  type FilterSeverity,
  type FilterTerm,
  type ModerationPolicy,
  type ModerationVerdict,
} from './moderation';
import type {
  Challenge,
  CommunityComment,
  CommunityPost,
  CommunityPostKind,
  MemberRestriction,
  ModerationLogEntry,
  Poll,
  PollVote,
  Report,
  ReportReason,
} from './types';

export type ContentResult = {
  ok: boolean;
  verdict?: ModerationVerdict;
  postId?: string;
  error?: string;
};

export type ModerationResult = { ok: boolean; error?: string };
export type BlockedUser = { id: string; displayName: string; at: number };
export type ModerationSession = {
  attempts: number;
  lockedUntil: number | null;
  verifiedAt: number | null;
};

const MODERATION_WINDOW_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000;

export function isModerationActive(session: ModerationSession, now = Date.now()): boolean {
  return Boolean(session.verifiedAt && now - session.verifiedAt < MODERATION_WINDOW_MS);
}

function audit(
  action: ModerationLogEntry['action'],
  detail: string,
  targetId?: string,
  actor: ModerationLogEntry['actor'] = 'moderator'
): ModerationLogEntry {
  return { id: newId('log'), at: Date.now(), actor, action, detail, targetId };
}

export type CommunityState = {
  posts: CommunityPost[];
  comments: CommunityComment[];
  votes: Record<string, PollVote>;
  voteCounts: Record<string, Record<string, number>>;
  postTimestamps: number[];
  commentTimestamps: number[];
  guidelinesAcceptedAt: number | null;
  seeded: boolean;

  filterTerms: FilterTerm[];
  policy: ModerationPolicy;
  reports: Report[];
  restrictions: MemberRestriction[];
  blockedUsers: BlockedUser[];
  passphraseHash: string | null;
  passphraseUpdatedAt: number | null;
  session: ModerationSession;
  log: ModerationLogEntry[];
  hydrated: boolean;

  seedIfEmpty: () => void;
  acceptGuidelines: () => void;
  createPost: (input: {
    kind: CommunityPostKind;
    title?: string;
    body: string;
    authorId: string;
    authorName: string;
    memberOnly?: boolean;
    poll?: Poll;
    challenge?: Challenge;
  }) => ContentResult;
  addComment: (input: {
    postId: string;
    parentId?: string;
    body: string;
    authorId: string;
    authorName: string;
  }) => ContentResult;
  vote: (postId: string, optionId: string) => { ok: boolean; error?: string };
  reportTarget: (input: {
    targetType: 'post' | 'comment';
    targetId: string;
    targetAuthor: string;
    excerpt: string;
    reason: ReportReason;
    note?: string;
  }) => void;
  blockUser: (id: string, displayName: string) => void;
  unblockUser: (id: string) => void;

  ensurePassphrase: (defaultValue: string) => Promise<void>;
  verifyModeration: (password: string) => Promise<ModerationResult>;
  lockModeration: () => void;
  changePassphrase: (current: string, next: string) => Promise<ModerationResult>;
  addFilterTerm: (term: string, severity: FilterSeverity) => ModerationResult;
  removeFilterTerm: (id: string) => void;
  setFilterMode: (mode: FilterMode) => void;
  updatePolicy: (patch: Partial<ModerationPolicy>) => void;
  removePost: (id: string, reason: string) => void;
  restorePost: (id: string) => void;
  removeComment: (id: string, reason: string) => void;
  restoreComment: (id: string) => void;
  restrictMember: (input: {
    userId: string;
    displayName: string;
    kind: 'mute' | 'ban';
    reason: string;
    days: number | null;
  }) => void;
  liftRestriction: (userId: string) => void;
  resolveReport: (id: string, resolution: string) => void;
  dismissReport: (id: string) => void;
  clearCommunity: () => void;
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      posts: [],
      comments: [],
      votes: {},
      voteCounts: {},
      postTimestamps: [],
      commentTimestamps: [],
      guidelinesAcceptedAt: null,
      seeded: false,

      filterTerms: DEFAULT_FILTER_TERMS,
      policy: DEFAULT_POLICY,
      reports: [],
      restrictions: [],
      blockedUsers: [],
      passphraseHash: null,
      passphraseUpdatedAt: null,
      session: { attempts: 0, lockedUntil: null, verifiedAt: null },
      log: [],
      hydrated: false,

      seedIfEmpty() {
        if (get().posts.length > 0) return;
        set({ posts: buildSeedPosts(), seeded: true });
      },

      acceptGuidelines() {
        set({ guidelinesAcceptedAt: Date.now() });
      },

      createPost(input) {
        const state = get();
        const now = Date.now();
        const verdict = analyzeContent(input.body, state.filterTerms, state.policy, {
          recentTexts: state.posts
            .slice(0, 12)
            .map((post) => `${post.title ?? ''} ${post.body}`),
          recentTimestamps: state.postTimestamps,
          now,
          rateLimit: { limit: 3, windowMs: 60_000 },
        });
        if (!verdict.allowed) return { ok: false, verdict };

        const post: CommunityPost = {
          id: newId('post'),
          kind: input.kind,
          authorId: input.authorId,
          authorName: input.authorName,
          authorIsArtist: false,
          createdAt: now,
          title: input.title?.trim() || undefined,
          body: verdict.sanitized,
          poll: input.poll,
          challenge: input.challenge,
          memberOnly: input.memberOnly,
          hidden: false,
          reports: 0,
        };
        set({
          posts: [post, ...state.posts],
          postTimestamps: [...state.postTimestamps, now].slice(-50),
        });
        return { ok: true, verdict, postId: post.id };
      },

      addComment(input) {
        const state = get();
        const now = Date.now();
        if (!state.posts.some((post) => post.id === input.postId)) {
          return { ok: false, error: 'That thread no longer exists.' };
        }
        const verdict = analyzeContent(input.body, state.filterTerms, state.policy, {
          recentTexts: state.comments.slice(-12).map((comment) => comment.body),
          recentTimestamps: state.commentTimestamps,
          now,
          rateLimit: { limit: 5, windowMs: 60_000 },
        });
        if (!verdict.allowed) return { ok: false, verdict };

        const comment: CommunityComment = {
          id: newId('comment'),
          postId: input.postId,
          parentId: input.parentId,
          authorId: input.authorId,
          authorName: input.authorName,
          authorIsArtist: false,
          body: verdict.sanitized,
          createdAt: now,
          hidden: false,
          reports: 0,
        };
        set({
          comments: [...state.comments, comment],
          commentTimestamps: [...state.commentTimestamps, now].slice(-80),
        });
        return { ok: true, verdict };
      },

      vote(postId, optionId) {
        const state = get();
        const post = state.posts.find((item) => item.id === postId);
        if (!post?.poll) return { ok: false, error: 'This poll is not available.' };
        if (post.poll.closesAt && Date.now() > post.poll.closesAt) {
          return { ok: false, error: 'This poll has closed.' };
        }
        const previous = state.votes[postId];
        if (previous?.optionId === optionId) return { ok: true };

        const counts = { ...(state.voteCounts[postId] ?? {}) };
        if (previous) {
          counts[previous.optionId] = Math.max(0, (counts[previous.optionId] ?? 1) - 1);
        }
        counts[optionId] = (counts[optionId] ?? 0) + 1;

        set({
          votes: { ...state.votes, [postId]: { postId, optionId, at: Date.now() } },
          voteCounts: { ...state.voteCounts, [postId]: counts },
        });
        return { ok: true };
      },

      reportTarget(input) {
        const state = get();
        const report: Report = {
          id: newId('report'),
          targetType: input.targetType,
          targetId: input.targetId,
          targetAuthor: input.targetAuthor,
          excerpt: input.excerpt.slice(0, 180),
          reason: input.reason,
          note: input.note,
          createdAt: Date.now(),
          status: 'open',
        };
        set({
          reports: [report, ...state.reports],
          posts:
            input.targetType === 'post'
              ? state.posts.map((post) =>
                  post.id === input.targetId ? { ...post, reports: post.reports + 1 } : post
                )
              : state.posts,
          comments:
            input.targetType === 'comment'
              ? state.comments.map((comment) =>
                  comment.id === input.targetId
                    ? { ...comment, reports: comment.reports + 1 }
                    : comment
                )
              : state.comments,
        });
      },

      blockUser(id, displayName) {
        if (get().blockedUsers.some((user) => user.id === id)) return;
        set({ blockedUsers: [...get().blockedUsers, { id, displayName, at: Date.now() }] });
      },

      unblockUser(id) {
        set({ blockedUsers: get().blockedUsers.filter((user) => user.id !== id) });
      },

      async ensurePassphrase(defaultValue) {
        if (get().passphraseHash) return;
        const hash = await hashPassphrase(defaultValue);
        set({ passphraseHash: hash, passphraseUpdatedAt: null });
      },

      async verifyModeration(password) {
        const state = get();
        const now = Date.now();
        if (state.session.lockedUntil && now < state.session.lockedUntil) {
          const seconds = Math.ceil((state.session.lockedUntil - now) / 1000);
          return { ok: false, error: `Too many attempts. Try again in ${seconds}s.` };
        }
        if (!state.passphraseHash) {
          return { ok: false, error: 'Moderator access is not configured on this device yet.' };
        }
        const valid = await verifyPassphrase(password, state.passphraseHash);
        if (!valid) {
          const attempts = state.session.attempts + 1;
          const locked = attempts >= MAX_ATTEMPTS;
          const detail = locked
            ? 'Locked out after 5 failed moderator attempts.'
            : `Failed moderator attempt (${attempts}/${MAX_ATTEMPTS}).`;
          set({
            session: {
              attempts: locked ? 0 : attempts,
              lockedUntil: locked ? now + LOCKOUT_MS : null,
              verifiedAt: null,
            },
            log: [audit('unlock', detail, undefined, 'automation'), ...state.log].slice(0, 100),
          });
          return {
            ok: false,
            error: locked
              ? 'Too many attempts. Locked for 60 seconds.'
              : `Wrong passphrase. ${MAX_ATTEMPTS - attempts} attempts left.`,
          };
        }
        set({
          session: { attempts: 0, lockedUntil: null, verifiedAt: now },
          log: [audit('unlock', 'Moderator tools unlocked.'), ...state.log].slice(0, 100),
        });
        return { ok: true };
      },

      lockModeration() {
        set({ session: { ...get().session, verifiedAt: null } });
      },

      async changePassphrase(current, next) {
        if (!isModerationActive(get().session)) {
          return { ok: false, error: 'Unlock the moderation page first.' };
        }
        if (next.trim().length < 8) {
          return { ok: false, error: 'Use at least 8 characters for the new passphrase.' };
        }
        const hash = get().passphraseHash;
        if (!hash || !(await verifyPassphrase(current, hash))) {
          return { ok: false, error: 'Current passphrase is incorrect.' };
        }
        set({
          passphraseHash: await hashPassphrase(next),
          passphraseUpdatedAt: Date.now(),
          log: [audit('change-passphrase', 'Moderator passphrase changed.'), ...get().log].slice(
            0,
            100
          ),
        });
        return { ok: true };
      },

      addFilterTerm(term, severity) {
        if (!isModerationActive(get().session)) {
          return { ok: false, error: 'Unlock the moderation page first.' };
        }
        const clean = term.trim().toLowerCase();
        if (clean.length < 2) return { ok: false, error: 'Enter at least two characters.' };
        if (clean.length > 60) return { ok: false, error: 'Keep filter terms under 60 characters.' };
        if (get().filterTerms.some((item) => item.term === clean)) {
          return { ok: false, error: 'That term is already filtered.' };
        }
        set({
          filterTerms: [
            { id: newId('term'), term: clean, severity, createdAt: Date.now(), addedBy: 'moderator' },
            ...get().filterTerms,
          ],
          log: [
            audit('add-filter-term', `Added filter term “${clean}” (${severity}).`),
            ...get().log,
          ].slice(0, 100),
        });
        return { ok: true };
      },

      removeFilterTerm(id) {
        if (!isModerationActive(get().session)) return;
        const term = get().filterTerms.find((item) => item.id === id);
        set({
          filterTerms: get().filterTerms.filter((item) => item.id !== id),
          log: [
            audit('remove-filter-term', `Removed filter term “${term?.term ?? id}”.`, id),
            ...get().log,
          ].slice(0, 100),
        });
      },

      setFilterMode(mode) {
        if (!isModerationActive(get().session)) return;
        const detail =
          mode === 'block'
            ? 'Filter mode set to block (messages are rejected).'
            : 'Filter mode set to mask (terms are starred out).';
        set({
          policy: { ...get().policy, mode },
          log: [audit('update-policy', detail), ...get().log].slice(0, 100),
        });
      },

      updatePolicy(patch) {
        if (!isModerationActive(get().session)) return;
        set({
          policy: { ...get().policy, ...patch },
          log: [
            audit('update-policy', `Policy updated: ${Object.keys(patch).join(', ')}.`),
            ...get().log,
          ].slice(0, 100),
        });
      },

      removePost(id, reason) {
        if (!isModerationActive(get().session)) return;
        set({
          posts: get().posts.map((post) =>
            post.id === id
              ? {
                  ...post,
                  hidden: true,
                  moderation: { removedAt: Date.now(), removedBy: 'moderator', reason },
                }
              : post
          ),
          log: [audit('remove-post', `Removed post: ${reason}`, id), ...get().log].slice(0, 100),
        });
      },

      restorePost(id) {
        if (!isModerationActive(get().session)) return;
        set({
          posts: get().posts.map((post) =>
            post.id === id ? { ...post, hidden: false, moderation: null } : post
          ),
          log: [audit('restore-post', 'Restored a hidden post.', id), ...get().log].slice(0, 100),
        });
      },

      removeComment(id, reason) {
        if (!isModerationActive(get().session)) return;
        set({
          comments: get().comments.map((comment) =>
            comment.id === id
              ? {
                  ...comment,
                  hidden: true,
                  moderation: { removedAt: Date.now(), removedBy: 'moderator', reason },
                }
              : comment
          ),
          log: [audit('remove-comment', `Removed comment: ${reason}`, id), ...get().log].slice(
            0,
            100
          ),
        });
      },

      restoreComment(id) {
        if (!isModerationActive(get().session)) return;
        set({
          comments: get().comments.map((comment) =>
            comment.id === id ? { ...comment, hidden: false, moderation: null } : comment
          ),
          log: [audit('restore-comment', 'Restored a hidden comment.', id), ...get().log].slice(
            0,
            100
          ),
        });
      },

      restrictMember(input) {
        if (!isModerationActive(get().session)) return;
        const restriction: MemberRestriction = {
          userId: input.userId,
          displayName: input.displayName,
          kind: input.kind,
          reason: input.reason,
          createdAt: Date.now(),
          until: input.days ? Date.now() + input.days * 86_400_000 : null,
        };
        const verb = input.kind === 'ban' ? 'Banned' : 'Muted';
        set({
          restrictions: [
            restriction,
            ...get().restrictions.filter((item) => item.userId !== input.userId),
          ],
          log: [
            audit(
              input.kind === 'ban' ? 'ban-member' : 'mute-member',
              `${verb} ${input.displayName}: ${input.reason}`,
              input.userId
            ),
            ...get().log,
          ].slice(0, 100),
        });
      },

      liftRestriction(userId) {
        if (!isModerationActive(get().session)) return;
        const restriction = get().restrictions.find((item) => item.userId === userId);
        set({
          restrictions: get().restrictions.filter((item) => item.userId !== userId),
          log: [
            audit(
              'lift-restriction',
              `Lifted restriction for ${restriction?.displayName ?? userId}.`,
              userId
            ),
            ...get().log,
          ].slice(0, 100),
        });
      },

      resolveReport(id, resolution) {
        if (!isModerationActive(get().session)) return;
        set({
          reports: get().reports.map((report) =>
            report.id === id ? { ...report, status: 'resolved', resolution } : report
          ),
          log: [audit('resolve-report', `Report resolved: ${resolution}`, id), ...get().log].slice(
            0,
            100
          ),
        });
      },

      dismissReport(id) {
        if (!isModerationActive(get().session)) return;
        set({
          reports: get().reports.map((report) =>
            report.id === id ? { ...report, status: 'dismissed' } : report
          ),
          log: [audit('dismiss-report', 'Report dismissed — content kept.', id), ...get().log].slice(
            0,
            100
          ),
        });
      },

      clearCommunity() {
        set({
          posts: buildSeedPosts(),
          comments: [],
          votes: {},
          voteCounts: {},
          postTimestamps: [],
          commentTimestamps: [],
          reports: [],
          restrictions: [],
          blockedUsers: [],
          log: [],
          seeded: true,
        });
      },
    }),
    {
      name: StorageKeys.community,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        posts: state.posts,
        comments: state.comments,
        votes: state.votes,
        voteCounts: state.voteCounts,
        postTimestamps: state.postTimestamps,
        commentTimestamps: state.commentTimestamps,
        guidelinesAcceptedAt: state.guidelinesAcceptedAt,
        seeded: state.seeded,
        filterTerms: state.filterTerms,
        policy: state.policy,
        reports: state.reports,
        restrictions: state.restrictions,
        blockedUsers: state.blockedUsers,
        passphraseHash: state.passphraseHash,
        passphraseUpdatedAt: state.passphraseUpdatedAt,
        session: state.session,
        log: state.log,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export const useModerationActive = () =>
  useCommunityStore((state) => isModerationActive(state.session));

export function activeRestrictionFor(userId: string, restrictions: MemberRestriction[]) {
  return restrictions.find(
    (item) => item.userId === userId && (item.until === null || item.until > Date.now())
  );
}
