import styles from "./DataList.module.css";

export function DataListToolbar({
  searchable,
  query,
  onQueryChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  totalItems,
}) {
  const handleQueryChange = (e) => onQueryChange(e.target.value);
  const handlePageSizeChange = (e) =>
    onPageSizeChange(Number(e.target.value));

  return (
    <div className={styles.toolbar}>
      {searchable && (
        <div className={styles.searchWrapper}>
          <input
            type="search"
            className={styles.search}
            placeholder="Buscar…"
            value={query}
            onChange={handleQueryChange}
          />
        </div>
      )}

      <div className={styles.toolbarRight}>
        <span className={styles.counter}>
          {totalItems} resultado{totalItems === 1 ? "" : "s"}
        </span>

        <label className={styles.pageSizeLabel}>
          Mostrar
          <select
            className={styles.pageSize}
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
