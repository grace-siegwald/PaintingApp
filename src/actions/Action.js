// An Action is one undoable thing the user did: drew a shape, moved it, deleted it...
// This is called the "Command pattern".
//
// Every action can:
//   execute() - do it for the first time
//   undo()    - put things back the way they were BEFORE ("last state")
//   redo()    - put things back the way they were AFTER ("current state")
//
// Each action stores whatever it needs to get between those two states.
// Drawing: the shape, and the layer it goes in.
// Moving (later): the shape, its old position, and its new position.
export class Action
{
    constructor(name)
    {
        if (new.target === Action) throw new Error("Action is abstract");
        this.name = name;
    }

    execute()
    {
        throw new Error(`${this.constructor.name} must implement execute()`);
    }

    undo()
    {
        throw new Error(`${this.constructor.name} must implement undo()`);
    }

    // Most actions redo by simply doing the same thing again.
    // Override this if an action's first run does extra work it shouldn't repeat.
    redo()
    {
        this.execute();
    }
}
