import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function InitialSequenceModal({
  visible,
  documentLabel,
  serie,
  saving,
  message,
  onClose,
  onSave,
}: {
  visible: boolean;
  documentLabel: string;
  serie: string;
  saving?: boolean;
  message?: string | null;
  onClose: () => void;
  onSave: (input: { habiaGenerado: boolean; secuenciaAnterior: string }) => void;
}) {
  const [habiaGenerado, setHabiaGenerado] = useState<boolean | null>(null);
  const [secuenciaAnterior, setSecuenciaAnterior] = useState('');
  const cleanedSequence = secuenciaAnterior.replace(/\D/g, '').slice(0, 9);
  const nextHint = useMemo(() => {
    const current = Number(cleanedSequence);
    if (!current) return '';
    return String(current + 1).padStart(9, '0');
  }, [cleanedSequence]);
  const canSave = habiaGenerado !== null && (!habiaGenerado || cleanedSequence.length > 0);

  const handleSave = () => {
    if (!canSave || saving) return;
    onSave({ habiaGenerado: Boolean(habiaGenerado), secuenciaAnterior: cleanedSequence });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>CONFIGURACION DEL DOCUMENTO</Text>
              <Text style={styles.title}>Configuración inicial de secuencia</Text>
              <Text style={styles.help}>Antes de emitir tu primera {documentLabel} en este sistema, indícanos si ya habías generado documentos anteriormente.</Text>
            </View>
            <View style={styles.serieBox}>
              <Text style={styles.serieValue}>{serie || '---'}</Text>
              <Text style={styles.serieLabel}>SERIE</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#31516E" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.step}>PASO 1</Text>
                <Text style={styles.badge}>{habiaGenerado ? 'Continuar secuencia' : habiaGenerado === false ? 'Empezar desde cero' : 'Selecciona'}</Text>
              </View>
              <Text style={styles.question}>¿YA HABÍAS GENERADO {documentLabel.toUpperCase()} ANTES?</Text>
              <View style={styles.choiceRow}>
                <Pressable style={[styles.choice, habiaGenerado === true && styles.choiceActive]} onPress={() => setHabiaGenerado(true)}>
                  <Text style={[styles.choiceText, habiaGenerado === true && styles.choiceTextActive]}>Si</Text>
                </Pressable>
                <Pressable style={[styles.choice, habiaGenerado === false && styles.choiceActive]} onPress={() => setHabiaGenerado(false)}>
                  <Text style={[styles.choiceText, habiaGenerado === false && styles.choiceTextActive]}>No</Text>
                </Pressable>
              </View>
              <Text style={styles.note}>Si ya emitías este documento antes, puedes continuar la numeración desde la secuencia donde te quedaste.</Text>
            </View>

            {habiaGenerado ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.step}>SECUENCIA ANTERIOR</Text>
                  <Text style={styles.badge}>9 dígitos</Text>
                </View>
                <Text style={styles.question}>INGRESA LA SECUENCIA DONDE TE QUEDASTE</Text>
                <TextInput
                  value={cleanedSequence}
                  onChangeText={(value) => setSecuenciaAnterior(value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="Ej: 000000125"
                  keyboardType="number-pad"
                  maxLength={9}
                  style={styles.input}
                />
                {nextHint ? <Text style={styles.nextHint}>Si te quedaste en la {Number(cleanedSequence)}, la siguiente será la {Number(nextHint)}.</Text> : null}
              </View>
            ) : null}

            {habiaGenerado === false ? (
              <View style={styles.section}>
                <Text style={styles.question}>Se iniciará la numeración normal.</Text>
                <Text style={styles.note}>La siguiente emisión comenzará desde la secuencia inicial configurada para este documento.</Text>
              </View>
            ) : null}

            {message ? <Text style={styles.error}>{message}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerCopy}>
              <Text style={styles.footerTitle}>Configuracion unica</Text>
              <Text style={styles.note}>Este ajuste solo se solicita la primera vez para cada tipo de documento.</Text>
            </View>
            <Pressable style={[styles.saveButton, (!canSave || saving) && styles.saveButtonDisabled]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar y continuar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 25, 42, 0.55)',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    maxHeight: '88%',
    borderRadius: 24,
    backgroundColor: '#F8FCFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBE1F3',
  },
  header: {
    padding: 22,
    backgroundColor: '#EEF8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#D5E6F4',
    flexDirection: 'row',
    gap: 12,
  },
  headerCopy: { flex: 1, gap: 8 },
  eyebrow: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#D6ECFA',
    color: '#006AAE',
    fontWeight: '900',
    letterSpacing: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    fontSize: 12,
  },
  title: { color: '#132D45', fontSize: 23, fontWeight: '900' },
  help: { color: '#5C7186', fontSize: 16, lineHeight: 24 },
  serieBox: {
    minWidth: 96,
    height: 96,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#B8D8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5FE',
  },
  serieValue: { color: '#006AAE', fontSize: 18, fontWeight: '900' },
  serieLabel: { color: '#4C6D8B', fontSize: 12, fontWeight: '900', marginTop: 6 },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBE1F3',
  },
  body: { maxHeight: 430 },
  bodyContent: { padding: 20, gap: 16 },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBE1F3',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  step: {
    borderRadius: 999,
    backgroundColor: '#E6F4FD',
    color: '#006AAE',
    fontWeight: '900',
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: '#E6F4FD',
    color: '#006AAE',
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
  },
  question: { color: '#17324D', fontSize: 15, fontWeight: '900' },
  choiceRow: { flexDirection: 'row', gap: 10 },
  choice: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBE1F3',
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#F5FAFE',
  },
  choiceActive: { borderColor: '#0781C8', backgroundColor: '#E8F6FF' },
  choiceText: { color: '#52687D', fontWeight: '900', fontSize: 16 },
  choiceTextActive: { color: '#006AAE' },
  note: { color: '#5C7186', fontSize: 14, lineHeight: 21 },
  input: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8BC7F0',
    backgroundColor: '#FFFFFF',
    color: '#132D45',
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '800',
  },
  nextHint: {
    borderRadius: 16,
    backgroundColor: '#DDF0FC',
    color: '#006AAE',
    fontWeight: '800',
    padding: 12,
  },
  error: { color: '#9D1C1C', fontWeight: '800' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#D5E6F4',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerCopy: { flex: 1, gap: 5 },
  footerTitle: { color: '#132D45', fontWeight: '900', fontSize: 16 },
  saveButton: {
    minWidth: 190,
    borderRadius: 16,
    backgroundColor: '#168AD0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.55 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
});
