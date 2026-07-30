export class RowModel {
  private readonly index: number;
  private height: number;
  constructor(index: number, height: number) {
    this.index = index;
    this.height = height;
  }
  public getIndex(): number {
    return this.index;
  }
  public getHeight(): number {
    return this.height;
  }
  public setHeight(height: number): void {
    this.height = height;
  }
}
