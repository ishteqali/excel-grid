import type { EmployeeRecord } from "../models/EmployeeRecord";

export class JsonDataLoader {
  public async load(filePath: string): Promise<EmployeeRecord[]> {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }
    const data = await response.json();
    return data as EmployeeRecord[];
  }
}
