/** Bộ nhớ bền (SPEC 15.2): xin trình duyệt không tự xóa IndexedDB. */

const storage = () => (typeof navigator !== 'undefined' ? navigator.storage : undefined);

/** Gọi sau bài học đầu tiên. Trả về true nếu đã được bảo vệ. */
export async function requestPersistentStorage(): Promise<boolean> {
  const s = storage();
  if (!s?.persist) return false;
  try {
    return (await s.persisted()) || (await s.persist());
  } catch {
    return false;
  }
}

export async function isStoragePersisted(): Promise<boolean> {
  const s = storage();
  if (!s?.persisted) return false;
  try {
    return await s.persisted();
  } catch {
    return false;
  }
}

/** Dung lượng đã dùng / hạn mức (byte); undefined nếu trình duyệt không cho biết. */
export async function estimateStorage(): Promise<{ usage: number; quota: number } | undefined> {
  const s = storage();
  if (!s?.estimate) return undefined;
  try {
    const { usage = 0, quota = 0 } = await s.estimate();
    return { usage, quota };
  } catch {
    return undefined;
  }
}
