import { Application, Assets, Sprite, Rectangle, Graphics  } from "pixi.js";
import ToolsManager from "./managers/ToolsManager.js";
import InputManager from "./managers/InputManager.js";

import "../style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

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

    ToolsManager.addToolGroup("Shapes",["fa-solid","fa-shapes"], [
        ToolsManager.getTool("Ellipse",["fa-regular","fa-circle"], () => {
            // Where we put code for "what happenes when this tool gets clicked"
            const circle = new Graphics()
                .circle(200, 200, 200, 100) // Create a rectangle with dimensions 200x100
                .fill('red'); // Fill the rectangle with a red color

            app.stage.addChild(circle);
            // Whenever you click one of these shape types, change the "state" of the app, depending on what state 

        }),
        ToolsManager.getTool("Rectangle",["fa-regular","fa-square"], () => {
            
            const rect = new Graphics()
                .rect(0, 0, 200, 100) // Create a rectangle with dimensions 200x100
                .fill('red'); // Fill the rectangle with a red color

            app.stage.addChild(rect);
            
        }),
        ToolsManager.getTool("Line",["fa-solid","fa-lines-leaning"], () => {
            
            
        }),
        ToolsManager.getTool("Star",["fa-regular","fa-star"], () => {
            
            
        })
    ]);
    
    let fillColorPicker = ToolsManager.getColorPicker("Fill Color");
    let strokeColorPicker = ToolsManager.getColorPicker("Stroke Color");
    let strokeInput = document.getElementById("stroke");

    ToolsManager.addTool(fillColorPicker);
    ToolsManager.addTool(strokeColorPicker);
    
    ToolsManager.addTool(ToolsManager.getTool("Select Tool",["fa-solid","fa-arrow-pointer"], () => {
        
    }));
    
    ToolsManager.addTool(ToolsManager.getTool("Move Tool",["fa-solid","fa-up-down-left-right"], () => {
        
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

    });
    
    redoBtn.addEventListener("click",() => {

    });
    
    

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
