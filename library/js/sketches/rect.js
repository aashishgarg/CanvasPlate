//====================  Rectangle type drawing  ========================//
function Rectangle(options) {
    this.options = {
        id: null,
        type: 'rect',
        shallow: true,
        adjusters: null,
        factory: null,
        plate: null
    };
    this.starting_points = {};
    this.rotate = [0, 0, 0];
    this.transform_string = 0;
    this.current_transform = '';
    this.startX = this.startY = this.endX = this.endY = 0;

    $.extend(this.options, options);
    this.options.plate = this.options.factory.options.plate;
    this.options.factory.options.active_template = 'sheets_list'
}

//====================  Rectangle instance level methods  ========================//
Rectangle.prototype = {
    //====================  Provision drawing  ========================//
    provisionDrawing: function (element_class, boundary_points) {
        this.options.adjusters.drawing_element.attr({
            x: boundary_points.lt[0], y: boundary_points.lt[1],
            width: boundary_points.width, height: boundary_points.height
        });
        this.options.adjusters.drawingLink.append(this.options.adjusters.drawing_element);
        this.options.adjusters.drawingLink.appendTo(this.options.adjusters.element_group.attr('class', 'elements_group'));


        if (this.options.adjusters.drawing_element.attr('class') == undefined) {
            this.options.adjusters.drawing_element.attr('class', element_class)
        }
        //this.drawing_element.appendTo(this.element_group.attr('class', 'elements_group'));
        this.options.adjusters.provisionBoundary(boundary_points);
        this.options.adjusters.element_group.appendTo(this.options.adjusters.boundary_group);
    },

    //==========  Provides boundary points of drawing for drawing to be created or already created drawing  ======//
    getBoundaryPoints: function (drawingStartX, drawingStartY, drawingEndX, drawingEndY, ratio) {
        var min_x = 0, min_y = 0, max_x = 0, max_y = 0, x = 0, y = 0, r = 0;

        ratio == undefined ? ratio = {x: 1, y: 1} : ratio;
        if (drawingStartX == undefined) {
            min_x = parseFloat(this.options.adjusters.drawing_element.attr('x')) / ratio.x;
            min_y = parseFloat(this.options.adjusters.drawing_element.attr('y')) / ratio.y;
            max_x = (parseFloat(this.options.adjusters.drawing_element.attr('x'))
            + parseFloat(this.options.adjusters.drawing_element.attr('width'))) / ratio.x;
            max_y = (parseFloat(this.options.adjusters.drawing_element.attr('y'))
            + parseFloat(this.options.adjusters.drawing_element.attr('height'))) / ratio.y;
        } else {
            min_x = drawingStartX / ratio.x;
            min_y = drawingStartY / ratio.y;
            max_x = drawingEndX / ratio.x;
            max_y = drawingEndY / ratio.y;
            r = Math.sqrt(((max_x - min_x) * (max_x - min_x)) + ((max_y - min_y) * (max_y - min_y)));
        }

        return {
            lt: [min_x, min_y], rt: [max_x, min_y], rb: [max_x, max_y], lb: [min_x, max_y],
            top_mid: [(min_x + max_x) / 2, min_y], right_mid: [max_x, (min_y + max_y) / 2],
            bottom_mid: [(max_x + min_x) / 2, max_y], left_mid: [min_x, (max_y + min_y) / 2],
            diagonal_mid: [(min_x + max_x) / 2, (min_y + max_y) / 2], width: Math.abs(max_x - min_x),
            height: Math.abs(max_y - min_y), translation: this.options.factory.getTransformationValues().translate,
            rotate: this.options.factory.getTransformationValues().rotate
        }
    },

    drawingPoints: function (startX, startY, endX, endY) {
        return {
            startPoint: this.getBoundaryPoints(startX, startY, endX, endY,
                this.options.factory.getCurrentPointsRatio()).lt,
            endPoint: this.getBoundaryPoints(startX, startY, endX, endY,
                this.options.factory.getCurrentPointsRatio()).rb
        }
    },

    //===============  Reset the attributes values on doing the translate value adjustment  ==============//
    adjustTranslation: function () {
        var attrs = this.getBoundaryPoints();

        this.options.adjusters.drawing_element.attr({
            x: attrs.lt[0] + attrs.translation[0], y: attrs.lt[1] + attrs.translation[1]
        });

        this.options.adjusters.actions_circle.attr({
            cx: parseFloat(this.options.adjusters.actions_circle.attr('cx')) + attrs.translation[0],
            cy: parseFloat(this.options.adjusters.actions_circle.attr('cy')) + attrs.translation[1]
        });

        if (this.options.draggable.capability) {
            $.each(this.options.adjusters.boundary_circles, function (i, circle) {
                this.attr({
                    cx: parseFloat(circle.attr('cx')) + attrs.translation[0],
                    cy: parseFloat(circle.attr('cy')) + attrs.translation[1]
                })
            });
            this.options.adjusters.boundary_path.attr({
                d: 'M ' + (attrs.lt[0] + attrs.translation[0]) + ' ' + (attrs.lt[1] + attrs.translation[1])
                + ' L ' + (attrs.rt[0] + attrs.translation[0]) + ' ' + (attrs.rt[1] + attrs.translation[1])
                + ' L ' + +(attrs.rb[0] + attrs.translation[0]) + ' ' + (attrs.rb[1] + attrs.translation[1])
                + ' L ' + (attrs.lb[0] + attrs.translation[0]) + ' ' + (attrs.lb[1] + attrs.translation[1])
                + ' Z'
            });
        }
        if (this.options.rotatable.capability) {
            this.options.adjusters.rotate_circle.attr({
                cx: parseFloat(this.options.adjusters.rotate_circle.attr('cx')) + attrs.translation[0],
                cy: parseFloat(this.options.adjusters.rotate_circle.attr('cy')) + attrs.translation[1]
            });
            this.options.adjusters.rotate_handle.attr({
                d: 'M ' + (attrs.top_mid[0] + attrs.translation[0]) + ' ' + (attrs.top_mid[1] + attrs.translation[1])
                + ' L ' + (attrs.top_mid[0] + attrs.translation[0]) + ' ' + (attrs.top_mid[1] + attrs.translation[1] - 30)
            });
        }

        if (this.options.linkable.capability) {
            this.options.adjusters.link_option.attr({
                cx: parseFloat(this.options.adjusters.link_option.attr('cx')) + attrs.translation[0],
                cy: parseFloat(this.options.adjusters.link_option.attr('cy')) + attrs.translation[1]
            })
        }
        if (this.options.textable.capability) {
            this.options.adjusters.text_option.attr({
                cx: parseFloat(this.options.adjusters.text_option.attr('cx')) + attrs.translation[0],
                cy: parseFloat(this.options.adjusters.text_option.attr('cy')) + attrs.translation[1]
            })
        }
        this.options.adjusters.boundary_group.attr({
            'transform': this.options.factory.getTransformationValues().rotate_string + ' translate(0 0)'
        })
    },

    //=================  Handles boundary visibility behaviour(show/hide)  ==================//
    toggleBoundary: function (visibility_status) {
        var _this = this;
        var action;
        if (visibility_status == 'show') {
            action = 'block';
        } else {
            action = 'none';
            this.options.draggable.enable = false;
            this.options.resizable.enable = false;
            this.options.rotatable.enable = false;
            this.options.textable.enable = false;
            this.options.deletable.enable = false;
            this.options.linkable.enable = false;
            $.each(this.options.adjusters.boundary_circles, function (position, circle) {
                if (!_this.options.resizable.enable) {
                    circle.css('display', action);
                }
            });
        }

        this.options.adjusters.boundary_path.css('display', action);
        this.options.adjusters.text.css('display', action);
        canvas_plate.adjustBoundaryElements();
    },

    //===============  Provides new points of drawing after rotation  ====================//
    getPointsAfterRotation: function (rotate_point, rotate_wrt_point, angle1) {
        var angle = angle1 * Math.PI / 180;
        return {
            x: ((rotate_point[0] - rotate_wrt_point[0]) * Math.cos(angle)) -
            ((rotate_point[1] - rotate_wrt_point[1]) * Math.sin(angle)) + rotate_wrt_point[0],
            y: ((rotate_point[0] - rotate_wrt_point[0]) * Math.sin(angle)) +
            (rotate_point[1] - rotate_wrt_point[1]) * Math.cos(angle) + rotate_wrt_point[1]
        };
    },

    //====================  Provides new boundary points of drawing after rotation  ========================//
    getBoundaryPointsAfterRotation: function (angle) {
        var points = this.getBoundaryPoints(undefined, undefined, undefined, undefined,
            this.options.factory.getCurrentPointsRatio());
        var mid = points.diagonal_mid;

        return {
            rotated_lt: this.getPointsAfterRotation(points.lt, mid, angle),
            rotated_rt: this.getPointsAfterRotation(points.rt, mid, angle),
            rotated_rb: this.getPointsAfterRotation(points.rb, mid, angle),
            rotated_lb: this.getPointsAfterRotation(points.lb, mid, angle),
            rotated_top_mid: this.getPointsAfterRotation(points.top_mid, mid, angle),
            rotated_right_mid: this.getPointsAfterRotation(points.right_mid, mid, angle),
            rotated_bottom_mid: this.getPointsAfterRotation(points.bottom_mid, mid, angle),
            rotated_left_mid: this.getPointsAfterRotation(points.left_mid, mid, angle)

        }
    },

    setCapabilities: function () {
        var status = (this.options.factory.options.user_role == 'owner');

        if (status && this.options.plate.options.rect.draggable) {
            this.options.draggable.capability = true;
            this.options.draggable.enable = true;
        } else {
            this.options.draggable.capability = false;
            this.options.draggable.enable = false;
        }

        if (status && this.options.plate.options.rect.resizable) {
            this.options.resizable.capability = true;
            this.options.resizable.enable = true;
        } else {
            this.options.resizable.capability = false;
            this.options.resizable.enable = false;
        }

        if (status && this.options.plate.options.rect.rotatable) {
            this.options.rotatable.capability = true;
            this.options.rotatable.enable = true;
        } else {
            this.options.rotatable.capability = false;
            this.options.rotatable.enable = false;
        }

        if (status && this.options.plate.options.rect.linkable) {
            this.options.linkable.capability = true;
            this.options.linkable.enable = true;
        } else {
            this.options.linkable.capability = false;
            this.options.linkable.enable = false;
        }

        if (status && this.options.plate.options.rect.textable) {
            this.options.textable.capability = true;
            this.options.textable.enable = true;
        } else {
            this.options.textable.capability = false;
            this.options.textable.enable = false;
        }

        if (status && this.options.plate.options.rect.deletable) {
            this.options.deletable.capability = true;
            this.options.deletable.enable = true;
        } else {
            this.options.deletable.capability = false;
            this.options.deletable.enable = false;
        }
    },

    setTooltip: function () {
        var _this = this;

        if ((this.options.factory.options.link_sheet_id == undefined) ||
            (this.options.factory.options.link_sheet_id == '')) {
            this.options.adjusters.link_option_a
                .tooltipster('content', this.options.adjusters.sheet_list_template);
            this.options.factory.options.active_template = 'sheets_list';
        } else {
            this.options.adjusters.link_option_a.tooltipster('content', this.options.adjusters.link_template);
            this.options.factory.options.active_template = 'sheet_link';
        }

        $.each(this.options.plate.options.sheets_data, function (i, v) {
            if (v.id == _this.options.factory.options.link_sheet_id) {
                _this.options.adjusters.link_template.find('img#drawing_sheet_link-' + _this.options.id)
                    .data('path', v.path);
            }
        });
    },


    generateDrawingFromDb: function () {
        var ratio = this.options.factory.options.zoom_percentage / this.options.plate.options.viewer.plateSetCurrentZoom;
        this.provisionCreation({
            startX: parseFloat(this.options.factory.options.attrs.startPoint[0]) / ratio,
            startY: parseFloat(this.options.factory.options.attrs.startPoint[1]) / ratio,
            endX: parseFloat(this.options.factory.options.attrs.endPoint[0]) / ratio,
            endY: parseFloat(this.options.factory.options.attrs.endPoint[1]) / ratio,
            start: true
        });
        this.options.factory.provisionLocalSvg();
        this.options.factory.setAuthorization();
    },

    //================  Controls the minimum height and width of rectangle  =================//
    getSanitizedPoints: function (options) {
        switch (options.position) {
            case 'TOP':
                if (options.startX > options.endX) {
                    options.startX = options.endX - 5;
                }
                if (options.startY > options.endY) {
                    options.startY = options.endY - 5;
                }
                break;
            case 'RIGHT':
                if (options.startX > options.endX) {
                    options.endX = options.startX + 5;
                }
                if (options.startY > options.endY) {
                    options.endY = options.startY + 5;
                }
                break;
            case 'BOTTOM':
                if (options.endX < options.startX) {
                    options.endX = options.startX + 5;
                }
                if (options.endY < options.startY) {
                    options.endY = options.startY + 5;
                }
                break;
            case 'LEFT':
                if (options.endX < options.startX) {
                    options.startX = options.endX - 5;
                }
                if (options.endY < options.startY) {
                    options.startY = options.endY - 5;
                }
                break;
            case undefined:
                if (options.endX < options.startX) {
                    options.endX = options.startX + 5;
                }
                if (options.endY < options.startY) {
                    options.endY = options.startY + 5;
                }
                break;
        }
        return {startX: options.startX, startY: options.startY, endX: options.endX, endY: options.endY}
    },

    //====================  Creates new Rectangle  ========================//
    provisionCreation: function (options) {
        var points = {};
        if (options.start == true) {
            this.startX = options.startX;
            this.startY = options.startY;
            this.endX = options.endX;
            this.endY = options.endY;

            /*--- In case of sheet rotation needs to swap the points ---*/
            if (this.startX > this.endX) {
                this.endX = this.startX + (this.startX = this.endX) - this.endX
            }
            if (this.startY > this.endY) {
                this.endY = this.startY + (this.startY = this.endY) - this.endY
            }

            points = {startX: this.startX, startY: this.startY, endX: this.endX, endY: this.endY};
        } else {
            this.endX = options.endX;
            this.endY = options.endY;

            points = this.getSanitizedPoints({
                startX: this.startX, startY: this.startY, endX: this.endX, endY: this.endY
            });
        }
        var boundary_points = this.getBoundaryPoints(points.startX, points.startY, points.endX, points.endY);
        this.provisionDrawing(this.options.type + ' drawing', boundary_points);
        this.options.shallow = false;
    },

    //====================  Creates new Rectangle  ========================//
    provisionResize: function (options) {
        var distance = 0;
        var points = {};
        if (options.start == true) {
            this.starting_points =
                this.getBoundaryPoints(undefined, undefined, undefined, undefined, this.options.factory.getCurrentPointsRatio());
            $.extend(this.starting_points, this.getBoundaryPointsAfterRotation(this.rotate[0]));
        } else {
            //---------------------------------------------------------------------------------------------------//
            if (options.direction == 'TOP') {
                distance = this.options.plate.getPointToLineDistance(
                    options.newX, options.newY,
                    this.starting_points.rotated_lt.x, this.starting_points.rotated_lt.y,
                    this.starting_points.rotated_rt.x, this.starting_points.rotated_rt.y
                );
                if (options.newY > this.starting_points.rotated_top_mid.y) {
                    distance = -distance
                }
                points = this.getSanitizedPoints({
                    startX: this.starting_points.lt[0], startY: this.starting_points.lt[1] - distance,
                    endX: this.starting_points.rb[0], endY: this.starting_points.rb[1], position: 'TOP'
                });
            }
            //---------------------------------------------------------------------------------------------------//
            if (options.direction == 'BOTTOM') {
                distance = this.options.plate.getPointToLineDistance(
                    options.newX, options.newY,
                    this.starting_points.rotated_lb.x, this.starting_points.rotated_lb.y,
                    this.starting_points.rotated_rb.x, this.starting_points.rotated_rb.y
                );
                if (options.newY < this.starting_points.rotated_bottom_mid.y) {
                    distance = -distance
                }
                points = this.getSanitizedPoints({
                    startX: this.starting_points.lt[0],
                    startY: this.starting_points.lt[1],
                    endX: this.starting_points.rb[0],
                    endY: (this.starting_points.rb[1] + distance),
                    position: 'BOTTOM'
                });
            }
            //---------------------------------------------------------------------------------------------------//
            if (options.direction == 'LEFT') {
                distance = this.options.plate.getPointToLineDistance(
                    options.newX, options.newY,
                    this.starting_points.rotated_lt.x, this.starting_points.rotated_lt.y,
                    this.starting_points.rotated_lb.x, this.starting_points.rotated_lb.y
                );
                if (options.newX > this.starting_points.rotated_left_mid.x) {
                    distance = -distance
                }
                points = this.getSanitizedPoints({
                    startX: this.starting_points.lt[0] - distance, startY: this.starting_points.lt[1],
                    endX: this.starting_points.rb[0], endY: this.starting_points.rb[1], position: 'LEFT'
                });
            }
            //---------------------------------------------------------------------------------------------------//
            if (options.direction == 'RIGHT') {
                distance = this.options.plate.getPointToLineDistance(
                    options.newX, options.newY,
                    this.starting_points.rotated_rt.x, this.starting_points.rotated_rt.y,
                    this.starting_points.rotated_rb.x, this.starting_points.rotated_rb.y
                );
                if (options.newX < this.starting_points.rotated_right_mid.x) {
                    distance = -distance
                }
                points = this.getSanitizedPoints({
                    startX: this.starting_points.lt[0],
                    startY: this.starting_points.lt[1],
                    endX: this.starting_points.rb[0] + distance,
                    endY: this.starting_points.rb[1],
                    position: 'RIGHT'
                });
            }
            var boundary_points = this.getBoundaryPoints(
                points.startX * this.options.factory.getCurrentPointsRatio().x,
                points.startY * this.options.factory.getCurrentPointsRatio().y,
                points.endX * this.options.factory.getCurrentPointsRatio().x,
                points.endY * this.options.factory.getCurrentPointsRatio().y
            );
            this.options.adjusters.provisionBoundary(boundary_points);
            this.provisionDrawing('', boundary_points);
        }
    },

    provisionDragging: function (options) {
        if (options.start == true) {
            this.startX = options.startX;
            this.startY = options.startY;
            this.rotate = this.options.factory.getTransformationValues().rotate;
            this.transform_string = this.options.factory.getTransformationValues().translate_string;
            this.current_transform = '';
            this.starting_points = this.getBoundaryPoints();
        } else {
            var current_displaced_x = (options.endX - this.startX) * this.options.factory.getCurrentPointsRatio().x;
            var current_displaced_y = (options.endY - this.startY) * this.options.factory.getCurrentPointsRatio().y;
            var overall_displaced_x = options.endX - this.startX;
            var overall_displaced_y = options.endY - this.startY;

            var new_rotate = 'rotate(' + this.rotate[0]
                + ' '
                + (this.rotate[1] + overall_displaced_x)
                + ' '
                + (this.rotate[2] + overall_displaced_y)
                + ') ';

            if ([current_displaced_x, current_displaced_y] != [0, 0]) {
                this.current_transform +=
                    ' translate(' + current_displaced_x
                    + ' '
                    + current_displaced_y
                    + ')';

                this.options.adjusters.boundary_group.attr({
                    'transform': new_rotate + this.transform_string + this.current_transform
                });
            }
            this.startX = options.endX;
            this.startY = options.endY;
        }
    },

    provisionRotation: function (options) {
        if (options.start == true) {
            this.starting_points = this.getBoundaryPoints();
        } else {
            var attributes = this.getBoundaryPoints();
            var new_rotation_point = [
                (attributes.diagonal_mid[0] + attributes.translation[0]),
                (attributes.diagonal_mid[1] + attributes.translation[1])
            ];
            this.factory.provisionTransformation(
                'rotate', new_rotation_point, [options.endX, options.endY]);
            this.rotate[0] = this.options.factory.getRotationAngle(
                new_rotation_point, [options.endX, options.endX]
            );
        }
    }
};