import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { ImportProgress, TimerSnapshot } from "../types";

export function useNativeEvents(
  actions: Record<string, () => void>,
  flush: () => Promise<void>,
  onTimer: (timer: TimerSnapshot) => void,
  onMessage: (message: string) => void,
  refresh: () => Promise<void>,
) {
  const current = useRef({ actions, flush, refresh });
  current.current = { actions, flush, refresh };
  useEffect(() => {
    let active = true;
    const cleanups: (() => void)[] = [];
    const register = (promise: Promise<() => void>) => {
      void promise
        .then((dispose) => {
          if (active) cleanups.push(dispose);
          else dispose();
        })
        .catch((error) => onMessage(String(error)));
    };
    register(
      listen<TimerSnapshot>("timer://tick", ({ payload }) => onTimer(payload)),
    );
    register(
      listen<ImportProgress>("import://progress", ({ payload }) =>
        onMessage(
          `Importing ${payload.completed}/${payload.total}: ${payload.filename}`,
        ),
      ),
    );
    register(
      listen<string>("menu://action", ({ payload }) =>
        current.current.actions[payload]?.(),
      ),
    );
    register(
      listen("notes://changed", () => {
        void current.current
          .refresh()
          .catch((error) => onMessage(String(error)));
      }),
    );
    const prepare = async (quit = false) => {
      try {
        await current.current.flush();
        if (quit) current.current.actions["quit-ready"]?.();
        else await getCurrentWindow().hide();
      } catch (error) {
        onMessage(`Save failed; window stays open: ${String(error)}`);
      }
    };
    register(
      listen("lifecycle://quit", () => {
        void prepare(true);
      }),
    );
    register(
      getCurrentWindow().onCloseRequested((event) => {
        event.preventDefault();
        void prepare();
      }),
    );
    return () => {
      active = false;
      cleanups.forEach((dispose) => dispose());
    };
  }, [onMessage, onTimer]);
}
