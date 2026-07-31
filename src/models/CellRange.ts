import { CellPosition } from "./CellPosition";

export class CellRange {
  private readonly start: CellPosition;
  private readonly end: CellPosition;

  constructor(start: CellPosition, end: CellPosition) {
    this.start = start;
    this.end = end;
  }

  public getStart(): CellPosition {
    return this.start;
  }

  public getEnd(): CellPosition {
    return this.end;
  }
  
  public getStartRow(): number {
    return Math.min(this.start.getRowIndex(), this.end.getRowIndex());
  }

  public getEndRow(): number {
    return Math.max(this.start.getRowIndex(), this.end.getRowIndex());
  }

  public getStartColumn(): number {
    return Math.min(this.start.getColumnIndex(), this.end.getColumnIndex());
  }

  public getEndColumn(): number {
    return Math.max(this.start.getColumnIndex(), this.end.getColumnIndex());
  }
}
