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
} from 'lucide-react';
import {
  VisionStudioProject,
  AssistantChatMessage,
  SafetyWarning,
  PhotoDiaryEntry,
} from '../../types';
import { assistantService, SAFETY_PRESETS } from '../../services/assistantService';
import { Language, translations } from '../../i18n/translations';
import { InteractiveToolTutorials } from './InteractiveToolTutorials';

interface AssistantAiModeProps {
  project: VisionStudioProject;
  language: Language;
  onSendMessage: (msg: Omit<AssistantChatMessage, 'id'>) => void;
  onToggleChecklist: (itemId: string) => void;
  onAddPhotoDiary: (entry: Omit<PhotoDiaryEntry, 'id'>) => void;
  onNavigateVisionAi: () => void;
}

export const AssistantAiMode: React.FC<AssistantAiModeProps> = ({
  project,
  language,
  onSendMessage,
  onToggleChecklist,
  onAddPhotoDiary,
  onNavigateVisionAi,
}) => {
  const t = translations[language];

  // Chat input state
  const [inputText, setInputText] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [attachedPhotoName, setAttachedPhotoName] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Photo Diary modal state
  const [showAddDiaryModal, setShowAddDiaryModal] = useState(false);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryNotes, setDiaryNotes] = useState('');
  const [diaryPhase, setDiaryPhase] = useState('Superfici & Ebanisteria');
  const [diaryPhotoUrl, setDiaryPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80'
  );

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [project.chatHistory, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedPhoto) return;

    const userMessage: Omit<AssistantChatMessage, 'id'> = {
      sender: 'user',
      text: inputText.trim() || 'Ho caricato questa foto del cantiere.',
      timestamp: 'Adesso',
      attachedImageUrl: attachedPhoto || undefined,
    };

    onSendMessage(userMessage);
    const sentText = inputText;
    const sentPhotoName = attachedPhotoName;
    setInputText('');
    setAttachedPhoto(null);
    setAttachedPhotoName(null);

    // Simulate AI thinking and expert reply
    setIsTyping(true);
    setTimeout(() => {
      const reply = assistantService.generateReply(
        sentText,
        project,
        sentPhotoName || undefined
      );
      onSendMessage(reply);
      setIsTyping(false);
    }, 900);
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedPhoto(url);
      setAttachedPhotoName(file.name);
    }
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
  };

  const quickQuestions = [
    'Come applicare il sigillante per microcemento?',
    'Quali DPI sono obbligatori per il taglio?',
    'Stato del budget e materiali ordinati',
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5DFD5] shadow-xs flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 sm:p-5 border-b border-[#F0EBE1] bg-[#FAF8F5] flex items-center justify-between">
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
                  Sincronizzato sul cantiere: {project.roomType} ({project.scanData.squareMeters} mq)
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-semibold text-[#8F7451] bg-white px-2.5 py-1 rounded-full border border-[#E5DFD5]">
              Avanzamento {project.progress}%
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#FAF8F5]/50">
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

                    <p>{msg.text}</p>

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

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
