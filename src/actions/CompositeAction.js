import { Action } from "./Action.js";

export class CompositeAction extends Action
{
    constructor(name, actions)
    {
        super(name);
        this.actions = actions;
    }

    execute()
    {
        for (const action of this.actions) action.execute();
    }

    undo()
    {
        // BACKWARDS: the last thing done is the first thing undone. Each action expects the canvas to look the way it did right after it ran
        for (const action of [...this.actions].reverse()) action.undo();
    }
}