function Circle(options) {
    this.options = {
        id: null,
        type: 'circle',
        shallow: true,
        adjusters: null,
        factory: null,
        plate: null
    };
    $.extend(this.options, options);
    this.startX = this.startY = this.endX = this.endY = 0;
    this.options.plate = this.options.factory.options.plate;
    this.options.factory.options.active_template = 'sheets_list'
}

Circle.prototype = {
    provisionDrawing: function (element_class, boundary_points) {
        this.options.adjusters.drawing_element.attr({
            r: boundary_points.radius,
            cx: this.startX,
            cy: this.startY
        });
        this.options.adjusters.drawingLink.append(this.options.adjusters.drawing_element);
        this.options.adjusters.drawingLink.appendTo(this.options.adjusters.element_group.attr('class', 'elements_group'));

        if (this.options.adjusters.drawing_element.attr('class') == undefined) {
            this.options.adjusters.drawing_element.attr('class', element_class)
        }

        this.options.adjusters.provisionBoundary(boundary_points);
        this.options.adjusters.element_group.appendTo(this.options.adjusters.boundary_group);
    },

    getBoundaryPoints: function (drawingStartX, drawingStartY, drawingEndX, drawingEndY, ratio) {
        var min_x, min_y, max_x, max_y, x, y, r;

        ratio == undefined ? ratio = {x: 1, y: 1} : ratio;
        if (drawingStartX == undefined) {
            min_x = parseFloat(this.options.adjusters.drawing_element.attr('cx')) / ratio.x;
            min_y = parseFloat(this.options.adjusters.drawing_element.attr('cy')) / ratio.y;
            r = parseFloat(this.options.adjusters.drawing_element.attr('r')) / ((ratio.x + ratio.y) / 2);

        } else {
            min_x = drawingStartX / ratio.x;
            min_y = drawingStartY / ratio.y;
            max_x = drawingEndX / ratio.x;
            max_y = drawingEndY / ratio.y;
            r = Math.sqrt(((max_x - min_x) * (max_x - min_x)) + ((max_y - min_y) * (max_y - min_y)));
        }

        return {
            lt: [min_x - r, min_y - r], rt: [min_x + r, min_y - r], rb: [min_x + r, min_y + r],
            lb: [min_x - r, min_y + r], top_mid: [min_x, (min_y - r)], right_mid: [(min_x + r), min_y],
            bottom_mid: [min_x, (min_y + r)], left_mid: [(min_x - r), min_y], radius: Math.abs(r),
            diagonal_mid: [min_x, min_y], translation: this.options.factory.getTransformationValues().translate,
            cx: min_x, cy: min_y, width: (2 * Math.abs(r)), height: (2 * Math.abs(r))
        }
    },

    drawingPoints: function () {
        return {
            startPoint: this.getBoundaryPoints(undefined, undefined, undefined, undefined,
                this.options.factory.getCurrentPointsRatio()).diagonal_mid,
            endPoint: this.getBoundaryPoints(undefined, undefined, undefined, undefined,
                this.options.factory.getCurrentPointsRatio()).right_mid
        }
    },

    adjustTranslation: function () {
        var attrs = this.getBoundaryPoints();

        this.options.adjusters.drawing_element.attr({
            cx: attrs.diagonal_mid[0] + attrs.translation[0],
            cy: attrs.diagonal_mid[1] + attrs.translation[1]
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

    setCapabilities: function () {
        var status = (this.options.factory.options.user_role == 'owner');

        if(status && this.options.plate.options.circle.draggable){
            this.options.draggable.capability = true;
            this.options.draggable.enable = true;
        }else{
            this.options.draggable.capability = false;
            this.options.draggable.enable = false;
        }

        if(status && this.options.plate.options.circle.resizable){
            this.options.resizable.capability = true;
            this.options.resizable.enable = true;
        }else{
            this.options.resizable.capability = false;
            this.options.resizable.enable = false;
        }

        if(status && this.options.plate.options.circle.rotatable){
            this.options.rotatable.capability = true;
            this.options.rotatable.enable = true;
        }else{
            this.options.rotatable.capability = false;
            this.options.rotatable.enable = false;
        }

        if(status && this.options.plate.options.circle.linkable){
            this.options.linkable.capability = true;
            this.options.linkable.enable = true;
        }else{
            this.options.linkable.capability = false;
            this.options.linkable.enable = false;
        }

        if(status && this.options.plate.options.circle.textable){
            this.options.textable.capability = true;
            this.options.textable.enable = true;
        }else{
            this.options.textable.capability = false;
            this.options.textable.enable = false;
        }

        if(status && this.options.plate.options.circle.deletable){
            this.options.deletable.capability = true;
            this.options.deletable.enable = true;
        }else{
            this.options.deletable.capability = false;
            this.options.deletable.enable = false;
        }
    },

    setTooltip: function () {
        var _this = this;

        if ((this.options.factory.options.link_sheet_id == undefined) ||
            (this.options.factory.options.link_sheet_id == '')) {
            this.options.adjusters.link_option_a.tooltipster('content', this.options.adjusters.sheet_list_template);
            this.options.factory.options.active_template = 'sheets_list'
        } else {
            this.options.adjusters.link_option_a.tooltipster('content', this.options.adjusters.link_template);
            this.options.factory.options.active_template = 'sheet_link'
        }

        $.each(this.options.plate.options.sheets_data, function (i, v) {
            if (v.id == _this.options.factory.options.link_sheet_id) {
                _this.options.adjusters.link_template.find('img#drawing_sheet_link-' + _this.options.id)
                    .data('path', v.path);
            }
        });
    },

    generateDrawingFromDb: function () {
        var current_zoom = this.options.plate.options.viewer.plateSetCurrentZoom;
        var draw_percentage = this.options.factory.options.zoom_percentage;
        var ratio = draw_percentage / current_zoom;
        var points = {
            startX: parseFloat(this.options.factory.options.attrs.startPoint[0]) / ratio,
            startY: parseFloat(this.options.factory.options.attrs.startPoint[1]) / ratio,
            endX:parseFloat(this.options.factory.options.attrs.endPoint[0])/ ratio,
            endY: parseFloat(this.options.factory.options.attrs.endPoint[1]) / ratio,
            start: true
        };

        this.provisionCreation(points);
        this.options.factory.provisionLocalSvg();
        this.options.adjusters.link_template.find('img.drawing_sheet_link').attr('src', this.options.factory.link);
        this.options.factory.setAuthorization();
    },

    provisionCreation: function (options) {
        if (options.start == true) {
            this.startX = options.startX;
            this.startY = options.startY;
        }
        var boundary_points = this.getBoundaryPoints(this.startX, this.startY,
            options.endX, options.endY);
        this.provisionDrawing(this.options.type + ' drawing', boundary_points);
        this.options.shallow = false;
    },

    provisionResize: function (options) {
        this.startX = this.getBoundaryPoints().cx;
        this.startY = this.getBoundaryPoints().cy;

        var boundary_points = this.getBoundaryPoints(
            this.getBoundaryPoints().cx, this.getBoundaryPoints().cy,
            options.newX * this.options.factory.getCurrentPointsRatio().x,
            options.newY * this.options.factory.getCurrentPointsRatio().y
        );
        this.options.adjusters.provisionBoundary(boundary_points);
        this.provisionDrawing('', boundary_points);
    },

    provisionDragging: function (options) {
        if (options.start == true) {
            this.startX = options.startX;
            this.startY = options.startY;
            this.options.rotate = this.options.factory.getTransformationValues().rotate;
            this.options.transform_string = this.options.factory.getTransformationValues().translate_string;
            this.options.current_transform = '';
            this.options.starting_points = this.getBoundaryPoints();
        } else {
            var current_displaced_x = (options.endX - this.startX) * this.options.factory.getCurrentPointsRatio().x;
            var current_displaced_y = (options.endY - this.startY) * this.options.factory.getCurrentPointsRatio().y;
            var overall_displaced_x = options.endX - this.startX;
            var overall_displaced_y = options.endY - this.startY;

            if ([current_displaced_x, current_displaced_y] != [0, 0]) {
                this.options.current_transform += ' translate(' + current_displaced_x + ' ' + current_displaced_y + ')';
                this.options.adjusters.boundary_group.attr({
                    'transform': this.options.transform_string + this.options.current_transform
                });
            }
            this.startX = options.endX;
            this.startY = options.endY;
        }
    }
};