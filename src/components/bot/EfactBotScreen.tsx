import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import type * as SpeechRecognition from 'expo-speech-recognition';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiError } from '../../services/apiClient';
import { resetBotSession, sendBotMessage } from '../../services/botService';
import type { BotFacturaDraft, BotSelectionOption } from '../../services/botService';
import type { BotFeedbackState, BotMessage } from '../../types/bot';
import { NumiThinkingIndicator } from './NumiThinkingIndicator';
import { styles } from '../../styles/appStyles';

type SpeechRecognitionBindings = typeof SpeechRecognition;
type VoiceOverlayState = 'listening' | 'review' | 'processing' | 'response';

let speechRecognitionBindings: SpeechRecognitionBindings | null = null;
try {
  speechRecognitionBindings = require('expo-speech-recognition') as SpeechRecognitionBindings;
} catch {
  // Expo Go no incluye este módulo nativo; el development build sí lo carga.
}

const ExpoSpeechRecognitionModule = speechRecognitionBindings?.ExpoSpeechRecognitionModule ?? null;
const useSpeechRecognitionEvent: SpeechRecognitionBindings['useSpeechRecognitionEvent'] = speechRecognitionBindings?.useSpeechRecognitionEvent ?? (() => undefined);
const voiceRecognitionAvailable = ExpoSpeechRecognitionModule !== null;
export const botVoiceRecognitionAvailable = voiceRecognitionAvailable;
const speechContext = [
  'Númi', 'e-fact', 'factura', 'RUC', 'cédula', 'cliente', 'producto', 'IVA', 'subtotal', 'impuesto',
  'retención', 'guía de remisión', 'emitir', 'anular', 'cancelar', 'confirmar', 'contado', 'crédito',
];

export type BotVoiceControls = {
  available: boolean;
  start: () => Promise<void>;
  startHandsFree: () => void;
  stop: () => void;
};

export function EfactBotScreen({
  userName,
  userId,
  onNavigate,
  voiceControlsRef,
  voiceOnly = false,
  messages,
  setMessages,
  draft,
  setDraft,
  feedbackByMessage,
  setFeedbackByMessage,
}: {
  userName: string;
  userId: number;
  onNavigate?: (route: string) => void;
  voiceControlsRef?: MutableRefObject<BotVoiceControls | null>;
  voiceOnly?: boolean;
  messages: BotMessage[];
  setMessages: Dispatch<SetStateAction<BotMessage[]>>;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  feedbackByMessage: BotFeedbackState;
  setFeedbackByMessage: Dispatch<SetStateAction<BotFeedbackState>>;
}) {
  const [sending, setSending] = useState(false);
  const [thinkingRequest, setThinkingRequest] = useState('');
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [invoiceDraft, setInvoiceDraft] = useState<BotFacturaDraft | null>(null);
  const [missingData, setMissingData] = useState<string[]>([]);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [invoiceState, setInvoiceState] = useState('');
  const [selectionOptions, setSelectionOptions] = useState<BotSelectionOption[]>([]);
  const [pendingOperation, setPendingOperation] = useState<{ tipo?: string; resumen?: string; expiraEn?: string | null } | null>(null);
  const [voiceOverlayState, setVoiceOverlayState] = useState<VoiceOverlayState | null>(null);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [handsFreeEnabled, setHandsFreeEnabled] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);
  const [chatTop, setChatTop] = useState<number | null>(null);
  const voiceHolding = useRef(false);
  const voiceShouldSubmit = useRef(false);
  const voiceRecognitionStarted = useRef(false);
  const voiceTranscriptRef = useRef('');
  const handsFreeEnabledRef = useRef(false);
  const handsFreeAwaitingConfirmationRef = useRef(false);
  const handsFreeResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceNavigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesScrollRef = useRef<ScrollView>(null);
  const botContainerRef = useRef<View>(null);
  const voiceInputRef = useRef<TextInput>(null);
  const windowHeight = useWindowDimensions().height;
  const windowHeightRef = useRef(windowHeight);

  const clearVoiceTimers = () => {
    if (voiceNavigationTimerRef.current) clearTimeout(voiceNavigationTimerRef.current);
    voiceNavigationTimerRef.current = null;
    if (handsFreeResumeTimerRef.current) clearTimeout(handsFreeResumeTimerRef.current);
    handsFreeResumeTimerRef.current = null;
  };

  const startNewConversation = async () => {
    Speech.stop();
    clearVoiceTimers();
    voiceHolding.current = false;
    voiceShouldSubmit.current = false;
    handsFreeEnabledRef.current = false;
    handsFreeAwaitingConfirmationRef.current = false;
    setHandsFreeEnabled(false);
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.stop();
    await resetBotSession(userId);
    setMessages([]);
    setDraft('');
    setFeedbackByMessage({});
    setError('');
    setVoiceTranscript('');
    setInvoiceDraft(null);
    setMissingData([]);
    setRequiresConfirmation(false);
    setInvoiceState('');
    setSelectionOptions([]);
    setPendingOperation(null);
    setVoiceOverlayState(null);
    setVoiceResponse('');
  };

  useEffect(() => {
    windowHeightRef.current = windowHeight;
  }, [windowHeight]);

  useEffect(() => () => {
    clearVoiceTimers();
    Speech.stop();
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.stop();
  }, []);

  const measureChatTop = () => {
    requestAnimationFrame(() => {
      const container = botContainerRef.current;
      if (!container || typeof container.measureInWindow !== 'function') return;
      container.measureInWindow((_x: number, y: number) => {
        if (Number.isFinite(y)) setChatTop(y);
      });
    });
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardVisible(true);
      const nextKeyboardTop = event.endCoordinates?.screenY ?? windowHeightRef.current - (event.endCoordinates?.height ?? 0);
      setKeyboardTop(nextKeyboardTop);
      measureChatTop();
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardTop(null);
      measureChatTop();
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollMessagesToEnd = (animated = true) => {
    requestAnimationFrame(() => messagesScrollRef.current?.scrollToEnd({ animated }));
  };

  useEffect(() => {
    scrollMessagesToEnd(false);
  }, [messages.length, sending]);

  useSpeechRecognitionEvent('start', () => {
    voiceRecognitionStarted.current = true;
    setListening(true);
    setVoiceOverlayState('listening');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript?.trim() ?? '';
    if (!transcript) return;
    voiceTranscriptRef.current = transcript;
    setVoiceTranscript(transcript);
  });

  useSpeechRecognitionEvent('error', (event) => {
    voiceRecognitionStarted.current = false;
    setListening(false);
    setVoiceOverlayState(null);
    if (event.error !== 'aborted' && event.error !== 'no-speech') {
      handsFreeEnabledRef.current = false;
      setHandsFreeEnabled(false);
    }
    if (event.error === 'no-speech' && handsFreeEnabledRef.current) {
      setVoiceOverlayState(handsFreeAwaitingConfirmationRef.current ? 'response' : 'listening');
      if (!handsFreeAwaitingConfirmationRef.current) scheduleHandsFreeResume(700);
    }
    if (event.error !== 'aborted' && event.error !== 'no-speech') {
      setError(event.message || 'No se pudo reconocer la voz. Intenta nuevamente.');
    }
  });

  useSpeechRecognitionEvent('end', () => {
    voiceRecognitionStarted.current = false;
    setListening(false);
    const shouldProcessTranscript = voiceShouldSubmit.current || voiceHolding.current;
    voiceHolding.current = false;
    if (!shouldProcessTranscript) {
      setVoiceOverlayState(null);
      return;
    }
    voiceShouldSubmit.current = false;
    const transcript = voiceTranscriptRef.current.trim();
    if (transcript) {
      if (handsFreeEnabledRef.current) {
        if (handsFreeAwaitingConfirmationRef.current) {
          if (isExplicitConfirmation(transcript)) {
            setVoiceOverlayState('processing');
            void send(pendingOperation ? 'confirmar' : 'emitir', 'voz');
          } else if (isExplicitCancellation(transcript)) {
            setVoiceOverlayState('processing');
            void send('cancelar', 'voz');
          } else {
            setVoiceResponse('Para ejecutar esta operación di “confirmado” o pulsa el botón Confirmar.');
            setVoiceOverlayState('response');
          }
        } else {
          setVoiceOverlayState('processing');
          handsFreeResumeTimerRef.current = setTimeout(() => void send(transcript, 'voz'), 900);
        }
      } else {
        setDraft(transcript);
        setVoiceOverlayState('review');
      }
    } else {
      setVoiceOverlayState(null);
    }
  });

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', text: `Hola ${userName || ''}. Soy Númi, tu asistente de E-FACT. ¿En qué te ayudo hoy?` }]);
    }
  }, [messages.length, setMessages, userName]);

  const send = async (preset?: string, modo: 'texto' | 'voz' = 'texto') => {
    const text = (preset ?? draft).trim();
    if (!text || sending) return;
    const voiceRequest = modo === 'voz';
    if (voiceRequest) {
      clearVoiceTimers();
      setVoiceOverlayState('processing');
      setVoiceResponse('');
    }
    setDraft('');
    setError('');
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text }]);
    setThinkingRequest(text);
    setSending(true);
    try {
      const botResult = await sendBotMessage({
        message: text,
        userId,
        requestId: `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        modo,
        contexto: 'asistente de facturación: ayuda a crear facturas, buscar clientes y productos, completar datos faltantes, revisar subtotal, IVA y total, confirmar o cancelar la emisión. Usa datos reales del usuario y no inventes información.',
      });
      const presentationAnswer = botResult.draft?.cliente || botResult.draft?.items?.length
        ? buildVoiceResponse(botResult.answer, botResult.draft ?? null, botResult.missing)
        : botResult.answer;
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: presentationAnswer }]);
      setInvoiceDraft(botResult.draft ?? null);
      setMissingData(botResult.missing);
      setRequiresConfirmation(botResult.requiresConfirmation);
      setInvoiceState(botResult.estado ?? '');
      setSelectionOptions(botResult.selectionOptions);
      setPendingOperation(botResult.pendingOperation);
       handsFreeAwaitingConfirmationRef.current = Boolean(botResult.pendingOperation || botResult.requiresConfirmation);
       if (voiceRequest) {
         const voiceAnswer = presentationAnswer;
         setVoiceResponse(voiceAnswer);
         setVoiceOverlayState('response');
         void speakBotText(voiceAnswer).then(() => {
           if (handsFreeEnabledRef.current) scheduleHandsFreeResume(2000);
         });
       }
       if (botResult.suggestedRoute && !voiceOnly) {
        if (voiceRequest) {
          voiceNavigationTimerRef.current = setTimeout(() => onNavigate?.(botResult.suggestedRoute as string), 2200);
        } else {
          onNavigate?.(botResult.suggestedRoute);
        }
      }
    } catch (err) {
      if (voiceRequest) {
        clearVoiceTimers();
        setVoiceOverlayState(null);
        setVoiceResponse('');
      }
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'No se pudo contactar al bot.');
    } finally {
      setSending(false);
      setThinkingRequest('');
    }
  };

  const startVoiceInput = async () => {
    if (sending) return;
    if (!ExpoSpeechRecognitionModule) {
      setError('El reconocimiento de voz requiere abrir la app en un development build, no en Expo Go.');
      return;
    }
    setError('');
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';
    voiceHolding.current = true;
    voiceShouldSubmit.current = false;
    try {
      await Speech.stop();
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        voiceHolding.current = false;
        setError('Necesito permiso para usar el micrófono y reconocer tu voz.');
        return;
      }
      if (!voiceHolding.current || !ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        voiceHolding.current = false;
        setError('El reconocimiento de voz no está disponible en este dispositivo.');
        return;
      }
      let language = 'es-EC';
      try {
        const supported = await ExpoSpeechRecognitionModule.getSupportedLocales({});
        const locales = supported.locales ?? [];
        language = locales.find((locale) => locale.toLowerCase() === 'es-ec')
          ?? locales.find((locale) => locale.toLowerCase().startsWith('es-'))
          ?? language;
      } catch {
        // El motor puede no exponer sus locales; es-EC sigue siendo válido para el reconocimiento en línea.
      }
      if (!voiceHolding.current) {
        voiceShouldSubmit.current = false;
        setVoiceOverlayState(null);
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        addsPunctuation: false,
        contextualStrings: speechContext,
        iosTaskHint: 'dictation',
      });
    } catch (err) {
      voiceHolding.current = false;
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el micrófono.');
    }
  };

  const resumeHandsFreeListening = async () => {
    if (!handsFreeEnabledRef.current || sending) return;
    try {
      if (await Speech.isSpeakingAsync()) {
        scheduleHandsFreeResume(1200);
        return;
      }
    } catch {
      // Si el motor de audio no informa su estado, se respeta igualmente la espera prudente.
    }
    if (handsFreeEnabledRef.current) void startVoiceInput();
  };

  const scheduleHandsFreeResume = (delay = 2200) => {
    if (handsFreeResumeTimerRef.current) clearTimeout(handsFreeResumeTimerRef.current);
    handsFreeResumeTimerRef.current = setTimeout(() => {
      handsFreeResumeTimerRef.current = null;
      void resumeHandsFreeListening();
    }, delay);
  };

  const stopVoiceInput = () => {
    voiceHolding.current = false;
    voiceShouldSubmit.current = true;
    if (voiceRecognitionStarted.current) {
      ExpoSpeechRecognitionModule?.stop();
    } else {
      voiceShouldSubmit.current = false;
      setVoiceOverlayState(null);
    }
  };

  const stopHandsFreeMode = () => {
    clearVoiceTimers();
    handsFreeEnabledRef.current = false;
    handsFreeAwaitingConfirmationRef.current = false;
    setHandsFreeEnabled(false);
    voiceHolding.current = false;
    voiceShouldSubmit.current = false;
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.abort();
    voiceRecognitionStarted.current = false;
    setListening(false);
    setVoiceOverlayState(null);
  };

  const toggleHandsFreeMode = () => {
    if (!voiceRecognitionAvailable) {
      setError('El modo manos libres requiere abrir la app en un development build, no en Expo Go.');
      return;
    }
    if (handsFreeEnabledRef.current) {
      stopHandsFreeMode();
      return;
    }
    setError('');
    handsFreeEnabledRef.current = true;
    handsFreeAwaitingConfirmationRef.current = false;
    setHandsFreeEnabled(true);
    void startVoiceInput();
  };

  const startHandsFree = () => {
    if (handsFreeEnabledRef.current) {
      void startVoiceInput();
      return;
    }
    toggleHandsFreeMode();
  };

  const startHandsFreeConfirmation = () => {
    clearVoiceTimers();
    handsFreeEnabledRef.current = true;
    handsFreeAwaitingConfirmationRef.current = true;
    setHandsFreeEnabled(true);
    setVoiceResponse('');
    setVoiceOverlayState(null);
    void startVoiceInput();
  };

  const cancelVoiceInput = () => {
    clearVoiceTimers();
    Speech.stop();
    if (voiceOverlayState === 'review') setDraft('');
    handsFreeEnabledRef.current = false;
    handsFreeAwaitingConfirmationRef.current = false;
    setHandsFreeEnabled(false);
    voiceHolding.current = false;
    voiceShouldSubmit.current = false;
    if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.stop();
    voiceRecognitionStarted.current = false;
    setListening(false);
    setVoiceOverlayState(null);
    setVoiceResponse('');
    setVoiceTranscript('');
  };

  useEffect(() => {
    if (!voiceControlsRef) return undefined;
    voiceControlsRef.current = {
      available: voiceRecognitionAvailable,
      start: startVoiceInput,
      startHandsFree,
      stop: stopVoiceInput,
    };
    return () => {
      if (voiceControlsRef.current?.start === startVoiceInput) voiceControlsRef.current = null;
    };
  }, [voiceControlsRef, startHandsFree, startVoiceInput, stopVoiceInput]);

  const renderVoiceOverlay = () => voiceOverlayState ? (
    <VoiceInteractionOverlay
      state={voiceOverlayState}
      transcript={voiceTranscript}
      response={voiceResponse}
      draft={invoiceDraft}
      missing={missingData}
      pendingOperation={pendingOperation}
      requiresConfirmation={requiresConfirmation}
      invoiceState={invoiceState}
      selectionOptions={selectionOptions}
      showWorkflow={voiceOnly}
      handsFreeEnabled={handsFreeEnabled}
      onChangeTranscript={(value) => {
        voiceTranscriptRef.current = value;
        setVoiceTranscript(value);
        setDraft(value);
      }}
      onCancel={cancelVoiceInput}
      onReviewEdit={() => {
        setVoiceOverlayState(null);
        requestAnimationFrame(() => voiceInputRef.current?.focus());
      }}
      onReviewSend={() => void send(voiceTranscriptRef.current, 'voz')}
      onStartConfirmationVoice={startHandsFreeConfirmation}
      onCommand={(command) => {
        clearVoiceTimers();
        voiceHolding.current = false;
        voiceShouldSubmit.current = false;
        if (voiceRecognitionStarted.current) ExpoSpeechRecognitionModule?.stop();
        voiceRecognitionStarted.current = false;
        setListening(false);
        void send(command, 'voz');
      }}
    />
  ) : null;

  if (voiceOnly) {
    return voiceOverlayState ? <View style={styles.botVoiceOnlyRoot} pointerEvents="box-none">{renderVoiceOverlay()}</View> : null;
  }

  return (
    <View ref={botContainerRef} onLayout={measureChatTop} style={[styles.botScreen, keyboardVisible && styles.botScreenKeyboard, keyboardVisible && keyboardTop !== null && chatTop !== null ? { height: Math.max(1, keyboardTop - chatTop - 36) } : null]}>
      <KeyboardAvoidingView style={styles.botScreenInner} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <View style={styles.botWidgetHeader}>
        <Image source={require('../../../assets/numi-chat-avatar.jpg')} style={styles.botWidgetAvatar} />
        <View style={styles.botWidgetCopy}>
          <Text style={styles.botWidgetKicker}>Chat con</Text>
          <Text style={styles.botWidgetTitle}>Númi</Text>
          <Text style={styles.botWidgetStatus}>Estamos en línea</Text>
        </View>
        <View style={styles.botWidgetHeaderActions}>
          <Pressable accessibilityLabel="Iniciar nueva conversación" onPress={() => void startNewConversation()} hitSlop={8}>
            <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
          </Pressable>
          <MaterialCommunityIcons name="chevron-down" size={19} color="#FFFFFF" />
        </View>
      </View>
      <ScrollView
        ref={messagesScrollRef}
        style={styles.botMessages}
        contentContainerStyle={styles.botMessagesContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        nestedScrollEnabled
        showsVerticalScrollIndicator
        onContentSizeChange={() => scrollMessagesToEnd()}
      >
        {messages.map((message) => (
          <View key={message.id} style={message.role === 'user' ? styles.botUserRow : styles.botAssistantRow}>
            {message.role === 'assistant' ? <Image source={require('../../../assets/numi-chat-avatar.jpg')} style={styles.botMessageAvatar} /> : null}
            <View style={[styles.botBubble, message.role === 'user' ? styles.botUserBubble : styles.botAssistantBubble]}>
              <View style={styles.botMessageRow}>
                <Text style={[styles.botBubbleText, message.role === 'user' && styles.botUserBubbleText]}>{message.text}</Text>
                {message.role === 'assistant' ? <Pressable style={styles.botAudioButton} onPress={() => void speakBotText(message.text)} hitSlop={8}><MaterialCommunityIcons name="volume-high" size={16} color="#0878C9" /></Pressable> : null}
              </View>
              {message.role === 'assistant' ? (
                <View style={styles.botBubbleFeedback}>
                  <Pressable accessibilityLabel="Respuesta util" hitSlop={6} style={[styles.botFeedbackButton, feedbackByMessage[message.id] === 'like' && styles.botFeedbackButtonActive]} onPress={() => setFeedbackByMessage((current) => {
                    const next = { ...current };
                    if (next[message.id] === 'like') delete next[message.id];
                    else next[message.id] = 'like';
                    return next;
                  })}>
                    <MaterialCommunityIcons name={feedbackByMessage[message.id] === 'like' ? 'thumb-up' : 'thumb-up-outline'} size={15} color={feedbackByMessage[message.id] === 'like' ? '#FFFFFF' : '#6E94B4'} />
                  </Pressable>
                  <Pressable accessibilityLabel="Respuesta no util" hitSlop={6} style={[styles.botFeedbackButton, feedbackByMessage[message.id] === 'dislike' && styles.botFeedbackButtonActive]} onPress={() => setFeedbackByMessage((current) => {
                    const next = { ...current };
                    if (next[message.id] === 'dislike') delete next[message.id];
                    else next[message.id] = 'dislike';
                    return next;
                  })}>
                    <MaterialCommunityIcons name={feedbackByMessage[message.id] === 'dislike' ? 'thumb-down' : 'thumb-down-outline'} size={15} color={feedbackByMessage[message.id] === 'dislike' ? '#FFFFFF' : '#6E94B4'} />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ))}
        {sending ? (
          <View style={styles.botAssistantRow}>
            <Image source={require('../../../assets/numi-chat-avatar.jpg')} style={styles.botMessageAvatar} />
            <NumiThinkingIndicator request={thinkingRequest} />
          </View>
        ) : null}
      </ScrollView>
      {voiceTranscript && !voiceOverlayState ? <View style={styles.botVoiceTranscript}><MaterialCommunityIcons name="waveform" size={16} color="#0878C9" /><Text style={styles.botVoiceTranscriptText}>{voiceTranscript}</Text></View> : null}
      <BotInvoiceWorkflowCard
        draft={invoiceDraft}
        missing={missingData}
        requiresConfirmation={requiresConfirmation}
        state={invoiceState}
        selectionOptions={selectionOptions}
        pendingOperation={pendingOperation}
        onCommand={(command) => void send(command)}
      />
      {error ? <Text style={styles.botError}>{error}</Text> : null}
      {handsFreeEnabled ? (
        <View style={styles.botHandsFreeBanner}>
          <MaterialCommunityIcons name="headset" size={16} color="#0878C9" />
          <Text style={styles.botHandsFreeBannerText}>Manos libres activo · Númi esperará antes de volver a escuchar</Text>
          <Pressable accessibilityLabel="Desactivar modo manos libres" onPress={stopHandsFreeMode} hitSlop={8}><Text style={styles.botHandsFreeBannerAction}>Detener</Text></Pressable>
        </View>
      ) : null}
      {emojiOpen ? (
        <View style={styles.botEmojiTray}>
          {['👍', 'Gracias', 'Factura', 'Firma', 'Ayuda'].map((emoji) => (
            <Pressable key={emoji} style={styles.botEmojiChip} onPress={() => setDraft((current) => `${current}${current ? ' ' : ''}${emoji}`)}>
              <Text style={styles.botEmojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.botComposer}>
        <Pressable accessibilityLabel={handsFreeEnabled ? 'Desactivar modo manos libres' : 'Activar modo manos libres'} style={[styles.botToolButton, handsFreeEnabled && styles.botToolButtonActive]} disabled={sending || !voiceRecognitionAvailable} onPress={toggleHandsFreeMode}>
          <MaterialCommunityIcons name="headset" size={19} color={handsFreeEnabled ? '#FFFFFF' : '#6E94B4'} />
        </Pressable>
        <Pressable style={[styles.botToolButton, emojiOpen && styles.botToolButtonActive]} disabled={sending || listening} onPress={() => setEmojiOpen((value) => !value)}>
          <MaterialCommunityIcons name="emoticon-outline" size={19} color={emojiOpen ? '#FFFFFF' : '#6E94B4'} />
        </Pressable>
        <TextInput ref={voiceInputRef} value={draft} onChangeText={setDraft} placeholder={listening ? 'Escuchando... toca para detener' : voiceRecognitionAvailable ? 'Escribe o toca el micrófono para hablar...' : 'Escribe tu orden...'} placeholderTextColor="#8DA1B4" style={styles.botInput} editable={!sending && !listening} multiline maxLength={800} onFocus={() => scrollMessagesToEnd()} onSubmitEditing={() => send()} />
        <Pressable
          accessibilityLabel={listening ? 'Detener reconocimiento de voz' : 'Hablar con Númi'}
          style={[styles.botVoiceButton, listening && styles.botVoiceButtonActive]}
          disabled={sending || !voiceRecognitionAvailable}
          onPress={() => {
            if (listening || voiceRecognitionStarted.current) stopVoiceInput();
            else void startVoiceInput();
          }}
        >
          <MaterialCommunityIcons name={listening ? 'stop' : 'microphone-outline'} size={20} color={listening ? '#FFFFFF' : '#0878C9'} />
        </Pressable>
        <Pressable style={[styles.botSendButton, (!draft.trim() || sending) && styles.botSendButtonDisabled]} onPress={() => send()} disabled={!draft.trim() || sending}>
          <Text style={styles.botSendText}>➤</Text>
        </Pressable>
      </View>
      </KeyboardAvoidingView>
      {renderVoiceOverlay()}
    </View>
  );
}

function VoiceInteractionOverlay({ state, transcript, response, draft, missing, pendingOperation, requiresConfirmation, invoiceState, selectionOptions, showWorkflow, handsFreeEnabled, onChangeTranscript, onCancel, onReviewEdit, onReviewSend, onStartConfirmationVoice, onCommand }: {
  state: VoiceOverlayState;
  transcript: string;
  response: string;
  draft: BotFacturaDraft | null;
  missing: string[];
  pendingOperation: { tipo?: string; resumen?: string; expiraEn?: string | null } | null;
  requiresConfirmation: boolean;
  invoiceState: string;
  selectionOptions: BotSelectionOption[];
  showWorkflow: boolean;
  handsFreeEnabled: boolean;
  onChangeTranscript: (value: string) => void;
  onCancel: () => void;
  onReviewEdit: () => void;
  onReviewSend: () => void;
  onStartConfirmationVoice: () => void;
  onCommand: (command: string) => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const needsConfirmation = state === 'response' && (Boolean(pendingOperation) || requiresConfirmation);

  useEffect(() => {
    pulse.stopAnimation();
    pulse.setValue(1);
    if (state === 'response' || state === 'review') return undefined;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse, state]);

  const title = state === 'listening' ? 'Númi está escuchando' : state === 'review' ? 'Revisa lo que entendí' : state === 'processing' ? 'Procesando comando' : needsConfirmation ? 'Revisa antes de continuar' : 'Númi respondió';
  const subtitle = state === 'listening' ? 'Habla con claridad; volveré a escuchar cuando termines.' : state === 'review' ? 'Corrige cualquier palabra antes de enviarla.' : state === 'processing' ? 'Estoy revisando tus datos y preparando el siguiente paso.' : needsConfirmation ? 'Di “confirmado” para ejecutar o usa el botón Confirmar.' : 'Esta respuesta también se guardó en el chat.';
  const icon = state === 'listening' ? 'microphone' : state === 'review' ? 'text-box-check-outline' : state === 'processing' ? 'loading' : needsConfirmation ? 'shield-check-outline' : 'check-circle-outline';

  return (
    <View style={styles.botVoiceOverlayLayer} pointerEvents="box-none">
      <View style={styles.botVoiceOverlayBackdrop} pointerEvents="none" />
      <View style={[styles.botVoiceOverlayCard, showWorkflow && { maxHeight: '90%' }]}>
       <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={showWorkflow}>
        <View style={styles.botVoiceOverlayHeader}>
          <Image source={require('../../../assets/numi-chat-avatar.jpg')} style={styles.botVoiceOverlayAvatar} />
          <View style={styles.botVoiceOverlayHeaderCopy}>
            <Text style={styles.botVoiceOverlayTitle}>{title}</Text>
            <Text style={styles.botVoiceOverlaySubtitle}>{subtitle}</Text>
          </View>
        </View>
        <Animated.View style={[styles.botVoiceOverlayOrb, state !== 'response' && { transform: [{ scale: pulse }] }]}>
          <MaterialCommunityIcons name={icon} size={34} color="#FFFFFF" />
        </Animated.View>
        {state === 'listening' ? <Text style={styles.botVoiceOverlayTranscript}>{transcript || 'Te escucho…'}</Text> : null}
        {state === 'review' ? <TextInput autoFocus value={transcript} onChangeText={onChangeTranscript} multiline maxLength={800} style={styles.botVoiceOverlayEdit} /> : null}
        {state === 'processing' ? <Text style={styles.botVoiceOverlayTranscript}>Analizando: “{transcript}”</Text> : null}
        {state === 'response' ? <Text style={styles.botVoiceOverlayResponse}>{response}</Text> : null}
        {pendingOperation && state === 'response' && !showWorkflow ? <View style={styles.botVoiceOverlayOperation}><Text style={styles.botVoiceOverlayOperationLabel}>Operación pendiente</Text><Text style={styles.botVoiceOverlayOperationText}>{pendingOperation.resumen || 'Operación que requiere confirmación'}</Text></View> : null}
        {showWorkflow && state === 'response' ? <BotInvoiceWorkflowCard draft={draft} missing={missing} requiresConfirmation={requiresConfirmation} state={invoiceState} selectionOptions={selectionOptions} pendingOperation={pendingOperation} showActions={false} onCommand={onCommand} /> : null}
        {state === 'review' ? (
          <>
            <View style={styles.botVoiceOverlayActions}>
              <Pressable style={styles.botVoiceOverlayCancelButton} onPress={onCancel}><Text style={styles.botVoiceOverlayCancelText}>Cancelar</Text></Pressable>
              <Pressable style={[styles.botVoiceOverlayConfirmButton, !transcript.trim() && styles.botVoiceOverlayConfirmButtonDisabled]} onPress={onReviewSend} disabled={!transcript.trim()}><MaterialCommunityIcons name="send" size={16} color="#FFFFFF" /><Text style={styles.botVoiceOverlayConfirmText}>Enviar</Text></Pressable>
            </View>
            <Pressable style={styles.botVoiceOverlayCloseButton} onPress={onReviewEdit}><Text style={styles.botVoiceOverlayCloseText}>Editar en el chat</Text></Pressable>
          </>
        ) : needsConfirmation ? (
          <>
            <View style={styles.botVoiceOverlayActions}>
              <Pressable style={styles.botVoiceOverlayCancelButton} onPress={() => onCommand('cancelar')}><Text style={styles.botVoiceOverlayCancelText}>Cancelar</Text></Pressable>
              {handsFreeEnabled ? <Pressable style={styles.botVoiceOverlayContinueButton} onPress={onStartConfirmationVoice}><MaterialCommunityIcons name="microphone" size={16} color="#FFFFFF" /><Text style={styles.botVoiceOverlayContinueText}>Decir confirmado</Text></Pressable> : null}
            </View>
            <Pressable style={styles.botVoiceOverlayConfirmButtonFull} onPress={() => onCommand(pendingOperation ? 'confirmar' : 'emitir')}><MaterialCommunityIcons name="check" size={17} color="#FFFFFF" /><Text style={styles.botVoiceOverlayConfirmText}>Confirmar con botón</Text></Pressable>
          </>
        ) : state === 'response' ? (
          <View style={styles.botVoiceOverlayActions}>
            <Pressable style={styles.botVoiceOverlayCloseButton} onPress={onCancel}><Text style={styles.botVoiceOverlayCloseText}>Cerrar</Text></Pressable>
          </View>
        ) : <Pressable style={styles.botVoiceOverlayCloseButton} onPress={onCancel}><Text style={styles.botVoiceOverlayCloseText}>Cancelar</Text></Pressable>}
       </ScrollView>
      </View>
    </View>
  );
}

function BotInvoiceWorkflowCard({ draft, missing, requiresConfirmation, state, selectionOptions, pendingOperation, showActions = true, onCommand }: {
  draft: BotFacturaDraft | null;
  missing: string[];
  requiresConfirmation: boolean;
  state: string;
  selectionOptions: BotSelectionOption[];
  pendingOperation: { tipo?: string; resumen?: string; expiraEn?: string | null } | null;
  showActions?: boolean;
  onCommand: (command: string) => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const actualMissing = missing.filter((item) => !item.toLowerCase().includes('confirm'));
  const hasCalculatedValues = Boolean(draft?.items?.length && (draft.subtotal !== undefined || draft.impuesto !== undefined || draft.total !== undefined));
  const hasWorkflow = actualMissing.length > 0 || requiresConfirmation || selectionOptions.length > 0 || Boolean(draft?.cliente || draft?.items?.length) || hasCalculatedValues || Boolean(pendingOperation);

  useEffect(() => {
    if (!requiresConfirmation) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return undefined;
    }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.015, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse, requiresConfirmation]);

  if (!hasWorkflow) return null;

  return (
    <Animated.View style={[styles.botWorkflowCard, requiresConfirmation && { transform: [{ scale: pulse }] }]}>
      <View style={styles.botWorkflowHeader}>
        <View style={styles.botWorkflowIcon}><MaterialCommunityIcons name={requiresConfirmation ? 'check-decagram-outline' : 'clipboard-alert-outline'} size={20} color={requiresConfirmation ? '#0F8A4B' : '#0878C9'} /></View>
        <View style={styles.botWorkflowHeaderCopy}>
          <Text style={styles.botWorkflowTitle}>{pendingOperation ? 'Confirma la operación' : requiresConfirmation ? 'Confirma la emisión' : actualMissing.length ? 'Datos pendientes' : 'Resultados encontrados'}</Text>
          <Text style={styles.botWorkflowSubtitle}>{pendingOperation ? 'No se ejecutará nada sin tu autorización explícita.' : requiresConfirmation ? 'Revisa el resumen y elige cómo continuar.' : actualMissing.length ? 'Te indico lo que falta y cómo continuar.' : 'Númi verificó los datos y calculó los valores.'}</Text>
        </View>
      </View>
      {pendingOperation ? <View style={styles.botWorkflowClient}><Text style={styles.botWorkflowLabel}>Operación pendiente</Text><Text style={styles.botWorkflowValue}>{pendingOperation.resumen || 'Operación que requiere confirmación'}</Text></View> : null}
      {actualMissing.length > 0 ? (
        <View style={styles.botWorkflowMissingBox}>
          <Text style={styles.botWorkflowSectionTitle}>Falta completar</Text>
          {actualMissing.map((item) => <Text key={item} style={styles.botWorkflowMissingItem}>• {item}</Text>)}
        </View>
      ) : null}
      {draft?.cliente ? (
        <View style={styles.botWorkflowClient}>
          <Text style={styles.botWorkflowLabel}>Cliente encontrado</Text>
          <Text style={styles.botWorkflowValue}>{draft.cliente.nombre || 'Cliente'}{draft.cliente.identificacion ? ` · ${draft.cliente.identificacion}` : ''}</Text>
        </View>
      ) : null}
      {draft?.items?.length ? (
        <View style={styles.botWorkflowItems}>
          <Text style={styles.botWorkflowSectionTitle}>{draft.items.length === 1 ? 'Producto encontrado' : 'Productos encontrados'}</Text>
          {draft.items.map((item, index) => (
            <View key={item.id || `${item.descripcion}-${index}`} style={styles.botWorkflowItemRow}>
              <Text style={styles.botWorkflowItemText}>{item.cantidad ?? 0} × {item.descripcion || 'Producto'}</Text>
              <Text style={styles.botWorkflowItemAmount}>{formatMoney(item.total ?? 0)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {draft?.items?.length && (draft.subtotal !== undefined || draft.impuesto !== undefined || draft.total !== undefined) ? (
        <View style={styles.botWorkflowTotals}>
          <Text style={styles.botWorkflowSectionTitle}>Valores calculados</Text>
          <Text style={styles.botWorkflowTotalText}>Subtotal {formatMoney(draft.subtotal ?? 0)}</Text>
          <Text style={styles.botWorkflowTotalText}>IVA {formatMoney(draft.impuesto ?? 0)}</Text>
          <Text style={styles.botWorkflowTotalStrong}>Total {formatMoney(draft.total ?? 0)}</Text>
        </View>
      ) : null}
      {selectionOptions.length > 0 ? (
        <View style={styles.botWorkflowOptions}>
          <Text style={styles.botWorkflowSectionTitle}>Selecciona una opción</Text>
          {selectionOptions.map((option) => <Pressable key={`${option.tipo}-${option.indice}`} style={styles.botWorkflowOption} onPress={() => onCommand(String(option.indice))}><Text style={styles.botWorkflowOptionTitle}>{option.indice}. {option.etiqueta}</Text><Text style={styles.botWorkflowOptionDescription}>{option.descripcion || 'Toca para seleccionar'}</Text></Pressable>)}
        </View>
      ) : null}
      {actualMissing.some(isMissingProduct) ? (
        <View style={styles.botWorkflowActions}>
          <Pressable style={styles.botWorkflowCancelButton} onPress={() => onCommand('ayúdame a crear el producto')}><Text style={styles.botWorkflowCancelText}>Ayúdame a crearlo</Text></Pressable>
          <Pressable style={styles.botWorkflowConfirmButton} onPress={() => onCommand('continuar')}><Text style={styles.botWorkflowConfirmText}>Seguir</Text></Pressable>
        </View>
      ) : null}
      {showActions && (requiresConfirmation || pendingOperation) ? (
        <View style={styles.botWorkflowActions}>
          <Pressable style={styles.botWorkflowCancelButton} onPress={() => onCommand('cancelar')}><Text style={styles.botWorkflowCancelText}>Cancelar</Text></Pressable>
          <Pressable style={styles.botWorkflowConfirmButton} onPress={() => onCommand(pendingOperation ? 'confirmar' : 'emitir')}><MaterialCommunityIcons name="check" size={17} color="#FFFFFF" /><Text style={styles.botWorkflowConfirmText}>{pendingOperation ? 'Confirmar' : 'Emitir factura'}</Text></Pressable>
        </View>
      ) : null}
      {state === 'FacturaEmitida' ? <Text style={styles.botWorkflowSuccess}>Factura emitida correctamente.</Text> : null}
    </Animated.View>
  );
}

function formatMoney(value: number) {
  return `$ ${Number(value || 0).toFixed(2)}`;
}

function isMissingProduct(value: string) {
  const normalized = normalizeVoiceCommand(value);
  return normalized.includes('producto') || normalized.includes('articulo');
}

function buildVoiceResponse(answer: string, draft: BotFacturaDraft | null, missing: string[]) {
  const details: string[] = [];
  if (draft?.cliente?.nombre) details.push(`Cliente ${draft.cliente.nombre} encontrado.`);
  const products = draft?.items?.map((item) => item.descripcion).filter((value): value is string => Boolean(value?.trim())) ?? [];
  if (products.length === 1) details.push(`Producto ${products[0]} encontrado.`);
  else if (products.length > 1) details.push(`${products.length} productos encontrados.`);
  if (draft?.items?.length && (draft.subtotal !== undefined || draft.impuesto !== undefined || draft.total !== undefined)) {
    details.push(`Valores calculados: subtotal ${formatMoney(draft.subtotal ?? 0)}, IVA ${formatMoney(draft.impuesto ?? 0)} y total ${formatMoney(draft.total ?? 0)}.`);
  }
  const unresolved = missing.filter((item) => !normalizeVoiceCommand(item).includes('confirm'));
  if (unresolved.length) details.push(`Te falta completar ${unresolved.join(', ')}. Puedo ayudarte a crearlo o puedes decir continuar.`);
  const compactAnswer = /cliente:|subtotal|descuento|impuestos|iva|total/i.test(answer)
    ? answer.split(/\r?\n/).filter((line) => !/^(cliente:|-\s|subtotal|descuento|impuestos|iva|total)/i.test(line.trim())).join(' ').trim()
    : answer.trim();
  return [...details, compactAnswer].filter(Boolean).join(' ');
}

function normalizeVoiceCommand(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function isExplicitConfirmation(value: string) {
  return /\b(confirmado|confirmo|autorizo|autorizado|acepto)\b/.test(normalizeVoiceCommand(value));
}

function isExplicitCancellation(value: string) {
  return /\b(cancelar|cancelo|anular|anulo)\b/.test(normalizeVoiceCommand(value));
}

async function speakBotText(text: string) {
  const maxChunkLength = Number.isFinite(Speech.maxSpeechInputLength)
    ? Math.min(Math.max(Speech.maxSpeechInputLength, 500), 3500)
    : 3500;
  const chunks: string[] = [];
  let chunk = '';
  for (const word of text.trim().split(/\s+/)) {
    if (chunk && `${chunk} ${word}`.length > maxChunkLength) {
      chunks.push(chunk);
      chunk = word;
    } else {
      chunk = chunk ? `${chunk} ${word}` : word;
    }
  }
  if (chunk) chunks.push(chunk);
  if (!chunks.length) return;
  try {
    await Speech.stop();
  } catch {
    // Detener una locución previa no debe impedir la respuesta actual.
  }
  for (const part of chunks) {
    await new Promise<void>((resolve) => {
      Speech.speak(part, {
        language: 'es-EC',
        rate: 0.96,
        onDone: resolve,
        onStopped: resolve,
        onError: () => resolve(),
      });
    });
  }
}

