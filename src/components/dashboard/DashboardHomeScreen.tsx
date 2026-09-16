import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Image, Pressable, Text, useWindowDimensions, View } from 'react-native';

import type { FacturaListItem } from '../../services/facturasMobileService';
import { DashboardActivityItem, DashboardChartCard, DashboardPrimaryAction, DashboardServiceRow } from './DashboardWidgets';
import { EFACT_THEME } from '../../styles/theme';
import { styles } from '../../styles/appStyles';
import { formatDocumentDate, formatMoney, listItemKey } from '../../utils/documentFormatting';

type DashboardModule = {
  view: string;
  title: string;
  description: string;
};

export function DashboardHomeScreen({
  facturas,
  modules,
  onOpenView,
  onOpenVoice,
}: {
  facturas: FacturaListItem[];
  modules: DashboardModule[];
  onOpenView: (view: string) => void;
  onOpenVoice: () => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const latestFacturas = facturas.slice(0, 3);
  const mainModules = modules
    .filter((module) => ['mis-facturas', 'clientes', 'productos', 'emisor', 'punto-emision'].includes(module.view))
    .slice(0, 5);
  const recentFactura = facturas[0];
  const openConsultas = () => {
    Alert.alert('Consultas con Númi', '¿Cómo quieres hacer tu consulta?', [
      { text: 'Chat', onPress: () => onOpenView('bot') },
      { text: 'Comando de voz', onPress: onOpenVoice },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.dashboardHome}>
      <Pressable style={styles.dashboardNumiPanel} onPress={openConsultas}>
        <View style={styles.dashboardNumiAccentPanel} />
        <View style={styles.dashboardNumiConfettiDotLarge} />
        <View style={styles.dashboardNumiConfettiDotSmall} />
        <View style={styles.dashboardNumiConfettiRing} />
        <View style={styles.dashboardNumiHeader}>
          <View style={styles.dashboardNumiCopy}>
            <Text style={styles.dashboardNumiName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.86}>Númi</Text>
            <Text style={styles.dashboardNumiSubtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>Tu asistente inteligente</Text>
            <View style={styles.dashboardNumiBubble}>
              <Text style={styles.dashboardNumiBubbleText} numberOfLines={4} adjustsFontSizeToFit minimumFontScale={0.86}>¡Hola! Soy Númi, tu asistente. Estoy aquí para ayudarte en lo que necesites.</Text>
            </View>
          </View>
          <Image source={require('../../../assets/numi-home.png')} style={styles.dashboardNumiImage} resizeMode="contain" />
        </View>
        <View style={styles.dashboardNumiActions}>
          <View style={styles.dashboardNumiAction}>
            <MaterialCommunityIcons name="message-processing-outline" size={24} color="#49D7FF" />
            <View style={styles.dashboardNumiActionCopy}>
              <Text style={styles.dashboardNumiActionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>Consultas</Text>
              <Text style={styles.dashboardNumiActionText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>Haz tus preguntas</Text>
            </View>
          </View>
          <View style={styles.dashboardNumiAction}>
            <MaterialCommunityIcons name="lightning-bolt-outline" size={24} color="#49D7FF" />
            <View style={styles.dashboardNumiActionCopy}>
              <Text style={styles.dashboardNumiActionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>Ayuda rápida</Text>
              <Text style={styles.dashboardNumiActionText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>Guías y pasos</Text>
            </View>
          </View>
          <View style={styles.dashboardNumiAction}>
            <MaterialCommunityIcons name="headset" size={24} color="#49D7FF" />
            <View style={styles.dashboardNumiActionCopy}>
              <Text style={[styles.dashboardNumiActionTitle, styles.dashboardNumiSupportTitle]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>Soporte</Text>
              <Text style={styles.dashboardNumiActionText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>Te acompañamos</Text>
            </View>
          </View>
        </View>
      </Pressable>

      <DashboardChartCard facturas={facturas} />

      <View style={styles.dashboardSectionHeader}>
        <Text style={styles.dashboardSectionTitle}>Acciones principales</Text>
      </View>
      <View style={[styles.dashboardActionRow, compact && styles.dashboardActionRowCompact]}>
        <DashboardPrimaryAction icon="file-plus-outline" label="Nueva factura" text="Emitir comprobante" primary onPress={() => onOpenView('nueva-factura')} />
        <DashboardPrimaryAction icon="account-plus-outline" label="Nuevo cliente" text="Registrar datos" onPress={() => onOpenView('nuevo-cliente')} />
        <DashboardPrimaryAction icon="robot-outline" label="Númi" text="Asistente" onPress={() => onOpenView('bot')} />
        <DashboardPrimaryAction icon="file-document-outline" label="Mis facturas" text="Consultar emitidas" onPress={() => onOpenView('mis-facturas')} />
        <DashboardPrimaryAction icon="package-variant-closed" label="Productos" text="Catalogo" onPress={() => onOpenView('productos')} />
        <DashboardPrimaryAction icon="store-cog-outline" label="Series" text="Cajas" onPress={() => onOpenView('punto-emision')} />
      </View>

      <View style={styles.dashboardActivityPanel}>
        <View style={styles.dashboardSectionHeader}>
          <Text style={styles.dashboardSectionTitle}>Actividad reciente</Text>
          <Pressable hitSlop={8} onPress={() => onOpenView('mis-facturas')}>
            <Text style={styles.dashboardViewAll}>Ver facturas</Text>
          </Pressable>
        </View>
        {latestFacturas.length ? latestFacturas.map((factura, index) => (
          <DashboardActivityItem
            key={listItemKey('dashboard-factura', [factura.codfactura, factura.numeroCompleto, factura.numfactura], index)}
            color={EFACT_THEME.colors.secondary}
            title={factura.numeroCompleto ?? factura.numfactura ?? 'Factura emitida'}
            subtitle={`${factura.cliente ?? 'Cliente'} · ${formatDocumentDate(factura.fechaEmision)}`}
            amount={formatMoney(factura.total)}
            status={factura.autorizado || String(factura.estadoSri ?? '').toUpperCase().includes('AUTORIZ') ? 'Autorizada' : factura.estadoSri ?? 'Pendiente'}
          />
        )) : (
          <DashboardActivityItem
            color={EFACT_THEME.colors.info}
            title={recentFactura?.numeroCompleto ?? 'Sin documentos recientes'}
            subtitle="Cuando emitas comprobantes aparecerán aquí."
            status="Borrador"
          />
        )}
      </View>

      <View style={styles.dashboardSectionHeader}>
        <Text style={styles.dashboardSectionTitle}>Servicios frecuentes</Text>
        <Pressable hitSlop={8} onPress={() => onOpenView('portal')}>
          <Text style={styles.dashboardViewAll}>Ver todos</Text>
        </Pressable>
      </View>
      <View style={styles.dashboardServiceList}>
        {mainModules.map((module, index) => (
          <DashboardServiceRow key={`home-module-${module.view}`} module={module} index={index} onPress={() => onOpenView(module.view)} />
        ))}
      </View>
    </View>
  );
}
