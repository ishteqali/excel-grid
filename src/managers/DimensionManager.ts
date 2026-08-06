import { GridConfig } from "../config/GridConfig";
import { ColumnModel } from "../models/ColumnModel";
import { RowModel } from "../models/RowModel";

export class DimensionManager {
  private readonly rows: Map<number, RowModel>;
  private readonly columns: Map<number, ColumnModel>;
  constructor() {
    this.rows = new Map<number, RowModel>();
    this.columns = new Map<number, ColumnModel>();
  }

  public getRowHeight(rowIndex: number): number {
    const row = this.rows.get(rowIndex);
    if (!row) {
      return GridConfig.DEFAULT_ROW_HEIGHT;
    }
    return row.getHeight();
  }

  public getColumnWidth(columnIndex: number): number {
    const column = this.columns.get(columnIndex);
    if (!column) {
      return GridConfig.DEFAULT_COLUMN_WIDTH;
    }
    return column.getWidth();
  }

  public setRowHeight(rowIndex: number, height: number): void {
    const validHeight = Math.max(height, GridConfig.MIN_ROW_HEIGHT);
    if (validHeight === GridConfig.DEFAULT_ROW_HEIGHT) {
      this.rows.delete(rowIndex);
      return;
    }
    const existingRow = this.rows.get(rowIndex);
    if (existingRow) {
      existingRow.setHeight(validHeight);
      return;
    }
    const row = new RowModel(rowIndex, height);
    this.rows.set(rowIndex, row);
  }

  public setColumnWidth(columnIndex: number, width: number): void {
    const validWidth = Math.max(width, GridConfig.MIN_COLUMN_WIDTH);
    if (validWidth === GridConfig.DEFAULT_COLUMN_WIDTH) {
      this.columns.delete(columnIndex);
      return;
    }
    const existingColumn = this.columns.get(columnIndex);
    if (existingColumn) {
      existingColumn.setWidth(validWidth);
      return;
    }
    const column = new ColumnModel(columnIndex, "id", validWidth);
    this.columns.set(columnIndex, column);
  }

  public getColumnX(columnIndex: number) {
    let x = columnIndex * GridConfig.DEFAULT_COLUMN_WIDTH;
    for (const [index, column] of this.columns) {
      if (index >= columnIndex) {
        continue;
      }
      x += column.getWidth() - GridConfig.DEFAULT_COLUMN_WIDTH;
    }
    return x;
  }

  public getRowY(rowIndex: number) {
    let y = rowIndex * GridConfig.DEFAULT_ROW_HEIGHT;
    for (const [index, row] of this.rows) {
      if (index >= rowIndex) {
        continue;
      }
      y += row.getHeight() - GridConfig.DEFAULT_ROW_HEIGHT;
    }
    return y;
  }

  public getResizeColumnAtPosition(
    mouseX: number,
    firstVisibleColumn: number,
    visibleColumnCount: number,
  ): number | null {
    const lastVisibleColumn = Math.min(
      firstVisibleColumn + visibleColumnCount,
      GridConfig.COLUMN_COUNT,
    );

    for (
      let column = firstVisibleColumn;
      column < lastVisibleColumn;
      column++
    ) {
      const rightBorder = this.getColumnX(column) + this.getColumnWidth(column);
      const distance = Math.abs(mouseX - rightBorder);

      if (distance <= GridConfig.COLUMN_RESIZE_MARGIN) {
        return column;
      }
    }
    return null;
  }

  public getColumnAtOffset(offset: number): number {
    let estimatedColumn = Math.floor(offset / GridConfig.DEFAULT_COLUMN_WIDTH);

    estimatedColumn = Math.max(
      0,
      Math.min(estimatedColumn, GridConfig.COLUMN_COUNT - 1),
    );

    while (estimatedColumn > 0 && this.getColumnX(estimatedColumn) > offset) {
      estimatedColumn--;
    }

    while (
      estimatedColumn < GridConfig.COLUMN_COUNT - 1 &&
      this.getColumnX(estimatedColumn) + this.getColumnWidth(estimatedColumn) <=
        offset
    ) {
      estimatedColumn++;
    }

    return estimatedColumn;
  }

  public getRowAtOffset(offset: number): number {
    let estimatedRow = Math.floor(offset / GridConfig.DEFAULT_ROW_HEIGHT);

    estimatedRow = Math.max(
      0,
      Math.min(estimatedRow, GridConfig.ROW_COUNT - 1),
    );

    while (estimatedRow > 0 && this.getRowY(estimatedRow) > offset) {
      estimatedRow--;
    }

    while (
      estimatedRow < GridConfig.ROW_COUNT - 1 &&
      this.getRowY(estimatedRow) + this.getRowHeight(estimatedRow) <= offset
    ) {
      estimatedRow++;
    }

    return estimatedRow;
  }

  public getResizeRowAtPosition(
    mouseY: number,
    firstVisibleRow: number,
    visibleRowCount: number,
  ) {
    const lastVisibleRow = Math.min(
      firstVisibleRow + visibleRowCount,
      GridConfig.ROW_COUNT,
    );

    for (let row = firstVisibleRow; row < lastVisibleRow; row++) {
      const bottomBorder = this.getRowY(row) + this.getRowHeight(row);
      const distance = Math.abs(mouseY - bottomBorder);

      if (distance <= GridConfig.ROW_RESIZE_MARGIN) {
        return row;
      }
    }
    return null;
  }

  public getTotalWidth(): number {
    let width = GridConfig.COLUMN_COUNT * GridConfig.DEFAULT_COLUMN_WIDTH;

    for (const column of this.columns.values()) {
      width += column.getWidth() - GridConfig.DEFAULT_COLUMN_WIDTH;
    }

    return width;
  }

  public getTotalHeight(): number {
    let height = GridConfig.ROW_COUNT * GridConfig.DEFAULT_ROW_HEIGHT;

    for (const row of this.rows.values()) {
      height += row.getHeight() - GridConfig.DEFAULT_ROW_HEIGHT;
    }

    return height;
  }
}
