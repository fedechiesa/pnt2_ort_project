import { useDataListState } from "./useDataListState.js";
import { DataListToolbar } from "./DataListToolbar.jsx";
import { DataListGrid } from "./DataListGrid.jsx";
import { DataListPagination } from "./DataListPagination.jsx";
import styles from "./DataList.module.css";


export default function DataList(props) {
  const {
    columns = [],
    data = [],
    loading = false,
    searchable = true,
    emptyText = "No hay datos para mostrar.",
    pageSizeOptions = [6, 12, 24],
    initialPageSize = 6,
    actions,
    onRowClick,
    imageAccessor,
    hideImage = false,
  } = props;

  const state = useDataListState({
    columns,
    data,
    initialPageSize,
  });

  const {
    query,
    pageSize,
    page,
    totalPages,
    filteredCount,
    pagedRows,
    sortableColumns,
    setQuery,
    setPageSize,
    setPage,
    toggleSort,
    sortKey,
    sortDir,
    normalizedColumns,
  } = state;

  return (
    <div className={styles.wrapper}>
      <DataListToolbar
        searchable={searchable}
        query={query}
        onQueryChange={setQuery}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={pageSizeOptions}
        totalItems={filteredCount}
      />
      
      <div className={styles.sortRow}>
        {sortableColumns.map((col) => {
          const active = sortKey === col.key;
          return (
            <button
              key={col.key}
              type="button"
              className={`${styles.sortChip} ${active ? styles.sortChipActive : ""}`}
              onClick={() => toggleSort(col.key)}
            >
              <span>{col.header}</span>
              {active && (
                <span className={styles.sortIcon}>
                  {sortDir === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <DataListGrid
        loading={loading}
        emptyText={emptyText}
        rows={pagedRows}
        columns={normalizedColumns}
        actions={actions}
        onRowClick={onRowClick}
        imageAccessor={imageAccessor}
        hideImage={hideImage}
      />

      <DataListPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
