"use client";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { studyText } from "@/lib/i18n/study";

export function LocalRecorder() {
  const { locale } = useI18n();
  const s = (id: Parameters<typeof studyText>[1]) => studyText(locale, id);
  const [status, setStatus] = useState<"idle" | "waiting" | "recording" | "error">("idle");
  const [clip, setClip] = useState<{ url: string; extension: string } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrl = useRef("");
  const mounted = useRef(true);
  const cancelled = useRef(false);
  const failed = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); if (recorder.current?.state === "recording") recorder.current.stop(); stream.current?.getTracks().forEach(track => track.stop()); if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }; }, []);
  function stop() { if (recorder.current?.state === "recording") recorder.current.stop(); stream.current?.getTracks().forEach(track => track.stop()); if (timer.current) clearTimeout(timer.current); }
  function clear() { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); objectUrl.current = ""; setClip(null); }
  async function start() {
    cancelled.current = false; failed.current = false; setStatus("waiting"); clear();
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Unavailable");
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (!mounted.current || cancelled.current) { audioStream.getTracks().forEach(track => track.stop()); if (mounted.current) setStatus("idle"); return; }
      stream.current = audioStream;
      const media = new MediaRecorder(audioStream); recorder.current = media;
      const chunks: BlobPart[] = [];
      media.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      media.onstop = () => {
        audioStream.getTracks().forEach(track => track.stop()); if (timer.current) clearTimeout(timer.current);
        if (!mounted.current) return;
        if (failed.current) { setStatus("error"); return; }
        const blob = new Blob(chunks, { type: media.mimeType });
        if (!blob.size) { setStatus("error"); return; }
        objectUrl.current = URL.createObjectURL(blob);
        setClip({ url: objectUrl.current, extension: media.mimeType.includes("mp4") ? "m4a" : media.mimeType.includes("ogg") ? "ogg" : "webm" }); setStatus("idle");
      };
      media.onerror = () => { failed.current = true; stop(); if (mounted.current) setStatus("error"); };
      media.start(); setStatus("recording"); timer.current = setTimeout(stop, 120000);
    } catch { stream.current?.getTracks().forEach(track => track.stop()); if (mounted.current) setStatus("error"); }
  }
  return <details className="study-tools local-recorder" onToggle={event => { if (!event.currentTarget.open) { cancelled.current = true; stop(); } }}><summary>{s("record")}</summary><div className="study-tools-body"><p>{s("recordHelp")}</p><div className="study-actions">{status === "recording" ? <button type="button" className="button primary" onClick={stop}>{s("stopRecord")}</button> : <button type="button" className="button secondary" disabled={status === "waiting"} onClick={start}>{s("startRecord")}</button>}{clip && <><a className="button secondary" href={clip.url} download={`tajweed101-recording.${clip.extension}`}>{s("downloadRecord")}</a><button type="button" className="text-link" onClick={clear}>{s("deleteRecord")}</button></>}</div><p role="status">{status === "recording" ? s("recording") : status === "waiting" ? s("waitingMic") : status === "error" ? s("micError") : ""}</p>{clip && <audio controls preload="metadata" src={clip.url} aria-label={s("record")} />}</div></details>;
}
