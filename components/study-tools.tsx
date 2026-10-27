"use client";
import { OfflineLesson } from "@/components/offline-lesson";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { studyText } from "@/lib/i18n/study";
import { setReadingSize, updateLesson, useStudyData } from "@/lib/learning/store";

export function StudyTools({ id }: { id: string }) {
  const { locale, href } = useI18n();
  const s = (key: Parameters<typeof studyText>[1]) => studyText(locale, key);
  const { data, storageAvailable } = useStudyData();
  const record = data.records[id];
  const [notice, setNotice] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  useEffect(() => { document.documentElement.dataset.reading = data.large ? "large" : "standard"; }, [data.large]);
  return <details className="study-tools"><summary>{s("tools")}</summary><div className="study-tools-body"><p className="muted">{s("private")}</p><div className="study-actions"><label><input type="checkbox" checked={record?.read ?? false} onChange={e => updateLesson(id, { read: e.target.checked, readAt: e.target.checked ? Date.now() : undefined })} />{s("read")}</label><label><input type="checkbox" checked={record?.practised ?? false} onChange={e => updateLesson(id, { practised: e.target.checked })} />{s("practised")}</label><button type="button" className="button secondary" aria-pressed={record?.bookmark ?? false} onClick={() => updateLesson(id, { bookmark: !record?.bookmark })}>{s(record?.bookmark ? "savedLesson" : "bookmark")}</button></div><p className="muted">{s("progressLimit")}</p><div className="study-notes"><label htmlFor={`notes-${id}`}>{s("notes")}</label><textarea id={`notes-${id}`} name="notes" rows={4} maxLength={5000} value={notesDraft ?? record?.notes ?? ""} onChange={event => { setNotesDraft(event.target.value); setNotice(false); }} /><button type="button" className="button secondary save-study-notes" onClick={() => { updateLesson(id, { notes: notesDraft ?? record?.notes ?? "" }); setNotesDraft(null); setNotice(true); }}>{s("save")}</button></div><p role="status">{!storageAvailable ? s("unavailable") : notice ? s("saved") : ""}</p><div className="study-actions"><label>{s("reading")}<select value={data.large ? "large" : "standard"} onChange={e => setReadingSize(e.target.value === "large")}><option value="standard">{s("normal")}</option><option value="large">{s("large")}</option></select></label><button type="button" className="button secondary" onClick={() => window.print()}>{s("print")}</button><a className="text-link" href={href("/my-learning")}>{s("myLearning")} →</a></div><OfflineLesson /></div></details>;
}
