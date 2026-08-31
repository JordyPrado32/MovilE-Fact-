import { Pressable, Text, View } from 'react-native';

import { styles } from '../../styles/appStyles';

export function MenuItem({ active, count, disabled, expanded, hasChildren, inset, label, onPress, onToggle }: { active: boolean; count?: number; disabled?: boolean; expanded?: boolean; hasChildren?: boolean; inset?: boolean; label: string; onPress: () => void; onToggle?: () => void }) {
  return <Pressable accessibilityLabel={label} accessibilityState={{ disabled: Boolean(disabled), expanded: hasChildren ? Boolean(expanded) : undefined, selected: active }} disabled={disabled} style={[styles.menuItem, inset && styles.menuItemInset, active && styles.menuItemActive, disabled && styles.menuItemDisabled]} onPress={onPress}><Text style={[styles.menuItemText, active && styles.menuItemTextActive]} numberOfLines={1}>{label}</Text>{typeof count === 'number' ? <Text style={[styles.menuItemCount, active && styles.menuItemCountActive]}>{count}</Text> : null}{hasChildren ? <Pressable accessibilityLabel={`${expanded ? 'Contraer' : 'Expandir'} ${label}`} accessibilityRole="button" hitSlop={10} onPress={(event) => { event.stopPropagation(); onToggle?.(); }}><Text style={[styles.menuItemChevron, expanded && styles.menuItemChevronExpanded, active && styles.menuItemTextActive]}>⌄</Text></Pressable> : null}</Pressable>;
}

export function InitialsAvatar({ initials, size }: { initials: string; size: number }) {
  const colors = ['#6C63FF', '#006BB5', '#2C3E50', '#E67E22', '#27AE60', '#9B59B6', '#E74C3C', '#1ABC9C', '#34495E', '#2980B9'];
  const hash = initials.split('').reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return <View style={[styles.initialsAvatar, { backgroundColor: colors[Math.abs(hash) % colors.length], borderRadius: Math.round(size * 0.22), height: size, width: size }]}><Text style={[styles.initialsAvatarText, { fontSize: Math.max(16, Math.round(size * 0.42)) }]}>{initials}</Text></View>;
}
