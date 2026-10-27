"use client";
import { useState, useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n/client";
import { studyText } from "@/lib/i18n/study";
import { exportStudyData, importStudyData, resetStudyData, setReadingGoal, useStudyData } from "@/lib/learning/store";

const subscribeClock = (fn: () => void) => { const timer = window.setInterval(fn, 60000); return () => window.clearInterval(timer); };
export function LearningDashboard({ lessons }: { lessons: { id: string; title: string; url: string }[] }) {
  const { locale, t, href } = useI18n();
  const s = (id: Parameters<typeof studyText>[1]) => studyText(locale, id);
  const { data, storageAvailable } = useStudyData();
  const now = useSyncExternalStore(subscribeClock, () => Math.floor(Date.now() / 60000), () => 0) * 60000;
  const [notice, setNotice] = useState("");
  const last = lessons.find(lesson => lesson.id === data.last);
  const saved = lessons.filter(lesson => data.records[lesson.id]?.bookmark);
  const studied = lessons.filter(lesson => data.records[lesson.id]);
  const weeklyReads = studied.filter(lesson => data.records[lesson.id].read && (data.records[lesson.id].readAt ?? 0) >= now - 7 * 86400000).length;
  const due = studied.filter(lesson => (data.records[lesson.id]?.due ?? Infinity) <= now);
  const list = (entries: typeof lessons) => <ul className="study-link-list">{entries.map(lesson => <li key={lesson.id}><a href={`${lesson.url}#${data.records[lesson.id]?.section ?? "definition"}`}>{lesson.title}<span aria-hidden="true"> →</span></a>{data.records[lesson.id]?.correct !== undefined && <small>{t("{score} of {count} answers correct", { score: data.records[lesson.id].correct!, count: data.records[lesson.id].total! })}</small>}</li>)}</ul>;
  return <div className="learning-dashboard"><p className="muted">{s("private")}</p>{!storageAvailable && <p role="status" className="alert notice">{s("unavailable")}</p>}{last && <section className="resume-card"><p className="eyebrow">{s("resume")}</p><h2><a href={`${last.url}#${data.records[last.id]?.section ?? "definition"}`}>{last.title} →</a></h2></section>}<section><h2>{s("due")}</h2><p className="muted">{s("dueHelp")}</p>{due.length ? list(due) : <p>{s("noDue")}</p>}<a className="button primary" href={href("/practice")}>{t("Practice")}</a></section><section><h2>{s("bookmarks")}</h2>{saved.length ? list(saved) : <p>{s("empty")}</p>}</section><details className="study-tools"><summary>{s("review")}</summary><p className="muted">{s("progressLimit")}</p>{list(studied)}<p>{new Intl.NumberFormat(locale).format(studied.filter(l => data.records[l.id].read).length)} · {s("read")}</p><p>{new Intl.NumberFormat(locale).format(studied.filter(l => data.records[l.id].practised).length)} · {s("practised")}</p></details><details className="study-tools"><summary>{s("weeklyGoal")}</summary><label className="study-actions">{s("weeklyGoal")}<select value={data.goal} onChange={event => setReadingGoal(Number(event.target.value))}><option value={0}>{s("noGoal")}</option>{[2,3,5,10].map(number => <option value={number} key={number}>{new Intl.NumberFormat(locale).format(number)}</option>)}</select></label>{data.goal > 0 && <p role="status">{new Intl.NumberFormat(locale).format(weeklyReads)} / {new Intl.NumberFormat(locale).format(data.goal)} ? {s("read")}</p>}</details><details className="study-tools"><summary>{s("tools")}</summary><div className="study-tools-body"><div className="study-actions"><button type="button" className="button secondary" onClick={exportStudyData}>{s("export")}</button><label className="import-backup">{s("import")}<input type="file" accept="application/json,.json" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; try { await importStudyData(file); setNotice(s("imported")); } catch { setNotice(s("invalid")); } event.target.value = ""; }} /></label></div><button type="button" className="text-link" onClick={() => { if (window.confirm(s("confirmReset"))) { resetStudyData(); setNotice(""); } }}>{s("reset")}</button><p role="status">{notice}</p></div></details></div>;
}
