import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Camera,
  Send,
  ShieldAlert,
  CheckSquare,
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Image as ImageIcon,
  Paperclip,
  Check,
  X,
  Clock,
  Trash2,
} from 'lucide-react';
import {
  VisionStudioProject,
  AssistantChatMessage,
  SafetyWarning,
  PhotoDiaryEntry,
} from '../../types';
import { SAFETY_PRESETS } from '../../services/assistantService';
import { Language, translations } from '../../i18n/translations';
import { InteractiveToolTutorials } from './InteractiveToolTutorials';

const renderAssistantInline = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-[#F2ECE1] px-1 py-0.5 text-[0.92em]">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const AssistantFormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`}>{renderAssistantInline(paragraph.join(' '))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!listItems.length || !listType) return;
    const items = listItems.map((item, index) => <li key={index}>{renderAssistantInline(item)}</li>);
    blocks.push(listType === 'ol'
      ? <ol key={`ol-${blocks.length}`} className="my-2 list-decimal space-y-1 pl-5">{items}</ol>
      : <ul key={`ul-${blocks.length}`} className="my-2 list-disc space-y-1 pl-5">{items}</ul>);
    listItems = [];
    listType = null;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      return;
    }
    const unordered = line.match(/^(?:[-•*])\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered || ordered)![1]);
      return;
    }
    flushList();
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push(<h4 key={`h-${blocks.length}`} className="mt-2 font-semibold text-[#26343B]">{renderAssistantInline(heading[1])}</h4>);
      return;
    }
    paragraph.push(line);
  });
  flushParagraph();
  flushList();
  return <div className="space-y-2 [&>p]:whitespace-pre-wrap">{blocks}</div>;
};

interface AssistantAiModeProps {
  project: VisionStudioProject;
  language: Language;
  onSendMessage: (msg: Omit<AssistantChatMessage, 'id'>) => void;
  onToggleChecklist: (itemId: string) => void;
  onAddPhotoDiary: (entry: Omit<PhotoDiaryEntry, 'id'>) => void;
  onDeletePhotoDiary: (entryId: string) => void;
  onNavigateVisionAi: () => void;
}

export const AssistantAiMode: React.FC<AssistantAiModeProps> = ({
  project,
  language,
  onSendMessage,
  onToggleChecklist,
  onAddPhotoDiary,
  onDeletePhotoDiary,
  onNavigateVisionAi,
}) => {
  const t = translations[language];
  const [displayName] = useState<string>(() => {
    try {
      const saved = window.localStorage.getItem('casa-co:profile:display-name');
      return saved ? (JSON.parse(saved) as string).trim() : 'Carlo';
    } catch { return 'Carlo'; }
  });

  // Chat input state
  const [inputText, setInputText] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [attachedPhotoName, setAttachedPhotoName] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Photo Diary modal state
  const [showAddDiaryModal, setShowAddDiaryModal] = useState(false);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryNotes, setDiaryNotes] = useState('');
  const [diaryPhase, setDiaryPhase] = useState('Superfici & Ebanisteria');
  const [diaryPhotoUrl, setDiaryPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80'
  );
  const [diaryPhotoName, setDiaryPhotoName] = useState('');

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [project.chatHistory, isTyping]);

  const readImage = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossibile leggere la fotografia.'));
    reader.readAsDataURL(file);
  });

  // Compress phone photos locally before upload so the AI request stays within
  // the serverless request-body limit while retaining enough detail for analysis.
  const compressChatPhoto = async (file: File): Promise<File> => {
    const imageBitmap = await createImageBitmap(file);
    try {
      const maxDimension = 2048;
      const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(imageBitmap.width * scale));
      canvas.height = Math.max(1, Math.round(imageBitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Impossibile preparare la fotografia.');
      context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

      const toBlob = (quality: number) => new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality);
      });

      let quality = 0.86;
      let blob = await toBlob(quality);
      while (blob && blob.size > 2.5 * 1024 * 1024 && quality > 0.5) {
        quality = Math.max(0.5, quality - 0.1);
        blob = await toBlob(quality);
      }

      let currentCanvas = canvas;
      while (blob && blob.size > 2.5 * 1024 * 1024 && currentCanvas.width > 900) {
        const smaller = document.createElement('canvas');
        smaller.width = Math.round(currentCanvas.width * 0.8);
        smaller.height = Math.round(currentCanvas.height * 0.8);
        const smallerContext = smaller.getContext('2d');
        if (!smallerContext) break;
        smallerContext.drawImage(currentCanvas, 0, 0, smaller.width, smaller.height);
        currentCanvas = smaller;
        blob = await new Promise<Blob | null>((resolve) => smaller.toBlob(resolve, 'image/jpeg', 0.72));
      }

      if (!blob || blob.size > 2.5 * 1024 * 1024) {
        throw new Error('Non riesco a comprimere questa foto abbastanza. Prova con un’immagine più piccola.');
      }
      return new File([blob], file.name.replace(/\\.[^.]+$/, '') + '.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    } finally {
      imageBitmap.close();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedPhoto) || isTyping) return;

    const sentText = inputText.trim();
    const sentPhoto = attachedPhoto;
    const userMessage: Omit<AssistantChatMessage, 'id'> = {
      sender: 'user',
      text: sentText || 'Ho caricato questa foto del cantiere.',
      timestamp: 'Adesso',
      attachedImageUrl: sentPhoto || undefined,
    };
    onSendMessage(userMessage);
    setInputText('');
    setAttachedPhoto(null);
    setAttachedPhotoName(null);
    setServiceError('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sentText,
          project,
          history: project.chatHistory.map((item) => ({
            role: item.sender === 'assistant' ? 'model' : 'user',
            text: item.text
          })),
          image: sentPhoto ? {
            mimeType: sentPhoto.slice(5, sentPhoto.indexOf(';')),
            data: sentPhoto.split(',')[1]
          } : undefined
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Il servizio AI non è disponibile.');
      onSendMessage({
        sender: 'assistant',
        text: result.text,
        timestamp: 'Adesso'
      });
    } catch (error) {
      setServiceError(error instanceof Error ? error.message : 'Errore durante la richiesta all’assistente.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setServiceError('Formato non supportato. Usa JPG, PNG o WebP.');
      e.target.value = '';
      return;
    }
    try {
      const compressedPhoto = await compressChatPhoto(file);
      setAttachedPhoto(await readImage(compressedPhoto));
      setAttachedPhotoName(compressedPhoto.name);
      setServiceError('');
    } catch (error) {
      setServiceError(error instanceof Error ? error.message : 'Non è stato possibile preparare la fotografia.');
    }
    e.target.value = '';
  };

  const handleDiaryPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setServiceError('Per il diario usa una foto JPG, PNG o WebP fino a 2 MB.');
      return;
    }
    try {
      setDiaryPhotoUrl(await readImage(file));
      setDiaryPhotoName(file.name);
      setServiceError('');
    } catch {
      setServiceError('Impossibile leggere la foto selezionata.');
    }
    e.target.value = '';
  };

  const handleAddDiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryTitle.trim()) return;

    onAddPhotoDiary({
      title: diaryTitle.trim(),
      timestamp: 'Oggi',
      photoUrl: diaryPhotoUrl,
      notes: diaryNotes.trim() || 'Avanzamento registrato con successo nel diario.',
      phase: diaryPhase,
    });

    setShowAddDiaryModal(false);
    setDiaryTitle('');
    setDiaryNotes('');
    setDiaryPhotoName('');
  };

  const quickQuestions = [
    'Come applicare il sigillante per microcemento?',
    'Quali DPI sono obbligatori per il taglio?',
    'Stato del budget e materiali ordinati',
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B79B76]/15 text-[#8F7451] text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-[#B79B76]" />
            <span>Modalità 3 · Assistente Contestuale & Cantiere</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#26343B]">
            Assistant AI — Guida Tecnica & Diario Fotografico
          </h1>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1 max-w-2xl leading-relaxed">
            Consulenza d'autore in tempo reale, schemi esecutivi illustrati, avvisi di sicurezza DPI, checklist interattiva e archivio del cantiere.
          </p>
        </div>

        <button
          onClick={onNavigateVisionAi}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-[#26343B] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
        >
          <span>Torna a Vision AI</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8F7451]" />
        </button>
      </div>

      {/* Safety Alert Banner (Always Visible & Contextual) */}
      <div className="bg-[#26343B] text-[#F5F1E9] p-5 rounded-3xl border border-[#3A4B53] shadow-md flex items-start gap-4">
        <div className="p-2.5 bg-red-500/20 text-red-300 rounded-2xl flex-shrink-0 mt-0.5 border border-red-500/30">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-[#B79B76]">
              Avviso Sicurezza Attivo nel Cantiere
            </span>
            <span className="text-[10px] bg-red-500/30 text-red-200 px-2 py-0.5 rounded-full font-bold">
              Priorità Alta
            </span>
          </div>
          <h3 className="font-bold text-sm text-[#F5F1E9]">
            {SAFETY_PRESETS.dust.title}
          </h3>
          <p className="text-xs text-[#F5F1E9]/80 mt-1 leading-relaxed">
            {SAFETY_PRESETS.dust.description}
          </p>
          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            {SAFETY_PRESETS.dust.requiredPPE.map((ppe, i) => (
              <span
                key={i}
                className="text-[11px] bg-white/10 text-[#DAC9B2] px-2.5 py-0.5 rounded-md font-medium"
              >
                ✓ {ppe}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Chat & Sidebar (Checklist + Photo Diary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contextual Chat (7 cols on lg) */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-3xl border border-[#E5DFD5] shadow-xs flex flex-col h-[min(650px,75vh)] min-h-[480px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="min-w-0 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#F0EBE1] bg-[#FAF8F5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#26343B] text-[#B79B76] flex items-center justify-center font-serif font-bold text-base shadow-xs">
                AI
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#26343B] flex items-center gap-1.5">
                  <span>Mastro Assistente Casa&Co.</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </h3>
                <p className="text-[11px] text-[#26343B]/60">
                  {project.name ? `Progetto: ${project.name}` : (language === 'it' ? 'Pronto a rispondere alle tue domande' : 'Ready to answer your questions')}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-semibold text-[#8F7451] bg-white px-2.5 py-1 rounded-full border border-[#E5DFD5]">
              Mastro AI
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#FAF8F5]/50">
            {project.chatHistory.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#26343B] text-[#B79B76] flex items-center justify-center text-xs font-bold flex-shrink-0">C&</div>
                <div className="max-w-[90%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed bg-white text-[#26343B] border border-[#E5DFD5] shadow-xs">
                  <p className="whitespace-pre-wrap">{language === 'it'
                    ? `Ciao ${displayName || 'Carlo'}! 👋 Sono Mastro, l’assistente di Casa&Co. Hai bisogno di un’informazione, di un consiglio o vuoi costruire o rinnovare qualcosa? Posso aiutarti a scegliere materiali e attrezzi, spiegarti le lavorazioni e guidarti passo dopo passo. Da dove iniziamo?`
                    : `Hi ${displayName || 'Carlo'}! 👋 I’m Mastro, your Casa&Co assistant. Do you need information, advice, or would you like to build or renovate something? I can help you choose materials and tools, explain techniques, and guide you step by step. Where shall we start?`}</p>
                </div>
              </div>
            )}
            {project.chatHistory.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-[#26343B] text-[#B79B76] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      C&
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-white text-[#26343B] border border-[#E5DFD5] shadow-xs'
                        : 'bg-[#26343B] text-[#F5F1E9]'
                    }`}
                  >
                    {/* Attached Photo in message */}
                    {msg.attachedImageUrl && (
                      <div className="mb-2.5 rounded-xl overflow-hidden border border-black/10">
                        <img
                          src={msg.attachedImageUrl}
                          alt="Allegato utente"
                          className="w-full max-h-48 object-cover"
                        />
                      </div>
                    )}

                    {isAssistant ? <AssistantFormattedText text={msg.text} /> : <p className="whitespace-pre-wrap">{msg.text}</p>}

                    {/* Illustrated Step Card if present */}
                    {msg.illustratedStep && (
                      <div className="mt-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E0D7C9] text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#8F7451] mb-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Fase Illustrata: {msg.illustratedStep.title}</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-[#26343B]/80 pl-1">
                          {msg.illustratedStep.instructions.map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Safety Alert in message if present */}
                    {msg.safetyAlert && (
                      <div className="mt-3 p-2.5 bg-red-50 text-red-900 rounded-xl border border-red-200 text-xs">
                        <span className="font-bold flex items-center gap-1 text-red-700">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Avviso DPI: {msg.safetyAlert.title}</span>
                        </span>
                        <p className="mt-0.5 text-[11px] leading-tight">
                          {msg.safetyAlert.description}
                        </p>
                      </div>
                    )}

                    <span
                      className={`block text-[10px] mt-1.5 text-right ${
                        isAssistant ? 'text-[#26343B]/40' : 'text-white/50'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#26343B]/60 p-2">
                <span className="w-2 h-2 rounded-full bg-[#B79B76] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#B79B76] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#B79B76] animate-bounce delay-200" />
                <span>Il mastro sta elaborando le quote e i consigli...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {serviceError && <div role="alert" className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">{serviceError}</div>}

          {/* Quick Prompt Pills */}
          <div className="p-2.5 bg-white border-t border-[#F0EBE1] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputText(q);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#EAE4D8] text-[11px] font-medium text-[#26343B] whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Attached Photo Preview before sending */}
          {attachedPhoto && (
            <div className="p-2.5 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={attachedPhoto}
                  alt="Anteprima"
                  className="w-10 h-10 rounded-lg object-cover border border-[#E5DFD5]"
                />
                <span className="text-xs text-[#26343B] font-medium truncate max-w-xs">
                  {attachedPhotoName || 'Foto cantiere allegata'}
                </span>
              </div>
              <button
                onClick={() => {
                  setAttachedPhoto(null);
                  setAttachedPhotoName(null);
                }}
                className="p-1 text-[#26343B]/50 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-white border-t border-[#F0EBE1] flex items-center gap-2"
          >
            <label
              title="Allega fotografia del cantiere"
              className="p-2.5 text-[#26343B]/60 hover:text-[#26343B] hover:bg-[#FAF8F5] rounded-xl cursor-pointer transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleAttachFile}
                className="hidden"
              />
              <Camera className="w-5 h-5" />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Chiedi al mastro: tempi di posa, calcoli, incastri..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] focus:bg-white outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !attachedPhoto}
              className="p-2.5 bg-[#26343B] text-[#F5F1E9] rounded-xl hover:bg-[#1A242A] transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Column: Interactive Checklist & Photo Diary (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Checklist Interattiva di Cantiere */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0EBE1]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#B79B76]" />
                  <span>Checklist di Cantiere ({project.checklist.filter((c) => c.completed).length}/{project.checklist.length})</span>
                </h3>
                <p className="text-xs text-[#26343B]/60 mt-0.5">
                  Ogni spunta aggiorna l'avanzamento totale del progetto.
                </p>
              </div>
            </div>

            <div className="space-y-2 pr-1">
              {project.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleChecklist(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    item.completed
                      ? 'bg-[#FAF8F5] border-[#E5DFD5] opacity-65'
                      : 'bg-white border-[#EAE4D8] hover:border-[#B79B76]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                      item.completed
                        ? 'bg-[#26343B] border-[#26343B] text-white'
                        : 'bg-white border-[#B79B76]/50'
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#8F7451] font-bold uppercase tracking-wider block">
                      {item.phase}
                    </span>
                    <span
                      className={`text-xs font-medium block leading-tight ${
                        item.completed ? 'line-through text-[#26343B]/70' : 'text-[#26343B]'
                      }`}
                    >
                      {item.title}
                    </span>

                    {item.safetyNote && (
                      <span className="text-[10px] text-red-700 font-semibold mt-1 block">
                        ⚠ {item.safetyNote}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diario Fotografico di Cantiere */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0EBE1]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#B79B76]" />
                  <span>Diario Fotografico ({project.photoDiary.length})</span>
                </h3>
                <p className="text-xs text-[#26343B]/60 mt-0.5">
                  Cronistoria visiva degli stati di avanzamento.
                </p>
              </div>

              <button
                onClick={() => setShowAddDiaryModal(true)}
                className="text-xs font-semibold text-[#8F7451] hover:text-[#26343B] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi foto</span>
              </button>
            </div>

            <div className="space-y-3">
              {project.photoDiary.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8] flex gap-3 items-center"
                >
                  <img
                    src={entry.photoUrl}
                    alt={entry.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E5DFD5] flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[10px] text-[#26343B]/60 mb-0.5">
                      <span className="font-bold text-[#8F7451]">{entry.phase}</span>
                      <span>{entry.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-xs text-[#26343B] leading-snug line-clamp-1">
                      {entry.title}
                    </h4>
                    <p className="text-[11px] text-[#26343B]/70 line-clamp-2 mt-0.5">
                      {entry.notes}
                    </p>
                  </div>
                  <button type="button" onClick={() => onDeletePhotoDiary(entry.id)} aria-label={`Elimina ${entry.title}`} title="Elimina voce" className="shrink-0 rounded-lg p-2 text-[#8F7451] hover:bg-red-50 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Tool Tutorials with Graphic Overlays */}
      <InteractiveToolTutorials language={language} />

      {/* Add Photo Diary Modal */}
      {showAddDiaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl border border-[#E5DFD5] shadow-2xl p-6 text-[#26343B]">
            <h3 className="font-serif text-xl font-bold mb-3">
              Nuova Voce nel Diario Fotografico
            </h3>

            <form onSubmit={handleAddDiarySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Titolo dell'Avanzamento *</label>
                <input
                  type="text"
                  required
                  value={diaryTitle}
                  onChange={(e) => setDiaryTitle(e.target.value)}
                  placeholder="Es. Posa ultimata dei profili LED a soffitto"
                  className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#E5DFD5] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Fase di Riferimento</label>
                <select
                  value={diaryPhase}
                  onChange={(e) => setDiaryPhase(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#E5DFD5] rounded-xl outline-none"
                >
                  <option value="Preparazione & Demolizione">Preparazione & Demolizione</option>
                  <option value="Superfici & Microcemento">Superfici & Microcemento</option>
                  <option value="Ebanisteria & Boiserie">Ebanisteria & Boiserie</option>
                  <option value="Impianti & Illuminazione">Impianti & Illuminazione</option>
                  <option value="Collaudo Finale">Collaudo Finale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Fotografia del cantiere</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleDiaryPhotoSelect} className="block w-full text-xs text-[#26343B]/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#26343B]" />
                {diaryPhotoName && <p className="mt-1 text-[11px] text-[#8F7451]">{diaryPhotoName}</p>}
                {diaryPhotoUrl.startsWith('data:') && <img src={diaryPhotoUrl} alt="Anteprima foto diario" className="mt-2 h-24 w-24 rounded-xl object-cover" />}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Note di Lavorazione</label>
                <textarea
                  rows={2}
                  value={diaryNotes}
                  onChange={(e) => setDiaryNotes(e.target.value)}
                  placeholder="Dettagli sulle difficoltà riscontrate, tempo impiegato..."
                  className="w-full p-2.5 text-xs bg-white border border-[#E5DFD5] rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDiaryModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#26343B]/70"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#26343B] text-white text-xs font-bold rounded-xl"
                >
                  Salva nel Diario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
