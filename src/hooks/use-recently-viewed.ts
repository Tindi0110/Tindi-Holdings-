import { useEffect, useState } from "react";

const KEY = "shopsphere.recentlyViewed";
const MAX = 12;

export type RecentItem = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  compare_at_price?: number | string | null;
  image_url?: string | null;
};

function read(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(item: RecentItem) {
  if (typeof window === "undefined") return;
  const current = read().filter((i) => i.id !== item.id);
  const next = [item, ...current].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);
  useEffect(() => {
    setItems(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return items;
}
