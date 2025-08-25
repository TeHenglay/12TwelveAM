'use client';

import { useState } from 'react';

export default function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-8 right-8 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
      <button className="ml-2 text-xs underline" onClick={() => setVisible(false)}>Close</button>
    </div>
  );
}
