import type { MenuNode } from "@/types/menu";
import { joinPathSegments, normalizeMenuPath, splitPathSegments } from "@/lib/navigation/menuPath";

type RouteAccessDecision =
  | { kind: "public"; matchedPath: null; candidates: string[] }
  | { kind: "unverified"; matchedPath: null; candidates: string[] }
  | { kind: "allowed"; matchedPath: string; candidates: string[] }
  | { kind: "blocked"; matchedPath: null; candidates: string[] };

const PUBLIC_ROUTE_PREFIXES = ["/login"];
const ALWAYS_ALLOWED_ROUTES = new Set(["/", "/mypage"]);
const ACTION_SEGMENTS = new Set([
  "create",
  "new",
  "edit",
  "detail",
  "receipt",
  "statement",
  "view",
]);
const FALLBACK_SUFFIXES = ["list", "dashboard"];
const MAX_MENU_DEPTH = 12;
const MAX_ROUTE_CANDIDATES = 128;

const isUuidLike = (segment: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment);

const isIdLikeSegment = (segment: string) => {
  if (!segment) {
    return false;
  }

  if (/^\d+$/.test(segment)) {
    return true;
  }

  if (isUuidLike(segment)) {
    return true;
  }

  if (segment.length >= 4 && /\d/.test(segment)) {
    return true;
  }

  return false;
};

const flattenAccessibleMenuPaths = (menus: MenuNode[]) => {
  const paths = new Set<string>();

  const visit = (nodes: MenuNode[], depth = 0, ancestorIds: Set<number> = new Set()) => {
    if (depth > MAX_MENU_DEPTH) {
      return;
    }

    for (const node of nodes) {
      const hasKnownId = Number.isFinite(node.id) && node.id > 0;
      if (hasKnownId && ancestorIds.has(node.id)) {
        continue;
      }

      if (node.isActive !== "N") {
        const normalizedPath = normalizeMenuPath(node.path);
        if (normalizedPath) {
          paths.add(normalizedPath);
        }
      }

      if (node.children?.length) {
        const nextAncestors = new Set(ancestorIds);
        if (hasKnownId) {
          nextAncestors.add(node.id);
        }
        visit(node.children, depth + 1, nextAncestors);
      }
    }
  };

  visit(menus);
  return paths;
};

const enqueueCandidate = (queue: string[], seen: Set<string>, path?: string | null) => {
  const normalizedPath = normalizeMenuPath(path);
  if (!normalizedPath || seen.has(normalizedPath) || seen.size >= MAX_ROUTE_CANDIDATES) {
    return;
  }

  seen.add(normalizedPath);
  queue.push(normalizedPath);
};

const buildCandidatePaths = (pathname: string) => {
  const normalizedPath = normalizeMenuPath(pathname);
  if (!normalizedPath) {
    return [];
  }

  const queue: string[] = [];
  const seen = new Set<string>();
  enqueueCandidate(queue, seen, normalizedPath);

  for (let index = 0; index < queue.length && queue.length < MAX_ROUTE_CANDIDATES; index += 1) {
    const currentPath = queue[index];
    const segments = splitPathSegments(currentPath);
    if (!segments.length) {
      continue;
    }

    const lastSegment = segments.at(-1) ?? "";

    if (ACTION_SEGMENTS.has(lastSegment)) {
      enqueueCandidate(queue, seen, joinPathSegments(segments.slice(0, -1)));
      enqueueCandidate(
        queue,
        seen,
        joinPathSegments([...segments.slice(0, -1), "list"])
      );
    }

    if (isIdLikeSegment(lastSegment)) {
      enqueueCandidate(queue, seen, joinPathSegments(segments.slice(0, -1)));
    }

    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
      if (!isIdLikeSegment(segments[segmentIndex])) {
        continue;
      }

      const withoutDynamicSegment = segments.filter((_, indexToKeep) => indexToKeep !== segmentIndex);
      enqueueCandidate(queue, seen, joinPathSegments(withoutDynamicSegment));
    }
  }

  const baseCandidates = [...queue];
  for (const currentPath of baseCandidates) {
    if (queue.length >= MAX_ROUTE_CANDIDATES) {
      break;
    }

    const segments = splitPathSegments(currentPath);
    if (!segments.length) {
      continue;
    }

    const lastSegment = segments.at(-1) ?? "";
    if (FALLBACK_SUFFIXES.includes(lastSegment)) {
      continue;
    }

    for (const suffix of FALLBACK_SUFFIXES) {
      enqueueCandidate(queue, seen, joinPathSegments([...segments, suffix]));
    }
  }

  return queue;
};

export const isPublicRoute = (pathname: string) => {
  const normalizedPath = normalizeMenuPath(pathname) ?? "/";
  if (ALWAYS_ALLOWED_ROUTES.has(normalizedPath)) {
    return true;
  }

  return PUBLIC_ROUTE_PREFIXES.some(
    (publicPrefix) =>
      normalizedPath === publicPrefix || normalizedPath.startsWith(`${publicPrefix}/`)
  );
};

export const evaluateMenuRouteAccess = (
  menus: MenuNode[],
  pathname: string
): RouteAccessDecision => {
  if (isPublicRoute(pathname)) {
    return { kind: "public", matchedPath: null, candidates: [] };
  }

  if (!menus.length) {
    return { kind: "unverified", matchedPath: null, candidates: [] };
  }

  const allowedPaths = flattenAccessibleMenuPaths(menus);
  const candidates = buildCandidatePaths(pathname);

  for (const candidatePath of candidates) {
    if (allowedPaths.has(candidatePath)) {
      return {
        kind: "allowed",
        matchedPath: candidatePath,
        candidates,
      };
    }
  }

  const normalizedPath = normalizeMenuPath(pathname);
  if (normalizedPath) {
    let bestAncestorMatch: string | null = null;

    for (const allowedPath of allowedPaths) {
      if (!normalizedPath.startsWith(`${allowedPath}/`)) {
        continue;
      }

      if (!bestAncestorMatch || allowedPath.length > bestAncestorMatch.length) {
        bestAncestorMatch = allowedPath;
      }
    }

    if (bestAncestorMatch) {
      return {
        kind: "allowed",
        matchedPath: bestAncestorMatch,
        candidates,
      };
    }

    for (const allowedPath of allowedPaths) {
      if (allowedPath.startsWith(`${normalizedPath}/`)) {
        return {
          kind: "allowed",
          matchedPath: allowedPath,
          candidates,
        };
      }
    }
  }

  return {
    kind: "blocked",
    matchedPath: null,
    candidates,
  };
};
