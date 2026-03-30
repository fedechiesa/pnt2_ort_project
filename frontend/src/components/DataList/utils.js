export function safeGet(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

export function normalizeForSort(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return String(value).toLowerCase();
}

export function renderCell(col, row) {
  const value = col.accessor?.(row);
  return col.render ? col.render(value, row) : value ?? "—";
}

export function resolveImage(row, imageAccessor) {
  if (!imageAccessor) return null;
  if (typeof imageAccessor === "string") {
    return safeGet(row, imageAccessor);
  }
  return imageAccessor(row);
}
