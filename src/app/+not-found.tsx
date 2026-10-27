import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/States';
import { Screen } from '@/components/Screen';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen back title="Not found" bottomInset={40}>
      <EmptyState
        icon="compass-outline"
        title="That page does not exist"
        message="The link may be old. Everything in the app is reachable from the tabs below."
        actionLabel="Back home"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}
