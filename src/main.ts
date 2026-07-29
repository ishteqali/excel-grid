import "./style.css";

import { Grid } from "./core/Grid";
import { ViewportManager } from "./managers/ViewportManager";
import { GridRenderer } from "./renderer/GridRenderer";

const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
const container = document.getElementById("gridContainer") as HTMLElement;
const scrollContent = document.getElementById("scrollContent") as HTMLElement;

const viewportManager = new ViewportManager();

const renderer = new GridRenderer(canvas, viewportManager);

const grid = new Grid(renderer, viewportManager, container, scrollContent);

grid.initialize();
