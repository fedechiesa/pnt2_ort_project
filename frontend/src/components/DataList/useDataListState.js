import { useMemo, useState } from "react";
import { normalizeForSort, safeGet } from "./utils.js";


export function useDataListState({ columns, data, initialPageSize }) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const normalizedColumns = useMemo(
    () =>
      columns.map((col) => {
        if (typeof col.accessor === "string") {
          const path = col.accessor;
          return {
            ...col,
            accessor: (row) => safeGet(row, path),
          };
        }
        return col;
      }),
    [columns]
  );

  const sortableColumns = useMemo(
    () => normalizedColumns.filter((c) => c.sortable),
    [normalizedColumns]
  );
  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      normalizedColumns.some((col) => {
        try {
          const value = col.accessor?.(row);
          return String(value ?? "").toLowerCase().includes(q);
        } catch {
          return false;
        }
      })
    );
  }, [data, query, normalizedColumns]);
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = normalizedColumns.find((c) => c.key === sortKey);
    if (!col) return filtered;

    const factor = sortDir === "asc" ? 1 : -1;
    const copy = [...filtered];

    copy.sort((a, b) => {
      const va = normalizeForSort(col.accessor?.(a));
      const vb = normalizeForSort(col.accessor?.(b));
      if (va < vb) return -1 * factor;
      if (va > vb) return 1 * factor;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir, normalizedColumns]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);
  const handleSetQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  const handleSetPageSize = (value) => {
    setPageSize(value);
    setPage(1);
  };

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    }
  };

  return {
    query,
    pageSize,
    page: currentPage,
    totalPages,
    filteredCount: filtered.length,
    pagedRows,
    sortableColumns,
    sortKey,
    sortDir,
    normalizedColumns,
    setQuery: handleSetQuery,
    setPageSize: handleSetPageSize,
    setPage,
    toggleSort,
  };
}
