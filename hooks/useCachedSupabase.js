import { useState, useEffect } from "preact/hooks";

function getStorage(preferSession = false) {
  try {
    return typeof window !== "undefined"
      ? preferSession
        ? sessionStorage
        : localStorage
      : { getItem() {}, setItem() {} };
  } catch {
    return { getItem() {}, setItem() {} };
  }
}

function getCachedData(key, expiration) {
  try {
    const raw = getStorage().getItem(key);
    if (!raw) return null;

    if (
      typeof raw !== "string" ||
      raw[0] !== "{" ||
      raw[raw.length - 1] !== "}"
    ) {
      return null;
    }

    const { data, timestamp } = JSON.parse(raw);
    const age = Date.now() - timestamp;
    if (age > expiration) return null;

    return data;
  } catch {
    return null;
  }
}

function setCachedData(key, data) {
  try {
    getStorage().setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export default function useCachedSupabase({ key, expiration, fetcher }) {
  const [data, setData] = useState(() => getCachedData(key, expiration) || []);
  const [loading, setLoading] = useState(!data.length);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data.length) return;

    let canceled = false;

    async function load() {
      setLoading(true);
      const { data: fetched, error } = await fetcher();
      if (canceled) return;

      if (error) {
        setError(error.message || "Unknown error");
      } else if (fetched) {
        setData(fetched);
        setCachedData(key, fetched);
      }

      setLoading(false);
    }

    load();

    return () => {
      canceled = true;
    };
  }, []);

  return { data, loading, error };
}
