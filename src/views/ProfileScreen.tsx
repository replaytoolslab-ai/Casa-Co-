import React, { useEffect, useState } from 'react';
import {
  User, Hammer, Settings, Globe, Ruler, Check, ShieldCheck,
  Mail, Lock, LogOut, Save, KeyRound, LoaderCircle
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { AuthSession, authService } from '../services/authService';

interface ProfileScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  completedCount: number;
  session: AuthSession | null;
  onSessionChange: (session: AuthSession | null) => void;
}

type AuthMode = 'login' | 'signup' | 'recover';

const fieldClass = 'w-full rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] px-4 py-3 text-sm text-[#26343B] outline-none focus:border-[#B79B76] focus:ring-2 focus:ring-[#B79B76]/15';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  language, onLanguageChange, completedCount, session, onSessionChange
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const metadata = session?.user.user_metadata ?? {};
  const [name, setName] = useState(String(metadata.display_name ?? ''));
  const [location, setLocation] = useState(String(metadata.location ?? ''));
  const [bio, setBio] = useState(String(metadata.bio ?? ''));
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(metadata.unit_system === 'imperial' ? 'imperial' : 'metric');
  const [notificationsEnabled, setNotificationsEnabled] = useState(metadata.notifications_enabled !== false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const current = session?.user.user_metadata ?? {};
    setName(String(current.display_name ?? ''));
    setLocation(String(current.location ?? ''));
    setBio(String(current.bio ?? ''));
    setUnitSystem(current.unit_system === 'imperial' ? 'imperial' : 'metric');
    setNotificationsEnabled(current.notifications_enabled !== false);
  }, [session?.user.id, session?.user.user_metadata]);

  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (authMode === 'recover') {
        await authService.sendPasswordReset(email.trim());
        setNotice('Se l’indirizzo è registrato, riceverai un link per reimpostare la password.');
      } else if (authMode === 'signup') {
        if (password.length < 8) throw new Error('La password deve contenere almeno 8 caratteri.');
        const result = await authService.signUp(email.trim(), password, displayName.trim());
        if (result.session) {
          onSessionChange(result.session);
          setNotice('Account creato e accesso effettuato.');
        } else {
          setNotice('Account creato. Controlla la tua email e conferma l’indirizzo prima di accedere.');
          setAuthMode('login');
        }
      } else {
        const nextSession = await authService.signIn(email.trim(), password);
        onSessionChange(nextSession);
        setNotice('Accesso effettuato.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore.');
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!session) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const updated = await authService.updateProfile(session, {
        display_name: name.trim(),
        location: location.trim(),
        bio: bio.trim(),
        unit_system: unitSystem,
        notifications_enabled: notificationsEnabled,
        preferred_language: language
      });
      onSessionChange(updated);
      setNotice('Profilo e preferenze salvati.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile salvare il profilo.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!session) return;
    if (newPassword.length < 8) {
      setError('La nuova password deve contenere almeno 8 caratteri.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const updated = await authService.updatePassword(session, newPassword);
      onSessionChange(updated);
      setNewPassword('');
      setNotice('Password aggiornata.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile aggiornare la password.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut(session);
    onSessionChange(null);
    setNotice('Hai effettuato la disconnessione.');
  };

  const tools = [
    'Sega ad affondamento con binario guida',
    'Fresatrice verticale da 1400W',
    'Levigatrice rotorbitale 150mm',
    'Banco sega di precisione',
    'Trapano a percussione / Avvitatore a impulsi',
    'Livella laser rotante a 360°',
    'Maschera foratura Kreg Jig',
    'Pialletto a filo e spessore da banco',
    'Saldatrice TIG per telai ferro',
    'Frattone veneziano in acciaio inox'
  ];
  const [toolsInventory, setToolsInventory] = useState<boolean[]>(() => tools.map((_, i) => i !== 7 && i !== 8));

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {!session ? (
        <section className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E5DFD5] shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#26343B] text-[#B79B76] flex items-center justify-center mx-auto mb-5">
            <User className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#26343B] text-center">
            {authMode === 'signup' ? 'Crea il tuo account' : authMode === 'recover' ? 'Recupera la password' : 'Bentornato'}
          </h1>
          <p className="text-sm text-[#26343B]/65 text-center mt-2 mb-6">
            {authMode === 'signup' ? 'Salva i tuoi progetti e le tue preferenze.' : authMode === 'recover' ? 'Ti invieremo un link per reimpostare la password.' : 'Accedi per ritrovare i tuoi progetti e le tue impostazioni.'}
          </p>
          <form onSubmit={submitAuth} className="space-y-3">
            {authMode === 'signup' && (
              <label className="block">
                <span className="text-xs font-semibold text-[#26343B] block mb-1.5">Nome da visualizzare</span>
                <input className={fieldClass} value={displayName} onChange={e => setDisplayName(e.target.value)} autoComplete="name" required maxLength={60} placeholder="Il tuo nome" />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-semibold text-[#26343B] block mb-1.5">Email</span>
              <span className="relative block"><Mail className="absolute left-3 top-3.5 w-4 h-4 text-[#8F7451]" /><input className={fieldClass + ' pl-10'} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="nome@email.it" /></span>
            </label>
            {authMode !== 'recover' && (
              <label className="block">
                <span className="text-xs font-semibold text-[#26343B] block mb-1.5">Password</span>
                <span className="relative block"><Lock className="absolute left-3 top-3.5 w-4 h-4 text-[#8F7451]" /><input className={fieldClass + ' pl-10'} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} required minLength={8} placeholder="Almeno 8 caratteri" /></span>
              </label>
            )}
            {error && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{error}</p>}
            {notice && <p role="status" className="text-sm text-[#26343B] bg-[#B79B76]/15 rounded-xl p-3">{notice}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#26343B] text-[#F5F1E9] font-semibold py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
              {busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}
              {authMode === 'signup' ? 'Crea account' : authMode === 'recover' ? 'Invia link di recupero' : 'Accedi'}
            </button>
          </form>
          <div className="flex flex-col items-center gap-3 mt-5 text-sm">
            {authMode === 'login' && <button className="text-[#8F7451] font-semibold" onClick={() => { setAuthMode('recover'); setError(''); setNotice(''); }}>Password dimenticata?</button>}
            {authMode !== 'signup' ? <button className="text-[#26343B]/70" onClick={() => { setAuthMode('signup'); setError(''); setNotice(''); }}>Non hai un account? <strong className="text-[#8F7451]">Registrati</strong></button> : <button className="text-[#26343B]/70" onClick={() => { setAuthMode('login'); setError(''); setNotice(''); }}>Hai già un account? <strong className="text-[#8F7451]">Accedi</strong></button>}
            {authMode === 'recover' && <button className="text-[#26343B]/70" onClick={() => { setAuthMode('login'); setError(''); setNotice(''); }}>Torna all’accesso</button>}
          </div>
        </section>
      ) : (
        <>
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full bg-[#26343B] text-[#F5F1E9] border-4 border-[#FAF8F5] shadow-md flex items-center justify-center font-serif text-3xl font-bold">
                {(name || session.user.email || 'U').trim().charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif text-3xl font-bold text-[#26343B]">{name || 'Il tuo profilo'}</h1>
                  <span className="text-xs bg-[#FAF8F5] text-[#8F7451] font-bold px-3 py-1 rounded-full">PIANO FREE</span>
                </div>
                <p className="text-sm text-[#26343B]/65 mt-1">{session.user.email}</p>
                <p className="text-xs text-[#26343B]/55 mt-2">Account personale FaiDaTeCasa</p>
              </div>
              <button onClick={handleSignOut} className="rounded-xl border border-[#E5DFD5] px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-[#FAF8F5]"><LogOut className="w-4 h-4" /> Esci</button>
            </div>
            <div className="mt-7 pt-6 border-t border-[#F0EBE1] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl text-center"><span className="text-[10px] uppercase font-bold text-[#26343B]/60 block">Progetti completati</span><span className="font-serif text-2xl font-bold">{completedCount}</span></div>
              <div className="p-4 bg-[#FAF8F5] rounded-2xl text-center"><span className="text-[10px] uppercase font-bold text-[#26343B]/60 block">Livello</span><span className="font-serif text-xl font-bold">Iniziale</span></div>
              <div className="p-4 bg-[#FAF8F5] rounded-2xl text-center"><span className="text-[10px] uppercase font-bold text-[#26343B]/60 block">Abbonamento</span><span className="font-serif text-xl font-bold">Free</span></div>
              <div className="p-4 bg-[#FAF8F5] rounded-2xl text-center"><span className="text-[10px] uppercase font-bold text-[#26343B]/60 block">Account</span><span className="font-serif text-xl font-bold">Attivo</span></div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold flex items-center gap-2 pb-3 border-b border-[#F0EBE1]"><User className="w-5 h-5 text-[#B79B76]" /> Dati personali</h2>
            <label className="block"><span className="text-xs font-semibold block mb-1.5">Nome</span><input className={fieldClass} value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Come vuoi essere chiamato" /></label>
            <label className="block"><span className="text-xs font-semibold block mb-1.5">Località</span><input className={fieldClass} value={location} onChange={e => setLocation(e.target.value)} maxLength={100} placeholder="Es. Milano, Italia" /></label>
            <label className="block"><span className="text-xs font-semibold block mb-1.5">Presentazione</span><textarea className={fieldClass + ' min-h-24 resize-y'} value={bio} onChange={e => setBio(e.target.value)} maxLength={500} placeholder="Racconta qualcosa di te e dei tuoi progetti..." /></label>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs space-y-5">
            <h2 className="font-serif text-xl font-bold flex items-center gap-2 pb-3 border-b border-[#F0EBE1]"><Settings className="w-5 h-5 text-[#B79B76]" /> Preferenze</h2>
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-[#26343B]/70" /><div><span className="text-sm font-semibold block">Lingua</span><span className="text-xs text-[#26343B]/60">Lingua dell’interfaccia</span></div></div>
              <select className="rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] px-3 py-2 text-sm" value={language} onChange={e => onLanguageChange(e.target.value as Language)}><option value="it">Italiano</option><option value="en">English</option></select>
            </div>
            <div className="flex items-center justify-between gap-4 py-3 border-t border-[#F0EBE1]">
              <div className="flex items-center gap-3"><Ruler className="w-5 h-5 text-[#26343B]/70" /><div><span className="text-sm font-semibold block">Unità di misura</span><span className="text-xs text-[#26343B]/60">Sistema metrico o pollici</span></div></div>
              <div className="flex bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-1"><button onClick={() => setUnitSystem('metric')} className={`px-3 py-2 text-xs font-semibold rounded-lg ${unitSystem === 'metric' ? 'bg-[#26343B] text-white' : 'text-[#26343B]/60'}`}>Metrico</button><button onClick={() => setUnitSystem('imperial')} className={`px-3 py-2 text-xs font-semibold rounded-lg ${unitSystem === 'imperial' ? 'bg-[#26343B] text-white' : 'text-[#26343B]/60'}`}>Pollici</button></div>
            </div>
            <div className="flex items-center justify-between gap-4 py-3 border-t border-[#F0EBE1]">
              <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-[#26343B]/70" /><div><span className="text-sm font-semibold block">Notifiche aggiornamento guide</span><span className="text-xs text-[#26343B]/60">Preferenza salvata nel tuo account</span></div></div>
              <button type="button" role="switch" aria-checked={notificationsEnabled} aria-label="Attiva notifiche" onClick={() => setNotificationsEnabled(v => !v)} className={`w-12 h-6 rounded-full relative p-0.5 transition-colors ${notificationsEnabled ? 'bg-[#26343B]' : 'bg-[#E5DFD5]'}`}><span className={`block w-5 h-5 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} /></button>
            </div>
            <button onClick={saveProfile} disabled={saving} className="w-full rounded-xl bg-[#26343B] text-[#F5F1E9] font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-60"><Save className="w-4 h-4" /> {saving ? 'Salvataggio...' : 'Salva profilo e preferenze'}</button>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs space-y-3">
            <h2 className="font-serif text-xl font-bold flex items-center gap-2 pb-3 border-b border-[#F0EBE1]"><Hammer className="w-5 h-5 text-[#B79B76]" /> Attrezzatura del laboratorio</h2>
            <p className="text-xs text-[#26343B]/60">Seleziona gli strumenti che possiedi. La sincronizzazione cloud dell’inventario sarà aggiunta in una fase successiva.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{tools.map((tool, index) => <button key={tool} onClick={() => setToolsInventory(prev => prev.map((value, i) => i === index ? !value : value))} className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs ${toolsInventory[index] ? 'bg-[#FAF8F5] border-[#B79B76]/40' : 'border-[#E5DFD5] text-[#26343B]/50'}`}><span className={`w-5 h-5 rounded-md flex items-center justify-center ${toolsInventory[index] ? 'bg-[#26343B] text-white' : 'border border-[#E5DFD5]'}`}>{toolsInventory[index] ? <Check className="w-3 h-3" /> : null}</span>{tool}</button>)}</div>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs space-y-3">
            <h2 className="font-serif text-xl font-bold flex items-center gap-2"><KeyRound className="w-5 h-5 text-[#B79B76]" /> Sicurezza account</h2>
            <label className="block"><span className="text-xs font-semibold block mb-1.5">Nuova password</span><input className={fieldClass} type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Almeno 8 caratteri" /></label>
            <button onClick={changePassword} disabled={saving || newPassword.length < 8} className="rounded-xl border border-[#E5DFD5] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Aggiorna password</button>
          </section>
        </>
      )}

      {(error || notice) && session && <p role={error ? 'alert' : 'status'} className={`rounded-xl p-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-[#B79B76]/15 text-[#26343B]'}`}>{error || notice}</p>}
      <div className="bg-[#26343B] text-[#F5F1E9] rounded-3xl p-6 sm:p-8 border border-[#37474F] shadow-lg">
        <span className="text-xs uppercase tracking-widest text-[#B79B76] font-bold block mb-2">Filosofia FaiDaTeCasa</span>
        <h3 className="font-serif text-2xl font-bold mb-3">“Progetta, costruisci, rinnova.”</h3>
        <p className="text-sm text-[#F5F1E9]/80 leading-relaxed">Uno spazio per dare forma alle tue idee, organizzare i lavori e imparare a realizzare progetti per la casa.</p>
        <div className="mt-5 text-[11px] text-[#F5F1E9]/50 font-mono">FaiDaTeCasa · Progetta, costruisci, rinnova</div>
      </div>
    </div>
  );
};
