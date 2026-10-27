"use client";
import { useSyncExternalStore } from "react";

export type StudyRecord = { read?: boolean; readAt?: number; practised?: boolean; bookmark?: boolean; notes?: string; section?: string; updated: number; due?: number; correct?: number; total?: number };
export type QuizSession = { ids: string[]; current: number; answers: Record<string, number>; confidence?: Record<string, number>; completed: boolean };
type StudyData = { version: 1; records: Record<string, StudyRecord>; sessions: Record<string, QuizSession>; last?: string; large: boolean; goal: number };
const empty: StudyData = { version: 1, records: {}, sessions: {}, large: false, goal: 0 };
const key = "tajweed-study-v1";
let data = empty;
let loaded = false;
let storageAvailable = true;
const listeners = new Set<() => void>();
const safeId = /^[a-z][a-z0-9-]{0,100}$/;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const safeTime = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 9999999999999;

/** Strict, bounded allow-list parsing. Imported data is never assigned to HTML or arbitrary object properties. */
export function parseBackup(value: unknown): StudyData {
  if (!object(value) || value.version !== 1 || !object(value.records) || Object.keys(value.records).length > 100) throw new Error("Invalid backup");
  const records: Record<string, StudyRecord> = {};
  for (const [id, entry] of Object.entries(value.records)) {
    if (!safeId.test(id) || !object(entry) || !safeTime(entry.updated)) throw new Error("Invalid record");
    if (["read", "practised", "bookmark"].some(k => entry[k] !== undefined && typeof entry[k] !== "boolean") || entry.notes !== undefined && (typeof entry.notes !== "string" || entry.notes.length > 5000) || entry.section !== undefined && (typeof entry.section !== "string" || !safeId.test(entry.section)) || entry.due !== undefined && !safeTime(entry.due)) throw new Error("Invalid record");
    const record: StudyRecord = { updated: entry.updated };
    for (const field of ["read", "practised", "bookmark"] as const) if (typeof entry[field] === "boolean") record[field] = entry[field];
    if (typeof entry.notes === "string") record.notes = entry.notes;
    if (typeof entry.section === "string") record.section = entry.section;
    if (safeTime(entry.due)) record.due = entry.due;
    if (safeTime(entry.readAt)) record.readAt = entry.readAt;
    if (Number.isInteger(entry.total) && Number.isInteger(entry.correct) && Number(entry.total) <= 1000 && Number(entry.correct) >= 0 && Number(entry.correct) <= Number(entry.total)) { record.total = Number(entry.total); record.correct = Number(entry.correct); }
    records[id] = record;
  }
  const sessions: Record<string, QuizSession> = {};
  if (object(value.sessions) && Object.keys(value.sessions).length <= 80) for (const [id, session] of Object.entries(value.sessions)) {
    if (!safeId.test(id) || !object(session) || !Array.isArray(session.ids) || !session.ids.length || session.ids.length > 200 || session.ids.some(v => typeof v !== "string" || !safeId.test(v)) || new Set(session.ids).size !== session.ids.length || !object(session.answers) || !Number.isInteger(session.current) || Number(session.current) < 0 || Number(session.current) >= session.ids.length || typeof session.completed !== "boolean") continue;
    const answers: Record<string, number> = {};
    for (const [q, answer] of Object.entries(session.answers)) if (session.ids.includes(q) && Number.isInteger(answer) && Number(answer) >= 0 && Number(answer) < 10) answers[q] = Number(answer);
    sessions[id] = { ids: session.ids as string[], current: Number(session.current), answers, completed: session.completed && session.ids.every(q => q in answers) };
    const sessionIds = sessions[id].ids;
    if (object(session.confidence)) sessions[id].confidence = Object.fromEntries(Object.entries(session.confidence).filter(([q, score]) => sessionIds.includes(q) && Number.isInteger(score) && Number(score) >= 0 && Number(score) <= 2)) as Record<string, number>;
  }
  return { version: 1, records, sessions, large: value.large === true, goal: [2,3,5,10].includes(Number(value.goal)) ? Number(value.goal) : 0, ...(typeof value.last === "string" && safeId.test(value.last) ? { last: value.last } : {}) };
}
function read() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try { const raw = localStorage.getItem(key); if (raw && raw.length < 1000000) data = parseBackup(JSON.parse(raw)); }
    catch { storageAvailable = false; }
  }
  return data;
}
function publish(next: StudyData) {
  data = next;
  try { localStorage.setItem(key, JSON.stringify(data)); storageAvailable = true; } catch { storageAvailable = false; }
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) { loaded = false; data = empty; read(); listeners.forEach(fn => fn()); } };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
export function useStudyData() { const snapshot = useSyncExternalStore(subscribe, read, () => empty); return { data: snapshot, storageAvailable }; }
export function updateLesson(id: string, change: Partial<StudyRecord>) {
  if (!safeId.test(id)) return;
  const current = read();
  publish({ ...current, last: id, records: { ...current.records, [id]: { ...current.records[id], ...change, updated: Date.now() } } });
}
export function saveSession(id: string, session: QuizSession) {
  const current = read();
  const sessions = { ...current.sessions, [id]: session };
  if (Object.keys(sessions).length > 80) delete sessions[Object.keys(sessions)[0]];
  publish({ ...current, sessions });
}
export function recordAttempt(lesson: string, correct: number, total: number) { updateLesson(lesson, { correct, total, due: Date.now() + (correct === total ? 3 : 1) * 86400000 }); }
export function setReadingSize(large: boolean) { publish({ ...read(), large }); }
export function setReadingGoal(goal: number) { publish({ ...read(), goal: [2,3,5,10].includes(goal) ? goal : 0 }); }
export function exportStudyData() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(read(), null, 2)], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = "tajweed101-study-backup.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function importStudyData(file: File) {
  if (file.size > 1000000) throw new Error("Invalid backup");
  const imported = parseBackup(JSON.parse(await file.text()));
  publish(mergeBackup(read(), imported));
}
export function mergeBackup(current: StudyData, imported: StudyData): StudyData {
  const records = { ...current.records };
  for (const [id, record] of Object.entries(imported.records)) if (!records[id] || record.updated >= records[id].updated) records[id] = record;
  if (Object.keys(records).length > 100) throw new Error("Too many records");
  const sessions = Object.fromEntries(Object.entries({ ...imported.sessions, ...current.sessions }).slice(-80));
  return { ...current, records, sessions, large: imported.large, goal: imported.goal, ...(imported.last && records[imported.last] ? { last: imported.last } : {}) };
}
export function resetStudyData() { publish({ ...empty, records: {}, sessions: {} }); }
