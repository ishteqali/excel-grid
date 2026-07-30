export class ColumnModel {
  private readonly index: number;
  private width: number;
  constructor(index: number, width: number) {
    this.index = index;
    this.width = width;
  }
  public getIndex(): number {
    return this.index;
  }
  public getWidth(): number {
    return this.width;
  }
  public setWidth(width: number): void {
    this.width = width;
  }
}
