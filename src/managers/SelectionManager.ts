import { CellPosition } from "../models/CellPosition";

export class SelectionManager {
  private selectedCell: CellPosition | null;
  constructor() {
    this.selectedCell = null;
  }

  public selectCell(rowIndex: number, columnIndex: number): void {
    this.selectedCell = new CellPosition(rowIndex, columnIndex);
  }

  public getSelectedCell(): CellPosition | null {
    return this.selectedCell;
  }

  public clearSelection(): void {
    this.selectedCell = null;
  }
}
