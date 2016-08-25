function Arrow(options) {
    this.options = {
        id: null,
        shallow: true,
        adjusters: null,
        factory: null,
        plate: null
    };
    $.extend(this.options, options);
    this.min_x = this.min_y = this.max_x = this.max_y = 0;
    this.options.plate = this.options.factory.options.plate;
    this.options.factory.options.active_template = 'text';
    var _this = this;
}

Arrow.prototype = {
    provisionDrawing: function (element_class, boundary_points) {
        var marker_id = 'url(#arrow_head' + ')';
        this.options.adjusters.drawing_element.attr({
            x1: this.min_x,
            y1: this.min_y,
            x2: this.max_x,
            y2: this.max_y,
            'marker-end': marker_id
        });
        this.options.adjusters.drawing_element.appendTo(this.options.adjusters.element_group.attr('class', 'elements_group'));

        if (this.options.adjusters.drawing_element.attr('class') == undefined) {
            this.options.adjusters.drawing_element.attr('class', element_class)
        }
        this.options.adjusters.provisionBoundary(boundary_points);
        this.options.adjusters.element_group.appendTo(this.options.adjusters.boundary_group);
        if (this.options.plate.logging) console.log('(Arrow) provisioned')
    },

    getBoundaryPoints: function (drawingStartX, drawingStartY, drawingEndX, drawingEndY, ratio) {
        var min_x, min_y, max_x, max_y, x, y, r;

        ratio == undefined ? ratio = {x: 1, y: 1} : ratio;
        if (drawingStartX == undefined) {
            min_x = parseFloat(this.options.adjusters.drawing_element.attr('x1')) / ratio.x;
            min_y = parseFloat(this.options.adjusters.drawing_element.attr('y1')) / ratio.y;
            max_x = parseFloat(this.options.adjusters.drawing_element.attr('x2')) / ratio.x;
            max_y = parseFloat(this.options.adjusters.drawing_element.attr('y2')) / ratio.y;

        } else {
            min_x = drawingStartX / ratio.x;
            min_y = drawingStartY / ratio.y;
            max_x = drawingEndX / ratio.x;
            max_y = drawingEndY / ratio.y;
            r = Math.sqrt(((max_x - min_x) * (max_x - min_x)) + ((max_y - min_y) * (max_y - min_y)));
        }

        if (min_x > max_x) {
            min_x = [max_x, max_x = min_x][0]
        }
        if (min_y > max_y) {
            min_y = [max_y, max_y = min_y][0]
        }

        return {
            lt: [min_x, min_y], rt: [max_x, min_y], rb: [max_x, max_y], lb: [min_x, max_y],
            top_mid: [(min_x + max_x) / 2, min_y], right_mid: [max_x, (min_y + max_y) / 2],
            bottom_mid: [(max_x + min_x) / 2, max_y], left_mid: [min_x, (max_y + min_y) / 2],
            diagonal_mid: [(min_x + max_x) / 2, (min_y + max_y) / 2], width: Math.abs(max_x - min_x),
            height: Math.abs(max_y - min_y),
            x1: parseFloat(this.options.adjusters.drawing_element.attr('x1')) / ratio.x,
            y1: parseFloat(this.options.adjusters.drawing_element.attr('y1')) / ratio.x,
            x2: parseFloat(this.options.adjusters.drawing_element.attr('x2')) / ratio.x,
            y2: parseFloat(this.options.adjusters.drawing_element.attr('y2')) / ratio.x,
            translation: this.options.factory.getTransformationValues().translate,
            rotate: this.options.factory.getTransformationValues().rotate
        }
    },

    drawingPoints: function () {
        return {
            startPoint: [
                this.getBoundaryPoints(undefined, undefined, undefined, undefined,
                    this.options.factory.getCurrentPointsRatio()).x1,
                this.getBoundaryPoints(undefined, undefined, undefined, undefined,
                    this.options.factory.getCurrentPointsRatio()).y1],
            endPoint: [
                this.getBoundaryPoints(undefined, undefined, undefined, undefined,
                    this.options.factory.getCurrentPointsRatio()).x2,
                this.getBoundaryPoints(undefined, undefined, undefined, undefined,
                    this.options.factory.getCurrentPointsRatio()).y2
            ]
        }
    },

    adjustTranslation: function () {
        return true
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
        }
        this.options.adjusters.boundary_path.css('display', action);
        this.options.adjusters.text.find('tspan#element_text-' + this.options.id).css('display', action);
        canvas_plate.adjustBoundaryElements();
    },

    setCapabilities: function () {
        var status = (this.options.factory.options.user_role == 'owner');

        if (status && this.options.plate.options.line.draggable) {
            this.options.draggable.capability = true;
            this.options.draggable.enable = true;
        } else {
            this.options.draggable.capability = false;
            this.options.draggable.enable = false;
        }

        if (status && this.options.plate.options.line.resizable) {
            this.options.resizable.capability = true;
            this.options.resizable.enable = true;
        } else {
            this.options.resizable.capability = false;
            this.options.resizable.enable = false;
        }

        if (status && this.options.plate.options.line.rotatable) {
            this.options.rotatable.capability = true;
            this.options.rotatable.enable = true;
        } else {
            this.options.rotatable.capability = false;
            this.options.rotatable.enable = false;
        }

        if (status && this.options.plate.options.line.linkable) {
            this.options.linkable.capability = true;
            this.options.linkable.enable = true;
        } else {
            this.options.linkable.capability = false;
            this.options.linkable.enable = false;
        }

        if (status && this.options.plate.options.line.textable) {
            this.options.textable.capability = true;
            this.options.textable.enable = true;
        } else {
            this.options.textable.capability = false;
            this.options.textable.enable = false;
        }

        if (status && this.options.plate.options.line.deletable) {
            this.options.deletable.capability = true;
            this.options.deletable.enable = true;
        } else {
            this.options.deletable.capability = false;
            this.options.deletable.enable = false;
        }
    },

    setTooltip: function () {
        this.options.adjusters.text_template.find('textarea.template_textarea').val(this.options.factory.options.text);
        if (this.options.factory.options.text == '') {
            this.options.adjusters.text_template.find('input.submit_text').val('Add');
        } else {
            this.options.adjusters.text_template.find('input.submit_text').val('Update');
        }
        this.options.adjusters.text.find('tspan#text_content-' + this.options.id)
            .text(this.options.factory.options.text.trimToLength(20));
        this.options.adjusters.text_option_a.tooltipster('content', this.options.adjusters.text_template);
        this.options.factory.options.active_template = 'text'
    },

    generateDrawingFromDb: function () {
        var ratio = this.options.factory.options.zoom_percentage / this.options.plate.options.viewer.plateSetCurrentZoom;
        var points = {
            startX: parseFloat(this.options.factory.options.attrs.startPoint[0]) / ratio,
            startY: parseFloat(this.options.factory.options.attrs.startPoint[1]) / ratio,
            endX: parseFloat(this.options.factory.options.attrs.endPoint[0]) / ratio,
            endY: parseFloat(this.options.factory.options.attrs.endPoint[1]) / ratio,
            start: true
        };
        if (this.options.plate.logging) console.log('(Arrow) id, ratio,points---------', this.options.factory.options.id, ratio, points)
        this.provisionCreation(points);
        this.options.factory.provisionLocalSvg();
        this.options.factory.setAuthorization();
    },

    revertArrow: function () {
        var x1 = this.options.adjusters.drawing_element.attr('x1');
        var y1 = this.options.adjusters.drawing_element.attr('y1');
        this.options.adjusters.drawing_element.attr({
            x1: this.options.adjusters.drawing_element.attr('x2'),
            y1: this.options.adjusters.drawing_element.attr('y2'),
            x2: x1,
            y2: y1
        });

        this.options.factory.updateDrawing({
            data: {
                drawing: {
                    attrs: this.drawingPoints(),
                    zoom_percentage: this.options.plate.options.viewer.plateSetCurrentZoom
                }
            }
        });

        /* ------ To toggle arrow head in ie ------ */
        $(this.options.adjusters.boundary_group)
            .hide(CanvasPlate.SKETCHES_HIDE_ANIMATION_TIME)
            .show(CanvasPlate.SKETCHES_SHOW_ANIMATION_TIME);
    },

    provisionCreation: function (options) {
        if (options.start == true) {
            this.min_x = options.startX;
            this.min_y = options.startY;
        }
        this.max_x = options.endX;
        this.max_y = options.endY;

        var boundary_points = this.getBoundaryPoints(this.min_x, this.min_y, this.max_x, this.max_y);
        this.provisionDrawing(this.options.type + ' drawing', boundary_points);
        this.options.shallow = false;
        if (this.options.plate.logging) console.log('(Arrow) this.min_x, this.min_y, this.max_x, this.max_y---------', this.min_x, this.min_y, this.max_x, this.max_y)
    }
};