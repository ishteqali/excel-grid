import type { EmployeeRecord } from "./EmployeeRecord";

export class ColumnModel {
  private readonly index: number;
  private readonly dataKey: keyof EmployeeRecord;
  private width: number;

  constructor(index: number, dataKey: keyof EmployeeRecord, width: number) {
    this.index = index;
    this.dataKey = dataKey;
    this.width = width;
  }
  public getIndex(): number {
    return this.index;
  }
  public getKey(): string {
    return this.dataKey;
  }
  public getWidth(): number {
    return this.width;
  }
  public setWidth(width: number): void {
    this.width = width;
  }
}
