# Learning
### *Learning to create an independent JS plugin(CanvasPlate) for creating drawings on a HTML div element.*
##### CanvasPlate

 Provisions a plate(canvas_plate) where drawings can be drawn.

 Drawing plate has its tools in the toolbar.On selecting any of the drawing tool, Canvas plate attains a state "CREATE" and gets prepared to
 draw a new drawing.

 As plate detects a mouse down event it initializes a new drawing(as per tool selected).
          Here it stops the event propagation.
          and it places a request for drawing product in the Drawing Factory(drawing_factory).
          Drawing Factory provides a suitable product for the request.
          This product is composed of different parts -
                  Actual drawing, Boundary path, Boundary resize circles, drawing delete element, Rotate handle,
                  tooltip position element etc.
          which after getting assembled constitutes a complete product.
          For parts drawing factory further places a request in Parts factory((drawing_parts_factory)).
          Then these parts gets assembled and a complete product is prepared
 On moving the mouse with a mouse down it starts creating the drawing.
 As plate detects a mouse up event it attains a state 'IDLE'.

 On pressing a drawing for long, it switches to editable mode. Drawing Drag and Resize operations are
 available in the editable mode only.
 On clicking the drawing plate all the drawings come out of the editable mode.

 Now as the plate detects a mouse down on any of resize circles of any of its drawings, it attains a state 'RESIZE'.
          Here it again stops the event propagation.
          And resize procedures particular to drawing under selection starts working.
Again as plate detects a mouse up event it attains a state 'IDLE'.

 Now as the plate detects a mouse down event on any of the drawing element, it attains a state 'DRAG'.
          Here it again stops the event propagation.
          And drag procedures particular to drawing under selection starts working.
Again as plate detects a mouse up event it attains a state 'IDLE'.


