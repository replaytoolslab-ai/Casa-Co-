import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Calculator, Euro } from 'lucide-react';

type CostKind = 'material' | 'labor' | 'equipment';

interface CostRow {
  id: number;
  kind: CostKind;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  actualUnitPrice: number | null;
}

interface ProjectCostCalculatorProps {
  projectId: string;
  initialArea?: number;
}

const makeRow = (id: number, kind: CostKind = 'material'): CostRow => ({
  id,
  kind,
  description: '',
  quantity: 1,
  unit: kind === 'labor' ? 'ore' : 'pz',
  unitPrice: 0,
  actualUnitPrice: null,
});

const currency = (value: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

export const ProjectCostCalculator: React.FC<ProjectCostCalculatorProps> = ({ projectId, initialArea = 0 }) => {
  const storageKey = 'casa-co:project-costs:' + projectId;
  const [rows, setRows] = useState<CostRow[]>(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && Array.isArray(parsed.rows)) return parsed.rows as CostRow[];
    } catch { /* fallback to initial rows */ }
    return [
    { ...makeRow(1, 'material'), description: 'Materiale principale', quantity: initialArea > 0 ? initialArea : 1, unit: initialArea > 0 ? 'm²' : 'pz' },
    makeRow(2, 'labor'),
    makeRow(3, 'equipment'),
    ];
  });
  const [vatRate, setVatRate] = useState(() => {
    try { const saved = window.localStorage.getItem(storageKey); return saved ? Number(JSON.parse(saved).vatRate) || 0 : 0; } catch { return 0; }
  });
  const [contingencyRate, setContingencyRate] = useState(() => {
    try { const saved = window.localStorage.getItem(storageKey); return saved ? Number(JSON.parse(saved).contingencyRate) || 0 : 0; } catch { return 0; }
  });
  const [nextId, setNextId] = useState(() => {
    try { const saved = window.localStorage.getItem(storageKey); return saved ? Number(JSON.parse(saved).nextId) || 4 : 4; } catch { return 4; }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ rows, vatRate, contingencyRate, nextId }));
    } catch (error) {
      console.warn('Casa&Co: impossibile salvare il computo su questo dispositivo.', error);
    }
  }, [storageKey, rows, vatRate, contingencyRate, nextId]);

  const totals = useMemo(() => {
    const byKind = {
      material: 0,
      labor: 0,
      equipment: 0,
    };
    rows.forEach((row) => {
      const amount = Math.max(0, Number(row.quantity) || 0) * Math.max(0, Number(row.unitPrice) || 0);
      byKind[row.kind] += amount;
    });
    const subtotal = byKind.material + byKind.labor + byKind.equipment;
    const contingency = subtotal * Math.max(0, contingencyRate) / 100;
    const taxable = subtotal + contingency;
    const vat = taxable * Math.max(0, vatRate) / 100;
    const trackedRows = rows.filter((row) => row.actualUnitPrice !== null && Number.isFinite(row.actualUnitPrice));
    const trackedBudget = trackedRows.reduce((sum, row) => sum + Math.max(0, Number(row.quantity) || 0) * Math.max(0, row.unitPrice || 0), 0);
    const actualSubtotal = trackedRows.reduce((sum, row) => sum + Math.max(0, Number(row.quantity) || 0) * Math.max(0, Number(row.actualUnitPrice) || 0), 0);
    const actualContingency = actualSubtotal * Math.max(0, contingencyRate) / 100;
    const actualVat = (actualSubtotal + actualContingency) * Math.max(0, vatRate) / 100;
    const actualTotal = actualSubtotal + actualContingency + actualVat;
    const variance = actualSubtotal - trackedBudget;
    return { ...byKind, subtotal, contingency, vat, total: taxable + vat, trackedRows: trackedRows.length, trackedBudget, actualSubtotal, actualTotal, variance };
  }, [rows, vatRate, contingencyRate]);

  const updateRow = (id: number, patch: Partial<CostRow>) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const addRow = (kind: CostKind) => {
    setRows((current) => [...current, makeRow(nextId, kind)]);
    setNextId((value) => value + 1);
  };

  const kindLabel: Record<CostKind, string> = {
    material: 'Materiale',
    labor: 'Manodopera',
    equipment: 'Attrezzatura / noleggio',
  };

  return (
    <section className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-5">
      <div className="flex items-start gap-3 pb-3 border-b border-[#F0EBE1]">
        <span className="p-2 rounded-xl bg-[#EAE4D8] text-[#8F7451]"><Calculator className="w-5 h-5" /></span>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#8F7451]">Strumento di progetto</span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26343B]">Computo metrico e preventivo</h3>
          <p className="text-xs text-[#26343B]/65 mt-1">Inserisci quantità e prezzi reali: i totali si aggiornano automaticamente.</p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-2 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8]">
            <label className="col-span-2 sm:col-span-3 text-[10px] font-semibold text-[#26343B]/65">
              Voce
              <input value={row.description} onChange={(event) => updateRow(row.id, { description: event.target.value })} placeholder="Es. primer, posa..." className="mt-1 w-full min-w-0 rounded-lg border border-[#E5DFD5] bg-white px-2.5 py-2 text-xs text-[#26343B] outline-none focus:border-[#B79B76]" />
            </label>
            <label className="col-span-2 sm:col-span-3 text-[10px] font-semibold text-[#26343B]/65">
              Categoria
              <select value={row.kind} onChange={(event) => updateRow(row.id, { kind: event.target.value as CostKind, unit: event.target.value === 'labor' ? 'ore' : row.unit })} className="mt-1 w-full rounded-lg border border-[#E5DFD5] bg-white px-2 py-2 text-xs text-[#26343B]">
                <option value="material">Materiale</option>
                <option value="labor">Manodopera</option>
                <option value="equipment">Attrezzatura / noleggio</option>
              </select>
            </label>
            <label className="text-[10px] font-semibold text-[#26343B]/65">
              Quantità
              <input type="number" min="0" step="0.01" value={row.quantity} onChange={(event) => updateRow(row.id, { quantity: Number(event.target.value) })} className="mt-1 w-full min-w-0 rounded-lg border border-[#E5DFD5] bg-white px-2 py-2 text-xs text-[#26343B]" />
            </label>
            <label className="text-[10px] font-semibold text-[#26343B]/65">
              Unità
              <input value={row.unit} onChange={(event) => updateRow(row.id, { unit: event.target.value })} placeholder="pz, kg..." className="mt-1 w-full min-w-0 rounded-lg border border-[#E5DFD5] bg-white px-2 py-2 text-xs text-[#26343B]" />
            </label>
            <label className="col-span-1 sm:col-span-2 text-[10px] font-semibold text-[#26343B]/65">
              Preventivo €/unità
              <input type="number" min="0" step="0.01" value={row.unitPrice} onChange={(event) => updateRow(row.id, { unitPrice: Number(event.target.value) })} className="mt-1 w-full min-w-0 rounded-lg border border-[#E5DFD5] bg-white px-2 py-2 text-xs text-[#26343B]" />
            </label>
            <label className="col-span-1 sm:col-span-2 text-[10px] font-semibold text-[#26343B]/65">
              Effettivo €/unità
              <input type="number" min="0" step="0.01" placeholder="Da registrare" value={row.actualUnitPrice ?? ''} onChange={(event) => updateRow(row.id, { actualUnitPrice: event.target.value === '' ? null : Number(event.target.value) })} className="mt-1 w-full min-w-0 rounded-lg border border-[#E5DFD5] bg-white px-2 py-2 text-xs text-[#26343B]" />
            </label>
            <div className="col-span-1 sm:col-span-1 flex items-end justify-between sm:justify-end gap-2">
              <span className="text-xs font-bold text-[#26343B] pb-2">{currency(Math.max(0, row.quantity || 0) * Math.max(0, row.unitPrice || 0))}</span>
              <button type="button" aria-label="Rimuovi voce" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="p-2 rounded-lg text-[#8F7451] hover:bg-[#EAE4D8]"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['material', 'labor', 'equipment'] as CostKind[]).map((kind) => (
          <button key={kind} type="button" onClick={() => addRow(kind)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#26343B] hover:border-[#B79B76]">
            <Plus className="w-3.5 h-3.5" /> Aggiungi {kindLabel[kind].toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <label className="text-[11px] font-semibold text-[#26343B]/70">
          Imprevisti (%)
          <input type="number" min="0" max="100" step="0.5" value={contingencyRate} onChange={(event) => setContingencyRate(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#E5DFD5] bg-[#FAF8F5] px-3 py-2 text-sm text-[#26343B]" />
        </label>
        <label className="text-[11px] font-semibold text-[#26343B]/70">
          IVA (%)
          <input type="number" min="0" max="100" step="0.1" value={vatRate} onChange={(event) => setVatRate(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#E5DFD5] bg-[#FAF8F5] px-3 py-2 text-sm text-[#26343B]" />
        </label>
        <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#26343B] text-[#F5F1E9] p-3 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#DAC9B2]">Totale stimato</span>
          <strong className="font-serif text-2xl">{currency(totals.total)}</strong>
        </div>
      </div>

      <div className="rounded-xl border border-[#EAE4D8] overflow-hidden text-xs">
        <div className="flex justify-between px-3 py-2 bg-[#FAF8F5]"><span>Materiali</span><strong>{currency(totals.material)}</strong></div>
        <div className="flex justify-between px-3 py-2"><span>Manodopera</span><strong>{currency(totals.labor)}</strong></div>
        <div className="flex justify-between px-3 py-2 bg-[#FAF8F5]"><span>Attrezzature / noleggio</span><strong>{currency(totals.equipment)}</strong></div>
        <div className="flex justify-between px-3 py-2"><span>Subtotale</span><strong>{currency(totals.subtotal)}</strong></div>
        <div className="flex justify-between px-3 py-2 bg-[#FAF8F5]"><span>Fondo imprevisti</span><strong>{currency(totals.contingency)}</strong></div>
        <div className="flex justify-between px-3 py-2"><span>IVA (aliquota inserita)</span><strong>{currency(totals.vat)}</strong></div>
        <div className="flex justify-between px-3 py-3 bg-[#26343B] text-[#F5F1E9] font-bold"><span>Totale complessivo</span><strong>{currency(totals.total)}</strong></div>
      </div>
      <div className="rounded-2xl border border-[#E5DFD5] bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8F7451]">Controllo del budget</span>
            <h4 className="font-serif text-lg font-bold text-[#26343B]">Preventivo vs spesa effettiva</h4>
          </div>
          <span className="text-[10px] text-[#26343B]/60">{totals.trackedRows} voci consuntivate su {rows.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#FAF8F5] p-3"><span className="block text-[10px] text-[#26343B]/60">Preventivo comparabile</span><strong className="text-base">{currency(totals.trackedBudget)}</strong></div>
          <div className="rounded-xl bg-[#FAF8F5] p-3"><span className="block text-[10px] text-[#26343B]/60">Spesa effettiva</span><strong className="text-base">{currency(totals.actualSubtotal)}</strong></div>
          <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#26343B] text-white p-3"><span className="block text-[10px] text-white/70">Scostamento</span><strong className="text-base">{totals.variance > 0 ? '+' : totals.variance < 0 ? '−' : ''}{currency(Math.abs(totals.variance))}</strong><span className="block text-[10px] text-white/70">{totals.variance > 0 ? 'Spesa oltre il preventivo' : totals.variance < 0 ? 'Risparmio rispetto al preventivo' : 'In linea con il preventivo'}</span></div>
        </div>
        <p className="text-[10px] text-[#26343B]/55">Il confronto considera solo le righe per cui hai inserito un prezzo effettivo. Inserisci il costo reale per unità man mano che acquisti materiali o sostieni spese. Il totale stimato continua a includere IVA e imprevisti; il confronto qui sopra mostra i subtotali delle sole voci consuntivate.</p>
      </div>
      <p className="text-[10px] text-[#26343B]/55">Calcolo indicativo basato esclusivamente sui valori inseriti. IVA e aliquote dipendono dal tipo di intervento e dalla situazione fiscale: verifica l'applicabilità. I dati del computo vengono salvati automaticamente su questo dispositivo e restano separati per progetto.</p>
    </section>
  );
};
