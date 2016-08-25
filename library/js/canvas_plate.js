//######################################################################################################//
//                               Canvas Plate Constructor
//######################################################################################################//

//==============  Canvas Plate Constants ==================================//
CanvasPlate.SAMPLE_SVG_HEIGHT = 55;
CanvasPlate.SAMPLE_SVG_WIDTH = 100;
CanvasPlate.OVERLAPPING_SKETCH_CONTAINER_HEIGHT = 400;
CanvasPlate.SKETCHES_SHOW_ANIMATION_TIME = 800;
CanvasPlate.SKETCHES_HIDE_ANIMATION_TIME = 500;
CanvasPlate.BOUNDARY_CIRCLES_RADIUS = 5;
CanvasPlate.LONG_PRESS_TIME = 700;  //MILLISECONDS

//==============  Canvas Plate acting as space to play with drawings ==================================//
function CanvasPlate(options) {
    this.options = {
        id: null,
        toolbox: null,
        plate: null,
        container: null,
        svg: null,

        rect: null,
        circle: null,
        scribble: null,
        line: null
    };
    $.extend(this.options, options);

    /*--- Logs in the system start showing ---*/
    this.logging = false;

    this.long_press_start = 0;
    this.options.toolbox.options.canvas_plate = this.options.svg;
    this.current_drawing = null;
    this.current_target = null;
    this.active_event = 'mousemove';
    this.current_mode = 'IDLE';
    /*--- Current mode of the plate ---*/

    /*--- Coordinates of the drawing ---*/
    this.startX = null;
    this.startY = null;
    this.endX = null;
    this.endY = null;

    this.drawing_type_selected = '';
    this.options.plateSetData = {height: this.options.plate.height(), width: this.options.plate.width()};
    var _this = this;

    /*
     Zooming on viewer takes time and provide final dimensions.On Canvas
     Plate for setting viewBox, viewer's final dimensions are required.
     */
    //if (this.options.viewer) {
    //    this.options.onMouseScrollInstructions = null;
    //    this.options.viewer.registerAfterZoomCallback(function (pos_n_dim, tiles_loaded_flag) {
    //        _this.options.plateSetData = pos_n_dim;
    //        if (typeof(_this.options.onMouseScrollInstructions) == "function") {
    //            _this.options.onMouseScrollInstructions();
    //        }
    //    });
    //}

    //=============================  For plate provisioning  =============================================//
    this.provision();
    this.updateViewBox();
    this.drawAllDrawings();

    //######################################################################################################//
    //                               Canvas Plate event handling
    //######################################################################################################//

    //=============================  For Drawing type selection  ===========================================//
    this.options.toolbox.options.container.on('click', function (e) {
        if (_this.options.toolbox.options.selectedToolType == 'drawing') {
            _this.adaptCreateModeBehaviour();
            _this.drawing_type_selected = _this.options.toolbox.options.selectedTool.attr('id');
            _this.current_drawing = new SketchFactory(
                {
                    type: _this.drawing_type_selected,
                    plate: _this,
                    id: Date.now(),
                    link_template: _this.options.sheet_list_template,
                    shallow: true,
                    editable: true
                }
            );
        } else {
            _this.adaptIdleModeBehaviour()
        }
    });

    $('body').on('keyup', function (e) {
        if (e.which == 27) {
            _this.adaptIdleModeBehaviour();
        }
    });

    //=============================  Overlapped drawing selection  =========================================//
    this.overlapping_drawings_container.on('click', '.sample_svg', function (e) {
        e.stopPropagation();
        var sample_svg = this;
        $.each(_this.allDrawings(), function (i, obj) {
            if (obj.options.id == $(sample_svg).children().first().attr('id')) {
                obj.adjusters.boundary_group.show(CanvasPlate.SKETCHES_SHOW_ANIMATION_TIME);
                obj.sketch.toggleBoundary('show');
                obj.adjusters.local_svg.data('z_index', parseInt(Date.now()));
                _this.reArrangeElements($('.local_svg'));
                _this.current_drawing = obj;
            } else {
                obj.adjusters.boundary_group.hide(CanvasPlate.SKETCHES_HIDE_ANIMATION_TIME)
            }
            obj.adjusters.actions_circle_a.tooltipster('hide');
        });
        _this.options.plate.removeClass('overlapping_underlay');
        _this.current_drawing.adjusters.actions_circle_a.tooltipster('show');
    });

    this.overlapping_drawings_container.on('mousewheel', function (e) {
        e.stopPropagation();
    });
    //=============================  Provision new SVG on zooming =========================================//
    this.options.svg.on('mousewheel', function (e) {
        _this.options.onMouseScrollInstructions = function () {
            _this.updateViewBox();
            _this.adjustBoundaryElements();
        }
    });

    //######################################################################################################//
    //                   Canvas Plate MOUSE DOWN, MOUSE MOVE and MOUSE UP
    //######################################################################################################//

    //=============================  Drawing actions start  ====================================//
    this.options.svg.on('mousedown', function (e) {
        _this.provisionPropagation(e);
        _this.long_press_start = Date.now();
        _this.active_event = 'mousedown';
        _this.current_target = $(e.target);

        var start_x = e.pageX - _this.options.svg.offset().left;
        var start_y = e.pageY - _this.options.svg.offset().top;
        _this.startX = start_x;
        _this.startY = start_y;
        //=========================  CREATE drawing start  ==========================//
        if (_this.current_mode == 'CREATE') {
            _this.provisionDrawingsFading('fade');
            _this.current_drawing.sketch.provisionCreation({
                startX: start_x, startY: start_y, endX: start_x, endY: start_y, start: true
            });
        } else {
            _this.current_drawing = _this.getDrawingObject(_this.current_target);
            if (_this.current_drawing) {
                //=========================  DRAGGING drawing start  ==========================//
                if (_this.current_drawing.sketch.options.draggable.enable) {
                    if (_this.current_target.attr('class').indexOf('drawing') > -1) { //JQuery's hasClass does not work with svg
                        _this.current_mode = 'DRAG';
                        _this.current_drawing.long_press_start = new Date().getTime();
                        _this.current_drawing.sketch.provisionDragging({start: true, startX: start_x, startY: start_y});
                    }
                }
                //=========================  RESIZING drawing start  ==========================//
                if (_this.current_drawing.sketch.options.resizable.enable) {
                    if (_this.current_target.attr('class').indexOf('boundary_circle') > -1) {
                        _this.current_mode = 'RESIZE';
                        _this.current_drawing.sketch.provisionResize({start: true, newX: start_x, newY: start_y})
                    }
                }
                //=========================  ROTATING drawing start  ==========================//
                if (_this.current_drawing.sketch.options.rotatable.enable) {
                    if (_this.current_target.attr('class').indexOf('boundary_transform_circle') > -1) {
                        _this.current_mode = 'ROTATE';
                        _this.current_drawing.sketch.provisionRotation({start: true});
                    }
                }
            }
        }
    });
    //=============================  Drawing actions in progress  ====================================//
    this.options.svg.on('mousemove', function (e) {
        _this.provisionPropagation(e);
        _this.long_press_start = Date.now();
        var start_x = e.pageX - _this.options.svg.offset().left;
        var start_y = e.pageY - _this.options.svg.offset().top;
        var options = {};

        if (_this.current_drawing) {
            switch (_this.current_mode) {
                //====================  CREATE drawing in progress  =============//
                case 'CREATE':
                    if (_this.active_event == 'mousedown') {
                        options = {startX: start_x, startY: start_y, endX: start_x, endY: start_y};
                        _this.current_drawing.sketch.provisionCreation(options);
                    }
                    break;
                //====================  RESIZING drawing in progress  =============//
                case 'RESIZE':
                    if (_this.active_event == 'mousedown') {
                        switch (_this.current_drawing.options.type) {
                            //====================  RESIZING circle in progress  =============//
                            case 'circle':
                                if (_this.current_target.attr('class').indexOf('boundary_circle') > -1) {
                                    options = {newX: start_x, newY: start_y};
                                }
                                _this.current_drawing.sketch.provisionResize(options);
                                break;
                            //====================  RESIZING rectangle in progress  =============//
                            case 'rect':
                                var distance;
                                //================== RESIZING from TOP =================//
                                if (_this.current_target.attr('class').indexOf('top_circle') > -1) {
                                    options = {direction: 'TOP', newX: start_x, newY: start_y};
                                }
                                //================== RESIZING from BOTTOM =================//
                                if (_this.current_target.attr('class').indexOf('bottom_circle') > -1) {
                                    options = {direction: 'BOTTOM', newX: start_x, newY: start_y};
                                }
                                //================== RESIZING from LEFT =================//
                                if (_this.current_target.attr('class').indexOf('left_circle') > -1) {
                                    options = {direction: 'LEFT', newX: start_x, newY: start_y};
                                }
                                //================== RESIZING from RIGHT =================//
                                if (_this.current_target.attr('class').indexOf('right_circle') > -1) {
                                    options = {direction: 'RIGHT', newX: start_x, newY: start_y};
                                }

                                _this.current_drawing.sketch.provisionResize(options);
                                break;
                        }
                    }
                    break;
                //====================  DRAGGING drawing in progress  =============//
                case 'DRAG':
                    if (_this.current_target.attr('class').indexOf('drawing') > -1) {
                        _this.current_drawing.adaptUnderDraggingModeBehaviour();
                        _this.current_drawing.sketch.provisionDragging({endX: start_x, endY: start_y});
                    }
                    break;
                //====================  ROTATING drawing in progress  =============//
                case 'ROTATE':
                    _this.current_drawing.sketch.provisionRotation({endX: start_x, endY: start_y});
                    break;
            }
        } else {
            if (_this.active_event == 'mousedown') {
                _this.adaptUnderDraggingModeBehaviour();
            }
        }
    });
    //=============================  Drawing actions complete  ====================================//
    this.options.svg.on('mouseup', function (e) {
        _this.active_event = 'mouseup';
        _this.options.toolbox.unselectAllTools();

        switch (_this.current_mode) {
            //================== CREATE drawing complete =================//
            case 'CREATE':
                var end_x = e.pageX - _this.options.svg.offset().left;
                var end_y = e.pageY - _this.options.svg.offset().top;
                //========== Tooltipster provisioning =======================//
                _this.current_drawing.provisionLocalSvg();
                if (_this.current_drawing.sketch.options.linkable.capability) {
                    _this.current_drawing.adjusters.link_option_a
                        .tooltipster('content', _this.current_drawing.adjusters.tooltip);
                }

                if (_this.current_drawing.sketch.options.textable.capability) {
                    _this.current_drawing.adjusters.text_option_a
                        .tooltipster('content', _this.current_drawing.adjusters.text_template);
                    _this.current_drawing.adjusters.text_option_a.tooltipster('show');
                }
                _this.current_drawing.adaptCreatedModeBehaviour();
                //============= Save newly created drawing =====================//
                _this.current_drawing.saveDrawing({
                    data: {
                        drawing: {
                            type: _this.current_drawing.options.type == 'line'
                                ? 'Arrow'
                                : _this.current_drawing.options.type.capitalize(),
                            attrs: _this.current_drawing.sketch
                                .drawingPoints(_this.startX, _this.startY, end_x, end_y),
                            temp_id: _this.current_drawing.options.id
                        }
                    }
                });
                _this.current_mode = 'READY';
                break;
            //================== RESIZING, DRAGGING, ROTATING drawing complete =================//
            case 'RESIZE':
            case 'DRAG':
                _this.current_drawing = _this.getDrawingObject($(e.target));

                //===== In case of drawing delete, update request should not be placed. =====//
                _this.current_drawing.updateDrawing({
                    data: {
                        drawing: {
                            type: _this.current_drawing.options.type == 'line'
                                ? 'Arrow'
                                : _this.current_drawing.options.type.capitalize(),
                            attrs: _this.current_drawing.sketch.drawingPoints(),
                            temp_id: _this.current_drawing.options.id
                        }
                    }
                });
                _this.current_drawing.sketch.toggleBoundary('hide');
                _this.current_drawing.adaptIdleModeBehaviour();
                _this.current_drawing.adjusters.actions_circle_a.tooltipster('hide');
                _this.current_mode = 'IDLE';
                break;
            case 'ROTATE':
                _this.current_drawing = _this.getDrawingObject($(e.target));
                _this.current_mode = 'IDLE';
                break;
            //================== When Canvas Plate is idle =================//
            case 'IDLE':
                //================== Long clicked on plate =================//
                if (Date.now() - _this.long_press_start > CanvasPlate.LONG_PRESS_TIME) {
                    _this.provisionDrawingSelection(
                        e.pageX - _this.options.plate.offset().left,
                        e.pageY - _this.options.plate.offset().top
                    );
                    _this.current_mode = 'READY';
                }
                //================== Short clicked on plate =================//
                else {
                    _this.options.plate.removeClass('overlapping_underlay');
                    _this.overlapping_drawings_container.empty().hide();
                    _this.overlapping_drawings_container.slimScroll({destroy: true});
                    _this.current_mode = 'IDLE';
                }
                break;
        }

        //================== When target is Main SVG =================//
        if ($(e.target).attr('id') == _this.options.svg.attr('id')) {
            _this.adaptIdleModeBehaviour();
        }
    });
}

//######################################################################################################//
//                               Canvas Plate prototypes
//######################################################################################################//

CanvasPlate.prototype = {
    //===================== Generates all available drawings ============================//
    drawAllDrawings: function () {
        if (this.logging) console.log('(Plate) starting to draw esisting drawings---------')

        var _this = this;
        var points;

        $.each(Object.keys(this.options.existing_drawings), function (index, drawing_type) {
            $.each(_this.options.existing_drawings[drawing_type], function (i, v) {
                var sketch_factory = new SketchFactory(
                    {
                        id: v.data.id,
                        main_id: v.data.id,
                        shallow: false,
                        type: drawing_type.toLowerCase() == 'arrow' ? 'line' : drawing_type.toLowerCase(),
                        belonging: v.data.belonging,
                        attrs: v.data.oriented_attrs,
                        zoom_percentage: v.data.zoom_percentage,
                        sheet_id: v.data.sheet_id,
                        link_sheet_id: (v.data.link_sheet_id == null ? '' : v.data.link_sheet_id),
                        text: (v.data.text == null ? '' : v.data.text),
                        plate: _this,
                        endpoints: v.endpoints,
                        editable: v.editable
                    });
                sketch_factory.sketch.generateDrawingFromDb();
                sketch_factory.sketch.setCapabilities();
                sketch_factory.setBelonging('saved');
                sketch_factory.SetActionsCapabilities();
                sketch_factory.sketch.setTooltip();
                sketch_factory
                    .adjusters.actions_circle_a
                    .tooltipster('content', sketch_factory.adjusters.drawing_actions_template);
                sketch_factory.setDrawingPointer();
            })
        });
    },

    //===================== Gets the current viewport size ===============================//
    provision: function () {
        this.options.plate.append(this.options.svg);
        this.options.svg.appendTo(this.options.container.appendTo(this.options.plate));

        /*=============================  For Drawings overlapping  =======================//*/
        this.drawing_list_svg = this.getSvg(
            {
                id: 'drawing_list_svg',
                class: 'drawing_list_svg',
                height: CanvasPlate.SAMPLE_SVG_HEIGHT - 5,
                width: CanvasPlate.SAMPLE_SVG_WIDTH
            });
        this.overlapping_drawings_container = this.getElement('div',
            {id: 'overlapping_drawings_container', class: 'overlapping_drawings_container'}, {});
        this.overlapping_drawings_container.appendTo(this.options.plateContainer).hide();

        if (this.logging) console.log('(Plate) provisioned---------')
    },

    //===================== Set viewBox according to available viewport ==================//
    updateViewBox: function () {
        document.getElementById('svgroot')
            .setAttribute('viewBox', '0 0 ' + this.options.plateSetData.width + ' ' + this.options.plateSetData.height)
        if (this.logging) {
            console.log('(Plate) viewBox updated---------')
        }
    },

    //===================== Provision Event propagation on the plate =====================//
    provisionPropagation: function (e) {
        if (this.options.toolbox.options.selectedTool != null) {
            e.stopPropagation();
        }
        if (this.current_mode != 'IDLE') {
            e.stopPropagation();
        }
    },

    //===================== Creates or selects the HTML element ==========================//
    getElement: function (element, attributes, data) {
        if ($(element + '#' + attributes.id).size() > 0) {
            return $(element + '#' + attributes.id);
        } else {
            return $(document.createElement(element)).attr(attributes).data(data);
        }
    },

    //===================== Creates or selects the SVG ===================================//
    getSvg: function (attributes) {
        if ($('svg#' + attributes.id).size() > 0) {
            return $('svg#' + attributes.id);
        } else {
            return $('<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" ></svg>')
                .attr(attributes);
        }
    },

    //===================== Sample drawings creations for overlapping =====================//
    provisionDrawingSelection: function (point_x, point_y) {
        var _this = this;
        var height = 0;
        var overlapping_drawings = _this.getUnderLyingDrawings({x: point_x, y: point_y});
        if (overlapping_drawings.length > 1) {
            this.current_drawing.adjusters.actions_circle_a.tooltipster('hide');
            this.overlapping_drawings_container.empty().show();

            $.each(overlapping_drawings, function (i, drawing) {
                height = height + CanvasPlate.SAMPLE_SVG_HEIGHT;
                var sample_svg = _this.drawing_list_svg.clone(true).attr({
                    class: 'sample_svg',
                    id: 'sample_svg-' + drawing.options.id
                });
                sample_svg.appendTo(_this.overlapping_drawings_container);
                _this.options.plate.addClass('overlapping_underlay');

                var drawing_clone = drawing.adjusters.drawing_element.clone(true).attr('class', 'drawing_clone');
                var svgs_ratio = drawing.getCurrentPointsRatio(drawing.adjusters.local_svg, sample_svg);
                var attrs = {};

                switch (drawing.options.type) {
                    case 'rect':
                        attrs = {
                            x: drawing.sketch.getBoundaryPoints().lt[0] * svgs_ratio.x,
                            y: drawing.sketch.getBoundaryPoints().lt[1] * svgs_ratio.y,
                            width: drawing.sketch.getBoundaryPoints().width * svgs_ratio.x,
                            height: drawing.sketch.getBoundaryPoints().height * svgs_ratio.y,
                            stroke: '#ffffff'
                        };
                        break;
                    case 'circle':
                        attrs = {
                            r: drawing.sketch.getBoundaryPoints().radius * svgs_ratio.x,
                            cx: drawing.sketch.getBoundaryPoints().cx * svgs_ratio.x,
                            cy: drawing.sketch.getBoundaryPoints().cy * svgs_ratio.y,
                            stroke: '#ffffff'
                        };
                        break;
                    case 'scribble':
                        var path = '';
                        $.each(drawing.sketch.points, function (j, point) {
                            if (j == 0) {
                                path = 'M ' + (point[0] * svgs_ratio.x) + ' ' + (point[1] * svgs_ratio.y)
                            } else {
                                path = path + ' L ' + (point[0] * svgs_ratio.x) + ' ' + (point[1] * svgs_ratio.y)
                            }
                        });
                        attrs = {d: path, 'stroke-width': 1, stroke: '#ffffff'};
                        break;
                    case 'line':
                        attrs = {
                            x1: drawing.sketch.getBoundaryPoints().x1 * svgs_ratio.x / 2,
                            y1: drawing.sketch.getBoundaryPoints().y1 * svgs_ratio.y / 2,
                            x2: drawing.sketch.getBoundaryPoints().x2 * svgs_ratio.x / 2,
                            y2: drawing.sketch.getBoundaryPoints().y2 * svgs_ratio.y / 2,
                            stroke: '#ffffff'
                        };
                        break;

                }
                drawing_clone.removeAttr('vector-effect').attr(attrs).appendTo(sample_svg);
            });
            this.overlapping_drawings_container.html(this.overlapping_drawings_container.html());
            if (height > CanvasPlate.OVERLAPPING_SKETCH_CONTAINER_HEIGHT) {
                height = CanvasPlate.OVERLAPPING_SKETCH_CONTAINER_HEIGHT;
            }
            this.overlapping_drawings_container.slimScroll({height: height, color: '#ffffff'})
        }
    },

    provisionDrawingsFading: function (status) {
        $.each(this.allDrawings(), function (i, drawing) {
            //if (!drawing.options.shallow) {
            if (document.getElementById(drawing.adjusters.drawing_element.attr('id')) != null) {
                if (status == 'fade') {
                    $(drawing.adjusters.boundary_group).hide(CanvasPlate.SKETCHES_HIDE_ANIMATION_TIME);
                } else {
                    $(drawing.adjusters.boundary_group).show(CanvasPlate.SKETCHES_SHOW_ANIMATION_TIME);
                }
            }
            //}
        });
    },

    //===================== Provides object for selected element =====================//
    getDrawingObject: function (current_target) {
        var element_id;
        if ($(current_target).attr('class').indexOf('drawing') > -1) {
            element_id = current_target.attr('id');
        }

        if ($(current_target).attr('class').indexOf('elements_group') > -1) {
            element_id = current_target.find('.drawing').first().attr('id');
        }

        if ($(current_target).attr('class').indexOf('boundary_group') > -1) {
            element_id = current_target.find('g.elements_group').find('.drawing').first().attr('id');
        }

        if ($(current_target).attr('class').indexOf('text_object') > -1) {
            element_id = current_target.parents('g.boundary_group').find('g.elements_group').find('.drawing').first().attr('id');
        }

        if ($(current_target).attr('class').indexOf('boundary_element') > -1) {
            element_id = current_target.parents('g.boundary_group').find('g.elements_group').find('.drawing').first().attr('id');
        }

        return this.getDrawingObjectById(parseInt(element_id));
    },

    //===================== Provides object through object id =====================//
    getDrawingObjectById: function (id) {
        var index = this.allDrawings().map(function (obj) {
            return obj.options.id
        }).indexOf(id);
        if (index > -1) {
            return this.allDrawings()[index]
        }
    },

    //===================== Rearrange elements base on z_index data =====================//
    reArrangeElements: function (elements) {
        $(elements).sortElements(function (a, b) {
            return parseInt($(a).data().z_index) > parseInt($(b).data().z_index) ? 1 : -1;
        })
    },

    //===================== Provide all saved drawings on plate =====================//
    allDrawings: function () {
        return $.map(drawings_array, function (obj) {
            if (!obj.options.shallow) {
                return obj;
            }
        })
    },

    toggleAllDrawings: function (status) {
        $.each(this.allDrawings(), function (i, drawing) {
            //if (!drawing.options.shallow) {
            drawing.sketch.toggleBoundary(status);
            if (status == 'fade') {
                $(drawing.adjusters.boundary_group).hide(CanvasPlate.SKETCHES_HIDE_ANIMATION_TIME);
            } else {
                $(drawing.adjusters.boundary_group).show(CanvasPlate.SKETCHES_SHOW_ANIMATION_TIME);
            }
            drawing.setDrawingPointer();
            //}
        });
    },

    //===================== Set new size of boundary circles =====================//
    adjustBoundaryElements: function () {
        var _this = this;
        $.each(this.allDrawings(), function (i, v) {
            $.each(this.adjusters.boundary_group.find('circle.boundary_element'), function (index, circle) {
                $(circle).attr(
                    'r', CanvasPlate.BOUNDARY_CIRCLES_RADIUS * ((v.getCurrentPointsRatio().x + v.getCurrentPointsRatio().y) / 2)
                )
            })
        });
    },

    //===================== Provides all drawings underlying provided point =====================//
    getUnderLyingDrawings: function (point) {
        return $.map(this.allDrawings(), function (obj) {
            if ((obj.sketch.getBoundaryPoints().lt[0] / obj.getCurrentPointsRatio().x < point.x) &&
                (obj.sketch.getBoundaryPoints().rb[0] / obj.getCurrentPointsRatio().y > point.x) &&
                (obj.sketch.getBoundaryPoints().lt[1] / obj.getCurrentPointsRatio().x < point.y) &&
                (obj.sketch.getBoundaryPoints().rb[1] / obj.getCurrentPointsRatio().y > point.y)) {
                return obj
            }
        })
    },

    //==========  calculates shortest distance between point(x,y) and line [(x1,y1),(x2,y2)]  ==========//
    getPointToLineDistance: function (x, y, x1, y1, x2, y2) {
        var A = x - x1;
        var B = y - y1;
        var C = x2 - x1;
        var D = y2 - y1;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = -1;
        if (len_sq != 0) {
            param = dot / len_sq;
        }
        var xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        var dx = x - xx;
        var dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    },

    adaptCreateModeBehaviour: function (e) {
        console.log('---CREATE mode invoked on canvas plate---');
        this.current_mode = 'CREATE';
        this.toggleAllDrawings('show');

        $.each(this.allDrawings(), function (index, drawing) {
            /*--- Hide text tooltip ---*/
            if (drawing.sketch.options.textable.capability) {
                drawing.adjusters.text_option_a.tooltipster('hide')
            }
            /*--- Hide link tooltip ---*/
            if (drawing.sketch.options.linkable.capability) {
                drawing.adjusters.link_option_a.tooltipster('hide')
            }
            drawing.sketch.toggleBoundary('hide');
            drawing.adjusters.boundary_group.css('cursor', 'crosshair');
        });
        this.options.svg.css('cursor', 'crosshair');
        this.options.plate.removeClass('overlapping_underlay');
        this.overlapping_drawings_container.empty().hide();
    },

    adaptIdleModeBehaviour: function (e) {
        console.log('---IDLE mode invoked on canvas plate---');
        this.current_mode = 'IDLE';
        this.toggleAllDrawings('show');

        /*--- Hide toolTipster for all non shallow drawings ---*/
        $.each(this.allDrawings(), function (index, drawing) {
            drawing.sketch.toggleBoundary('hide');
            drawing.adjusters.boundary_group.css('cursor', 'pointer');
            /*--- Hide text tooltip ---*/
            if (drawing.sketch.options.textable.capability) {
                drawing.adjusters.text_option_a.tooltipster('hide');
            }
            /*--- Hide link tooltip ---*/
            if (drawing.sketch.options.linkable.capability) {
                drawing.adjusters.link_option_a.tooltipster('hide');
            }
        });

        this.options.svg.css('cursor', 'grab');
        this.options.plate.removeClass('overlapping_underlay');
        this.overlapping_drawings_container.empty().hide();
    },

    adaptUnderDraggingModeBehaviour: function () {
        this.options.svg.css('cursor', 'grabbing');
    }
};