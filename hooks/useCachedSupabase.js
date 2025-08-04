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

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      getStorage().removeItem(key);
      return null;
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.data ||
      !parsed.timestamp
    ) {
      getStorage().removeItem(key);
      return null;
    }

    const age = Date.now() - parsed.timestamp;
    if (age > expiration) return null;

    return parsed.data;
  } catch (e) {
    getStorage().removeItem(key);
    return null;
  }
}

export function setCachedData(key, data) {
  try {
    getStorage().setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export default function useCachedSupabase({ key, expiration, fetcher }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = getCachedData(key, expiration);
    if (cached && cached.length) {
      setData(cached);
      setLoading(false);
    } else {
      (async () => {
        const { data: fetched, error } = await fetcher();
        if (error) {
          setError(error.message || "Unknown error");
        } else if (fetched) {
          setData(fetched);
          setCachedData(key, fetched);
        }
        setLoading(false);
      })();
    }
  }, []);

  return { data, loading, error };
}
