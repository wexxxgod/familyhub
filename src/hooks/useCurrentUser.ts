"use client";

import { useState, useEffect, useCallback } from "react";

interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  familyId: string | null;
}

interface CacheData {
  user: CurrentUser | null;
}

let cache: CacheData | null = null;
let promise: Promise<void> | null = null;

function fetchUser(): Promise<void> {
  if (cache) return Promise.resolve();
  if (promise) return promise;
  promise = fetch("/api/session")
    .then((res) => res.json())
    .then((data: CacheData) => { cache = data; })
    .catch(() => { cache = { user: null }; })
    .finally(() => { promise = null; });
  return promise;
}

function getCachedUser(): CurrentUser | null {
  return cache ? cache.user : null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(getCachedUser());
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setUser(getCachedUser());
      setLoading(false);
      return;
    }
    fetchUser().then(() => {
      setUser(getCachedUser());
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    cache = null;
    await fetchUser();
    setUser(getCachedUser());
  }, []);

  return { user, loading, refresh };
}

export function clearUserCache() {
  cache = { user: null };
}
