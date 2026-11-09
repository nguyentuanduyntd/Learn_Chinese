import { afterEach, describe, expect, it, vi as mock } from 'vitest';
import { canVibrate, vibrate } from './haptics';
import { playSfx } from './sfx';
import { estimateStorage, isStoragePersisted, requestPersistentStorage } from './storage';
import { isTtsSupported, pickVoice, speak } from './tts';

const voice = (lang: string, localService: boolean, voiceURI = lang): SpeechSynthesisVoice =>
  ({ lang, localService, voiceURI, name: voiceURI, default: false }) as SpeechSynthesisVoice;

afterEach(() => {
  Reflect.deleteProperty(navigator, 'vibrate');
  Reflect.deleteProperty(navigator, 'storage');
  Reflect.deleteProperty(window, 'speechSynthesis');
});

describe('tts.pickVoice', () => {
  const voices = [
    voice('en-US', true),
    voice('zh-TW', true, 'tw'),
    voice('zh-CN', false, 'cn-cloud'),
    voice('zh-CN', true, 'cn-local'),
  ];

  it('ưu tiên URI người dùng chọn, rồi zh-CN local, rồi zh-CN, rồi zh khác', () => {
    expect(pickVoice(voices, 'cn-cloud')?.voiceURI).toBe('cn-cloud');
    expect(pickVoice(voices)?.voiceURI).toBe('cn-local');
    expect(pickVoice(voices.filter((v) => v.voiceURI !== 'cn-local'))?.voiceURI).toBe('cn-cloud');
    expect(pickVoice([voices[0], voices[1]])?.voiceURI).toBe('tw');
  });

  it('không có giọng zh → undefined; hiểu định dạng zh_CN', () => {
    expect(pickVoice([voices[0]])).toBeUndefined();
    expect(pickVoice([voice('zh_CN', true, 'u')])?.voiceURI).toBe('u');
  });
});

describe('tts.speak', () => {
  it('không có speechSynthesis → "unsupported"', async () => {
    expect(isTtsSupported()).toBe(false);
    expect(await speak('你好')).toBe('unsupported');
  });

  it('có speechSynthesis nhưng không có giọng zh → "no-voice", không gọi speak', async () => {
    const speakFn = mock.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { getVoices: () => [voice('en-US', true)], speak: speakFn, cancel: mock.fn() },
    });
    expect(await speak('你好')).toBe('no-voice');
    expect(speakFn).not.toHaveBeenCalled();
  });
});

describe('haptics', () => {
  it('không hỗ trợ → false, không ném lỗi', () => {
    expect(canVibrate()).toBe(false);
    expect(vibrate('correct')).toBe(false);
  });

  it('hỗ trợ → gọi navigator.vibrate với mẫu đúng; tắt trong cài đặt → không gọi', () => {
    const fn = mock.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: fn });
    expect(vibrate('wrong')).toBe(true);
    expect(fn).toHaveBeenCalledWith([30, 40, 30]);
    expect(vibrate('tap', false)).toBe(false);
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('sfx', () => {
  it('jsdom không có AudioContext → bỏ qua êm', () => {
    expect(() => playSfx('correct')).not.toThrow();
    expect(() => playSfx('wrong', false)).not.toThrow();
  });
});

describe('storage', () => {
  it('không có navigator.storage → false / undefined', async () => {
    expect(await requestPersistentStorage()).toBe(false);
    expect(await isStoragePersisted()).toBe(false);
    expect(await estimateStorage()).toBeUndefined();
  });

  it('có API → xin persist khi chưa được bảo vệ', async () => {
    const persist = mock.fn(async () => true);
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: {
        persisted: async () => false,
        persist,
        estimate: async () => ({ usage: 10, quota: 100 }),
      },
    });
    expect(await requestPersistentStorage()).toBe(true);
    expect(persist).toHaveBeenCalledOnce();
    expect(await estimateStorage()).toEqual({ usage: 10, quota: 100 });
  });
});
