import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Strx } from 'react-native-strx';
import { StrxDebugOverlay } from 'react-native-strx/debug';

import { EntranceScreen } from './src/screens/EntranceScreen';
import { LayoutScreen } from './src/screens/LayoutScreen';
import { PlaybackScreen } from './src/screens/PlaybackScreen';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { TransitionScreen } from './src/screens/TransitionScreen';
import { colors } from './src/ui';

const SCREENS = {
  Entrance: EntranceScreen,
  Transitions: TransitionScreen,
  Timeline: TimelineScreen,
  Playback: PlaybackScreen,
  Layout: LayoutScreen,
};

type ScreenName = keyof typeof SCREENS;

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('Entrance');
  const [reduceMotion, setReduceMotion] = useState(false);
  const Screen = SCREENS[screen];

  return (
    <Strx.Provider reduceMotion={reduceMotion ? 'always' : 'system'}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>react-native-strx</Text>
        <View style={styles.reduceMotion}>
          <Text style={styles.small}>Reduce motion</Text>
          <Switch value={reduceMotion} onValueChange={setReduceMotion} />
        </View>
      </View>
      <ScrollView horizontal style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {(Object.keys(SCREENS) as ScreenName[]).map(name => (
          <Pressable
            key={name}
            onPress={() => setScreen(name)}
            style={[styles.tab, screen === name && styles.tabActive]}
          >
            <Text style={[styles.tabText, screen === name && styles.tabTextActive]}>
              {name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <Screen key={screen} />
      </ScrollView>
      {__DEV__ ? <StrxDebugOverlay /> : null}
    </Strx.Provider>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  title: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  reduceMotion: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  small: { color: colors.muted, fontSize: 12 },
  tabs: { backgroundColor: colors.background, flexGrow: 0 },
  tabsContent: { gap: 8, padding: 12 },
  tab: { borderColor: '#d1d5db', borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  tabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: 'white' },
  body: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 14, padding: 16, paddingBottom: 80 },
});
