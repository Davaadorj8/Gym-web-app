'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store';
import { setAuthUser, UserProfile } from '@/features/auth/authSlice';

export default function StoreProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}) {
  const [store] = useState<AppStore>(() => {
    const initializedStore = makeStore();
    if (initialUser) {
      initializedStore.dispatch(setAuthUser(initialUser));
    }
    return initializedStore;
  });

  return <Provider store={store}>{children}</Provider>;
}

