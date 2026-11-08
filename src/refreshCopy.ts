import type { SiteContent } from './types';

// Three-way copy update: only unchanged starter text is replaced. No live write.
export function refreshCopy(current: SiteContent, previous: SiteContent, latest: SiteContent): SiteContent {
  const preserve = new Set(['image', 'heroImage', 'welcomeImage', 'logo', 'id', 'slug']);
  function merge(value: any, old: any, next: any): any {
    if (typeof next === 'string') return value === old ? next : value;
    if (Array.isArray(next)) return Array.isArray(value) ? value.map(item => {
      const before = old?.find((o: any) => o.id === item.id);
      const after = next.find((o: any) => o.id === item.id);
      return before && after ? merge(item, before, after) : item;
    }) : value;
    if (!next || typeof next !== 'object' || !value || typeof value !== 'object') return value;
    const result = { ...value };
    for (const key of Object.keys(next)) {
      if (preserve.has(key)) continue;
      result[key] = !(key in value) ? structuredClone(next[key]) : merge(value[key], old?.[key], next[key]);
    }
    return result;
  }
  const result = structuredClone(current);
  result.home = merge(current.home, previous.home, latest.home);
  result.pages = merge(current.pages, previous.pages, latest.pages);
  result.programmes = merge(current.programmes, previous.programmes, latest.programmes);
  result.stories = merge(current.stories, previous.stories, latest.stories);
  result.copy = merge(current.copy || {}, previous.copy || {}, latest.copy || {});
  for (const [key, value] of Object.entries(previous.copy || {})) {
    if (!(key in (latest.copy || {})) && result.copy?.[key] === value) delete result.copy[key];
  }
  result.settings.footerText = merge(current.settings.footerText, previous.settings.footerText, latest.settings.footerText);
  return result;
}
