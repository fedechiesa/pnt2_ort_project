import styles from "./DataList.module.css";
import { DataListCard } from "./DataListCard.jsx";

export function DataListGrid({
  loading,
  emptyText,
  rows,
  columns,
  actions,
  onRowClick,
  imageAccessor,
  hideImage = false,
}) {
  if (loading) {
    return <div className={styles.stateMessage}>Cargando…</div>;
  }

  if (!loading && rows.length === 0) {
    return <div className={styles.stateMessage}>{emptyText}</div>;
  }

  return (
    <div className={styles.grid}>
      {rows.map((row, index) => (
        <DataListCard
          key={row.id ?? index}
          row={row}
          columns={columns}
          actions={actions}
          onClick={onRowClick}
          imageAccessor={imageAccessor}
          hideImage={hideImage}
        />
      ))}
    </div>
  );
}
