//====================================================================================//
// Provisions a plate(drawing_plate) where drawings can be drawn.
// Drawing plate has its tools in the toolbar.
// On selecting any of the drawing tool, Drawing plate attains a state "CREATE" and gets prepared to
// draw a new drawing.

// As plate detects a mouse down event it initializes a new drawing(as per tool selected).
//          Here it stops the event propagation.
//          and it places a request for drawing product in the Drawing Factory(drawing_factory).
//          Drawing Factory provides a suitable product for the request.
//          This product is composed of different parts -
//                  Actual drawing, Boundary path, Boundary resize circles, drawing delete element, Rotate handle,
//                  tooltip position element etc.
//          which after getting assembled constitutes a complete product.
//          For parts drawing factory further places a request in Parts factory((drawing_parts_factory)).
//          Then these parts gets assembled and a complete product is prepared
// On moving the mouse with a mouse down it starts creating the drawing.
// As plate detects a mouse up event it attains a state 'IDLE'.

// On pressing a drawing for long, it switches to editable mode. Drawing Drag and Resize operations are
// available in the editable mode only.
// On clicking the drawing plate all the drawings come out of the editable mode.

// Now as the plate detects a mouse down on any of resize circles of any of its drawings, it attains a state 'RESIZE'.
//          Here it again stops the event propagation.
//          And resize procedures particular to drawing under selection starts working.
//Again as plate detects a mouse up event it attains a state 'IDLE'.

// Now as the plate detects a mouse down event on any of the drawing element, it attains a state 'DRAG'.
//          Here it again stops the event propagation.
//          And drag procedures particular to drawing under selection starts working.
//Again as plate detects a mouse up event it attains a state 'IDLE'.

//====================================================================================//
//= require viewer/drawing/sketch_factory
//= require viewer/drawing/canvas_plate.js
//= require viewer/drawing/sketches/rect.js
//= require viewer/drawing/sketches/circle.js
//= require viewer/drawing/sketches/scribble.js
//= require viewer/drawing/sketches/arrow.js
//= require viewer/drawing/adjusters_factory.js

// ======================== Rearrange dom elements based on provided value ==========================//
jQuery.fn.sortElements = (function () {
    var sort = [].sort;
    return function (comparator, getSortable) {
        getSortable = getSortable || function () {
            return this;
        };
        var placements = this.map(function () {
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );
            return function () {
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
            };
        });
        return sort.call(this, comparator).each(function (i) {
            placements[i].call(getSortable.call(this));
        });
    };
})();

// ======================== Custom prototypes for Super classes ==========================//
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.trimToLength = function (m) {
    return (this.length > m)
        ? jQuery.trim(this).substring(0, m) + "..."
        : this;
};

Number.prototype.round = function(places){
    places = Math.pow(10, places);
    return Math.round(this * places)/places;
};

SVGElement.prototype.hasClass = function (className) {
    if (this.classList)
        return this.classList.contains(className);
    else
        return !!this.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

SVGElement.prototype.addClass = function (className) {
    if (this.classList)
        this.classList.add(className);
    else if (!hasClass(this, className)) this.className += " " + className
};
SVGElement.prototype.removeClass = function (className) {
    if (this.classList)
        this.classList.remove(className);
    else if (hasClass(this, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        this.className = this.className.replace(reg, ' ')
    }
};
//=========================================================================================//