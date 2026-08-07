import { GridConfig } from "../config/GridConfig";
import { DimensionManager } from "./DimensionManager";
import { CellPosition } from "../models/CellPosition";

export class ViewportManager {
  private scrollX: number;
  private scrollY: number;
  private readonly dimensionManager: DimensionManager;

  private viewportHeight: number;

  constructor(dimensionManager: DimensionManager) {
    this.scrollX = 0;
    this.scrollY = 0;
    this.dimensionManager = dimensionManager;
    this.viewportHeight = 0;
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
    return this.dimensionManager.getRowAtOffset(this.scrollY);
  }

  public getFirstVisibleColumn(): number {
    return this.dimensionManager.getColumnAtOffset(this.scrollX);
  }

  public getVisibleRowCount(viewportHeight: number): number {
    const availableHeight =
      viewportHeight - GridConfig.HEADER_HEIGHT - GridConfig.STATUS_BAR_HEIGHT;

    let height = 0;
    let row = this.getFirstVisibleRow();

    while (row < GridConfig.ROW_COUNT && height < availableHeight) {
      height += this.dimensionManager.getRowHeight(row);
      row++;
    }

    return row - this.getFirstVisibleRow() + 1;
  }

  public getVisibleColumnCount(viewportWidth: number): number {
    const availableWidth = viewportWidth - GridConfig.HEADER_WIDTH;

    let width = 0;
    let column = this.getFirstVisibleColumn();

    while (column < GridConfig.COLUMN_COUNT && width < availableWidth) {
      width += this.dimensionManager.getColumnWidth(column);
      column++;
    }

    return column - this.getFirstVisibleColumn() + 1;
  }

  public getRowOffset(): number {
    const firstRow = this.getFirstVisibleRow();
    return this.scrollY - this.dimensionManager.getRowY(firstRow);
  }

  public getColumnOffset(): number {
    const firstColumn = this.getFirstVisibleColumn();
    return this.scrollX - this.dimensionManager.getColumnX(firstColumn);
  }

  public getCellAtPoint(x: number, y: number): CellPosition | null {
    const bodyBottom = this.viewportHeight + GridConfig.HEADER_HEIGHT;

    if (
      x < GridConfig.HEADER_WIDTH ||
      y < GridConfig.HEADER_HEIGHT ||
      y >= bodyBottom
    ) {
      return null;
    }

    const gridX = x - GridConfig.HEADER_WIDTH + this.scrollX;
    const gridY = y - GridConfig.HEADER_HEIGHT + this.scrollY;

    const columnIndex = this.dimensionManager.getColumnAtOffset(gridX);
    const rowIndex = this.dimensionManager.getRowAtOffset(gridY);

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
    return this.dimensionManager.getRowAtOffset(gridY);
  }

  public getColumnPoint(x: number): number {
    const gridX = x - GridConfig.HEADER_WIDTH + this.scrollX;
    return this.dimensionManager.getColumnAtOffset(gridX);
  }

  public isRowHeader(x: number, y: number): boolean {
    return (
      x < GridConfig.HEADER_WIDTH &&
      y >= GridConfig.HEADER_HEIGHT &&
      y < this.viewportHeight + GridConfig.HEADER_HEIGHT
    );
  }

  public isColumnHeader(x: number, y: number): boolean {
    return x >= GridConfig.HEADER_WIDTH && y < GridConfig.HEADER_HEIGHT;
  }

  public isCornerHeader(x: number, y: number): boolean {
    return x < GridConfig.HEADER_WIDTH && y < GridConfig.HEADER_HEIGHT;
  }

  public getColumnWidth(columnIndex: number): number {
    return this.dimensionManager.getColumnWidth(columnIndex);
  }

  public getRowHeight(rowIndex: number): number {
    return this.dimensionManager.getRowHeight(rowIndex);
  }

  public getColumnX(columnIndex: number): number {
    return this.dimensionManager.getColumnX(columnIndex);
  }

  public getRowY(rowIndex: number): number {
    return this.dimensionManager.getRowY(rowIndex);
  }

  public getResizeColumnAtPoint(
    mouseX: number,
    viewportWidth: number,
  ): number | null {
    if (mouseX < GridConfig.HEADER_WIDTH) {
      return null;
    }

    return this.dimensionManager.getResizeColumnAtPosition(
      mouseX - GridConfig.HEADER_WIDTH + this.scrollX,
      this.getFirstVisibleColumn(),
      this.getVisibleColumnCount(viewportWidth),
    );
  }

  public setColumnWidth(columnIndex: number, width: number): void {
    this.dimensionManager.setColumnWidth(columnIndex, width);
  }

  public getTotalWidth(): number {
    return this.dimensionManager.getTotalWidth();
  }

  public getTotalHeight(): number {
    return this.dimensionManager.getTotalHeight();
  }

  public getResizeRowAtPoint(
    mouseY: number,
    viewportHeight: number,
  ): number | null {
    if (mouseY < GridConfig.HEADER_HEIGHT) {
      return null;
    }

    return this.dimensionManager.getResizeRowAtPosition(
      mouseY - GridConfig.HEADER_HEIGHT + this.scrollY,
      this.getFirstVisibleRow(),
      this.getVisibleRowCount(viewportHeight),
    );
  }

  public setRowHeight(rowIndex: number, height: number): void {
    this.dimensionManager.setRowHeight(rowIndex, height);
  }

  public setViewportSize(_width: number, height: number): void {
    this.viewportHeight = height;
  }
}
