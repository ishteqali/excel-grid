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
    const column = new ColumnModel(columnIndex, "id", validWidth); // Todo: after completing dataloading and cell selection will implement cell resizing
    this.columns.set(columnIndex, column);
  }
}
