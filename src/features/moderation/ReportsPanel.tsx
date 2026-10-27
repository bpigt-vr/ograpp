import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { Card, Divider } from '@/components/Surfaces';
import { EmptyState } from '@/components/States';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { relativeTime } from '@/lib/date';
import { useTheme } from '@/theme';

export function ReportsPanel() {
  const theme = useTheme();
  const reports = useCommunityStore((state) => state.reports);
  const posts = useCommunityStore((state) => state.posts);
  const comments = useCommunityStore((state) => state.comments);
  const removePost = useCommunityStore((state) => state.removePost);
  const removeComment = useCommunityStore((state) => state.removeComment);
  const resolveReport = useCommunityStore((state) => state.resolveReport);
  const dismissReport = useCommunityStore((state) => state.dismissReport);
  const restorePost = useCommunityStore((state) => state.restorePost);
  const restoreComment = useCommunityStore((state) => state.restoreComment);

  const open = reports.filter((report) => report.status === 'open');
  const hiddenPosts = posts.filter((post) => post.hidden);
  const hiddenComments = comments.filter((comment) => comment.hidden);

  return (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="flag" size={16} color={theme.colors.accent} />
          <AppText variant="smallMedium" style={{ flex: 1 }}>
            Open reports ({open.length})
          </AppText>
          <Chip label={`${reports.length} total`} size="sm" />
        </View>
        {open.length === 0 ? (
          <AppText variant="small" color="textMuted">
            Nothing waiting. Reports from the community land here with the offending excerpt.
          </AppText>
        ) : (
          open.map((report, index) => (
            <View key={report.id} style={{ gap: 8 }}>
              {index > 0 ? <Divider /> : null}
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Chip
                  label={report.reason.replace('-', ' ')}
                  size="sm"
                  tone={report.reason === 'harassment' || report.reason === 'hate' ? 'danger' : 'gold'}
                />
                <AppText variant="label" color="textFaint">
                  {report.targetType.toUpperCase()} · {relativeTime(report.createdAt).toUpperCase()}
                </AppText>
                <View style={{ flex: 1 }} />
                <AppText variant="small" color="textFaint">
                  {report.targetAuthor}
                </AppText>
              </View>
              <AppText variant="small" color="textMuted" numberOfLines={3}>
                “{report.excerpt}”
              </AppText>
              {report.note ? (
                <AppText variant="small" color="textFaint">
                  Note: {report.note}
                </AppText>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  label="Remove content"
                  size="sm"
                  variant="danger"
                  icon="trash-outline"
                  onPress={() => {
                    if (report.targetType === 'post') {
                      removePost(report.targetId, `Report: ${report.reason}`);
                    } else {
                      removeComment(report.targetId, `Report: ${report.reason}`);
                    }
                    resolveReport(report.id, `Content removed (${report.reason})`);
                  }}
                />
                <Button
                  label="Keep content"
                  size="sm"
                  variant="secondary"
                  onPress={() => resolveReport(report.id, 'Reviewed — content kept')}
                />
                <Button
                  label="Dismiss"
                  size="sm"
                  variant="ghost"
                  onPress={() => dismissReport(report.id)}
                />
              </View>
            </View>
          ))
        )}
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="eye-off" size={16} color={theme.colors.textMuted} />
          <AppText variant="smallMedium" style={{ flex: 1 }}>
            Hidden content ({hiddenPosts.length + hiddenComments.length})
          </AppText>
        </View>
        {hiddenPosts.length + hiddenComments.length === 0 ? (
          <AppText variant="small" color="textMuted">
            Nothing hidden. Removed posts and comments stay here so decisions can be reversed.
          </AppText>
        ) : (
          <>
            {hiddenPosts.map((post) => (
              <View key={post.id} style={{ gap: 6 }}>
                <AppText variant="smallMedium" numberOfLines={1}>
                  Post · {post.authorName}
                </AppText>
                <AppText variant="small" color="textFaint" numberOfLines={2}>
                  {post.body}
                </AppText>
                <AppText variant="small" color="textFaint">
                  Reason: {post.moderation?.reason ?? 'Not recorded'}
                </AppText>
                <Button label="Restore post" size="sm" variant="secondary" onPress={() => restorePost(post.id)} />
              </View>
            ))}
            {hiddenComments.map((comment) => (
              <View key={comment.id} style={{ gap: 6 }}>
                <AppText variant="smallMedium" numberOfLines={1}>
                  Comment · {comment.authorName}
                </AppText>
                <AppText variant="small" color="textFaint" numberOfLines={2}>
                  {comment.body}
                </AppText>
                <AppText variant="small" color="textFaint">
                  Reason: {comment.moderation?.reason ?? 'Not recorded'}
                </AppText>
                <Button
                  label="Restore comment"
                  size="sm"
                  variant="secondary"
                  onPress={() => restoreComment(comment.id)}
                />
              </View>
            ))}
          </>
        )}
      </Card>

      {reports.length > 0 && open.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Queue clear"
          message="Every report has been reviewed. Resolved reports stay in the audit log."
        />
      ) : null}
    </View>
  );
}
