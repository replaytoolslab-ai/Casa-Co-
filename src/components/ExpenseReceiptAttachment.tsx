import React, { useEffect, useState } from 'react';
import { FileImage, Upload, Trash2, ExternalLink } from 'lucide-react';

interface Props { projectId: string; expenseId: number; }
const databaseName = 'casa-co-receipts';
const storeName = 'attachments';

function openReceiptDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('Archivio locale non disponibile')); return; }
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Impossibile aprire archivio'));
  });
}


export async function deleteExpenseReceiptAttachment(projectId: string, expenseId: number): Promise<void> {
  const db = await openReceiptDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(projectId + ':' + expenseId);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export const ExpenseReceiptAttachment: React.FC<Props> = ({ projectId, expenseId }) => {
  const key = projectId + ':' + expenseId;
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let currentUrl = '';
    openReceiptDatabase().then(async (db) => {
      const record = await new Promise<{ blob: Blob; name: string } | undefined>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const request = transaction.objectStore(storeName).get(key);
        request.onsuccess = () => resolve(request.result as { blob: Blob; name: string } | undefined);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
      });
      return record;
    }).then((record) => {
      if (active && record) {
        currentUrl = URL.createObjectURL(record.blob);
        setFileUrl(currentUrl);
        setFileName(record.name || 'Ricevuta allegata');
      }
    }).catch(() => { if (active) setError('Non è stato possibile leggere l’allegato su questo dispositivo.'); });
    return () => { active = false; if (currentUrl) URL.revokeObjectURL(currentUrl); };
  }, [key]);

  const saveFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError('File troppo grande: il limite è 8 MB.'); return; }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') { setError('Carica un’immagine o un PDF.'); return; }
    try {
      const db = await openReceiptDatabase();
      const stored = new Blob([file], { type: file.type });
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).put({ blob: stored, name: file.name }, key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      db.close();
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(stored)); setFileName(file.name); setError('');
    } catch { setError('Salvataggio non riuscito. Controlla lo spazio disponibile nel dispositivo.'); }
  };

  const removeFile = async () => {
    try {
      const db = await openReceiptDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      db.close();
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(''); setFileName(''); setError('');
    } catch { setError('Non è stato possibile eliminare l’allegato.'); }
  };

  return <div className="flex flex-wrap items-center gap-2 text-[10px]">
    <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#E5DFD5] bg-white px-2.5 py-2 font-semibold text-[#26343B] hover:border-[#B79B76]">
      {fileUrl ? <FileImage className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
      {fileUrl ? 'Sostituisci allegato' : 'Allega foto / PDF'}
      <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(event) => { void saveFile(event.target.files?.[0]); event.currentTarget.value = ''; }} />
    </label>
    {fileUrl && <><a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-[170px] items-center gap-1 truncate text-[#8F7451] underline"><ExternalLink className="h-3 w-3 shrink-0" />{fileName}</a><button type="button" onClick={() => void removeFile()} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#8F7451] hover:bg-[#EAE4D8]"><Trash2 className="h-3 w-3" /> Rimuovi</button></>}
    {error && <span className="w-full text-red-700">{error}</span>}
  </div>;
};
