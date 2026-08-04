export class CellEditor {
  private readonly input: HTMLInputElement;
  constructor() {
    this.input = document.createElement("input");
    this.initialize();
  }
  private initialize(): void {
    this.input.type = "text";
    this.input.style.position = "absolute";
    this.input.style.display = "none";
    this.input.style.padding = "0 4px";
    this.input.style.margin = "0";
    this.input.style.border = "2px solid #107c41";
    this.input.style.font = "14px Calibri";
    this.input.style.boxSizing = "border-box";
    document.body.appendChild(this.input);
  }

  public show(
    x: number,
    y: number,
    width: number,
    height: number,
    value: string,
  ): void {
    console.log("Show Editor");
    this.input.style.left = `${x}px`;
    this.input.style.top = `${y}px`;
    this.input.style.width = `${width}px`;
    this.input.style.height = `${height}px`;
    this.input.value = value;
    this.input.style.display = "block";
    this.input.style.zIndex = "1";
    this.input.focus();
    this.input.select();
  }

  public move(x: number, y: number, width: number, height: number): void {
    this.input.style.left = `${x}px`;
    this.input.style.top = `${y}px`;
    this.input.style.width = `${width}px`;
    this.input.style.height = `${height}px`;
  }

  public hide(): void {
    this.input.style.display = "none";
  }

  public getValue(): string {
    return this.input.value;
  }

  public getInput(): HTMLInputElement {
    return this.input;
  }
}
