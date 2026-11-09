/**
 * Phát âm tiếng Trung bằng Web Speech API (SPEC M3). Không gọi mạng; nếu có file
 * /audio/*.mp3 thì ưu tiên file. Không hiện UI — trả kết quả để màn hình quyết định toast.
 */
export type SpeakResult = 'ok' | 'no-voice' | 'unsupported' | 'error';

interface SpeakOptions {
  /** 0.6–1.0 (Settings.ttsRate). */
  rate?: number;
  /** URI giọng người dùng đã chọn trong Cài đặt. */
  voiceURI?: string;
  /** File dự phòng, VD "/audio/w_nihao.mp3" (Word.audio). */
  audioUrl?: string;
}

const synth = () => (typeof window !== 'undefined' ? window.speechSynthesis : undefined);

export const isTtsSupported = () => synth() !== undefined;

/**
 * Chọn giọng zh-CN tốt nhất: đúng URI người dùng chọn → giọng local zh-CN → zh-CN bất kỳ
 * → zh bất kỳ (zh-TW/zh-HK vẫn đọc được chữ giản thể). Hàm thuần, test được.
 */
export function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  preferredURI?: string,
): SpeechSynthesisVoice | undefined {
  const zh = voices.filter((v) => /^zh\b/i.test(v.lang.replace('_', '-')));
  const cn = zh.filter(
    (v) => /^zh[-_]?(cn|hans)?$/i.test(v.lang.replace('_', '-')) || /CN/i.test(v.lang),
  );
  return (
    voices.find((v) => v.voiceURI === preferredURI) ??
    cn.find((v) => v.localService) ??
    cn[0] ??
    zh.find((v) => v.localService) ??
    zh[0]
  );
}

/** Danh sách giọng; Chrome nạp bất đồng bộ nên đợi `voiceschanged` (tối đa ~1.5s). */
export function getVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const s = synth();
  if (!s) return Promise.resolve([]);
  const now = s.getVoices();
  if (now.length > 0) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      s.removeEventListener('voiceschanged', done);
      clearTimeout(timer);
      resolve(s.getVoices());
    };
    const timer = setTimeout(done, timeoutMs);
    s.addEventListener('voiceschanged', done);
  });
}

/** Giọng zh để hiển thị trong Cài đặt. */
export async function listChineseVoices(): Promise<SpeechSynthesisVoice[]> {
  return (await getVoices()).filter((v) => /^zh/i.test(v.lang));
}

function playAudio(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.addEventListener('ended', () => resolve(true), { once: true });
    audio.addEventListener('error', () => resolve(false), { once: true });
    audio.play().catch(() => resolve(false));
  });
}

/** Đọc `text` (zh-CN). Hủy câu đang đọc dở trước khi đọc câu mới. */
export async function speak(text: string, options: SpeakOptions = {}): Promise<SpeakResult> {
  if (options.audioUrl && (await playAudio(options.audioUrl))) return 'ok';
  const s = synth();
  if (!s) return 'unsupported';
  const voice = pickVoice(await getVoices(), options.voiceURI);
  if (!voice) return 'no-voice';
  s.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = options.rate ?? 0.8;
    u.onend = () => resolve('ok');
    u.onerror = (e) =>
      resolve(e.error === 'interrupted' || e.error === 'canceled' ? 'ok' : 'error');
    s.speak(u);
  });
}

export const stopSpeaking = () => synth()?.cancel();
