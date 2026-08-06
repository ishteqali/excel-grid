import { GridConfig } from "../config/GridConfig";
import { ViewportManager } from "../managers/ViewportManager";
import { GridDataStore } from "../data/GridDataStore";
import type { SelectionManager } from "../managers/SelectionManager";

export class GridRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly viewportManager: ViewportManager;
  private readonly dataStore: GridDataStore;
  private readonly selectionManager: SelectionManager;

  private viewportWidth: number;
  private viewportHeight: number;

  constructor(
    canvas: HTMLCanvasElement,
    viewportManager: ViewportManager,
    dataStore: GridDataStore,
    selectionManager: SelectionManager,
  ) {
    this.canvas = canvas;
    this.viewportManager = viewportManager;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to get canvas context");
    }
    this.context = context;
    this.dataStore = dataStore;
    this.selectionManager = selectionManager;
    this.viewportWidth = 0;
    this.viewportHeight = 0;
  }
  public resize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.scale(dpr, dpr);
  }
  public render(): void {
    this.clear();
    this.drawGridBody();
    this.drawHeadersBackground();
    this.drawColumnHeaders();
    this.drawRowHeaders();
  }
  private clear(): void {
    this.context.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    this.context.fillStyle = GridConfig.CANVAS_BACKGROUND_COLOR;
    this.context.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
  }

  private drawHeadersBackground(): void {
    this.context.fillStyle = GridConfig.HEADERS_BACKGROUND_COLOR;
    // Column Header Background
    this.context.fillRect(
      GridConfig.HEADER_WIDTH,
      0,
      this.viewportWidth - GridConfig.HEADER_WIDTH,
      GridConfig.HEADER_HEIGHT,
    );
    // Row Header Background
    this.context.fillRect(
      0,
      GridConfig.HEADER_HEIGHT,
      GridConfig.HEADER_WIDTH,
      this.viewportHeight - GridConfig.HEADER_HEIGHT,
    );
    // Top Left Intersection
    this.context.fillRect(
      0,
      0,
      GridConfig.HEADER_WIDTH,
      GridConfig.HEADER_HEIGHT,
    );
  }

  private drawGridLines(): void {
    this.context.strokeStyle = GridConfig.GRID_LINES_COLOR;
    this.context.lineWidth = 1;
    this.drawHorizontalLines();
    this.drawVerticalLines();
  }

  private drawHorizontalLines(): void {
    this.context.beginPath();

    const firstRow = this.viewportManager.getFirstVisibleRow();
    const rowOffset = this.viewportManager.getRowOffset();

    let rowIndex = firstRow;
    let y = GridConfig.HEADER_HEIGHT - rowOffset;

    while (y <= this.viewportHeight && rowIndex < GridConfig.ROW_COUNT) {
      this.context.moveTo(GridConfig.HEADER_WIDTH, y);
      this.context.lineTo(this.viewportWidth, y);
      y += this.viewportManager.getRowHeight(rowIndex);
      rowIndex++;
    }

    this.context.stroke();
  }

  private drawVerticalLines(): void {
    this.context.beginPath();

    const firstColumn = this.viewportManager.getFirstVisibleColumn();
    const columnOffset = this.viewportManager.getColumnOffset();

    let columnIndex = firstColumn;
    let x = GridConfig.HEADER_WIDTH - columnOffset;

    while (x <= this.viewportWidth && columnIndex < GridConfig.COLUMN_COUNT) {
      this.context.moveTo(x, GridConfig.HEADER_HEIGHT);
      this.context.lineTo(x, this.viewportHeight);

      x += this.viewportManager.getColumnWidth(columnIndex);
      columnIndex++;
    }

    this.context.stroke();
  }
  private drawColumnHeaders(): void {
    this.context.save();
    this.applyColumnHeaderClip();
    this.headerOptions();

    const firstVisibleColumn = this.viewportManager.getFirstVisibleColumn();
    const columnOffset = this.viewportManager.getColumnOffset();

    let columnIndex = firstVisibleColumn;
    let x = GridConfig.HEADER_WIDTH - columnOffset;

    while (x < this.viewportWidth && columnIndex < GridConfig.COLUMN_COUNT) {
      const width = this.viewportManager.getColumnWidth(columnIndex);

      this.context.fillText(
        this.getColumnName(columnIndex),
        x + width / 2,
        GridConfig.HEADER_HEIGHT / 2,
      );
      x += width;
      columnIndex++;
    }
    this.context.restore();
  }
  private getColumnName(columnIndex: number): string {
    let columnName = "";
    let currentIndex = columnIndex;

    while (currentIndex >= 0) {
      columnName = String.fromCharCode(65 + (currentIndex % 26)) + columnName;

      currentIndex = Math.floor(currentIndex / 26) - 1;
    }

    return columnName;
  }
  private drawRowHeaders(): void {
    this.context.save();
    this.applyRowHeaderClip();
    this.headerOptions();

    const firstVisibleRow = this.viewportManager.getFirstVisibleRow();
    const rowOffset = this.viewportManager.getRowOffset();

    let rowIndex = firstVisibleRow;
    let y = GridConfig.HEADER_HEIGHT - rowOffset;

    while (y < this.viewportHeight && rowIndex < GridConfig.ROW_COUNT) {
      const rowHeight = this.viewportManager.getRowHeight(rowIndex);

      this.context.fillText(
        (rowIndex + 1).toString(),
        GridConfig.HEADER_WIDTH / 2,
        y + rowHeight / 2,
      );

      y += rowHeight;
      rowIndex++;
    }
    this.context.restore();
  }

  private applyColumnHeaderClip(): void {
    this.context.beginPath();

    this.context.rect(
      GridConfig.HEADER_WIDTH,
      0,
      this.viewportWidth - GridConfig.HEADER_WIDTH,
      GridConfig.HEADER_HEIGHT,
    );

    this.context.clip();
  }

  private applyRowHeaderClip(): void {
    this.context.beginPath();

    this.context.rect(
      0,
      GridConfig.HEADER_HEIGHT,
      GridConfig.HEADER_WIDTH,
      this.viewportHeight - GridConfig.HEADER_HEIGHT,
    );

    this.context.clip();
  }

  private headerOptions(): void {
    this.context.fillStyle = GridConfig.TEXT_COLOR;
    this.context.font = "14px Calibri, Arial, sans-serif";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
  }
  private clipGridBody(): void {
    this.context.beginPath();

    this.context.rect(
      GridConfig.HEADER_WIDTH,
      GridConfig.HEADER_HEIGHT,
      this.viewportWidth - GridConfig.HEADER_WIDTH,
      this.viewportHeight - GridConfig.HEADER_HEIGHT,
    );

    this.context.clip();
  }
  private drawGridBody(): void {
    this.context.save();
    this.clipGridBody();
    this.drawGridLines();
    this.drawSelection();
    this.drawCellContents();
    this.context.restore();
  }

  private drawCellContents(): void {
    this.context.fillStyle = GridConfig.TEXT_COLOR;
    this.context.font = "14px Calibri, Arial, sans-serif";
    this.context.textAlign = "left";
    this.context.textBaseline = "middle";

    const firstVisibleRow = this.viewportManager.getFirstVisibleRow();
    const firstVisibleColumn = this.viewportManager.getFirstVisibleColumn();

    const rowOffset = this.viewportManager.getRowOffset();
    const columnOffset = this.viewportManager.getColumnOffset();

    let rowIndex = firstVisibleRow;
    let y = GridConfig.HEADER_HEIGHT - rowOffset;

    while (y < this.viewportHeight && rowIndex < GridConfig.ROW_COUNT) {
      const rowHeight = this.viewportManager.getRowHeight(rowIndex);

      let columnIndex = firstVisibleColumn;
      let x = GridConfig.HEADER_WIDTH - columnOffset;

      while (x < this.viewportWidth && columnIndex < GridConfig.COLUMN_COUNT) {
        const columnWidth = this.viewportManager.getColumnWidth(columnIndex);
        const value = this.dataStore.getCellValue(rowIndex, columnIndex);

        if (value !== null) {
          const displayText = this.fitText(
            String(value),
            columnWidth - GridConfig.CELL_PADDING * 2,
          );

          this.context.fillText(
            displayText,
            x + GridConfig.CELL_PADDING,
            y + rowHeight / 2,
          );
        }

        x += columnWidth;
        columnIndex++;
      }

      y += rowHeight;
      rowIndex++;
    }
  }

  private drawSelection(): void {
    const selectionType = this.selectionManager.getSelectionType();
    const range = this.selectionManager.getSelectionRange();

    if (!range) {
      return;
    }

    if (selectionType === "Row") {
      const row = range.getStartRow();
      const y =
        GridConfig.HEADER_HEIGHT +
        this.viewportManager.getRowY(row) -
        this.viewportManager.getScrollY();
      const height = this.viewportManager.getRowHeight(row);

      this.styleSelection(
        GridConfig.HEADER_WIDTH,
        y,
        this.viewportWidth - GridConfig.HEADER_WIDTH,
        height,
      );
      return;
    }
    if (selectionType === "Column") {
      const column = range.getStartColumn();
      const x =
        GridConfig.HEADER_WIDTH +
        this.viewportManager.getColumnX(column) -
        this.viewportManager.getScrollX();
      const width = this.viewportManager.getColumnWidth(column);
      this.styleSelection(
        x,
        GridConfig.HEADER_HEIGHT,
        width,
        this.viewportHeight - GridConfig.HEADER_HEIGHT,
      );
      return;
    }

    const startRow = range.getStartRow();
    const endRow = range.getEndRow();
    const startColumn = range.getStartColumn();
    const endColumn = range.getEndColumn();

    const x =
      GridConfig.HEADER_WIDTH +
      this.viewportManager.getColumnX(startColumn) -
      this.viewportManager.getScrollX();

    const y =
      GridConfig.HEADER_HEIGHT +
      this.viewportManager.getRowY(startRow) -
      this.viewportManager.getScrollY();

    let width = 0;
    for (let column = startColumn; column <= endColumn; column++) {
      width += this.viewportManager.getColumnWidth(column);
    }

    let height = 0;
    for (let row = startRow; row <= endRow; row++) {
      height += this.viewportManager.getRowHeight(row);
    }

    this.styleSelection(x, y, width, height);
  }

  private styleSelection(x: number, y: number, width: number, height: number) {
    this.context.strokeStyle = GridConfig.SELECTION_BORDER_COLOR;
    this.context.lineWidth = 2;
    this.context.fillStyle = GridConfig.SELECTION_BACKGROUND_COLOR;
    this.context.fillRect(x, y, width, height);
    this.context.strokeRect(x, y, width, height);
  }

  private fitText(text: string, maxWidth: number): string {
    if (this.context.measureText(text).width <= maxWidth) {
      return text;
    }
    while (text.length > 0 && this.context.measureText(text).width > maxWidth) {
      text = text.slice(0, -1);
    }
    return text;
  }
}
