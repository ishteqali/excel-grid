import { GridConfig } from "../config/GridConfig";
import { ViewportManager } from "../managers/ViewportManager";
import { GridRenderer } from "../renderer/GridRenderer";
import { SelectionManager } from "../managers/SelectionManager";
import type { CellPosition } from "../models/CellPosition";
import type { CommandManager } from "../commands/CommandManager";
import type { CellEditor } from "../editor/CellEditor";
import type { GridDataStore } from "../data/GridDataStore";
import { EditCellCommand } from "../commands/EditCellCommand";

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

  private isSelecting: boolean;
  private selectionStart: CellPosition | null;
  private editingCell: CellPosition | null;

  private resizingColumn: number | null = null;
  private resizeStartX = 0;
  private resizeStartWidth = 0;

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
      GridConfig.HEADER_WIDTH +
      GridConfig.COLUMN_COUNT * GridConfig.DEFAULT_COLUMN_WIDTH;

    const totalHeight =
      GridConfig.HEADER_HEIGHT +
      GridConfig.ROW_COUNT * GridConfig.DEFAULT_ROW_HEIGHT;

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

      const x =
        GridConfig.HEADER_WIDTH +
        this.viewportManager.getColumnX(column) -
        this.viewportManager.getScrollX();

      const y =
        GridConfig.HEADER_HEIGHT +
        this.viewportManager.getRowY(row) -
        this.viewportManager.getScrollY();

      this.cellEditor.move(
        x,
        y,
        GridConfig.DEFAULT_COLUMN_WIDTH,
        GridConfig.DEFAULT_ROW_HEIGHT,
      );
    }
    this.renderer.render();
  };

  private handleResize = (): void => {
    this.resize();
  };

  private resize(): void {
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

    if (this.viewportManager.isRowHeader(x, y)) {
      const rowIndex = this.viewportManager.getRowAtPoint(y);
      this.selectionManager.selectRow(rowIndex);
      this.renderer.render();
      return;
    }
    if (this.viewportManager.isColumnHeader(x, y)) {
      const columnIndex = this.viewportManager.getColumnPoint(x);
      this.selectionManager.selectColumn(columnIndex);
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

    this.renderer.render();
  };

  private handleMouseMove = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (this.viewportManager.isColumnHeader(mouseX, mouseY)) {
      const resizeColumn = this.viewportManager.getResizeColumnAtPoint(
        mouseX,
        this.container.clientWidth,
      );

      this.canvas.style.cursor =
        resizeColumn !== null ? "col-resize" : "default";
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

    this.renderer.render();
  };

  private handleMouseUp = (): void => {
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

    const x =
      GridConfig.HEADER_WIDTH +
      this.viewportManager.getColumnX(column) -
      this.viewportManager.getScrollX();

    const y =
      GridConfig.HEADER_HEIGHT +
      this.viewportManager.getRowY(row) -
      this.viewportManager.getScrollY();

    this.cellEditor.show(
      x,
      y,
      GridConfig.DEFAULT_COLUMN_WIDTH,
      GridConfig.DEFAULT_ROW_HEIGHT,
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
  };
}
