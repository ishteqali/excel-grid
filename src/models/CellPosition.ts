export class CellPosition {
  private readonly rowIndex: number;
  private readonly columnIndex: number;

  constructor(rowIndex: number, columnIndex: number) {
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
  }

  public getRowIndex(): number {
    return this.rowIndex;
  }

  public getColumnIndex(): number {
    return this.columnIndex;
  }
}
