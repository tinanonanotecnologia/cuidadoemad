import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
} from 'expo-glass-effect';

type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

type GlassMenuProps = {
  items: MenuItem[];
  activeKey: string;
  onChange: (key: string) => void;
};

/**
 * Menu nativo do Recomeço.
 * O GlassView fica restrito à barra e aos botões do menu.
 * O restante da tela continua sem camada de vidro.
 */
export function GlassMenu({ items, activeKey, onChange }: GlassMenuProps) {
  const glassAvailable = isGlassEffectAPIAvailable();

  return (
    <GlassContainer spacing={8} style={styles.bar}>
      {items.map((item) => {
        const active = item.key === activeKey;

        return (
          <View key={item.key} style={styles.itemShell}>
            <GlassView
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
              glassEffectStyle={glassAvailable ? 'regular' : 'none'}
              tintColor={active ? '#dbeedc' : undefined}
              isInteractive={active}
            />
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [
                styles.item,
                active && styles.itemActive,
                pressed && styles.itemPressed,
              ]}>
              {item.icon}
              <Text style={[styles.label, active && styles.labelActive]}>
                {item.label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  itemShell: {
    flex: 1,
    minHeight: 58,
    overflow: 'hidden',
    borderRadius: 16,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.52)',
    borderRadius: 16,
  },
  itemActive: {
    backgroundColor: 'rgba(220,242,216,0.56)',
    borderColor: 'rgba(23,132,82,0.34)',
  },
  itemPressed: {
    transform: [{ scale: 0.96 }],
  },
  label: {
    color: '#7a7c76',
    fontSize: 11,
    fontWeight: '700',
  },
  labelActive: {
    color: '#006c45',
  },
});
