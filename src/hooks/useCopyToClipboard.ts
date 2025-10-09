// src/hooks/useCopyToClipboard.ts

import { useState } from 'react';

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>; // Return success

/**
 * Hook personalizado para copiar texto al portapapeles.
 * @returns [copiedText, copy] donde 'copy' es la función para copiar.
 */
export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = async (text) => {
    if (!navigator.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    // Try to save to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  };

  return [copiedText, copy];
}
