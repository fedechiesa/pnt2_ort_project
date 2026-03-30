import styles from "./DataList.module.css";

export function DataListPagination({ page, totalPages, onPageChange }) {
  const go = (next) => {
    if (next < 1 || next > totalPages) return;
    onPageChange(next);
  };

  return (
    <div className={styles.pagination}>
      <button type="button" onClick={() => go(1)} disabled={page === 1}>
        «
      </button>
      <button type="button" onClick={() => go(page - 1)} disabled={page === 1}>
        ‹
      </button>

      <span className={styles.pageInfo}>
        Página {page} de {totalPages}
      </span>

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
      >
        ›
      </button>
      <button
        type="button"
        onClick={() => go(totalPages)}
        disabled={page === totalPages}
      >
        »
      </button>
    </div>
  );
}
