import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { EFACT_THEME } from '../../styles/theme';
import { styles } from '../../styles/appStyles';

type PortalView = string;
type PortalIcon = 'home' | 'grid' | 'document' | 'profile' | 'settings' | 'bot' | 'signature';

export function PortalHeaderAvatar() {
  return <Image source={require('../../../assets/logo-numerica.png')} style={styles.portalHeaderLogo} />;
}

export function PortalBottomNav({ bottomInset, activeView, onServices, onHome, onBot, onFirma, onProfile }: {
  bottomInset: number;
  activeView: PortalView;
  onServices: () => void;
  onHome: () => void;
  onBot: () => void;
  onFirma: () => void;
  onProfile: () => void;
}) {
  return <View style={[styles.portalBottomNav, { bottom: Math.max(8, bottomInset + 4) }]}><PortalTabButton active={activeView === 'portal'} icon="grid" label="Portal" onPress={onServices} /><PortalTabButton active={activeView === 'dashboard'} icon="home" label="Inicio" onPress={onHome} /><PortalTabButton active={activeView === 'bot'} icon="bot" label="Númi" featured onPress={onBot} /><PortalTabButton active={activeView === 'firma'} icon="signature" label="Firma" onPress={onFirma} /><PortalTabButton active={activeView === 'perfil'} icon="profile" label="Perfil" onPress={onProfile} /></View>;
}

function PortalTabButton({ active, featured, icon, label, onPress }: { active: boolean; featured?: boolean; icon: PortalIcon; label: string; onPress: () => void }) {
  const iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] = icon === 'home' ? 'home-variant-outline' : icon === 'grid' ? 'view-grid-outline' : icon === 'document' ? 'file-document-outline' : icon === 'signature' ? 'draw-pen' : icon === 'profile' ? 'account-circle-outline' : icon === 'settings' ? 'cog-outline' : 'robot-outline';
  return <Pressable hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={[styles.portalTabButton, active && !featured && styles.portalTabButtonActive, featured && styles.portalTabButtonFeatured]} onPress={onPress}><View style={[styles.portalTabIcon, active && styles.portalTabIconBubble, featured && styles.portalTabIconFeatured]}><MaterialCommunityIcons name={iconName} size={featured ? 25 : 22} color={active || featured ? '#FFFFFF' : EFACT_THEME.colors.textMuted} /></View><Text style={[styles.portalTabText, active && styles.portalTabTextActive, featured && styles.portalTabTextFeatured]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>{label}</Text></Pressable>;
}

export function ModuleCard({ title, description, count, enabled, onPress }: { title: string; description: string; count?: number; enabled: boolean; onPress: () => void }) {
  return <Pressable accessibilityHint={enabled ? `Abre ${title}` : 'Esta opcion aun no esta disponible'} disabled={!enabled} style={[styles.moduleCard, !enabled && styles.moduleCardDisabled]} onPress={onPress}><View style={styles.moduleTopRow}><Text style={styles.moduleTitle}>{title}</Text>{typeof count === 'number' ? <Text style={styles.moduleCount}>{count}</Text> : null}</View><Text style={styles.moduleDescription}>{description}</Text><Text style={styles.moduleAction}>{enabled ? 'Abrir' : 'Proximamente'}</Text></Pressable>;
}

export function NavButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable style={[styles.navButton, active && styles.navButtonActive]} onPress={onPress}><Text style={[styles.navButtonText, active && styles.navButtonTextActive]}>{label}</Text></Pressable>;
}
