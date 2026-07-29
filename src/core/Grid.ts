import { GridConfig } from "../config/GridConfig";
import { ViewportManager } from "../managers/ViewportManager";
import { GridRenderer } from "../renderer/GridRenderer";

export class Grid {
  private readonly renderer: GridRenderer;
  private readonly viewportManager: ViewportManager;
  private readonly container: HTMLElement;
  private readonly scrollContent: HTMLElement;

  constructor(
    renderer: GridRenderer,
    viewportManager: ViewportManager,
    container: HTMLElement,
    scrollContent: HTMLElement,
  ) {
    this.renderer = renderer;
    this.viewportManager = viewportManager;
    this.container = container;
    this.scrollContent = scrollContent;
  }

  public initialize(): void {
    this.setupVirtualScrollSpace();
    this.resize();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    this.container.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleResize);
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
}
