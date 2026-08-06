import type { ViewportManager } from "../managers/ViewportManager";
import type { ICommand } from "./ICommand";

export class ResizeRowCommand implements ICommand {
  private readonly viewportManager: ViewportManager;
  private readonly rowIndex: number;
  private readonly oldHeight: number;
  private readonly newHeight: number;

  constructor(
    viewportManager: ViewportManager,
    columnIndex: number,
    oldHeight: number,
    newHeight: number,
  ) {
    this.viewportManager = viewportManager;
    this.rowIndex = columnIndex;
    this.oldHeight = oldHeight;
    this.newHeight = newHeight;
  }

  execute(): void {
    this.viewportManager.setRowHeight(this.rowIndex, this.newHeight);
  }

  undo(): void {
    this.viewportManager.setRowHeight(this.rowIndex, this.oldHeight);
  }
}
