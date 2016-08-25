function Scribble(options) {
    this.options = {
        id: null,
        shallow: true,
        adjusters: null,
        factory: null,
        plate: null
    };
    $.extend(this.options, options);
    this.points = [];
    this.min_x = this.min_y = 1000000;
    this.max_x = this.max_y = this.endX = this.endY = 0;
    this.options.plate = this.options.factory.options.plate;
    this.options.factory.options.active_template = 'text';
    var _this = this;
}

Scribble.prototype = {
    provisionDrawing: function (element_class, boundary_points) {
        this.options.adjusters.drawing_element.attr({
            d: this.options.adjusters.drawing_element.attr('d') + ' L ' + this.endX + ' ' +
            this.endY
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
            min_x = this.points[0][0];
            min_y = this.points[0][1];
            max_x = this.points[0][0];
            max_y = this.points[0][1];
            $.each(this.points, function (i, v) {
                if (this[0] < min_x) {
                    min_x = this[0];
                }
                if (this[0] > max_x) {
                    max_x = this[0];
                }
                if (this[1] < min_y) {
                    min_y = this[1];
                }
                if (this[1] > max_y) {
                    max_y = this[1];
                }
            });

        } else {
            min_x = drawingStartX / ratio.x;
            min_y = drawingStartY / ratio.y;
            max_x = drawingEndX / ratio.x;
            max_y = drawingEndY / ratio.y;
            r = Math.sqrt(((max_x - min_x) * (max_x - min_x)) + ((max_y - min_y) * (max_y - min_y)));
        }

        return {
            lt: [min_x.round(2), min_y.round(2)],
            rt: [max_x.round(2), min_y.round(2)],
            rb: [max_x.round(2), max_y.round(2)],
            lb: [min_x.round(2), max_y.round(2)],
            top_mid: [((min_x + max_x) / 2).round(2), min_y.round(2)],
            right_mid: [max_x.round(2), ((min_y + max_y) / 2).round(2)],
            bottom_mid: [((max_x + min_x) / 2).round(2), max_y.round(2)],
            left_mid: [min_x.round(2), ((max_y + min_y) / 2).round(2)],
            diagonal_mid: [((min_x + max_x) / 2).round(2), ((min_y + max_y) / 2).round(2)],
            width: Math.abs(max_x - min_x).round(2),
            height: Math.abs(max_y - min_y).round(2),
            translation: this.options.factory.getTransformationValues().translate,
            rotate: this.options.factory.getTransformationValues().rotate,
            points: JSON.stringify(this.points)
        }
    },

    drawingPoints: function () {
        return {
            points: eval(this.getBoundaryPoints(undefined, undefined, undefined, undefined,
                this.options.factory.getCurrentPointsRatio()).points)
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
        //canvas_plate.adjustBoundaryElements();
    },

    setCapabilities: function () {
        var status = (this.options.factory.options.user_role == 'owner');

        if(status && this.options.plate.options.scribble.draggable){
            this.options.draggable.capability = true;
            this.options.draggable.enable = true;
        }else{
            this.options.draggable.capability = false;
            this.options.draggable.enable = false;
        }

        if(status && this.options.plate.options.scribble.resizable){
            this.options.resizable.capability = true;
            this.options.resizable.enable = true;
        }else{
            this.options.resizable.capability = false;
            this.options.resizable.enable = false;
        }

        if(status && this.options.plate.options.scribble.rotatable){
            this.options.rotatable.capability = true;
            this.options.rotatable.enable = true;
        }else{
            this.options.rotatable.capability = false;
            this.options.rotatable.enable = false;
        }

        if(status && this.options.plate.options.scribble.linkable){
            this.options.linkable.capability = true;
            this.options.linkable.enable = true;
        }else{
            this.options.linkable.capability = false;
            this.options.linkable.enable = false;
        }

        if(status && this.options.plate.options.scribble.textable){
            this.options.textable.capability = true;
            this.options.textable.enable = true;
        }else{
            this.options.textable.capability = false;
            this.options.textable.enable = false;
        }

        if(status && this.options.plate.options.scribble.deletable){
            this.options.deletable.capability = true;
            this.options.deletable.enable = true;
        }else{
            this.options.deletable.capability = false;
            this.options.deletable.enable = false;
        }
    },

    setTooltip: function () {
        this.options.adjusters.text_template.find('textarea.template_textarea').val(this.options.factory.options.text);
        this.options.adjusters.text.find('tspan#text_content-' + this.options.id)
            .text(this.options.factory.options.text.trimToLength(20));
        this.options.adjusters.text_option_a.tooltipster('content', this.options.adjusters.text_template);
    },

    generateDrawingFromDb: function () {
        var _this = this;
        var ratio = this.options.factory.options.zoom_percentage / this.options.plate.options.viewer.plateSetCurrentZoom;
        var points = this.options.factory.options.attrs.points;

        $.each(points, function (index, point) {
            _this.provisionCreation({endX: point[0] / ratio, endY: point[1] / ratio});
        });

        this.options.factory.provisionLocalSvg();
        this.options.factory.setAuthorization();
    },

    provisionCreation: function (options) {
        this.points.push([options.endX.round(2), options.endY.round(2)]);

        this.endX = options.endX;
        this.endY = options.endY;

        if (options.endX < this.min_x) {
            this.min_x = options.endX;
        } else if (options.endX > this.max_x) {
            this.max_x = options.endX;
        }

        if (options.endY < this.min_y) {
            this.min_y = options.endY;
        } else if (options.endY > this.max_y) {
            this.max_y = options.endY;
        }

        if (this.points.length == 1) {
            this.options.adjusters.drawing_element.attr({d: 'M ' + options.endX + ' ' + options.endY});
        } else {
            var boundary_points = this.getBoundaryPoints(this.min_x, this.min_y, this.max_x,
                this.max_y);
            this.provisionDrawing(this.options.type + ' drawing', boundary_points);
            this.options.shallow = false;
        }
    }
};