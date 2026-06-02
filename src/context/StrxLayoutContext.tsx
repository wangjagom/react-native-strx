import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

export type StrxLayoutTransitionType =
  | 'linear'
  | 'spring'
  | 'fade'
  | 'spring-stiff'
  | 'spring-bouncy';

export type StrxLayoutPropagationMode = 'auto' | 'none';

export interface StrxMeasuredNode {
  nodeId: string;
  parentId: string | null;
  layoutPropagation: StrxLayoutPropagationMode;
  animatedRef: AnimatedRefLike;
}

export interface AnimatedRefLike {
  current?: unknown;
}

export interface StrxLayoutDemand {
  sourceId: string;
  transitionType: StrxLayoutTransitionType;
}

export interface StrxLayoutContextType {
  registerNode: (node: StrxMeasuredNode) => void;
  unregisterNode: (nodeId: string) => void;
  publishLayoutDemand: (demand: StrxLayoutDemand) => void;
  getNode: (nodeId: string) => StrxMeasuredNode | undefined;
  isNodeInfluenced: (nodeId: string) => boolean;
}

const MAX_REGISTRY_SIZE = 256;

const EMPTY_INFLUENCE_SET = Object.freeze(new Set<string>());

export const StrxLayoutContext = createContext<StrxLayoutContextType | null>(
  null,
);

export function StrxLayoutRoot({ children }: { children: ReactNode }) {
  const registryRef = useRef(new Map<string, StrxMeasuredNode>());
  const influencedNodeIdsRef = useRef<ReadonlySet<string>>(EMPTY_INFLUENCE_SET);

  const registerNode = useCallback((node: StrxMeasuredNode) => {
    try {
      const registry = registryRef.current;

      if (registry.has(node.nodeId)) {
        registry.delete(node.nodeId);
      }

      while (registry.size >= MAX_REGISTRY_SIZE) {
        const firstKey = registry.keys().next().value as string | undefined;

        if (firstKey === undefined) {
          break;
        }

        registry.delete(firstKey);
      }

      registry.set(node.nodeId, createStoredNode(node));
    } catch {
      registryRef.current.delete(node.nodeId);
    }
  }, []);

  const unregisterNode = useCallback((nodeId: string) => {
    registryRef.current.delete(nodeId);
  }, []);

  const getNode = useCallback((nodeId: string) => {
    return registryRef.current.get(nodeId);
  }, []);

  const isNodeInfluenced = useCallback((nodeId: string) => {
    return influencedNodeIdsRef.current.has(nodeId);
  }, []);

  const publishLayoutDemand = useCallback((demand: StrxLayoutDemand) => {
    try {
      const influencedIds = collectInfluencedNodes(
        registryRef.current,
        demand.sourceId,
      );
      influencedNodeIdsRef.current = influencedIds;
    } catch {
      influencedNodeIdsRef.current = EMPTY_INFLUENCE_SET;
    }
  }, []);

  const value = useMemo<StrxLayoutContextType>(
    () => ({
      registerNode,
      unregisterNode,
      publishLayoutDemand,
      getNode,
      isNodeInfluenced,
    }),
    [
      getNode,
      isNodeInfluenced,
      publishLayoutDemand,
      registerNode,
      unregisterNode,
    ],
  );

  return (
    <StrxLayoutContext.Provider value={value}>
      {children}
    </StrxLayoutContext.Provider>
  );
}

export function useStrxLayout(): StrxLayoutContextType | null {
  return useContext(StrxLayoutContext);
}

function collectInfluencedNodes(
  registry: Map<string, StrxMeasuredNode>,
  sourceId: string,
): ReadonlySet<string> {
  const sourceNode = registry.get(sourceId);

  if (!sourceNode) {
    return EMPTY_INFLUENCE_SET;
  }

  const influencedIds = new Set<string>();
  const ancestorIds = collectAncestorIds(registry, sourceNode);
  const sameParentId = sourceNode.parentId;

  influencedIds.add(sourceId);

  for (const ancestorId of ancestorIds) {
    influencedIds.add(ancestorId);
  }

  for (const node of registry.values()) {
    if (node.layoutPropagation === 'none' && node.nodeId !== sourceId) {
      continue;
    }

    if (
      node.parentId === sameParentId ||
      ancestorIds.has(node.parentId ?? '')
    ) {
      influencedIds.add(node.nodeId);
    }
  }

  return influencedIds;
}

function collectAncestorIds(
  registry: Map<string, StrxMeasuredNode>,
  sourceNode: StrxMeasuredNode,
): Set<string> {
  const ancestorIds = new Set<string>();
  let parentId = sourceNode.parentId;
  let guard = 0;

  while (parentId && guard < MAX_REGISTRY_SIZE) {
    const parent = registry.get(parentId);

    if (!parent) {
      break;
    }

    ancestorIds.add(parent.nodeId);

    if (parent.layoutPropagation === 'none') {
      break;
    }

    parentId = parent.parentId;
    guard += 1;
  }

  return ancestorIds;
}

function createStoredNode(node: StrxMeasuredNode): StrxMeasuredNode {
  return Object.assign(Object.create(null), {
    nodeId: node.nodeId,
    parentId: node.parentId,
    layoutPropagation: node.layoutPropagation,
    animatedRef: node.animatedRef,
  }) as StrxMeasuredNode;
}
