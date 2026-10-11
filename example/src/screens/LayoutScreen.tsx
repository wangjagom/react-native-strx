import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Strx } from 'react-native-strx';

import { Button, colors, Row, Section } from '../ui';

const LIST_SIZE = 200;
const ITEMS = Array.from({ length: LIST_SIZE }, (_, index) => index);

/**
 * QA:
 * - expanding the card animates its height with layout-spring
 * - adding/removing items animates siblings; removed items run their exit
 * - the 200-row list is for comparing frame rates (Perf Monitor) with and
 *   without layout tokens
 */
export function LayoutScreen() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(['A', 'B', 'C']);
  const [withLayout, setWithLayout] = useState(true);
  const [dense, setDense] = useState(false);

  return (
    <>
      <Section title="Expandable card" hint="layout-spring + layoutClip">
        <Button label={open ? 'Collapse' : 'Expand'} onPress={() => setOpen(v => !v)} />
        <Strx.View animate="layout-spring" layoutClip style={styles.card}>
          <Text style={styles.text}>Always visible</Text>
          {open ? (
            <Strx.Text animate="fade-in exit:opacity-0 duration-200" style={styles.text}>
              Extra content that appears when expanded. The card height should
              spring open, and the text should fade in and out.
            </Strx.Text>
          ) : null}
        </Strx.View>
      </Section>

      <Section title="LayoutGroup list" hint="Items enter with keyframes and exit sliding left.">
        <Row>
          <Button
            label="Add"
            onPress={() =>
              setItems(list => [...list, String.fromCharCode(65 + list.length)])
            }
          />
          <Button label="Remove first" onPress={() => setItems(list => list.slice(1))} />
        </Row>
        <Strx.LayoutGroup transition="spring">
          {items.map(item => (
            <Strx.View
              key={item}
              animate="from:opacity-0 from:translate-y-16 duration-400 exit:opacity-0 exit:-translate-x-60"
              style={styles.item}
            >
              <Text style={styles.text}>Item {item}</Text>
            </Strx.View>
          ))}
        </Strx.LayoutGroup>
      </Section>

      <Section
        title={`${LIST_SIZE} rows`}
        hint="Toggle density to relayout every row. Compare frame rates with layout tokens on and off."
      >
        <Row>
          <Button
            label={withLayout ? 'layout-linear: ON' : 'layout-linear: OFF'}
            onPress={() => setWithLayout(v => !v)}
          />
          <Button label="Toggle density" onPress={() => setDense(v => !v)} />
        </Row>
        <View>
          {ITEMS.map(index => (
            <Strx.View
              key={index}
              animate={withLayout ? 'layout-linear' : undefined}
              style={[styles.row, dense && styles.rowDense]}
            >
              <Text style={styles.small}>Row {index}</Text>
            </Strx.View>
          ))}
        </View>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#eef2ff', borderRadius: 12, gap: 8, padding: 12 },
  item: { backgroundColor: '#f3f4f6', borderRadius: 10, marginBottom: 8, padding: 12 },
  text: { color: colors.ink, fontSize: 14 },
  row: { borderBottomColor: '#e5e7eb', borderBottomWidth: 1, paddingVertical: 10 },
  rowDense: { paddingVertical: 3 },
  small: { color: colors.muted, fontSize: 12 },
});
