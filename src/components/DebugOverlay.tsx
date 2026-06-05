import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text as RNText,
  View as RNView,
} from 'react-native';

import strxLogo from '../../images/logo.png';
import { getNormalizeAnimateCacheSize } from '../parser/normalize';
import { useStrxLayout } from '../context/StrxLayoutContext';
import { useStrxMotion } from '../context/StrxMotionContext';

export type StrxDebugOverlayPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface StrxDebugOverlayProps {
  /** When false, the overlay returns null and does not start a polling timer. */
  enabled?: boolean;
  /** Screen corner used by the overlay. */
  position?: StrxDebugOverlayPosition;
  /** Whether the overlay starts expanded. Default is collapsed to avoid covering app UI. */
  initialExpanded?: boolean;
  /** Shows the tiny easing/timing preview. */
  showMotionPreview?: boolean;
}

interface DebugSnapshot {
  nodeCount: number;
  playableCount: number;
  influencedCount: number;
  normalizeCacheSize: number;
  lastEvent: string | null;
  warnings: readonly string[];
}

const EMPTY_SNAPSHOT: DebugSnapshot = Object.freeze({
  nodeCount: 0,
  playableCount: 0,
  influencedCount: 0,
  normalizeCacheSize: 0,
  lastEvent: null,
  warnings: Object.freeze([]),
});

const CURVE_POINT_COUNT = 56;
const GRAPH_WIDTH = 206;
const GRAPH_HEIGHT = 164;
const GRAPH_PADDING_LEFT = 28;
const GRAPH_PADDING_RIGHT = 10;
const GRAPH_PADDING_TOP = 16;
const GRAPH_PADDING_BOTTOM = 28;
const CURVE_WIDTH = GRAPH_WIDTH - GRAPH_PADDING_LEFT - GRAPH_PADDING_RIGHT;
const CURVE_HEIGHT = GRAPH_HEIGHT - GRAPH_PADDING_TOP - GRAPH_PADDING_BOTTOM;
const PREVIEW_DOT_SIZE = 10;
const CURVE_LINE_THICKNESS = 3;
const GRAPH_GRID_STEPS = [0, 1, 2, 3, 4];

/**
 * Lightweight development overlay for STRX runtime diagnostics.
 *
 * It intentionally shows aggregate counts only. It does not expose component
 * coordinates, node IDs, or user-provided target names.
 */
export function DebugOverlay({
  enabled = true,
  position = 'bottom-right',
  initialExpanded = false,
  showMotionPreview = true,
}: StrxDebugOverlayProps) {
  const layout = useStrxLayout();
  const motion = useStrxMotion();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [renderExpanded, setRenderExpanded] = useState(initialExpanded);
  const [snapshot, setSnapshot] = useState<DebugSnapshot>(EMPTY_SNAPSHOT);
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [renderGraph, setRenderGraph] = useState(false);
  const panelProgress = useRef(new Animated.Value(initialExpanded ? 1 : 0)).current;
  const graphProgress = useRef(new Animated.Value(0)).current;
  const timingProgress = useRef(new Animated.Value(0)).current;
  const previewPoints = useMemo(
    () => createPreviewPoints(motion.easing ?? 'ease-out'),
    [motion.easing],
  );
  const previewSegments = useMemo(
    () => createPreviewSegments(previewPoints),
    [previewPoints],
  );
  const actualDuration = getActualDuration(motion.duration);
  const timingDuration = getPreviewDuration(actualDuration);
  const isPreviewSlowed = timingDuration > actualDuration + 1;
  const isTimingPreviewVisible =
    enabled && showMotionPreview && !motion.isReduceMotionEnabled && renderExpanded && renderGraph;
  const dotInputRange = useMemo(
    () => previewPoints.map((_, index) => index / (previewPoints.length - 1)),
    [previewPoints],
  );
  const dotTranslateX = timingProgress.interpolate({
    inputRange: dotInputRange,
    outputRange: previewPoints.map(point => point.x - PREVIEW_DOT_SIZE / 2),
  });
  const dotTranslateY = timingProgress.interpolate({
    inputRange: dotInputRange,
    outputRange: previewPoints.map(point => point.y - PREVIEW_DOT_SIZE / 2),
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const update = () => {
      const layoutSnapshot = layout?.getDebugSnapshot?.() ?? EMPTY_SNAPSHOT;
      setSnapshot({
        nodeCount: layoutSnapshot.nodeCount,
        playableCount: layoutSnapshot.playableCount,
        influencedCount: layoutSnapshot.influencedCount,
        normalizeCacheSize: getNormalizeAnimateCacheSize(),
        lastEvent: layoutSnapshot.lastEvent,
        warnings: layoutSnapshot.warnings,
      });
    };

    update();
    const timer = setInterval(update, 500);

    return () => {
      clearInterval(timer);
    };
  }, [enabled, layout]);

  useEffect(() => {
    if (!isTimingPreviewVisible) {
      timingProgress.stopAnimation();
      timingProgress.setValue(motion.isReduceMotionEnabled ? 1 : 0);
      return;
    }

    let cancelled = false;
    let delayTimer: ReturnType<typeof setTimeout> | undefined;

    const runCycle = () => {
      if (cancelled) {
        return;
      }

      timingProgress.stopAnimation();
      timingProgress.setValue(0);
      Animated.timing(timingProgress, {
        toValue: 1,
        duration: timingDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!cancelled && finished) {
          delayTimer = setTimeout(runCycle, 420);
        }
      });
    };

    runCycle();

    return () => {
      cancelled = true;
      if (delayTimer !== undefined) {
        clearTimeout(delayTimer);
      }
      timingProgress.stopAnimation();
    };
  }, [isTimingPreviewVisible, motion.isReduceMotionEnabled, timingDuration, timingProgress]);

  useEffect(() => {
    if (graphExpanded) {
      setRenderGraph(true);
      Animated.timing(graphProgress, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(graphProgress, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setRenderGraph(false);
      }
    });
  }, [graphExpanded, graphProgress]);

  useEffect(() => {
    if (expanded) {
      setRenderExpanded(true);
      Animated.spring(panelProgress, {
        toValue: 1,
        damping: 18,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(panelProgress, {
      toValue: 0,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setRenderExpanded(false);
      }
    });
  }, [expanded, panelProgress]);

  if (!enabled) {
    return null;
  }

  return (
    <RNView style={[styles.shell, getPositionStyle(position)]}>
      {!renderExpanded ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Expand STRX debug overlay"
          onPress={() => setExpanded(true)}
          style={styles.collapsed}
        >
          <RNView style={styles.logoMark}>
            <RNImage source={strxLogo} style={styles.logoImage} resizeMode="contain" />
          </RNView>
          <RNView>
            <RNText style={styles.collapsedTitle}>STRX</RNText>
            <RNText style={styles.collapsedMeta}>
              {snapshot.playableCount} targets · {snapshot.warnings.length} warn
            </RNText>
          </RNView>
        </Pressable>
      ) : (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: panelProgress,
              transform: [
                {
                  scale: panelProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <RNView style={styles.header}>
            <RNView style={styles.headerTitleRow}>
              <RNView style={styles.logoMarkLarge}>
                <RNImage source={strxLogo} style={styles.logoImageLarge} resizeMode="contain" />
              </RNView>
              <RNView>
                <RNText style={styles.title}>STRX Debug</RNText>
                <RNText style={styles.subtitle}>runtime motion HUD</RNText>
              </RNView>
            </RNView>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Collapse STRX debug overlay"
              onPress={() => setExpanded(false)}
              style={styles.collapseButton}
            >
              <RNText style={styles.collapseText}>Hide</RNText>
            </Pressable>
          </RNView>

          <RNView style={styles.statusRow}>
            <RNView
              style={[
                styles.badge,
                motion.isReduceMotionEnabled ? styles.badgeOn : styles.badgeOff,
              ]}
            >
              <RNText style={styles.badgeText}>
                reduce {motion.isReduceMotionEnabled ? 'on' : 'off'}
              </RNText>
            </RNView>
            <RNText style={styles.eventText} numberOfLines={1}>
              {snapshot.lastEvent ?? 'no recent event'}
            </RNText>
          </RNView>

          <RNView style={styles.grid}>
            <Metric label="nodes" value={snapshot.nodeCount} />
            <Metric label="targets" value={snapshot.playableCount} />
            <Metric label="influenced" value={snapshot.influencedCount} />
            <Metric label="cache" value={snapshot.normalizeCacheSize} />
          </RNView>

          {showMotionPreview ? (
            <RNView style={styles.motionPanel}>
              <RNView style={styles.motionHeader}>
                <RNView style={styles.motionHeaderText}>
                  <RNText style={styles.sectionTitle}>Motion timing</RNText>
                  <RNView style={styles.motionMetaRow}>
                    <RNText style={styles.motionMeta}>
                      {actualDuration}ms · {motion.easing ?? '-'}
                    </RNText>
                    {isPreviewSlowed ? (
                      <RNText style={styles.motionPreviewMeta}>
                        preview {(timingDuration / 1000).toFixed(1)}s
                      </RNText>
                    ) : null}
                  </RNView>
                </RNView>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={graphExpanded ? 'Collapse motion timing graph' : 'Expand motion timing graph'}
                  onPress={() => setGraphExpanded(value => !value)}
                  style={styles.graphToggle}
                >
                  <RNText style={styles.graphToggleText}>
                    {graphExpanded ? 'Less' : 'More'} {graphExpanded ? '▴' : '▾'}
                  </RNText>
                </Pressable>
              </RNView>

              {renderGraph ? (
                <Animated.View
                  style={[
                    styles.graphShell,
                    {
                      opacity: graphProgress,
                      transform: [
                        {
                          scaleY: graphProgress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.98, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <RNView style={styles.graphTitleRow}>
                    <RNView>
                      <RNText style={styles.graphName}>{motion.easing ?? 'ease-out'}</RNText>
                      <RNText style={styles.graphFormula}>progress over time</RNText>
                    </RNView>
                    <RNText style={styles.graphDuration}>{actualDuration}ms</RNText>
                  </RNView>
                  <RNView style={styles.previewTrack}>
                    {GRAPH_GRID_STEPS.map(step => (
                      <RNView
                        key={`v-${step}`}
                        style={[
                          styles.graphGridLineVertical,
                          { left: GRAPH_PADDING_LEFT + (step / 4) * CURVE_WIDTH },
                        ]}
                      />
                    ))}
                    {GRAPH_GRID_STEPS.map(step => (
                      <RNView
                        key={`h-${step}`}
                        style={[
                          styles.graphGridLineHorizontal,
                          { top: GRAPH_PADDING_TOP + (step / 4) * CURVE_HEIGHT },
                        ]}
                      />
                    ))}
                    {previewSegments.map((segment, index) => (
                      <RNView
                        key={`curve-${index}`}
                        style={[
                          styles.previewSegment,
                          {
                            left: segment.left,
                            top: segment.top,
                            width: segment.length,
                            transform: [{ rotateZ: `${segment.angle}rad` }],
                          },
                        ]}
                      />
                    ))}
                    <RNText style={styles.progressAxisLabel}>PROGRESSION</RNText>
                    <RNText style={styles.timeAxisLabel}>TIME</RNText>
                    <RNText style={[styles.graphTickText, styles.graphTickZero]}>0</RNText>
                    <RNText style={[styles.graphTickText, styles.graphTickHalf]}>0.5</RNText>
                    <RNText style={[styles.graphTickText, styles.graphTickOne]}>1</RNText>
                    <Animated.View
                      style={[
                        styles.movingDot,
                        {
                          transform: [
                            { translateX: dotTranslateX },
                            { translateY: dotTranslateY },
                          ],
                        },
                      ]}
                    />
                  </RNView>
                </Animated.View>
              ) : null}
            </RNView>
          ) : null}

          <RNView style={styles.warningPanel}>
            <RNText style={styles.sectionTitle}>Dev warnings</RNText>
            {snapshot.warnings.length === 0 ? (
              <RNText style={styles.emptyText}>No warnings</RNText>
            ) : (
              snapshot.warnings.map((warning, index) => (
                <RNText key={`${index}-${warning}`} style={styles.warningText}>
                  {index + 1}. {warning}
                </RNText>
              ))
            )}
          </RNView>
        </Animated.View>
      )}
    </RNView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <RNView style={styles.metric}>
      <RNText style={styles.metricValue}>{value}</RNText>
      <RNText style={styles.metricLabel}>{label}</RNText>
    </RNView>
  );
}

interface PreviewPoint {
  x: number;
  y: number;
}

interface PreviewSegment {
  left: number;
  top: number;
  length: number;
  angle: number;
}

function createPreviewPoints(easing: string): PreviewPoint[] {
  const points: PreviewPoint[] = [];

  for (let index = 0; index < CURVE_POINT_COUNT; index += 1) {
    const t = index / (CURVE_POINT_COUNT - 1);
    const value = resolvePreviewEasing(easing, t);
    points.push({
      x: GRAPH_PADDING_LEFT + t * CURVE_WIDTH,
      y: GRAPH_PADDING_TOP + (1 - value) * CURVE_HEIGHT,
    });
  }

  return points;
}

function createPreviewSegments(points: PreviewPoint[]): PreviewSegment[] {
  const segments: PreviewSegment[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const length = Math.sqrt(dx * dx + dy * dy);

    segments.push({
      left: start.x + dx / 2 - length / 2,
      top: start.y + dy / 2 - CURVE_LINE_THICKNESS / 2,
      length: length + 1.4,
      angle: Math.atan2(dy, dx),
    });
  }

  return segments;
}

function getActualDuration(duration: number | undefined): number {
  return typeof duration === 'number' && Number.isFinite(duration) && duration > 0
    ? Math.round(duration)
    : 600;
}

function getPreviewDuration(duration: number): number {
  const readableDuration = duration * 2;

  if (readableDuration < 1200) {
    return 1200;
  }

  return Math.min(readableDuration, 5000);
}

function resolvePreviewEasing(easing: string, t: number): number {
  if (easing === 'linear') {
    return t;
  }

  if (easing === 'ease-in') {
    return t * t * t;
  }

  if (easing === 'ease-out') {
    return 1 - Math.pow(1 - t, 3);
  }

  if (easing === 'ease-in-out') {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  return t * t * (3 - 2 * t);
}

function getPositionStyle(position: StrxDebugOverlayPosition) {
  switch (position) {
    case 'top-left':
      return styles.topLeft;
    case 'top-right':
      return styles.topRight;
    case 'bottom-left':
      return styles.bottomLeft;
    case 'bottom-right':
    default:
      return styles.bottomRight;
  }
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    zIndex: 9999,
  },
  topLeft: {
    left: 18,
    top: 72,
  },
  topRight: {
    right: 18,
    top: 72,
  },
  bottomLeft: {
    left: 18,
    bottom: 34,
  },
  bottomRight: {
    right: 18,
    bottom: 34,
  },
  collapsed: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    minWidth: 112,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  collapsedTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  collapsedMeta: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
    marginTop: 1,
  },
  logoMark: {
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
  },
  logoImage: {
    width: 22,
    height: 22,
  },
  container: {
    width: 262,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: 12,
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  logoMarkLarge: {
    alignItems: 'center',
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
  },
  logoImageLarge: {
    width: 26,
    height: 26,
  },
  title: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
    marginTop: 1,
  },
  collapseButton: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  collapseText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  badgeOn: {
    backgroundColor: '#0f766e',
  },
  badgeOff: {
    backgroundColor: '#334155',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  eventText: {
    color: '#e2e8f0',
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  metric: {
    width: 109,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 21,
  },
  metricLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: 1,
  },
  motionPanel: {
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginTop: 10,
    padding: 9,
  },
  motionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  motionHeaderText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingRight: 2,
  },
  motionMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 3,
    maxWidth: 146,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
  },
  motionMeta: {
    color: '#67e8f9',
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  motionPreviewMeta: {
    color: '#bae6fd',
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 13,
  },
  graphToggle: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexBasis: 58,
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: 58,
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  graphToggleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 13,
  },
  graphShell: {
    overflow: 'hidden',
  },
  graphTitleRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  graphName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 17,
  },
  graphFormula: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    marginTop: 1,
  },
  graphDuration: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
  },
  previewTrack: {
    height: GRAPH_HEIGHT,
    width: GRAPH_WIDTH,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftWidth: 1,
    overflow: 'hidden',
  },
  graphGridLineVertical: {
    position: 'absolute',
    top: GRAPH_PADDING_TOP,
    width: 1,
    height: CURVE_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  graphGridLineHorizontal: {
    position: 'absolute',
    left: GRAPH_PADDING_LEFT,
    width: CURVE_WIDTH,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  previewSegment: {
    position: 'absolute',
    height: CURVE_LINE_THICKNESS,
    borderRadius: 0,
    backgroundColor: '#22d3ee',
  },
  movingDot: {
    position: 'absolute',
    width: PREVIEW_DOT_SIZE,
    height: PREVIEW_DOT_SIZE,
    borderColor: '#ecfeff',
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: '#22d3ee',
  },
  progressAxisLabel: {
    position: 'absolute',
    left: -31,
    top: 76,
    color: 'rgba(255, 255, 255, 0.42)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    transform: [{ rotateZ: '-90deg' }],
  },
  timeAxisLabel: {
    position: 'absolute',
    left: 94,
    bottom: 5,
    color: 'rgba(255, 255, 255, 0.42)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  graphTickText: {
    position: 'absolute',
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '900',
  },
  graphTickZero: {
    left: GRAPH_PADDING_LEFT - 4,
    bottom: 12,
  },
  graphTickHalf: {
    left: GRAPH_PADDING_LEFT + CURVE_WIDTH / 2 - 8,
    bottom: 12,
  },
  graphTickOne: {
    right: 5,
    bottom: 12,
  },
  warningPanel: {
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderTopWidth: 1,
    gap: 4,
    marginTop: 10,
    paddingTop: 9,
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  warningText: {
    color: '#fde68a',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
});
