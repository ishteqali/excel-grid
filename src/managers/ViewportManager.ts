import { GridConfig } from "../config/GridConfig";
import { DimensionManager } from "./DimensionManager";
import { CellPosition } from "../models/CellPosition";

export class ViewportManager {
  private scrollX: number;
  private scrollY: number;
  private readonly dimensionManager: DimensionManager;

  constructor(dimensionManager: DimensionManager) {
    this.scrollX = 0;
    this.scrollY = 0;
    this.dimensionManager = dimensionManager;
  }

  public setScrollPosition(scrollX: number, scrollY: number): void {
    this.scrollX = scrollX;
    this.scrollY = scrollY;
  }

  public getScrollX(): number {
    return this.scrollX;
  }

  public getScrollY(): number {
    return this.scrollY;
  }

  public getFirstVisibleRow(): number {
    return Math.floor(this.scrollY / GridConfig.DEFAULT_ROW_HEIGHT);
  }

  public getFirstVisibleColumn(): number {
    return Math.floor(this.scrollX / GridConfig.DEFAULT_COLUMN_WIDTH);
  }

  public getVisibleRowCount(viewportHeight: number): number {
    const availableHeight = viewportHeight - GridConfig.HEADER_HEIGHT;

    return Math.ceil(availableHeight / GridConfig.DEFAULT_ROW_HEIGHT) + 1;
  }

  public getVisibleColumnCount(viewportWidth: number): number {
    const availableWidth = viewportWidth - GridConfig.HEADER_WIDTH;

    return Math.ceil(availableWidth / GridConfig.DEFAULT_COLUMN_WIDTH) + 1;
  }

  public getRowOffset(): number {
    return this.scrollY % GridConfig.DEFAULT_ROW_HEIGHT;
  }

  public getColumnOffset(): number {
    return this.scrollX % GridConfig.DEFAULT_COLUMN_WIDTH;
  }

  public getCellAtPoint(x: number, y: number): CellPosition | null {
    if (x < GridConfig.HEADER_WIDTH || y < GridConfig.HEADER_HEIGHT) {
      return null;
    }

    const gridX = x - GridConfig.HEADER_WIDTH + this.scrollX;
    const gridY = y - GridConfig.HEADER_HEIGHT + this.scrollY;

    const columnIndex = Math.floor(gridX / GridConfig.DEFAULT_COLUMN_WIDTH);
    const rowIndex = Math.floor(gridY / GridConfig.DEFAULT_ROW_HEIGHT);

    if (
      rowIndex >= GridConfig.ROW_COUNT ||
      columnIndex >= GridConfig.COLUMN_COUNT
    ) {
      return null;
    }
    return new CellPosition(rowIndex, columnIndex);
  }

  public getRowAtPoint(y: number): number {
    const gridY = y - GridConfig.HEADER_HEIGHT + this.scrollY;
    return Math.floor(gridY / GridConfig.DEFAULT_ROW_HEIGHT);
  }

  public getColumnPoint(x: number): number {
    const gridX = x - GridConfig.HEADER_WIDTH + this.scrollX;
    return Math.floor(gridX / GridConfig.DEFAULT_COLUMN_WIDTH);
  }

  public isRowHeader(x: number, y: number): boolean {
    return x < GridConfig.HEADER_WIDTH && y >= GridConfig.HEADER_HEIGHT;
  }

  public isColumnHeader(x: number, y: number): boolean {
    return x >= GridConfig.HEADER_WIDTH && y < GridConfig.HEADER_HEIGHT;
  }

  public isCornerHeader(x: number, y: number): boolean {
    return x < GridConfig.HEADER_WIDTH && y < GridConfig.HEADER_HEIGHT;
  }
}
