import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { EFACT_THEME } from '../../styles/theme';
import { styles } from '../../styles/appStyles';
import type { FacturaListItem } from '../../services/facturasMobileService';
import { formatMoney } from '../../utils/documentFormatting';

type DashboardModule = { title: string; description: string };
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function DashboardMetric({ value, label }: { value: string | number; label: string }) {
  return <View style={styles.dashboardMetric}><Text style={styles.dashboardMetricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>{value}</Text><Text style={styles.dashboardMetricLabel}>{label}</Text></View>;
}

export function DashboardPrimaryAction({ icon, label, text, primary, onPress }: { icon: IconName; label: string; text: string; primary?: boolean; onPress: () => void }) {
  return <Pressable style={({ pressed }) => [styles.dashboardPrimaryAction, primary && styles.dashboardPrimaryActionMain, pressed && styles.dashboardFavoritePressed]} onPress={onPress}><View style={[styles.dashboardPrimaryActionIcon, primary && styles.dashboardPrimaryActionIconMain]}><MaterialCommunityIcons name={icon} size={22} color={primary ? '#FFFFFF' : EFACT_THEME.colors.primary} /></View><Text style={[styles.dashboardPrimaryActionLabel, primary && styles.dashboardPrimaryActionLabelMain]} numberOfLines={1}>{label}</Text><Text style={[styles.dashboardPrimaryActionText, primary && styles.dashboardPrimaryActionTextMain]} numberOfLines={2}>{text}</Text></Pressable>;
}

export function DashboardFavorite({ icon, label, color, onPress }: { icon: IconName; label: string; color: string; onPress: () => void }) {
  return <Pressable style={({ pressed }) => [styles.dashboardFavorite, pressed && styles.dashboardFavoritePressed]} onPress={onPress}><View style={[styles.dashboardFavoriteIcon, { backgroundColor: `${color}16` }]}><MaterialCommunityIcons name={icon} size={22} color={color} /></View><Text style={styles.dashboardFavoriteLabel} numberOfLines={2}>{label}</Text><Text style={[styles.dashboardFavoriteArrow, { color }]}>›</Text></Pressable>;
}

export function DashboardStatCard({ accent, compact, kind, value, label, trend }: { accent: string; compact?: boolean; kind: string; value: string | number; label: string; trend: string }) {
  return <View style={[styles.dashboardStatCard, compact && styles.dashboardStatCardCompact]}><View style={[styles.dashboardStatIcon, { backgroundColor: `${accent}18` }]}><Text style={[styles.dashboardStatIconText, { color: accent }]}>{kind === 'money' ? '$' : kind === 'people' ? '••' : kind === 'box' ? '+' : '▤'}</Text></View><Text style={styles.dashboardStatValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>{value}</Text><Text style={styles.dashboardStatLabel} numberOfLines={2}>{label}</Text><Text style={styles.dashboardStatTrend} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>↗ {trend} vs mes anterior</Text></View>;
}

export function DashboardChartCard({ facturas }: { facturas: FacturaListItem[] }) {
  const values = [500, 1200, 720, 1350, 1680, 1640, 2450].map((fallback, index) => Number(facturas[index]?.total ?? fallback));
  const max = Math.max(...values, 1);
  const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  const [selectedIndex, setSelectedIndex] = useState(values.length - 1);
  const selectedValue = values[selectedIndex] ?? 0;
  return <View style={styles.dashboardChartCard}><View style={styles.dashboardChartHeader}><Text style={styles.dashboardPanelTitle} numberOfLines={1} adjustsFontSizeToFit>Ventas de los ultimos 7 dias</Text><View style={styles.dashboardChartValuePill}><Text style={styles.dashboardChartValueDay}>{days[selectedIndex]}</Text><Text style={styles.dashboardChartValueText}>{formatMoney(selectedValue)}</Text></View></View><View style={styles.dashboardChartArea}>{values.map((value, index) => <Pressable key={`chart-${index}`} style={styles.dashboardChartColumn} onPress={() => setSelectedIndex(index)}><View style={[styles.dashboardChartBar, index === selectedIndex && styles.dashboardChartBarActive, { height: `${Math.max(12, (value / max) * 86)}%` }]} /><View style={[styles.dashboardChartPoint, index === selectedIndex && styles.dashboardChartPointActive, { bottom: `${Math.max(8, (value / max) * 78)}%` }]} /></Pressable>)}</View><View style={styles.dashboardChartLabels}>{days.map((day, index) => <Text key={day} style={[styles.dashboardChartLabel, index === selectedIndex && styles.dashboardChartLabelActive]}>{day}</Text>)}</View></View>;
}

export function DashboardQuickAction({ color, label, onPress }: { color: string; label: string; onPress: () => void }) {
  return <Pressable style={styles.dashboardQuickAction} onPress={onPress}><View style={[styles.dashboardQuickIcon, { backgroundColor: color }]}><Text style={styles.dashboardQuickIconText}>+</Text></View><Text style={styles.dashboardQuickLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>{label}</Text><Text style={styles.dashboardQuickArrow}>›</Text></Pressable>;
}

export function DashboardServiceRow({ module, index, onPress }: { module: DashboardModule; index: number; onPress: () => void }) {
  const colors = [EFACT_THEME.colors.primary, EFACT_THEME.colors.secondary, EFACT_THEME.colors.info, EFACT_THEME.colors.warning, EFACT_THEME.colors.primaryDark];
  const color = colors[index % colors.length];
  return <Pressable style={({ pressed }) => [styles.dashboardServiceRow, pressed && styles.dashboardFavoritePressed]} onPress={onPress}><View style={[styles.dashboardServiceIcon, { backgroundColor: `${color}16` }]}><MaterialCommunityIcons name="chevron-right-circle-outline" size={22} color={color} /></View><View style={styles.dashboardServiceCopy}><Text style={styles.dashboardServiceTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>{module.title}</Text><Text style={styles.dashboardServiceText} numberOfLines={2}>{module.description}</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color={EFACT_THEME.colors.textMuted} /></Pressable>;
}

export function DashboardActivityItem({ color, title, subtitle, amount, status }: { color: string; title: string; subtitle: string; amount?: string; status?: string }) {
  return <View style={styles.dashboardActivityItem}><View style={[styles.dashboardActivityIcon, { backgroundColor: `${color}28` }]}><Text style={[styles.dashboardActivityIconText, { color }]}>✓</Text></View><View style={styles.dashboardActivityCopy}><Text style={styles.dashboardActivityTitle} numberOfLines={2}>{title}</Text><Text style={styles.dashboardActivityText} numberOfLines={2}>{subtitle}</Text></View>{amount ? <Text style={styles.dashboardActivityAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{amount}</Text> : null}{status ? <Text style={styles.dashboardActivityStatus} numberOfLines={1}>{status}</Text> : null}</View>;
}
