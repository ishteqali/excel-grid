import { GridConfig } from "../config/GridConfig";
import { DimensionManager } from "./DimensionManager";

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
}
