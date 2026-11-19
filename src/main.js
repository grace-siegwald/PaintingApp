import { Application, Container } from "pixi.js";
import ToolsManager from "./managers/ToolsManager.js";
import InputManager from "./managers/InputManager.js";
import HistoryManager from "./managers/HistoryManager.js";
import SelectionManager from "./managers/SelectionManager.js";

import "../style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Rectangle, Circle, Line, Star } from "./shapes/Shape.js";
import { ShapeTool } from "./tools/ShapeTool.js";
import { SelectTool } from "./tools/SelectTool.js";
import { MoveTool } from "./tools/MoveTool.js";


// Used for initializing the app and setting up the tools on the left hand side
(async () => {
    // Create a new application
    const app = new Application();
    // Initialize the application
    const container = document.getElementById("pixi-container");
    await app.init({
        background: "#aaaaaa",
        resizeTo: container
    });
    console.log(container);
    InputManager.initialize(app)


    // --- Grace's new stuff ---
    const drawingLayer = new Container();
    app.stage.addChild(drawingLayer);

    // Added AFTER drawingLayer, so it's drawn on top: the selection box sits above every shape
    const selectionLayer = new Container();
    app.stage.addChild(selectionLayer);
    SelectionManager.initialize(selectionLayer, drawingLayer);

    // get the tools
    const selectTool = new SelectTool();
    const moveTool = new MoveTool();

    // Adding a shape tool, it takes in the currecnt fill and stroke colors and width
    const shapeTool = new ShapeTool(drawingLayer, () => ({
    fill: fillColorPicker.value,
    stroke: strokeColorPicker.value,
    strokeWidth: Number(strokeInput.value),
    }));

    // Utility method for selecting the shape we want
    const selectShape = (ShapeClass) => {
    shapeTool.setShapeType(ShapeClass);
    ToolsManager.setActiveTool(shapeTool);
    };


    ToolsManager.addToolGroup("Shapes",["fa-solid","fa-shapes"], [
        ToolsManager.getTool("Ellipse",["fa-regular","fa-circle"], () => {
            selectShape(Circle)
        }),
        ToolsManager.getTool("Rectangle",["fa-regular","fa-square"], () => {
            selectShape(Rectangle)
        }),
        ToolsManager.getTool("Line",["fa-solid","fa-lines-leaning"], () => {
            selectShape(Line)
        }),
        ToolsManager.getTool("Star",["fa-regular","fa-star"], () => {
            selectShape(Star)
        })
    ]);
    
    let fillColorPicker = ToolsManager.getColorPicker("Fill Color");
    let strokeColorPicker = ToolsManager.getColorPicker("Stroke Color");
    let strokeInput = document.getElementById("stroke");

    ToolsManager.addTool(fillColorPicker);
    ToolsManager.addTool(strokeColorPicker);
    
    ToolsManager.addTool(ToolsManager.getTool("Select Tool",["fa-solid","fa-arrow-pointer"], () => {
        ToolsManager.setActiveTool(selectTool);
    }));
    
    ToolsManager.addTool(ToolsManager.getTool("Move Tool",["fa-solid","fa-up-down-left-right"], () => {
        ToolsManager.setActiveTool(moveTool);
    }));
    
    ToolsManager.addTool(ToolsManager.getTool("Scale Tool",["fa-solid","fa-up-right-and-down-left-from-center"], () => {
        
    }));
    
    ToolsManager.addTool(ToolsManager.getTool("Delete Tool",["fa-solid","fa-trash-can"], () => {        
        
    }));
    
    ToolsManager.addTool(ToolsManager.getTool("Group Tool",["fa-solid","fa-object-group"], () => {        
       
    }));
    
    ToolsManager.addTool(ToolsManager.getTool("Ungroup Tool",["fa-regular","fa-object-group"], () => {        
        
    }));
    
    container.appendChild(app.canvas);

    let undoBtn = document.getElementById("undo");
    let redoBtn = document.getElementById("redo");
        
    undoBtn.addEventListener("click",() => {
        HistoryManager.undo();
    });

    redoBtn.addEventListener("click",() => {
        HistoryManager.redo();
    });

    // Grey out undo/redo when there's nothing to undo/redo
    const updateUndoRedoButtons = () => {
        undoBtn.disabled = !HistoryManager.canUndo();
        redoBtn.disabled = !HistoryManager.canRedo();
    };
    HistoryManager.HistoryChangedEvent.addListener(updateUndoRedoButtons);
    updateUndoRedoButtons(); // set the starting state (both disabled)
    
    

    // Load the bunny texture
    /*const texture = await Assets.load("./assets/bunny.png");

    // Create a bunny Sprite
    const bunny = new Sprite(texture);

    // Center the sprite's anchor point
    bunny.anchor.set(0.5);

    // Move the sprite to the center of the screen
    bunny.position.set(app.screen.width / 2, app.screen.height / 2);

    // Add the bunny to the stage
    app.stage.addChild(bunny);

    // Listen for animate update
    app.ticker.add((time) => {
        // Just for fun, let's rotate mr rabbit a little.
        // * Delta is 1 if running at 100% performance *
        // * Creates frame-independent transformation *
        bunny.rotation += 0.1 * time.deltaTime;
    });*/
})();
