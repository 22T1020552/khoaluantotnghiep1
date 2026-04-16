const normalizeArea = (area?: string) => {
  const trimmed = (area ?? "").trim();
  if (trimmed.length === 0) {
    return "khu vực này";
  }

  return trimmed.toLowerCase().startsWith("khu vực") ? trimmed : `khu vực ${trimmed}`;
};

export const getForbiddenSectionMessage = (area?: string) => {
  return `Bạn không có quyền truy cập ${normalizeArea(area)}.`;
};

export const getPartialForbiddenSectionMessage = (area?: string) => {
  return `Một phần dữ liệu ở ${normalizeArea(area)} bị hạn chế quyền truy cập.`;
};
