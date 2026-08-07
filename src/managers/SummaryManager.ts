import type { GridDataStore } from "../data/GridDataStore";
import type { CellRange } from "../models/CellRange";
import type { SummaryResult } from "../models/SummaryResult";

export class SummaryManager {
  public calculate(range: CellRange, dataStore: GridDataStore): SummaryResult {
    let count = 0;
    let sum = 0;
    let min: number | null = null;
    let max: number | null = null;

    for (let row = range.getStartRow(); row <= range.getEndRow(); row++) {
      for (
        let column = range.getStartColumn();
        column <= range.getEndColumn();
        column++
      ) {
        const value = dataStore.getCellValue(row, column);
        if (value === null) {
          continue;
        }
        const number = Number(value);

        if (!Number.isFinite(number)) {
          continue;
        }

        count++;
        sum += number;

        if (min === null || number < min) {
          min = number;
        }

        if (max === null || number > max) {
          max = number;
        }
      }
    }

    return {
      count,
      sum,
      min,
      max,
      average: count === 0 ? 0 : sum / count,
    };
  }
}
