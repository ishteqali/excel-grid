import "./style.css";

import { Grid } from "./core/Grid";
import { ViewportManager } from "./managers/ViewportManager";
import { GridRenderer } from "./renderer/GridRenderer";
import { DimensionManager } from "./managers/DimensionManager";
import { JsonDataLoader } from "./data/JsonDataLoader";
import { GridDataStore } from "./data/GridDataStore";

const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
const container = document.getElementById("gridContainer") as HTMLElement;
const scrollContent = document.getElementById("scrollContent") as HTMLElement;

const dataLoader = new JsonDataLoader();
const employees = await dataLoader.load("/data/employees.json");
const dataStore = new GridDataStore(employees);

const dimensionManager = new DimensionManager();
const viewportManager = new ViewportManager(dimensionManager);

const renderer = new GridRenderer(canvas, viewportManager, dataStore);

const grid = new Grid(renderer, viewportManager, container, scrollContent);

grid.initialize();
