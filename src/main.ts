import "./style.css";

import { Grid } from "./core/Grid";
import { ViewportManager } from "./managers/ViewportManager";
import { GridRenderer } from "./renderer/GridRenderer";
import { DimensionManager } from "./managers/DimensionManager";
import { JsonDataLoader } from "./data/JsonDataLoader";
import { GridDataStore } from "./data/GridDataStore";
import { SelectionManager } from "./managers/SelectionManager";

const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
const container = document.getElementById("gridContainer") as HTMLElement;
const scrollContent = document.getElementById("scrollContent") as HTMLElement;
const selectionManager = new SelectionManager();

const dataLoader = new JsonDataLoader();
const employees = await dataLoader.load("/data/employees.json");
const dataStore = new GridDataStore(employees);

const dimensionManager = new DimensionManager();
const viewportManager = new ViewportManager(dimensionManager);

const renderer = new GridRenderer(canvas, viewportManager, dataStore, selectionManager);

const grid = new Grid(
  renderer,
  viewportManager,
  container,
  scrollContent,
  selectionManager,
  canvas,
);

grid.initialize();
