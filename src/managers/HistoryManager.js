import { Event } from "../Event.js";

// Holds every Action the user has done, so they can be undone and redone.
//
//   undoStack: things that have happened, newest on top
//   redoStack: things that were undone, newest on top
//
// Draw A, draw B, draw C:   undo [A, B, C]   redo []
// Undo:                     undo [A, B]      redo [C]
// Undo:                     undo [A]         redo [C, B]
// Redo:                     undo [A, B]      redo [C]
// Draw D:                   undo [A, B, D]   redo []   <- a new action clears redo
class HistoryManager
{
    constructor()
    {
        this.undoStack = [];
        this.redoStack = [];

        // Fires after every execute/undo/redo, so other parts of the app
        // (undo/redo buttons, the selection highlight) can update themselves
        this.HistoryChangedEvent = new Event();
    }

    // Run a brand-new action and remember it
    execute(action)
    {
        action.execute();
        this.undoStack.push(action);
        this.redoStack = []; // the old "future" no longer makes sense
        this.HistoryChangedEvent.invoke();
    }

    undo()
    {
        if (!this.canUndo()) return;

        const action = this.undoStack.pop();
        action.undo();
        this.redoStack.push(action);
        this.HistoryChangedEvent.invoke();
    }

    redo()
    {
        if (!this.canRedo()) return;

        const action = this.redoStack.pop();
        action.redo();
        this.undoStack.push(action);
        this.HistoryChangedEvent.invoke();
    }

    canUndo() { return this.undoStack.length > 0; }
    canRedo() { return this.redoStack.length > 0; }
}

// Same pattern as InputManager and ToolsManager: one shared instance for the whole app
export default new HistoryManager();
