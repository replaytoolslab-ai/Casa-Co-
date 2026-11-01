import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Archive, FileText, Image as ImageIcon, Upload, Download, Trash2, FolderOpen } from 'lucide-react';

type DocumentCategory = 'Preventivi' | 'Fatture' | 'Scontrini' | 'Garanzie' | 'Fornitori' | 'Progetti e schede' | 'Altro';
interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  category: DocumentCategory;
  mimeType: string;
  size: number;
  addedAt: string;
  blob: Blob;
}
interface DocumentView extends Omit<ProjectDocument, 'blob'> { url: string; }

const DB_NAME = 'casa-co-project-documents';
const STORE_NAME = 'documents';
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const categories: DocumentCategory[] = ['Preventivi', 'Fatture', 'Scontrini', 'Garanzie', 'Fornitori', 'Progetti e schede', 'Altro'];

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('Archivio locale non disponibile in questo browser.')); return; }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Impossibile aprire archivio documenti.'));
  });
}

export const ProjectDocumentArchive: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [documents, setDocuments] = useState<DocumentView[]>([]);
  const [category, setCategory] = useState<DocumentCategory>('Preventivi');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const urlsRef = useRef<string[]>([]);

  const refresh = useCallback(async () => {
    const db = await openDatabase();
    const records = await new Promise<ProjectDocument[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve((request.result as ProjectDocument[]).filter((item) => item.projectId === projectId).sort((a, b) => b.addedAt.localeCompare(a.addedAt)));
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));\n    const next = records.map(({ blob, ...item }) => ({ ...item, url: URL.createObjectURL(blob) }));\n    urlsRef.current = next.map((item) => item.url);\n    setDocuments(next);
  }, [projectId]);

  useEffect(() => {
    void refresh().catch(() => setError('Impossibile caricare i documenti salvati su questo dispositivo.'));
  }, [projectId, refresh]);

  useEffect(() => () => { urlsRef.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError('');
    try {
      const accepted = Array.from(files);
      for (const file of accepted) {
        if (file.size > MAX_FILE_SIZE) throw new Error(file.name + ': dimensione superiore a 15 MB.');
        if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) throw new Error(file.name + ': formato non supportato. Usa immagini o PDF.');
      }
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        accepted.forEach((file) => {
          const id = projectId + ':' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 9);
          store.add({ id, projectId, name: file.name, category, mimeType: file.type, size: file.size, addedAt: new Date().toISOString(), blob: new Blob([file], { type: file.type }) } satisfies ProjectDocument);
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      db.close();
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Salvataggio documenti non riuscito.');
    } finally { setBusy(false); }
  };

  const removeDocument = async (id: string) => {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      db.close();
      setDocuments((current) => {
        const removed = current.find((item) => item.id === id);
        if (removed) URL.revokeObjectURL(removed.url);
        return current.filter((item) => item.id !== id);
      });
    } catch { setError('Non è stato possibile eliminare il documento.'); }
  };

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? (bytes / 1024).toFixed(0) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB';

  return <section className="rounded-3xl border border-[#E5DFD5] bg-white p-5 sm:p-7 shadow-xs space-y-5">
    <div className="flex items-center gap-3 border-b border-[#F0EBE1] pb-4">
      <span className="rounded-xl bg-[#EAE4D8] p-2.5 text-[#8F7451]"><Archive className="h-5 w-5" /></span>
      <div><span className="block text-[10px] uppercase tracking-wider font-bold text-[#8F7451]">Documentazione cantiere</span><h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26343B]">Archivio documenti</h3><p className="mt-1 text-xs text-[#26343B]/60">Raccogli preventivi, fatture, scontrini, garanzie e schede dei fornitori.</p></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 rounded-2xl bg-[#FAF8F5] p-4">
      <label className="text-[10px] font-semibold text-[#26343B]/70">Classifica documento
        <select value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory)} className="mt-1 w-full rounded-xl border border-[#E5DFD5] bg-white px-3 py-2.5 text-xs text-[#26343B]">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="inline-flex cursor-pointer items-center justify-center gap-2 self-end rounded-xl bg-[#26343B] px-4 py-3 text-xs font-bold text-white hover:bg-[#1A242A]">
        <Upload className="h-4 w-4" /> {busy ? 'Salvataggio…' : 'Carica documenti'}
        <input type="file" multiple accept="image/*,application/pdf" disabled={busy} className="sr-only" onChange={(event) => { void addFiles(event.target.files); event.currentTarget.value = ''; }} />
      </label>
    </div>
    <p className="text-[10px] text-[#26343B]/55">Formati accettati: immagini e PDF. Massimo 15 MB per file. I documenti sono conservati localmente in questo browser e non vengono caricati su un server né sincronizzati con altri dispositivi.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    <div className="flex items-center justify-between"><h4 className="text-sm font-bold text-[#26343B]">Documenti del progetto</h4><span className="rounded-full bg-[#EAE4D8] px-2.5 py-1 text-[10px] font-bold text-[#8F7451]">{documents.length}</span></div>
    {documents.length ? <div className="space-y-2">{documents.map((item) => <article key={item.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-[#EAE4D8] bg-[#FAF8F5] p-3">
      <span className="rounded-lg bg-white p-2 text-[#8F7451]">{item.mimeType === 'application/pdf' ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}</span>
      <div className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#26343B]">{item.name}</strong><p className="mt-1 text-[10px] text-[#26343B]/55">{item.category} · {formatSize(item.size)} · {new Date(item.addedAt).toLocaleDateString('it-IT')}</p></div>
      <a href={item.url} target="_blank" rel="noreferrer" aria-label={'Apri ' + item.name} className="rounded-lg p-2 text-[#8F7451] hover:bg-[#EAE4D8]"><FolderOpen className="h-4 w-4" /></a>
      <a href={item.url} download={item.name} aria-label={'Scarica ' + item.name} className="rounded-lg p-2 text-[#8F7451] hover:bg-[#EAE4D8]"><Download className="h-4 w-4" /></a>
      <button type="button" onClick={() => void removeDocument(item.id)} aria-label={'Elimina ' + item.name} className="rounded-lg p-2 text-[#8F7451] hover:bg-[#EAE4D8]"><Trash2 className="h-4 w-4" /></button>
    </article>)}</div> : <div className="rounded-2xl border border-dashed border-[#D9D0C2] px-4 py-8 text-center"><Archive className="mx-auto h-7 w-7 text-[#B79B76]" /><p className="mt-2 text-sm font-semibold text-[#26343B]">Nessun documento archiviato</p><p className="mt-1 text-xs text-[#26343B]/55">Carica il primo documento per questo progetto.</p></div>}
  </section>;
};
