'use client';

export default function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 shadow-lg min-w-[300px]">
        {children}
        <button className="mt-4 text-sm underline" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
