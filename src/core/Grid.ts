import { GridConfig } from "../config/GridConfig";
import { ViewportManager } from "../managers/ViewportManager";
import { GridRenderer } from "../renderer/GridRenderer";
import { SelectionManager } from "../managers/SelectionManager";

export class Grid {
  private readonly renderer: GridRenderer;
  private readonly viewportManager: ViewportManager;
  private readonly container: HTMLElement;
  private readonly scrollContent: HTMLElement;
  private readonly selectionManager: SelectionManager;
  private readonly canvas: HTMLCanvasElement;

  constructor(
    renderer: GridRenderer,
    viewportManager: ViewportManager,
    container: HTMLElement,
    scrollContent: HTMLElement,
    selectionManager: SelectionManager,
    canvas: HTMLCanvasElement,
  ) {
    this.renderer = renderer;
    this.viewportManager = viewportManager;
    this.container = container;
    this.scrollContent = scrollContent;
    this.selectionManager = selectionManager;
    this.canvas = canvas;
  }

  public initialize(): void {
    this.setupVirtualScrollSpace();
    this.resize();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    this.container.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleResize);
    this.canvas.addEventListener("click", this.handleClick);
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

  private handleClick = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cellPosition = this.viewportManager.getCellAtPoint(x, y);
    if (!cellPosition) {
      return;
    }

    this.selectionManager.selectCell(
      cellPosition.getRowIndex(),
      cellPosition.getColumnIndex(),
    );
    console.log(cellPosition.getRowIndex(), cellPosition.getColumnIndex());
    this.renderer.render();
  };
}
