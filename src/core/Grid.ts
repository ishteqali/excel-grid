import { GridConfig } from "../config/GridConfig";
import { ViewportManager } from "../managers/ViewportManager";
import { GridRenderer } from "../renderer/GridRenderer";
import { SelectionManager } from "../managers/SelectionManager";
import type { CellPosition } from "../models/CellPosition";
import type { CommandManager } from "../commands/CommandManager";
import type { CellEditor } from "../editor/CellEditor";
import type { GridDataStore } from "../data/GridDataStore";
import { EditCellCommand } from "../commands/EditCellCommand";
import { ResizeColumnCommand } from "../commands/ResizeColumnCommand";
import { ResizeRowCommand } from "../commands/ResizeRowCommand";
import type { SummaryManager } from "../managers/SummaryManager";

export class Grid {
  private readonly renderer: GridRenderer;
  private readonly viewportManager: ViewportManager;
  private readonly container: HTMLElement;
  private readonly scrollContent: HTMLElement;
  private readonly selectionManager: SelectionManager;
  private readonly canvas: HTMLCanvasElement;
  private readonly commandManager: CommandManager;
  private readonly cellEditor: CellEditor;
  private readonly dataStore: GridDataStore;
  private readonly summaryManager: SummaryManager;

  private isSelecting: boolean;
  private selectionStart: CellPosition | null;
  private editingCell: CellPosition | null;

  private resizingColumn: number | null = null;
  private resizeStartX: number = 0;
  private resizeStartWidth: number = 0;

  private resizingRow: number | null = null;
  private resizeStartY: number = 0;
  private resizeStartHeight: number = 0;

  private summaryText: string = "";

  constructor(
    renderer: GridRenderer,
    viewportManager: ViewportManager,
    container: HTMLElement,
    scrollContent: HTMLElement,
    selectionManager: SelectionManager,
    canvas: HTMLCanvasElement,
    dataStore: GridDataStore,
    commandManager: CommandManager,
    cellEditor: CellEditor,
    summaryManager: SummaryManager,
  ) {
    this.renderer = renderer;
    this.viewportManager = viewportManager;
    this.container = container;
    this.scrollContent = scrollContent;
    this.selectionManager = selectionManager;
    this.canvas = canvas;
    this.dataStore = dataStore;
    this.commandManager = commandManager;
    this.cellEditor = cellEditor;
    this.isSelecting = false;
    this.selectionStart = null;
    this.editingCell = null;
    this.summaryManager = summaryManager;
    this.cellEditor
      .getInput()
      .addEventListener("keydown", this.handleEditorKeyDown);
  }

  public initialize(): void {
    this.setupVirtualScrollSpace();
    this.resize();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    this.container.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleResize);
    this.addMouseEventListerener();
    this.canvas.addEventListener("dblclick", this.handleDoubleClick);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private addMouseEventListerener(): void {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  private setupVirtualScrollSpace(): void {
    const totalWidth =
      GridConfig.HEADER_WIDTH + this.viewportManager.getTotalWidth();

    const totalHeight =
      GridConfig.HEADER_HEIGHT + this.viewportManager.getTotalHeight();

    this.scrollContent.style.width = `${totalWidth}px`;
    this.scrollContent.style.height = `${totalHeight}px`;
  }

  private handleScroll = (): void => {
    this.viewportManager.setScrollPosition(
      this.container.scrollLeft,
      this.container.scrollTop,
    );
    if (this.editingCell) {
      const row = this.editingCell.getRowIndex();
      const column = this.editingCell.getColumnIndex();

      const bounds = this.getVisibleCellBounds(row, column);

      if (bounds.width > 0 && bounds.height > 0) {
        this.cellEditor.move(bounds.x, bounds.y, bounds.width, bounds.height);
      } else {
        this.cellEditor.hide();
      }
    }
    this.renderer.render();
  };

  private handleResize = (): void => {
    this.resize();
  };

  private resize(): void {
    const bodyWidth = this.container.clientWidth - GridConfig.HEADER_WIDTH;
    const bodyHeight =
      this.container.clientHeight -
      GridConfig.HEADER_HEIGHT -
      GridConfig.STATUS_BAR_HEIGHT;

    this.viewportManager.setViewportSize(bodyWidth, bodyHeight);

    this.renderer.resize(
      this.container.clientWidth,
      this.container.clientHeight,
    );

    this.renderer.render();
  }

  private getCellFromMouseEvent(event: MouseEvent): CellPosition | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return this.viewportManager.getCellAtPoint(x, y);
  }

  private handleMouseDown = (event: MouseEvent): void => {
    if (this.editingCell) {
      this.saveEditedCell();
    }
    const rect = this.canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.viewportManager.isColumnHeader(x, y)) {
      const resizeColumn = this.viewportManager.getResizeColumnAtPoint(
        x,
        this.container.clientWidth,
      );

      if (resizeColumn !== null) {
        this.resizingColumn = resizeColumn;
        this.resizeStartX = event.clientX;
        this.resizeStartWidth =
          this.viewportManager.getColumnWidth(resizeColumn);
        return;
      }
    }
    if (this.viewportManager.isRowHeader(x, y)) {
      const resizeRow = this.viewportManager.getResizeRowAtPoint(
        y,
        this.container.clientHeight,
      );

      if (resizeRow !== null) {
        this.resizingRow = resizeRow;
        this.resizeStartY = event.clientY;
        this.resizeStartHeight = this.viewportManager.getRowHeight(resizeRow);
        return;
      }
    }

    if (this.viewportManager.isRowHeader(x, y)) {
      const rowIndex = this.viewportManager.getRowAtPoint(y);
      this.selectionManager.selectRow(rowIndex);
      this.updateSummary();
      this.renderer.render();
      return;
    }
    if (this.viewportManager.isColumnHeader(x, y)) {
      const columnIndex = this.viewportManager.getColumnPoint(x);
      this.selectionManager.selectColumn(columnIndex);
      this.updateSummary();
      this.renderer.render();
      return;
    }

    const cellPosition = this.getCellFromMouseEvent(event);

    if (!cellPosition) {
      return;
    }

    this.isSelecting = true;
    this.selectionStart = cellPosition;

    this.selectionManager.selectCell(
      cellPosition.getRowIndex(),
      cellPosition.getColumnIndex(),
    );
    this.updateSummary();
    this.renderer.render();
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (this.resizingColumn !== null) {
      const delta = event.clientX - this.resizeStartX;
      const newWidth = this.resizeStartWidth + delta;

      this.viewportManager.setColumnWidth(this.resizingColumn, newWidth);
      this.setupVirtualScrollSpace();
      this.renderer.render();

      return;
    }

    if (this.resizingRow !== null) {
      const delta = event.clientY - this.resizeStartY;
      const newHeight = this.resizeStartHeight + delta;

      this.viewportManager.setRowHeight(this.resizingRow, newHeight);
      this.setupVirtualScrollSpace();
      this.renderer.render();
    }

    const rect = this.canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (
      this.viewportManager.isColumnHeader(mouseX, mouseY) &&
      this.resizingColumn === null
    ) {
      const resizeColumn = this.viewportManager.getResizeColumnAtPoint(
        mouseX,
        this.container.clientWidth,
      );

      this.canvas.style.cursor =
        resizeColumn !== null ? "col-resize" : "default";
    } else if (
      this.viewportManager.isRowHeader(mouseX, mouseY) &&
      this.resizingRow === null
    ) {
      const resizeRow = this.viewportManager.getResizeRowAtPoint(
        mouseY,
        this.container.clientHeight,
      );

      this.canvas.style.cursor = resizeRow !== null ? "row-resize" : "default";
    } else {
      this.canvas.style.cursor = "default";
    }

    if (!this.isSelecting || !this.selectionStart) {
      return;
    }

    const currentCell = this.getCellFromMouseEvent(event);
    if (!currentCell) {
      return;
    }
    this.selectionManager.selectRange(this.selectionStart, currentCell);
    this.updateSummary();
    this.renderer.render();
  };

  private handleMouseUp = (): void => {
    if (this.resizingColumn !== null) {
      const newWidth = this.viewportManager.getColumnWidth(this.resizingColumn);
      if (newWidth !== this.resizeStartWidth) {
        const command = new ResizeColumnCommand(
          this.viewportManager,
          this.resizingColumn,
          this.resizeStartWidth,
          newWidth,
        );

        this.commandManager.execute(command);
      }

      this.resizingColumn = null;
      this.setupVirtualScrollSpace();
      this.renderer.render();
      return;
    }

    if (this.resizingRow !== null) {
      const newHeight = this.viewportManager.getRowHeight(this.resizingRow);
      if (newHeight !== this.resizeStartHeight) {
        this.commandManager.execute(
          new ResizeRowCommand(
            this.viewportManager,
            this.resizingRow,
            this.resizeStartHeight,
            newHeight,
          ),
        );
      }
      this.resizingRow = null;
      this.setupVirtualScrollSpace();
      this.renderer.render();
      return;
    }

    this.isSelecting = false;
    this.selectionStart = null;
  };

  private handleDoubleClick = (event: MouseEvent): void => {
    if (this.editingCell) {
      this.saveEditedCell();
    }

    const cellPosition = this.getCellFromMouseEvent(event);
    if (!cellPosition) {
      return;
    }

    this.editingCell = cellPosition;

    const row = cellPosition.getRowIndex();
    const column = cellPosition.getColumnIndex();
    const value = this.dataStore.getCellValue(row, column);

    const bounds = this.getVisibleCellBounds(row, column);

    this.cellEditor.show(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      String(value ?? ""),
    );
  };

  private handleEditorKeyDown = (event: KeyboardEvent): void => {
    if (!this.editingCell) {
      return;
    }

    if (event.key === "Enter") {
      this.saveEditedCell();
      return;
    }

    if (event.key === "Escape") {
      this.cellEditor.hide();
      this.editingCell = null;
    }
  };

  private saveEditedCell(): void {
    if (!this.editingCell) {
      return;
    }

    const row = this.editingCell.getRowIndex();
    const column = this.editingCell.getColumnIndex();
    const oldValue = this.dataStore.getCellValue(row, column);
    const newValue = this.cellEditor.getValue();

    const command = new EditCellCommand(
      this.dataStore,
      row,
      column,
      oldValue,
      newValue,
    );

    this.commandManager.execute(command);
    this.cellEditor.hide();
    this.editingCell = null;
    this.renderer.render();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.cellEditor.isVisible()) {
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      this.commandManager.undo();
      this.renderer.render();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "y") {
      event.preventDefault();
      this.commandManager.redo();
      this.renderer.render();
      return;
    }

    this.handleNavigation(event);
  };

  private updateSummary(): void {
    const range = this.selectionManager.getSelectionRange();
    if (!range) {
      this.summaryText = "";
      return;
    }

    const summary = this.summaryManager.calculate(range, this.dataStore);

    this.summaryText =
      `Count: ${summary.count}    ` +
      `Min: ${summary.min ?? "-"}    ` +
      `Max: ${summary.max ?? "-"}    ` +
      `Sum: ${summary.sum}    ` +
      `Average: ${summary.average.toFixed(2)}`;

    this.renderer.setSummaryText(this.summaryText);
    this.renderer.render();
  }

  private handleNavigation(event: KeyboardEvent): void {
    const range = this.selectionManager.getSelectionRange();

    if (!range) {
      return;
    }

    let row = range.getStartRow();
    let column = range.getStartColumn();

    switch (event.key) {
      case "ArrowUp":
        row--;
        break;

      case "ArrowDown":
        row++;
        break;

      case "ArrowLeft":
        column--;
        break;

      case "ArrowRight":
        column++;
        break;

      case "Tab":
        column += event.shiftKey ? -1 : 1;
        break;

      case "Enter":
        row += event.shiftKey ? -1 : 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    row = Math.max(0, Math.min(GridConfig.ROW_COUNT - 1, row));
    column = Math.max(0, Math.min(GridConfig.COLUMN_COUNT - 1, column));

    this.selectionManager.selectCell(row, column);
    this.scrollCellIntoView(row, column);
    this.updateSummary();
  }

  private scrollCellIntoView(row: number, coloumn: number): void {
    const cellLeft = this.viewportManager.getColumnX(coloumn);
    const cellRight = cellLeft + this.viewportManager.getColumnWidth(coloumn);

    const cellTop = this.viewportManager.getRowY(row);
    const cellBottom = cellTop + this.viewportManager.getRowHeight(row);

    const visibleLeft = this.container.scrollLeft;
    const visibleRight =
      visibleLeft + this.container.clientWidth - GridConfig.HEADER_WIDTH;

    const visibleTop = this.container.scrollTop;
    const visibleBottom =
      visibleTop +
      this.container.clientHeight -
      GridConfig.HEADER_HEIGHT -
      GridConfig.STATUS_BAR_HEIGHT;

    if (cellLeft < visibleLeft) {
      this.container.scrollLeft = cellLeft;
    } else if (cellRight > visibleRight) {
      this.container.scrollLeft =
        cellRight - (this.container.clientWidth - GridConfig.HEADER_WIDTH);
    }

    if (cellTop < visibleTop) {
      this.container.scrollTop = cellTop;
    } else if (cellBottom > visibleBottom) {
      this.container.scrollTop =
        cellBottom -
        (this.container.clientHeight -
          GridConfig.HEADER_HEIGHT -
          GridConfig.STATUS_BAR_HEIGHT);
    }
  }

  private getVisibleCellBounds(row: number, column: number) {
    let x =
      GridConfig.HEADER_WIDTH +
      this.viewportManager.getColumnX(column) -
      this.viewportManager.getScrollX();

    let y =
      GridConfig.HEADER_HEIGHT +
      this.viewportManager.getRowY(row) -
      this.viewportManager.getScrollY();

    let width = this.viewportManager.getColumnWidth(column);
    let height = this.viewportManager.getRowHeight(row);

    const bodyLeft = GridConfig.HEADER_WIDTH;
    const bodyTop = GridConfig.HEADER_HEIGHT;
    const bodyRight = this.container.clientWidth;
    const bodyBottom =
      this.container.clientHeight - GridConfig.STATUS_BAR_HEIGHT;

    if (x < bodyLeft) {
      width -= bodyLeft - x;
      x = bodyLeft;
    }

    if (y < bodyTop) {
      height -= bodyTop - y;
      y = bodyTop;
    }

    if (x + width > bodyRight) {
      width = bodyRight - x;
    }

    if (y + height > bodyBottom) {
      height = bodyBottom - y;
    }

    return { x, y, width, height };
  }
}
