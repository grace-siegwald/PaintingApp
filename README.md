# PaintingApp
Node.js Painting Application
Published at: https://grace-siegwald.github.io/PaintingApp/

use: npm run dev

Structure:

    A tool is just an object. There are different types of tools which extend on the definition of a "base" tool in order to be unique
    For example, the Shape Tool. This tool *has a* shape object. There are extensions of the shape object which define the different types of shapes

    Tool.js (base): subscribes/unsubscribes to mouse events
    ShapeTool.js extends Tool: state = idle or dragging
    Shape.js (base): has start/end points, a Pixi Graphics, a draw() function
    BasicShapes.js extends Shape: Rectangle, Ellipse, Line, Star


Notes for 10/22:
Create instances of all the actions we can do in the application, and all those instances should have a undo redo function defined
    Need a history manager to hold our stack
        import it into main
        then in Main, where the button code is, call HistoryManager.Undo or Redo
    Have an undo redo function that is executed when we click the undo redo function

    Instead of drawing a rectangle, make an instance of DrawRectAction and let the action draw for you
    Add that instance to the HistoryManager


Think about implementing a layers manager
    LayersManager
        A layer that has all the outlines for the shapes
        A layer fo the shapes themselves
        A layer for the selection thingy
    Create an empty container, a class that has behaviors with it

Selecting two different objects could but them into one temporary container, and then you'd just move that container around


DO SELECT FIRST
UNDO REDO / HISTORY MANAGER

Main is creating the conections to everything, sets up the behavior
    Goes the state manager, it sets the state 

an action needs a current state and a last state
every action can execute
every action can undo and redo

keyboard shortcuts???

fill tool as a possible custom tool???