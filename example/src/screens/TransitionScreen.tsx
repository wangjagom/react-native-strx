import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Strx } from 'react-native-strx';

import { Button, colors, Row, Section } from '../ui';

const CASES = [
  ['transition-all duration-1000 ease-in-out', 'opacity, color, spacing, transform'],
  ['transition-colors duration-1000 linear', 'backgroundColor + borderColor only'],
  ['transition-opacity duration-2000 ease-out', 'opacity only, 2s'],
  ['transition-transform duration-1000 ease-in-out', 'translate, scale, rotate only'],
  ['transition-spacing duration-700 ease-out', 'margin + padding only'],
  ['transition-layout duration-1000 ease-in-out', 'width + height only'],
] as const;

/**
 * QA:
 * - toggling must not replay "fade-in" on the combined box (B1)
 * - "Rapid toggle" interrupts transitions every 300ms; values must reverse
 *   smoothly from where they are, never jump (B2)
 */
export function TransitionScreen() {
  const [active, setActive] = useState(false);
  const [rapid, setRapid] = useState(false);

  useEffect(() => {
    if (!rapid) {
      return;
    }

    const timer = setInterval(() => setActive(value => !value), 300);

    return () => clearInterval(timer);
  }, [rapid]);

  return (
    <>
      <Section title="Controls">
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>State: {active ? 'ON' : 'OFF'}</Text>
          <Switch value={active} onValueChange={setActive} />
        </View>
        <Row>
          <Button
            label={rapid ? 'Stop rapid toggle' : 'Rapid toggle'}
            onPress={() => setRapid(value => !value)}
          />
        </Row>
      </Section>

      <Section
        title="fade-in + transition-colors (B1)"
        hint="Fades in once on mount. Toggling only animates the color."
      >
        <Strx.View
          animate="fade-in transition-colors duration-800"
          style={[styles.box, { backgroundColor: active ? colors.green : colors.red }]}
        />
      </Section>

      {CASES.map(([animate, description]) => (
        <Section key={animate} title={animate} hint={description}>
          <Strx.View
            animate={animate}
            style={[
              styles.box,
              active ? styles.boxActive : styles.boxIdle,
              animate.includes('spacing') &&
                (active ? styles.spacingActive : styles.spacingIdle),
              animate.includes('layout') &&
                (active ? styles.layoutActive : styles.layoutIdle),
              (animate.includes('transform') || animate.includes('all')) &&
                (active ? styles.transformActive : styles.transformIdle),
            ]}
          />
        </Section>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchLabel: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  box: { borderRadius: 14, borderWidth: 2, height: 64 },
  boxIdle: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe', opacity: 0.5 },
  boxActive: { backgroundColor: '#dcfce7', borderColor: colors.green, opacity: 1 },
  transformIdle: { transform: [{ translateX: 0 }, { scale: 1 }, { rotate: '0deg' }] },
  transformActive: {
    transform: [{ translateX: 40 }, { scale: 1.1 }, { rotate: '6deg' }],
  },
  spacingIdle: { marginHorizontal: 0, paddingVertical: 8 },
  spacingActive: { marginHorizontal: 28, paddingVertical: 24 },
  layoutIdle: { height: 64, width: 160 },
  layoutActive: { height: 110, width: 260 },
});
