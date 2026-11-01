import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Trash2, AlertCircle } from 'lucide-react';

type DeadlineKind = 'Fattura' | 'Pagamento' | 'Consegna' | 'Garanzia' | 'Altro';
interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  kind: DeadlineKind;
  amount: number | null;
  completed: boolean;
  createdAt: string;
}

const kinds: DeadlineKind[] = ['Fattura', 'Pagamento', 'Consegna', 'Garanzia', 'Altro'];
const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const weekdays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const storageKey = (projectId: string) => 'casa-co:project-deadlines:' + projectId;
const localDateKey = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const formatDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const ProjectDeadlineCalendar: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [items, setItems] = useState<DeadlineItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey(projectId)) || '[]') as DeadlineItem[]; }
    catch { return []; }
  });
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(localDateKey(new Date()));
  const [kind, setKind] = useState<DeadlineKind>('Pagamento');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(storageKey(projectId), JSON.stringify(items)); }
    catch { /* Keep the current session usable if browser storage is full. */ }
  }, [items, projectId]);

  const today = localDateKey(new Date());
  const firstDayOffset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarCells = useMemo(() => {
    const cells: Array<string | null> = Array(firstDayOffset).fill(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(localDateKey(new Date(month.getFullYear(), month.getMonth(), day)));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [firstDayOffset, daysInMonth, month]);

  const upcoming = [...items].filter((item) => !item.completed).sort((a, b) => a.date.localeCompare(b.date));
  const completedCount = items.filter((item) => item.completed).length;
  const currency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const addItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !date) return;
    setItems((current) => [...current, {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: title.trim(), date, kind, amount: amount.trim() === '' ? null : Math.max(0, Number(amount)),
      completed: false, createdAt: new Date().toISOString(),
    }].sort((a, b) => a.date.localeCompare(b.date)));
    setTitle(''); setAmount(''); setShowForm(false);
  };

  const toggleItem = (id: string) => setItems((current) => current.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));

  return (
    <section className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5DFD5] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-[#EAE4D8] text-[#8F7451]"><CalendarDays className="w-5 h-5" /></span>
          <div><h3 className="font-serif text-xl font-bold text-[#26343B]">Scadenze e pagamenti</h3><p className="text-xs text-[#26343B]/60">Fatture, rate, consegne e garanzie del progetto</p></div>
        </div>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#26343B] text-white px-3 py-2 text-xs font-semibold hover:bg-[#37474F]"><Plus className="w-4 h-4" /> Aggiungi scadenza</button>
      </div>

      {showForm && <form onSubmit={addItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] p-3">
        <label className="text-xs font-semibold text-[#26343B]/70 sm:col-span-2">Descrizione
          <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Es. Saldo fattura elettricista" className="mt-1 w-full rounded-lg border border-[#E5DFD5] bg-white px-3 py-2 text-sm text-[#26343B]" />
        </label>
        <label className="text-xs font-semibold text-[#26343B]/70">Data
          <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-lg border border-[#E5DFD5] bg-white px-3 py-2 text-sm text-[#26343B]" />
        </label>
        <label className="text-xs font-semibold text-[#26343B]/70">Tipo
          <select value={kind} onChange={(event) => setKind(event.target.value as DeadlineKind)} className="mt-1 w-full rounded-lg border border-[#E5DFD5] bg-white px-3 py-2 text-sm text-[#26343B]">{kinds.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="text-xs font-semibold text-[#26343B]/70 sm:col-span-2">Importo (€) — facoltativo
          <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" className="mt-1 w-full rounded-lg border border-[#E5DFD5] bg-white px-3 py-2 text-sm text-[#26343B]" />
        </label>
        <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 rounded-lg text-xs text-[#26343B]/70">Annulla</button><button type="submit" className="px-4 py-2 rounded-lg bg-[#B79B76] text-white text-xs font-bold">Salva scadenza</button></div>
      </form>}

      <div className="rounded-xl border border-[#EAE4D8] p-3 space-y-3">
        <div className="flex items-center justify-between"><button type="button" aria-label="Mese precedente" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} className="p-2 rounded-lg hover:bg-[#FAF8F5]"><ChevronLeft className="w-4 h-4" /></button><strong className="text-sm text-[#26343B]">{monthNames[month.getMonth()]} {month.getFullYear()}</strong><button type="button" aria-label="Mese successivo" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))} className="p-2 rounded-lg hover:bg-[#FAF8F5]"><ChevronRight className="w-4 h-4" /></button></div>
        <div className="grid grid-cols-7 gap-1">{weekdays.map((day) => <div key={day} className="text-center text-[10px] font-bold text-[#26343B]/50 py-1">{day}</div>)}
          {calendarCells.map((cell, index) => {
            const count = cell ? items.filter((item) => item.date === cell && !item.completed).length : 0;
            const isToday = cell === today;
            return <div key={cell || 'empty-' + index} className={'min-h-10 rounded-lg flex flex-col items-center justify-center text-xs ' + (cell ? 'bg-[#FAF8F5]' : '') + (isToday ? ' ring-2 ring-[#B79B76] font-bold' : '')}>
              {cell && <><span className="text-[#26343B]">{Number(cell.slice(-2))}</span>{count > 0 && <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#B79B76]" />}</>}
            </div>;
          })}
        </div>
        <p className="text-[10px] text-[#26343B]/50">Il bordo indica oggi; i punti indicano scadenze ancora aperte.</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-lg bg-[#FAF8F5] px-3 py-2 text-[#26343B]"><strong>{upcoming.length}</strong> aperte</span><span className="rounded-lg bg-[#FAF8F5] px-3 py-2 text-[#26343B]"><strong>{completedCount}</strong> completate</span><span className="rounded-lg bg-[#FAF8F5] px-3 py-2 text-[#26343B]"><strong>{upcoming.filter((item) => item.date < today).length}</strong> in ritardo</span></div>

      {items.length === 0 ? <div className="text-center py-5 text-xs text-[#26343B]/55"><CalendarDays className="w-7 h-7 mx-auto mb-2 opacity-40" />Nessuna scadenza inserita. Aggiungi la prima fattura, rata o consegna.</div> :
        <div className="space-y-2">{[...items].sort((a, b) => a.date.localeCompare(b.date)).map((item) => {
          const overdue = !item.completed && item.date < today;
          return <div key={item.id} className={'flex items-center gap-2 rounded-xl border p-3 ' + (item.completed ? 'border-[#EAE4D8] bg-[#FAF8F5]/60 opacity-70' : overdue ? 'border-amber-200 bg-amber-50/50' : 'border-[#EAE4D8] bg-white')}>
            <button type="button" onClick={() => toggleItem(item.id)} aria-label={item.completed ? 'Riapri scadenza' : 'Segna come completata'} className="shrink-0 text-[#8F7451]">{item.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}</button>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className={'text-xs text-[#26343B] ' + (item.completed ? 'line-through' : '')}>{item.title}</strong><span className="text-[10px] rounded-full bg-[#EAE4D8] px-2 py-0.5 text-[#6F5B40]">{item.kind}</span>{overdue && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700"><AlertCircle className="w-3 h-3" />In ritardo</span>}</div><p className="text-[10px] text-[#26343B]/55 mt-1">{formatDate(item.date)}{item.amount !== null ? ' · ' + currency(item.amount) : ''}</p></div>
            <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Elimina scadenza" className="shrink-0 p-2 rounded-lg text-[#8F7451] hover:bg-[#EAE4D8]"><Trash2 className="w-4 h-4" /></button>
          </div>;
        })}</div>}
      <p className="text-[10px] text-[#26343B]/45">Dati salvati in questo browser e dispositivo. Le scadenze non inviano ancora notifiche automatiche.</p>
    </section>
  );
};
