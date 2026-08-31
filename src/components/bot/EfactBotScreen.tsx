import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiError } from '../../services/apiClient';
import { sendBotMessage } from '../../services/botService';
import type { BotFeedbackState, BotMessage } from '../../types/bot';
import { NumiThinkingIndicator } from './NumiThinkingIndicator';
import { styles } from '../../styles/appStyles';
export function EfactBotScreen({
  userName,
  messages,
  setMessages,
  draft,
  setDraft,
  feedbackByMessage,
  setFeedbackByMessage,
}: {
  userName: string;
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
  const [emojiOpen, setEmojiOpen] = useState(false);
  const voiceRecognition = useRef<any>(null);
  const messagesScrollRef = useRef<ScrollView>(null);

  const scrollMessagesToEnd = (animated = true) => {
    requestAnimationFrame(() => messagesScrollRef.current?.scrollToEnd({ animated }));
  };

  useEffect(() => {
    scrollMessagesToEnd(false);
  }, [messages.length, sending]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', text: `Hola ${userName || ''}. Soy Númi, tu asistente de E-FACT. ¿En qué te ayudo hoy?` }]);
    }
  }, [messages.length, setMessages, userName]);

  const send = async (preset?: string) => {
    const text = (preset ?? draft).trim();
    if (!text || sending) return;
    setDraft('');
    setError('');
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text }]);
    setThinkingRequest(text);
    setSending(true);
    try {
      const answer = await sendBotMessage({
        message: text,
        contexto: 'e-rúbrica: guía para crear solicitudes de firma, completar firmantes y documentos, firmar documentos y validar el estado y la autenticidad de las firmas. Explica los pasos según las opciones disponibles en e-rúbrica y no inventes funciones que no estén disponibles.',
      });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: answer }]);
      Speech.speak(answer, { language: 'es-EC', rate: 0.96 });
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'No se pudo contactar al bot.');
    } finally {
      setSending(false);
      setThinkingRequest('');
    }
  };

  const toggleVoiceInput = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Comandos por voz', 'El dictado nativo requiere habilitar el módulo de reconocimiento de voz en la compilación móvil. La lectura de respuestas ya está disponible.');
      return;
    }

    const browser = globalThis as typeof globalThis & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    if (listening) {
      voiceRecognition.current?.stop();
      return;
    }
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Este navegador no permite dictado por voz.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'es-EC';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => setDraft(event.results?.[0]?.[0]?.transcript ?? '');
    recognition.onerror = () => setError('No se pudo reconocer la voz. Intenta nuevamente.');
    recognition.onend = () => setListening(false);
    voiceRecognition.current = recognition;
    recognition.start();
  };

  return (
    <KeyboardAvoidingView style={styles.botScreen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <View style={styles.botWidgetHeader}>
        <Image source={require('./assets/numi-chat-avatar.jpg')} style={styles.botWidgetAvatar} />
        <View style={styles.botWidgetCopy}>
          <Text style={styles.botWidgetKicker}>Chat con</Text>
          <Text style={styles.botWidgetTitle}>Númi</Text>
          <Text style={styles.botWidgetStatus}>Estamos en línea</Text>
        </View>
        <View style={styles.botWidgetHeaderActions}>
          <MaterialCommunityIcons name="dots-vertical" size={18} color="#FFFFFF" />
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
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator
        onContentSizeChange={() => scrollMessagesToEnd()}
      >
        {messages.map((message) => (
          <View key={message.id} style={message.role === 'user' ? styles.botUserRow : styles.botAssistantRow}>
            {message.role === 'assistant' ? <Image source={require('./assets/numi-chat-avatar.jpg')} style={styles.botMessageAvatar} /> : null}
            <View style={[styles.botBubble, message.role === 'user' ? styles.botUserBubble : styles.botAssistantBubble]}>
              <View style={styles.botMessageRow}>
                <Text style={[styles.botBubbleText, message.role === 'user' && styles.botUserBubbleText]}>{message.text}</Text>
                {message.role === 'assistant' ? <Pressable style={styles.botAudioButton} onPress={() => Speech.speak(message.text, { language: 'es-EC', rate: 0.96 })} hitSlop={8}><MaterialCommunityIcons name="volume-high" size={16} color="#0878C9" /></Pressable> : null}
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
            <Image source={require('./assets/numi-chat-avatar.jpg')} style={styles.botMessageAvatar} />
            <NumiThinkingIndicator request={thinkingRequest} />
          </View>
        ) : null}
      </ScrollView>
      {error ? <Text style={styles.botError}>{error}</Text> : null}
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
        <Pressable style={[styles.botToolButton, emojiOpen && styles.botToolButtonActive]} disabled={sending} onPress={() => setEmojiOpen((value) => !value)}>
          <MaterialCommunityIcons name="emoticon-outline" size={19} color={emojiOpen ? '#FFFFFF' : '#6E94B4'} />
        </Pressable>
        <Pressable style={[styles.botVoiceButton, listening && styles.botVoiceButtonActive]} onPress={toggleVoiceInput} disabled={sending}>
          <MaterialCommunityIcons name={listening ? 'microphone' : 'microphone-outline'} size={21} color={listening ? '#FFFFFF' : '#0878C9'} />
        </Pressable>
        <TextInput value={draft} onChangeText={setDraft} placeholder={listening ? 'Escuchando...' : 'Escribe o dicta tu consulta...'} placeholderTextColor="#8DA1B4" style={styles.botInput} editable={!sending && !listening} multiline maxLength={800} onFocus={() => scrollMessagesToEnd()} onSubmitEditing={() => send()} />
        <Pressable style={[styles.botSendButton, (!draft.trim() || sending) && styles.botSendButtonDisabled]} onPress={() => send()} disabled={!draft.trim() || sending}>
          <Text style={styles.botSendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

