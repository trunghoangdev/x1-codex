export type Row = {
  kind: "context" | "removed" | "added";
  text: string;
  old?: number;
  next?: number;
};
// Longest-common-subsequence diff over the small, complete fixture files.
export function diffLines(before: string[], after: string[]): Row[] {
  const lengths = Array.from({ length: before.length + 1 }, () =>
    Array(after.length + 1).fill(0),
  );
  for (let i = before.length - 1; i >= 0; i--)
    for (let j = after.length - 1; j >= 0; j--)
      lengths[i][j] =
        before[i] === after[j]
          ? 1 + lengths[i + 1][j + 1]
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
  const rows: Row[] = [];
  let i = 0,
    j = 0;
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      rows.push({ kind: "context", text: before[i], old: ++i, next: ++j });
    } else if (
      i < before.length &&
      (j === after.length || lengths[i + 1][j] >= lengths[i][j + 1])
    ) {
      rows.push({ kind: "removed", text: before[i], old: ++i });
    } else {
      rows.push({ kind: "added", text: after[j], next: ++j });
    }
  }
  return rows;
}

export function splitRows(rows: Row[]): { left?: Row; right?: Row }[] {
  const result: { left?: Row; right?: Row }[] = [];
  let i = 0;
  while (i < rows.length) {
    if (rows[i].kind === "context") {
      result.push({ left: rows[i], right: rows[i] });
      i++;
      continue;
    }
    const removed: Row[] = [],
      added: Row[] = [];
    while (i < rows.length && rows[i].kind !== "context") {
      const row = rows[i++];
      (row.kind === "removed" ? removed : added).push(row);
    }
    for (let n = 0; n < Math.max(removed.length, added.length); n++)
      result.push({ left: removed[n], right: added[n] });
  }
  return result;
}
