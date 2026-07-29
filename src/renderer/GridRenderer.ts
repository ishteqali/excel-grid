import { GridConfig } from "../config/GridConfig";
import { ViewportManager } from "../managers/ViewportManager";

export class GridRenderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private viewportManager: ViewportManager;
  constructor(canvas: HTMLCanvasElement, viewportManager: ViewportManager) {
    this.canvas = canvas;
    this.viewportManager = viewportManager;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to get canvas context");
    }
    this.context = context;
  }
  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
  public render(): void {
    this.clear();
    this.drawGridBody();
    this.drawHeadersBackground();
    this.drawColumnHeaders();
    this.drawRowHeaders();
  }
  private clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawHeadersBackground(): void {
    this.context.fillStyle = "#f3f3f3";
    // Column Header Background
    this.context.fillRect(
      GridConfig.HEADER_WIDTH,
      0,
      this.canvas.width - GridConfig.HEADER_WIDTH,
      GridConfig.HEADER_HEIGHT,
    );
    // Row Header Background
    this.context.fillRect(
      0,
      GridConfig.HEADER_HEIGHT,
      GridConfig.HEADER_WIDTH,
      this.canvas.height - GridConfig.HEADER_HEIGHT,
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
    this.context.strokeStyle = "#d9d9d9";
    this.context.lineWidth = 1;
    this.drawHorizontalLines();
    this.drawVerticalLines();
  }
  private drawHorizontalLines(): void {
    const rowOffset = this.viewportManager.getRowOffset();
    let y = GridConfig.HEADER_HEIGHT - rowOffset;
    this.context.beginPath();
    while (y <= this.canvas.height) {
      this.context.moveTo(GridConfig.HEADER_WIDTH, y);
      this.context.lineTo(this.canvas.width, y);
      y = y + GridConfig.DEFAULT_ROW_HEIGHT;
    }
    this.context.stroke();
  }
  private drawVerticalLines(): void {
    const columnOffset = this.viewportManager.getColumnOffset();
    let x = GridConfig.HEADER_WIDTH - columnOffset;
    this.context.beginPath();
    while (x <= this.canvas.width) {
      this.context.moveTo(x, GridConfig.HEADER_HEIGHT);
      this.context.lineTo(x, this.canvas.height);
      x = x + GridConfig.DEFAULT_COLUMN_WIDTH;
    }
    this.context.stroke();
  }
  private drawColumnHeaders(): void {
    this.context.save();
    this.context.rect(
      GridConfig.HEADER_WIDTH,
      0,
      this.canvas.width - GridConfig.HEADER_WIDTH,
      GridConfig.HEADER_HEIGHT,
    );
    this.context.clip();

    this.context.fillStyle = "#000000";
    this.context.font = "14px Calibri, Arial, sans-serif";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    const firstVisibleColumn = this.viewportManager.getFirstVisibleColumn();
    const columnOffset = this.viewportManager.getColumnOffset();

    let columnIndex = firstVisibleColumn;
    let x = GridConfig.HEADER_WIDTH - columnOffset;
    while (x < this.canvas.width && columnIndex < GridConfig.COLUMN_COUNT) {
      const columnName = this.getColumnName(columnIndex);
      this.context.fillText(
        columnName,
        x + GridConfig.DEFAULT_COLUMN_WIDTH / 2,
        GridConfig.HEADER_HEIGHT / 2,
      );
      x = x + GridConfig.DEFAULT_COLUMN_WIDTH;
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
    this.context.beginPath();
    this.context.rect(
      0,
      GridConfig.HEADER_HEIGHT,
      GridConfig.HEADER_WIDTH,
      this.canvas.height - GridConfig.HEADER_HEIGHT,
    );
    this.context.clip();

    this.context.fillStyle = "#000000";
    this.context.font = "14px Calibri, Arial, sans-serif";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    const firstVisibleRow = this.viewportManager.getFirstVisibleRow();
    const rowOffset = this.viewportManager.getRowOffset();

    let rowIndex = firstVisibleRow;
    let y = GridConfig.HEADER_HEIGHT - rowOffset;

    while (y < this.canvas.height && rowIndex < GridConfig.ROW_COUNT) {
      this.context.fillText(
        (rowIndex + 1).toString(),
        GridConfig.HEADER_WIDTH / 2,
        y + GridConfig.DEFAULT_ROW_HEIGHT / 2,
      );

      y = y + GridConfig.DEFAULT_ROW_HEIGHT;
      rowIndex++;
    }
    this.context.restore();
  }
  private clipGridBody(): void {
    this.context.beginPath();

    this.context.rect(
      GridConfig.HEADER_WIDTH,
      GridConfig.HEADER_HEIGHT,
      this.canvas.width - GridConfig.HEADER_WIDTH,
      this.canvas.height - GridConfig.HEADER_HEIGHT,
    );

    this.context.clip();
  }
  private drawGridBody(): void {
    this.context.save();
    this.clipGridBody();
    this.drawGridLines();
    this.context.restore();
  }
}
