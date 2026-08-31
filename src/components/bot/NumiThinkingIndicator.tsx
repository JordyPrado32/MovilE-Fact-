import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ThinkingStep = { label: string; detail: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

function getThinkingSteps(request: string): ThinkingStep[] {
  const normalized = request.toLowerCase();
  const namedClient = request.match(/(?:cliente|nombre)\s*[:=]?\s*([\p{L}][\p{L}\s.'-]{1,30})/iu)?.[1]?.trim();
  if (normalized.includes('cliente') || normalized.includes('proveedor')) {
    return [
      { label: 'Entendiendo tu solicitud', detail: 'Analizando nombre e identificación.', icon: 'brain' },
      { label: namedClient ? `Buscando cliente: ${namedClient}` : 'Buscando cliente', detail: 'Comparando con tus registros para evitar duplicados.', icon: 'account-search-outline' },
      { label: 'Validando identificación', detail: 'Revisando coincidencias y datos obligatorios.', icon: 'card-account-details-outline' },
      { label: 'Preguntando solo lo necesario', detail: 'Preparando los datos que todavía faltan.', icon: 'message-question-outline' },
    ];
  }
  if (normalized.includes('producto') || normalized.includes('servicio')) {
    return [
      { label: 'Entendiendo tu solicitud', detail: 'Separando nombre, código, precio e IVA.', icon: 'brain' },
      { label: 'Buscando producto', detail: 'Revisando el catálogo y posibles coincidencias.', icon: 'package-variant-closed' },
      { label: 'Validando precio e IVA', detail: 'Usando la configuración real del catálogo.', icon: 'calculator-variant-outline' },
      { label: 'Preparando los datos faltantes', detail: 'Te pediré únicamente lo que no encuentre.', icon: 'message-question-outline' },
    ];
  }
  if (normalized.includes('factura') || normalized.includes('vender') || normalized.includes('venta')) {
    return [
      { label: 'Entendiendo tu solicitud', detail: 'Identificando cliente, productos y acción.', icon: 'brain' },
      { label: 'Buscando cliente y productos', detail: 'Consultando tus datos reales.', icon: 'file-search-outline' },
      { label: 'Calculando subtotal, IVA y total', detail: 'Aplicando cantidades, precios y descuentos.', icon: 'calculator-variant-outline' },
      { label: 'Revisando qué falta', detail: 'No emitiré nada sin tu confirmación.', icon: 'file-document-edit-outline' },
    ];
  }
  if (normalized.includes('firma') || normalized.includes('rúbrica') || normalized.includes('rubrica')) {
    return [
      { label: 'Entendiendo tu solicitud', detail: 'Identificando documento y operación de firma.', icon: 'brain' },
      { label: 'Revisando el proceso de firma', detail: 'Consultando las opciones disponibles.', icon: 'file-document-check-outline' },
      { label: 'Validando requisitos', detail: 'Revisando certificado, archivo y firmantes.', icon: 'shield-check-outline' },
      { label: 'Preparando el siguiente paso', detail: 'Te indicaré solo lo que falte completar.', icon: 'message-question-outline' },
    ];
  }
  return [
    { label: 'Entendiendo tu solicitud', detail: 'Detectando la operación que necesitas.', icon: 'brain' },
    { label: 'Consultando la información', detail: 'Revisando el contexto de tu conversación.', icon: 'database-search-outline' },
    { label: 'Validando datos disponibles', detail: 'Comprobando qué está completo y qué falta.', icon: 'clipboard-check-outline' },
    { label: 'Preparando la respuesta', detail: 'Organizando el siguiente paso para ti.', icon: 'lightbulb-on-outline' },
  ];
}

export function NumiThinkingIndicator({ request }: { request: string }) {
  const steps = getThinkingSteps(request);
  const [activeStep, setActiveStep] = useState(0);
  const bob = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.55)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0.12)).current;

  useEffect(() => {
    setActiveStep(0);
    progress.setValue(0.12);
    const stepTimer = setInterval(() => setActiveStep((current) => {
      const next = Math.min(current + 1, steps.length - 1);
      Animated.timing(progress, { toValue: 0.12 + ((next + 1) / steps.length) * 0.78, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
      return next;
    }), 1050);
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
    bobAnimation.start();
    glowAnimation.start();
    orbitAnimation.start();
    pulseAnimation.start();
    return () => {
      clearInterval(stepTimer);
      bobAnimation.stop();
      glowAnimation.stop();
      orbitAnimation.stop();
      pulseAnimation.stop();
    };
  }, [bob, glow, orbit, progress, pulse, request, steps.length]);

  return (
    <View style={styles.card} accessibilityLabel={`Númi está trabajando: ${steps[activeStep].label}`}>
      <View style={styles.robotWrap}>
        <Animated.View style={[styles.glow, { opacity: glow }]} />
        <Animated.View style={[styles.orbit, { transform: [{ rotate: orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}><View style={styles.orbitDot} /></Animated.View>
        <Animated.Image source={require('../../../assets/numi-robot.png')} style={[styles.robot, { transform: [{ translateY: bob }, { scale: pulse }] }]} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}><Text style={styles.title}>NUMI TRABAJANDO</Text><View style={styles.dots}><Text style={styles.dot}>•</Text><Text style={styles.dot}>•</Text><Text style={styles.dot}>•</Text></View></View>
        <Text style={styles.subtitle}>{steps[activeStep].detail}</Text>
        <View style={styles.progressTrack}><Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} /></View>
        <View style={styles.steps}>{steps.map((step, index) => <View key={step.label} style={[styles.step, index === activeStep && styles.stepActive]}><MaterialCommunityIcons name={index < activeStep ? 'check-circle' : step.icon} size={15} color={index <= activeStep ? '#0878C9' : '#9AB0C1'} /><Text style={[styles.stepText, index === activeStep && styles.stepTextActive]}>{step.label}</Text></View>)}</View>
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
  steps: { gap: 3, marginTop: 6 },
  step: { alignItems: 'center', flexDirection: 'row', gap: 5, opacity: 0.72 },
  stepActive: { opacity: 1 },
  stepText: { color: '#8CA0B0', flexShrink: 1, fontSize: 10, fontWeight: '700' },
  stepTextActive: { color: '#263A4F', fontWeight: '900' },
});
