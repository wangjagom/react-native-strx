import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import type { CodexAnimationController } from '../core/useCodexAnimation';

/**
 * Layout transition families supported by STRX layout tokens.
 */
export type StrxLayoutTransitionType =
  | 'linear'
  | 'spring'
  | 'fade'
  | 'spring-stiff'
  | 'spring-bouncy';

/**
 * Layout propagation behavior for STRX nodes.
 *
 * `none` makes the node a boundary for inherited layout animation demand.
 */
export type StrxLayoutPropagationMode = 'auto' | 'none';

/**
 * Internal STRX layout node registered by animated primitives.
 */
export interface StrxMeasuredNode {
  /** Stable generated node ID for this mounted component. */
  nodeId: string;
  /** Parent STRX layout node ID, or `null` for a root-level node. */
  parentId: string | null;
  /** Whether layout demand can bubble through this node. */
  layoutPropagation: StrxLayoutPropagationMode;
  /** Animated ref used by Reanimated layout registration. */
  animatedRef: AnimatedRefLike;
}

export interface AnimatedRefLike {
  current?: unknown;
}

/**
 * Layout animation request published by a node with an explicit layout token.
 */
export interface StrxLayoutDemand {
  /** Node ID that requested the layout animation. */
  sourceId: string;
  /** Layout transition family requested by the source node. */
  transitionType: StrxLayoutTransitionType;
}

/**
 * Registry API owned by `Strx.LayoutRoot`.
 *
 * Most users do not call this directly. It is exported for advanced adapters
 * and integrations that need to participate in STRX layout or event timelines.
 */
export interface StrxLayoutContextType {
  /** Registers a mounted STRX layout node. */
  registerNode: (node: StrxMeasuredNode) => void;
  /** Unregisters a STRX layout node by generated node ID. */
  unregisterNode: (nodeId: string) => void;
  /** Registers an event-playable animation target by user-provided `strxId`. */
  registerPlayable: (strxId: string, controller: CodexAnimationController) => void;
  /** Removes an event-playable animation target by `strxId`. */
  unregisterPlayable: (strxId: string) => void;
  /** Looks up an event-playable animation target by `strxId`. */
  getPlayable: (strxId: string) => CodexAnimationController | undefined;
  /** Publishes layout animation demand from a node with a layout token. */
  publishLayoutDemand: (demand: StrxLayoutDemand) => void;
  /** Looks up a registered layout node. */
  getNode: (nodeId: string) => StrxMeasuredNode | undefined;
  /** Returns whether a node is affected by the most recent layout demand. */
  isNodeInfluenced: (nodeId: string) => boolean;
}

const MAX_REGISTRY_SIZE = 256;

const EMPTY_INFLUENCE_SET = Object.freeze(new Set<string>());

export const StrxLayoutContext = createContext<StrxLayoutContextType | null>(
  null,
);

/**
 * Root provider for STRX layout coordination and event timeline targets.
 *
 * Place this near a screen or app root when using `Strx.useTimeline`, `strxId`,
 * or coordinated layout propagation.
 */
export function StrxLayoutRoot({ children }: { children: ReactNode }) {
  const registryRef = useRef(new Map<string, StrxMeasuredNode>());
  const playableRegistryRef = useRef(new Map<string, CodexAnimationController>());
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

  const registerPlayable = useCallback(
    (strxId: string, controller: CodexAnimationController) => {
      try {
        if (!isSafeRegistryId(strxId)) {
          return;
        }

        const registry = playableRegistryRef.current;

        if (registry.has(strxId)) {
          registry.delete(strxId);
        }

        while (registry.size >= MAX_REGISTRY_SIZE) {
          const firstKey = registry.keys().next().value as string | undefined;

          if (firstKey === undefined) {
            break;
          }

          registry.delete(firstKey);
        }

        registry.set(strxId, controller);
      } catch {
        playableRegistryRef.current.delete(strxId);
      }
    },
    [],
  );

  const unregisterPlayable = useCallback((strxId: string) => {
    playableRegistryRef.current.delete(strxId);
  }, []);

  const getPlayable = useCallback((strxId: string) => {
    return playableRegistryRef.current.get(strxId);
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
      registerPlayable,
      unregisterPlayable,
      getPlayable,
      publishLayoutDemand,
      getNode,
      isNodeInfluenced,
    }),
    [
      getNode,
      getPlayable,
      isNodeInfluenced,
      publishLayoutDemand,
      registerPlayable,
      registerNode,
      unregisterPlayable,
      unregisterNode,
    ],
  );

  return (
    <StrxLayoutContext.Provider value={value}>
      {children}
    </StrxLayoutContext.Provider>
  );
}

function isSafeRegistryId(value: string): boolean {
  return value.length > 0 && value.length <= 128;
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
