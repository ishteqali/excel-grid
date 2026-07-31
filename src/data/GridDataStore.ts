import type { EmployeeRecord } from "../models/EmployeeRecord";
import { CellModel, type CellValue } from "../models/CellModel";

export class GridDataStore {
  private readonly cells: Map<string, CellModel>;
  constructor(records: EmployeeRecord[]) {
    this.cells = new Map<string, CellModel>();
    this.loadRecords(records);
  }

  private createCellKey(rowIndex: number, columnIndex: number): string {
    return `${rowIndex}:${columnIndex}`;
  }

  private loadRecords(records: EmployeeRecord[]): void {
    records.forEach((record, rowIndex) => {
      this.setCell(rowIndex, 0, record.id);
      this.setCell(rowIndex, 1, record.firstName);
      this.setCell(rowIndex, 2, record.lastName);
      this.setCell(rowIndex, 3, record.age);
      this.setCell(rowIndex, 4, record.salary);
    });
  }

  public setCell(
    rowIndex: number,
    columnIndex: number,
    value: CellValue,
  ): void {
    const key = this.createCellKey(rowIndex, columnIndex);
    const existingCell = this.cells.get(key);

    if (existingCell) {
      existingCell.setValue(value);
      return;
    }

    const cell = new CellModel(rowIndex, columnIndex, value);
    this.cells.set(key, cell);
  }

  public getCell(rowIndex: number, columnIndex: number): CellModel | null {
    const key = this.createCellKey(rowIndex, columnIndex);
    const cell = this.cells.get(key);

    if (!cell) {
      return null;
    }
    return cell;
  }

  public getCellValue(rowIndex: number, columnIndex: number): CellValue {
    const cell = this.getCell(rowIndex, columnIndex);
    if (!cell) {
      return null;
    }
    return cell.getValue();
  }
}
