import { useCallback, useEffect, useRef, useState } from "react";

export type DialogRequest = {
  label: string;
  initial: string;
  confirm: boolean;
};
export function useDialog() {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const resolve = useRef<((value: string | null) => void) | null>(null);
  const finish = useCallback((value: string | null) => {
    resolve.current?.(value);
    resolve.current = null;
    setRequest(null);
  }, []);
  const ask = useCallback((label: string, initial = "", confirm = false) => {
    resolve.current?.(null);
    return new Promise<string | null>((done) => {
      resolve.current = done;
      setRequest({ label, initial, confirm });
    });
  }, []);
  useEffect(
    () => () => {
      resolve.current?.(null);
    },
    [],
  );
  return {
    request,
    finish,
    prompt: ask,
    confirm: async (label: string) => (await ask(label, "", true)) !== null,
  };
}
