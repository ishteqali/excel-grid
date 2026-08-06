import type { ViewportManager } from "../managers/ViewportManager";
import type { ICommand } from "./ICommand";

export class ResizeColumnCommand implements ICommand {
  private readonly viewportManager: ViewportManager;
  private readonly columnIndex: number;
  private readonly oldWidth: number;
  private readonly newWidth: number;

  constructor(
    viewportManager: ViewportManager,
    columnIndex: number,
    oldWidth: number,
    newWidth: number,
  ) {
    this.viewportManager = viewportManager;
    this.columnIndex = columnIndex;
    this.oldWidth = oldWidth;
    this.newWidth = newWidth;
  }

  execute(): void {
    this.viewportManager.setColumnWidth(this.columnIndex, this.newWidth);
  }

  undo(): void {
    this.viewportManager.setColumnWidth(this.columnIndex, this.oldWidth);
  }
}
