"use client";
import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { studyText } from "@/lib/i18n/study";
import { LocalRecorder } from "@/components/local-recorder";
import { recitation } from "@/lib/audio";

export function ListeningStudio() {
  const { locale, t } = useI18n();
  const s = (key: Parameters<typeof studyText>[1]) => studyText(locale, key);
  const [loop, setLoop] = useState(false);
  const [error, setError] = useState(false);
  const player = useRef<HTMLAudioElement>(null);
  return <div className="listening-studio"><p className="hero-lede">{s("audioHelp")}</p><section><h2>{s("audio")}</h2><audio ref={player} controls preload="none" loop={loop} aria-label={s("audio")} onError={() => setError(true)} src={recitation.src} /><label className="study-actions"><input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} />{s("loop")}</label>{error && <p role="status">{s("audioError")}</p>}<p><a href="https://quran.com/1" target="_blank" rel="noreferrer">{t("Quran text and verse references must be checked against a reliable text source.")} ↗</a></p><details><summary>{s("rights")}</summary><p><bdi lang="en">{recitation.publisher} · {recitation.reciter}</bdi></p><p><a href={recitation.source} target="_blank" rel="noreferrer">{t("Open source")}</a> · <a href={recitation.permission} target="_blank" rel="noreferrer">{s("rights")}</a></p></details></section><ol className="listening-steps"><li><h2>{t("Listen for one target")}</h2><p>{t("Before pressing play, choose one quality to listen for. After listening, describe what you noticed and ask a teacher to confirm whether your observation matches the intended target.")}</p></li><li><h2>{t("Try, then get feedback")}</h2><p>{t("Recite slowly, repeat, and ask your teacher what to adjust.")}</p></li></ol><LocalRecorder /></div>;
}
