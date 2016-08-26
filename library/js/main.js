var drawings_color = 'red';
var data = {
    existing_drawings: {Rect: {}, Circle: {}, Arrow: {}, Scribble: {}},
    sheets_data: {},
    stroke_color: drawings_color,
    endpoints: {create_drawing: {url: '', method: 'POST'}},
    plate: $('div.drawing_plate'),
    plateContainer: $('div.drawing_plate_container'),
    container: $('<div class="svg_container" id="svg_container"></div>').height('100%').width('100%'),
    toolbox: toolbox,
    svg: $('' +
        '<svg id="svgroot" class="main_svg" xmlns:svg="http://www.w3.org/2000/svg" ' +
        'xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 1000">' +
            '<defs id="definitions" class="line_arrow">' +
                '<marker id="arrow_head" orient="auto" markerwidth="6" markerheight="6" refx="1" refy="5" ' +
                'viewBox="0 0 20 20">' +
                    '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + drawings_color +
                    '" id="arrow_head_path-" ' +
                    'vector-effect= "non-scaling-stroke"/>' +
                '</marker>' +
            '</defs>' +
        '</svg>'
    ),
    rect: {
        draggable: true, resizable: true, rotatable: false, linkable: true, textable: false, deletable: true
    },
    circle: {
        draggable: true, resizable: true, rotatable: false, linkable: true, textable: false, deletable: true
    },
    scribble: {
        draggable: false, resizable: false, rotatable: false, linkable: false, textable: true,
        deletable: true
    },
    line: {
        draggable: false, resizable: false, rotatable: false, linkable: false, textable: true,
        deletable: true
    },

    /*--- Different templates used in drawings ---*/
    sheet_list_template: '',
    drawing_link_template: '',
    drawing_text_template: '',
    drawing_actions_template: '',
    processing_thumbnail: ''
};

var canvas_plate = new CanvasPlate(data);
canvas_plate.adaptIdleModeBehaviour();