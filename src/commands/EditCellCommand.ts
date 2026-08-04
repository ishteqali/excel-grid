import { GridDataStore } from "../data/GridDataStore";
import type { CellValue } from "../models/CellModel";
import type { ICommand } from "./ICommand";

export class EditCellCommand implements ICommand {
  private readonly dataStore: GridDataStore;
  private readonly rowIndex: number;
  private readonly columnIndex: number;
  private readonly oldValue: CellValue;
  private readonly newValue: CellValue;

  constructor(
    dataStore: GridDataStore,
    rowIndex: number,
    columnIndex: number,
    oldValue: CellValue,
    newValue: CellValue,
  ) {
    this.dataStore = dataStore;
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  public execute(): void {
    this.dataStore.setCell(this.rowIndex, this.columnIndex, this.newValue);
  }

  public undo(): void {
    this.dataStore.setCell(this.rowIndex, this.columnIndex, this.oldValue);
  }
}
