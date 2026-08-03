import { GridConfig } from "../config/GridConfig";
import { CellPosition } from "../models/CellPosition";
import { CellRange } from "../models/CellRange";
import type { SelectionType } from "../models/SelectionType";

export class SelectionManager {
  private selectionRange: CellRange | null;
  private selectionType: SelectionType;

  constructor() {
    this.selectionRange = null;
    this.selectionType = "Cell";
  }

  public selectCell(rowIndex: number, columnIndex: number): void {
    const position = new CellPosition(rowIndex, columnIndex);
    this.selectionRange = new CellRange(position, position);
    this.selectionType = "Cell";
  }

  public selectRange(start: CellPosition, end: CellPosition) {
    this.selectionRange = new CellRange(start, end);
    this.selectionType = "Cell";
  }

  public getSelectionRange(): CellRange | null {
    return this.selectionRange;
  }

  public clearSelection(): void {
    this.selectionRange = null;
  }

  public getSelectionType(): SelectionType {
    return this.selectionType;
  }

  public selectRow(rowIndex: number): void {
    this.selectionType = "Row";
    this.selectionRange = new CellRange(
      new CellPosition(rowIndex, 0),
      new CellPosition(rowIndex, GridConfig.COLUMN_COUNT - 1),
    );
  }

  public selectColumn(columnIndex: number): void {
    this.selectionType = "Column";
    this.selectionRange = new CellRange(
      new CellPosition(0, columnIndex),
      new CellPosition(GridConfig.ROW_COUNT - 1, columnIndex),
    );
  }
}
