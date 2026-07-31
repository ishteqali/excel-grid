import { CellPosition } from "../models/CellPosition";
import { CellRange } from "../models/CellRange";

export class SelectionManager {
  private selectionRange: CellRange | null;
  constructor() {
    this.selectionRange = null;
  }

  public selectCell(rowIndex: number, columnIndex: number): void {
    const position = new CellPosition(rowIndex, columnIndex);
    this.selectionRange = new CellRange(position, position);
  }

  public selectRange(start: CellPosition, end: CellPosition) {
    this.selectionRange = new CellRange(start, end);
  }

  public getSelectionRange(): CellRange | null {
    return this.selectionRange;
  }

  public clearSelection(): void {
    this.selectionRange = null;
  }
}
