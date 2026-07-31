export type CellValue = string | number | null;

export class CellModel {
  private readonly rowIndex: number;
  private readonly columnIndex: number;
  private value: CellValue;

  constructor(rowIndex: number, columnIndex: number, value: CellValue) {
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.value = value;
  }

  public getRowIndex(): number {
    return this.rowIndex;
  }

  public getColumnIndex(): number {
    return this.columnIndex;
  }

  public getValue(): CellValue {
    return this.value;
  }

  public setValue(value: CellValue): void {
    this.value = value;
  }
}
