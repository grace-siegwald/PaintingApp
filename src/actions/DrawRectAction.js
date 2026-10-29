import { Rectangle } from "pixi.js";

// instance of DrawRectAction will be on our stack
export class DrawRectAction {

    constructor()
    {

        this.execute();
    }
    
    redo()
    { 

    }
    
    undo()
    { 
        // could make it invisible
        // remove from heirarchy all together
    }
    
    execute()
    {  
        // building out the shape
    }

}