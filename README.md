# PaintingApp
Node.js Painting Application
Published at: https://grace-siegwald.github.io/PaintingApp/


Structure:

    A tool is just an object. There are different types of tools which extend on the definition of a "base" tool in order to be unique
    For example, the Shape Tool. This tool *has a* shape object. There are extensions of the shape object which define the different types of shapes

    Tool.js (base): subscribes/unsubscribes to mouse events
    ShapeTool.js extends Tool: state = idle or dragging
    Shape.js (base): has start/end points, a Pixi Graphics, a draw() function
    BasicShapes.js extends Shape: Rectangle, Ellipse, Line, Star