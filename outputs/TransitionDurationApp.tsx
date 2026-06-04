import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  View as RNView,
} from 'react-native';
import { Strx } from 'react-native-strx';

const CASES = [
  {
    title: 'transition-all duration-1000',
    animate: 'transition-all duration-1000 ease-in-out',
    description: 'opacity + color + spacing + transform all animate over 1s',
  },
  {
    title: 'transition-colors duration-1000',
    animate: 'transition-colors duration-1000 linear',
    description: 'backgroundColor + borderColor only',
  },
  {
    title: 'transition-opacity duration-2000',
    animate: 'transition-opacity duration-2000 ease-out',
    description: 'opacity only, slow 2s',
  },
  {
    title: 'transition-transform duration-1000',
    animate: 'transition-transform duration-1000 ease-in-out',
    description: 'translate + scale + rotate only',
  },
  {
    title: 'transition-spacing duration-700',
    animate: 'transition-spacing duration-700 ease-out',
    description: 'margin + padding only',
  },
  {
    title: 'transition-layout duration-1000',
    animate: 'transition-layout duration-1000 ease-in-out',
    description: 'width + height only',
  },
] as const;

export default function App() {
  const [active, setActive] = useState(false);
  const [items, setItems] = useState(['A', 'B', 'C']);

  const toggleLabel = active ? 'ON' : 'OFF';
  const heroSource = useMemo(
    () => ({
      uri: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900&q=80',
    }),
    [],
  );

  return (
    <Strx.LayoutRoot>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <Strx.ScrollView
          animate="layout-linear"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Strx.View animate="fade-in layout-linear" style={styles.header}>
            <Strx.Text animate="fade-in duration-600" style={styles.title}>
              STRX transition / duration test
            </Strx.Text>
            <Strx.Text style={styles.subtitle}>
              Toggle state. Check each token scope and duration by eye.
            </Strx.Text>
            <RNView style={styles.switchRow}>
              <Strx.Text style={styles.switchLabel}>State: {toggleLabel}</Strx.Text>
              <Switch value={active} onValueChange={setActive} />
            </RNView>
          </Strx.View>

          {CASES.map((item, index) => (
            <Strx.View key={item.title} animate="layout-spring" style={styles.card}>
              <Strx.Text style={styles.caseTitle}>{index + 1}. {item.title}</Strx.Text>
              <Strx.Text style={styles.description}>{item.description}</Strx.Text>

              <Strx.View
                animate={item.animate}
                style={[
                  styles.box,
                  active ? styles.boxActive : styles.boxIdle,
                  item.title.includes('spacing') && (active ? styles.spacingActive : styles.spacingIdle),
                  item.title.includes('layout') && (active ? styles.layoutActive : styles.layoutIdle),
                  item.title.includes('transform') && (active ? styles.transformActive : styles.transformIdle),
                  item.title.includes('all') && (active ? styles.allActive : styles.allIdle),
                ]}
              >
                <Strx.Text
                  animate="transition-colors duration-1000"
                  style={[styles.boxText, active ? styles.boxTextActive : styles.boxTextIdle]}
                >
                  {item.animate}
                </Strx.Text>
              </Strx.View>
            </Strx.View>
          ))}

          <Strx.LayoutGroup defaultTransition="spring">
            <Strx.View animate="layout-spring fade-in" style={styles.card} layoutClip>
              <Strx.Text style={styles.caseTitle}>layout-spring + dynamic siblings</Strx.Text>
              <RNView style={styles.buttonRow}>
                <Strx.Pressable
                  animate="press-scale transition-all duration-300"
                  style={styles.button}
                  onPress={() => setItems(list => [...list, String.fromCharCode(65 + list.length)])}
                >
                  <Strx.Text style={styles.buttonText}>Add</Strx.Text>
                </Strx.Pressable>
                <Strx.Pressable
                  animate="press-scale transition-all duration-300"
                  style={styles.secondaryButton}
                  onPress={() => setItems(list => list.slice(0, Math.max(1, list.length - 1)))}
                >
                  <Strx.Text style={styles.secondaryButtonText}>Remove</Strx.Text>
                </Strx.Pressable>
              </RNView>

              {items.map(item => (
                <Strx.View
                  key={item}
                  animate="from:opacity-0 from:translate-y-16 to:opacity-100 to:translate-y-0 layout-linear duration-500"
                  style={styles.listItem}
                >
                  <Strx.Text style={styles.listText}>Item {item}</Strx.Text>
                </Strx.View>
              ))}
            </Strx.View>
          </Strx.LayoutGroup>

          <Strx.Image
            animate="transition-all duration-1000 fade-in layout-fade"
            source={heroSource}
            style={[styles.image, active ? styles.imageActive : styles.imageIdle]}
          />
        </Strx.ScrollView>
      </SafeAreaView>
    </Strx.LayoutRoot>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 60,
  },
  header: {
    gap: 10,
    paddingVertical: 8,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    gap: 12,
    padding: 14,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  caseTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
  },
  box: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 76,
    padding: 14,
  },
  boxIdle: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
    opacity: 0.55,
  },
  boxActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    opacity: 1,
  },
  allIdle: {
    marginLeft: 0,
    paddingVertical: 12,
    transform: [{ translateY: 0 }, { scale: 1 }, { rotate: '0deg' }],
  },
  allActive: {
    marginLeft: 28,
    paddingVertical: 24,
    transform: [{ translateY: -8 }, { scale: 1.06 }, { rotate: '2deg' }],
  },
  transformIdle: {
    transform: [{ translateX: 0 }, { scale: 1 }, { rotate: '0deg' }],
  },
  transformActive: {
    transform: [{ translateX: 48 }, { scale: 1.12 }, { rotate: '6deg' }],
  },
  spacingIdle: {
    marginHorizontal: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  spacingActive: {
    marginHorizontal: 28,
    paddingHorizontal: 34,
    paddingVertical: 24,
  },
  layoutIdle: {
    width: 170,
    height: 76,
  },
  layoutActive: {
    width: 280,
    height: 118,
  },
  boxText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  boxTextIdle: {
    color: '#3730a3',
  },
  boxTextActive: {
    color: '#166534',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  secondaryButton: {
    borderColor: '#d1d5db',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  listItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
  },
  listText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  image: {
    height: 170,
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
  },
  imageIdle: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  imageActive: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
});
