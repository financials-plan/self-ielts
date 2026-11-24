import { LISTENING_LESSONS_CATALOG } from "./listeningCatalog";
import { parseAudioClipRef, type ListeningSegment } from "./listeningEngine";

export function stopSpeechPlayback(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore speech synthesis errors on unsupported environments
  }
}

export function speakListeningSegment(
  segment: Pick<ListeningSegment, "text" | "accent">,
  rate: number = 1.0,
  onEnd?: () => void
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    const timer = globalThis.setTimeout(() => onEnd?.(), 1200);
    return () => globalThis.clearTimeout(timer);
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.lang = segment.accent;
    utterance.rate = Math.max(0.7, Math.min(1.3, rate));

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang.toLowerCase() === segment.accent.toLowerCase()) ??
      voices.find((v) => v.lang.toLowerCase().startsWith("en-"));
    if (preferred) {
      utterance.voice = preferred;
    }

    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      onEnd?.();
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);

    return () => {
      ended = true;
      stopSpeechPlayback();
    };
  } catch {
    onEnd?.();
    return () => {};
  }
}

export function resolveAudioClipFromRef(audioClipRef: string | null | undefined) {
  const parsed = parseAudioClipRef(audioClipRef);
  if (!parsed) return null;
  const lesson = LISTENING_LESSONS_CATALOG.find((l) => l.id === parsed.lessonId);
  if (!lesson) return null;
  const segment = lesson.segments.find((s) => s.id === parsed.segmentId);
  if (!segment) return null;
  return {
    lessonTitle: lesson.title,
    partNumber: lesson.partNumber,
    segment,
    parsed,
  };
}
