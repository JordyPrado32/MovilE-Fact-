import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function getThinkingDetail(request: string) {
  const normalized = request.toLowerCase();
  if (normalized.includes('cliente') || normalized.includes('proveedor')) return 'Consultando tus clientes y evitando pedir datos que ya existen.';
  if (normalized.includes('producto') || normalized.includes('servicio')) return 'Consultando el catálogo y usando sus precios e IVA reales.';
  if (normalized.includes('factura') || normalized.includes('vender') || normalized.includes('venta')) return 'Consultando cliente, productos y valores de la factura.';
  if (normalized.includes('firma') || normalized.includes('rúbrica') || normalized.includes('rubrica')) return 'Revisando el proceso de firma y el siguiente paso.';
  return 'Consultando la información necesaria para responderte.';
}

export function NumiThinkingIndicator({ request }: { request: string }) {
  const detail = getThinkingDetail(request);
  const bob = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.55)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    progress.setValue(0.1);
    const progressAnimation = Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 0.82, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(progress, { toValue: 0.18, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ]));
    const bobAnimation = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -4, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const glowAnimation = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.55, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const orbitAnimation = Animated.loop(Animated.timing(orbit, { toValue: 1, duration: 3600, easing: Easing.linear, useNativeDriver: true }));
    const pulseAnimation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    progressAnimation.start();
    bobAnimation.start();
    glowAnimation.start();
    orbitAnimation.start();
    pulseAnimation.start();
    return () => {
      progressAnimation.stop();
      bobAnimation.stop();
      glowAnimation.stop();
      orbitAnimation.stop();
      pulseAnimation.stop();
    };
  }, [bob, glow, orbit, progress, pulse]);

  return (
    <View style={styles.card} accessibilityLabel="Númi está consultando la información">
      <View style={styles.robotWrap}>
        <Animated.View style={[styles.glow, { opacity: glow }]} />
        <Animated.View style={[styles.orbit, { transform: [{ rotate: orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}><View style={styles.orbitDot} /></Animated.View>
        <Animated.Image source={require('../../../assets/numi-robot.png')} style={[styles.robot, { transform: [{ translateY: bob }, { scale: pulse }] }]} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}><Text style={styles.title}>NUMI TRABAJANDO</Text><View style={styles.dots}><Text style={styles.dot}>•</Text><Text style={styles.dot}>•</Text><Text style={styles.dot}>•</Text></View></View>
        <Text style={styles.subtitle}>{detail}</Text>
        <View style={styles.progressTrack}><Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} /></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#8DDCF6', borderRadius: 20, borderWidth: 1, flexDirection: 'row', gap: 11, maxWidth: '90%', minWidth: 246, paddingHorizontal: 11, paddingVertical: 11, shadowColor: '#0878C9', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 3 },
  robotWrap: { alignItems: 'center', height: 68, justifyContent: 'center', width: 62 },
  glow: { backgroundColor: '#9DEAFF', borderRadius: 28, height: 54, position: 'absolute', width: 54 },
  orbit: { borderColor: 'rgba(8,120,201,0.32)', borderRadius: 30, borderStyle: 'dashed', borderWidth: 1, height: 61, position: 'absolute', width: 61 },
  orbitDot: { backgroundColor: '#21BF73', borderColor: '#FFFFFF', borderRadius: 5, borderWidth: 2, height: 10, position: 'absolute', right: 0, top: 7, width: 10 },
  robot: { height: 59, width: 59 },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: '#0878C9', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  dots: { flexDirection: 'row', gap: 1 },
  dot: { color: '#21BF73', fontSize: 17, fontWeight: '900', lineHeight: 12 },
  subtitle: { color: '#71869A', fontSize: 11, fontWeight: '600', marginTop: 2 },
  progressTrack: { backgroundColor: '#E6F2F8', borderRadius: 99, height: 5, marginTop: 7, overflow: 'hidden', width: '100%' },
  progressFill: { backgroundColor: '#21BF73', borderRadius: 99, height: 5 },
});
