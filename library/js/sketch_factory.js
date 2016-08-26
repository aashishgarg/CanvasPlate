//   Important Link   //
// http://math.stackexchange.com/questions/270194/how-to-find-the-vertices-angle-after-rotation

/*######################################################################################################
 Sketch factory constructor
 ######################################################################################################*/
var drawings_array = [];

function SketchFactory(options) {
    this.options = {
        id: null,
        type: null,
        shallow: null,
        active_template: null,   // (sheets_list/sheet_link/text)
        boundary_visible: null,
        selected_sheet: {name: null, number: null}
    };
    $.extend(this.options, options);

    this.long_press_start = 0;
    this.sketch = this.pickDrawing();
    this.adjusters = this.sketch.options.adjusters;
    this.adjusters.options.sketch = this.sketch;

    this.setAuthorization();
    this.setBelonging('new');

    //======================= Push created drawing in main array =============//
    drawings_array.push(this);
    var _this = this;
    //######################################################################################################//
    //                           Sketch Mouse Down, Mouse Move and Mouse up
    //######################################################################################################//

    //=============================  Events for Factory products  ============================//
    this.setDrawingBehavior(this.adjusters.drawing_element);
    this.setDrawingBehavior(this.adjusters.text);

    //######################################################################################################//
    //                           Sketch templates click behavior
    //######################################################################################################//

    //=======================  Sheet list click  ===========================//
    this.adjusters.sheet_list_template.find('li#sheet_item-' + this.options.id).click(function () {
        var li = this;
        $.ajax({
            method: _this.options.endpoints.update_drawing.method,
            url: _this.options.endpoints.update_drawing.url,
            data: {drawing: {link_sheet_id: $(this).data().sheet_id}},
            dataType: 'script'
        }).success(function () {
            _this.adjusters.link_template.find('img.drawing_sheet_link').attr('src', $(li).data().thumbnail_url);

            /*--- set data for sheet name and number ---*/
            $(li).data().name == null ? $(li).data().name = '' : $(li).data().name;
            $(li).data().sheet_no == null ? $(li).data().sheet_no = '' : $(li).data().sheet_no;

            _this.options.link_sheet_id = $(li).data().sheet_id;
            _this.setDrawingPointer();
            _this.adjusters.link_template.find('span.template_sheet_no').text($(li).data().sheet_no);
            _this.adjusters.link_template.find('span.template_sheet_name').text($(li).data().name);
            _this.adjusters.link_template.find('a#sheet_link-' + _this.options.id).attr('href', $(li).data().path);
            _this.adjusters.tooltip = _this.adjusters.link_template;
            _this.adjusters.link_option_a.tooltipster('content', _this.adjusters.tooltip);
            _this.options.active_template = 'sheet_link';
        })
    });

    //=======================  EDIT sheet link  ===========================//
    this.adjusters.link_template.find('a#sheet_link_edit-' + this.options.id).click(function () {
        $.ajax({
            method: _this.options.endpoints.update_drawing.method,
            url: _this.options.endpoints.update_drawing.url,
            data: {drawing: {link_sheet_id: ''}},
            dataType: 'script'
        }).success(function () {
            _this.adjusters.link_template.find('img.drawing_sheet_link').attr('src', '');
            _this.adjusters.tooltip = _this.adjusters.sheet_list_template;
            _this.adjusters.link_option_a.tooltipster('content', _this.adjusters.tooltip);
            _this.options.active_template = 'sheets_list'
        })
    });

    //=======================  Sheet thumbnail click  ===========================//
    this.adjusters.link_template.find('img#drawing_sheet_link-' + this.options.id).click(function () {
        window.location.href = _this.adjusters.link_template
            .find('img#drawing_sheet_link-' + _this.options.id).data().path;
    });

    //=======================  Drawing push to master ===========================//
    $.each([this.adjusters.sheet_list_template.find('i#ptm_icon-' + this.options.id),
        this.adjusters.link_template.find('i#ptm_icon-' + this.options.id),
        this.adjusters.text_template.find('i#ptm_icon-' + this.options.id)], function (index, element) {

        element.click(function (e) {
            _this.updateBelonging(e, {
                method: _this.options.endpoints.push_to_master.method,
                url: _this.options.endpoints.push_to_master.url,
                data: {drawing: {belonging: 'master_copy'}},
                dataType: 'script'
            })
        });
    });

    //=======================  Save drawing text ===========================//
    this.adjusters.text_template.find('input.submit_text').click(function () {
        _this.options.text = $('.tooltipster-content').find('#template_textarea-' + _this.options.id).val();
        var data = {drawing: {text: _this.options.text}};
        _this.adjusters.text_template.find('textarea.template_textarea').val(_this.options.text);
        $.ajax({
            method: _this.options.endpoints.update_drawing.method,
            url: _this.options.endpoints.update_drawing.url,
            data: data,
            dataType: 'script'
        }).success(function () {
            _this.adjusters.text.find('tspan#text_content-' + _this.options.id).text(_this.options.text.trimToLength(20));
            if (_this.sketch.options.textable.capability) _this.adjusters.text_option_a.tooltipster('hide');
            _this.adjusters.text_template.find('input.submit_text').val('Update');
        })
    });

    /*--- For fixing IE issue(placeholder of textarea is shown as value in IE) ---*/
    this.adjusters.text_template.find('textarea.template_textarea').on('click',function(){
        if($(this).text() == 'Description...'){
            $(this).text('');
        }
    })
}

//######################################################################################################//
//                           Sketch factory instance methods
//######################################################################################################//

SketchFactory.prototype = {

    //=================  Creates specific product on type of factory product  =================//
    pickDrawing: function () {
        switch (this.options.type) {
            case 'rect':
                return (new Rectangle({
                    id: this.options.id, factory: this, shallow: true, type: this.options.type,
                    draggable: {capability: this.options.plate.options.rect.draggable},
                    resizable: {capability: this.options.plate.options.rect.resizable},
                    rotatable: {capability: this.options.plate.options.rect.rotatable},
                    linkable: {capability: this.options.plate.options.rect.linkable},
                    textable: {capability: this.options.plate.options.rect.textable},
                    deletable: {capability: this.options.plate.options.rect.deletable},
                    adjusters: new AdjustersFactory({id: this.options.id, factory: this, plate: this.options.plate})
                }));
                break;
            case 'circle':
                return (new Circle({
                    id: this.options.id, factory: this, shallow: true, type: this.options.type,
                    draggable: {capability: this.options.plate.options.circle.draggable},
                    resizable: {capability: this.options.plate.options.circle.resizable},
                    rotatable: {capability: this.options.plate.options.circle.rotatable},
                    linkable: {capability: this.options.plate.options.circle.linkable},
                    textable: {capability: this.options.plate.options.circle.textable},
                    deletable: {capability: this.options.plate.options.circle.deletable},
                    adjusters: new AdjustersFactory({id: this.options.id, factory: this, plate: this.options.plate})
                }));
                break;
            case 'scribble':
                return (new Scribble({
                    id: this.options.id, factory: this, shallow: true, type: this.options.type,
                    draggable: {capability: this.options.plate.options.scribble.draggable},
                    resizable: {capability: this.options.plate.options.scribble.resizable},
                    rotatable: {capability: this.options.plate.options.scribble.rotatable},
                    linkable: {capability: this.options.plate.options.scribble.linkable},
                    textable: {capability: this.options.plate.options.scribble.textable},
                    deletable: {capability: this.options.plate.options.scribble.deletable},
                    adjusters: new AdjustersFactory({id: this.options.id, factory: this, plate: this.options.plate})
                }));
                break;
            case 'line':
                return (new Arrow({
                    id: this.options.id, factory: this, shallow: true, type: this.options.type,
                    draggable: {capability: this.options.plate.options.line.draggable},
                    resizable: {capability: this.options.plate.options.line.resizable},
                    rotatable: {capability: this.options.plate.options.line.rotatable},
                    linkable: {capability: this.options.plate.options.line.linkable},
                    textable: {capability: this.options.plate.options.line.textable},
                    deletable: {capability: this.options.plate.options.line.deletable},
                    adjusters: new AdjustersFactory({id: this.options.id, factory: this, plate: this.options.plate})
                }));
                break;
        }
    },

    setDrawingBehavior: function (element) {
        var _this = this;
        $(element).on('mousedown', function (e) {
            _this.long_press_start = Date.now();
            _this.options.plate.reArrangeElements(_this.adjusters.boundary_group.children());
        }).on('mousemove', function (e) {
            _this.long_press_start = Date.now();
        }).on('mouseup', function (e) {
            _this.options.plate.current_drawing = _this;
            _this.setFinalTransformation();
            _this.sketch.adjustTranslation();

            //==================== LONG PRESS on drawing ===========================//
            if (Date.now() - _this.long_press_start > CanvasPlate.LONG_PRESS_TIME) {
                _this.reArrangeSvg();
                _this.sketch.toggleBoundary('show');
                _this.sketch.setCapabilities();
                _this.adaptSelectedModeBehaviour();
                _this.SetActionsCapabilities();
            }
            //==================== SHORT PRESS on drawing =========================//
            else {
                if (_this.options.plate.options.toolbox.options.selectedTool == null) {
                    if (_this.options.plate.current_mode == 'READY') {
                        _this.reArrangeSvg();
                        _this.sketch.toggleBoundary('show');
                        _this.sketch.setCapabilities();
                        _this.adaptSelectedModeBehaviour();
                        _this.SetActionsCapabilities();
                        $.each(_this.options.plate.allDrawings(), function (index, drawing) {
                            if (_this.options.id == drawing.options.id) {
                                _this.adaptSelectedModeBehaviour();
                            } else {
                                _this.adaptIdleModeBehaviour();
                            }
                        });
                    } else {
                        _this.setTooltipContentVisibility();
                        _this.setTooltipVisibility();
                    }
                }
            }
        });
    },

    //=============================  Deletes product  ====================================//
    markDeleted: function () {
        this.sketch.options.adjusters.boundary_group.hide();
        this.options.shallow = true;

        $.ajax({
            method: this.options.endpoints.delete_drawing.method,
            url: this.options.endpoints.delete_drawing.url,
            dataType: 'script'
        })
    },

    //==============  Rearranges all products local svg based on z_index data value ================//
    reArrangeSvg: function () {
        this.adjusters.local_svg.data('z_index', parseInt(Date.now()));
        this.options.plate.reArrangeElements($('.local_svg'));
    },

    //=====================  Set the viewBox value of local svg of product  =====================//
    provisionLocalSvg: function () {
        document.getElementById(this.adjusters.local_svg.attr('id'))
            .setAttribute('viewBox', document.getElementById(this.adjusters.svg.attr('id')).getAttribute('viewBox'));
        if (this.options.plate.logging) console.log('(Factory, LocalSvgProvisioned) RootSvg,LocalSvg--viewbox--', document.getElementById(this.adjusters.svg.attr('id')).getAttribute('viewBox'), document.getElementById(this.adjusters.local_svg.attr('id')).getAttribute('viewBox'));
    },

    //====================  Provides transform values of product  ========================//
    getTransformationValues: function () {
        var id = this.options.id;
        var transform = this.sketch.options.adjusters.boundary_group.attr('transform');
        var rotate_string = '';
        var rotate_values = [];
        //====================  parses transform value for rotate  ========================//
        if (transform.match(/(rotate\(.*?\))/) != null) {
            rotate_string = transform.match(/(rotate\(.*?\))/g)[0];
            /* ---- Temp fix for Internet Explorer as its malfunctioning with transform attribute --- */
            if(rotate_string == 'rotate(0)') rotate_string = 'rotate(0 0 0)';

            rotate_values = transform.match(/(rotate\(.*?\))/g)[0].match(/rotate\((.*?)\)/)[1].split(' ');
            $.each(rotate_values, function (i, v) {
                rotate_values[i] = parseFloat(rotate_values[i]);
            });
        }
        //====================  parses transform value for translate  ========================//
        var all_translates = transform.match(/(translate\(.*?\))/g), total_translate = [0, 0], translate_string = ' ';
        if (all_translates == null) all_translates = ["translate(0 0)"];
        $.each(all_translates, function (i, v) {
            var values = all_translates[i].match(/translate\((.*?)\)/)[1].split(' ');
            total_translate[0] += parseFloat(values[0]);
            total_translate[1] += parseFloat(values[1]);
            translate_string += all_translates[i];
        });

        var final_translate_string = 'translate(' + total_translate[0] + ' ' + total_translate[1] + ')';
        return {
            rotate: rotate_values,
            rotate_string: rotate_string,
            translate: total_translate,
            translate_string: translate_string,
            final_translate_string: final_translate_string,
            final_transformation_string: final_translate_string + ' ' + rotate_string
        }
    },

    //====================  Provides rotation angle of product  =========================//
    getRotationAngle: function (rotate_wrt, rotate_at) {
        var angle = Math.atan2((rotate_at[1] - rotate_wrt[1]), rotate_at[0] - rotate_wrt[0]) * (180 / Math.PI) + 90;
        angle < 0 ? angle += 360 : angle;
        return angle;
    },

    //=====================  Provision transformation of product  ========================//
    provisionTransformation: function (transform_effect, transformation_wrt_point, transformation_to_point) {
        switch (transform_effect) {
            case 'rotate':
                var angle = this.getRotationAngle(transformation_wrt_point, transformation_to_point);
                var transform = this.adjusters.boundary_group.attr('transform').match(/(translate\(.*?\))/g);

                var transform_string = ' ';
                $.each(transform, function (i, v) {
                    transform_string += transform[i] + ' '
                });

                this.sketch.options.rotate[0] = angle;
                return this.adjusters.boundary_group
                    .attr({
                        transform: ('rotate(' + angle + ' ' + transformation_wrt_point[0] + ' '
                        + transformation_wrt_point[1] + ')' + ' ' + transform_string)
                    });
                break;
        }
    },

    //====================  consolidates translate values of product  =====================//
    setFinalTransformation: function () {
        return this.adjusters.boundary_group.attr({
            transform: this.getTransformationValues(this.adjusters.boundary_group).rotate_string
            + ' '
            + this.getTransformationValues(this.adjusters.boundary_group).final_translate_string
        })
    },

    //==================  Provides ratio of Main and product local svg ================//
    getCurrentPointsRatio: function (parentSvg, childSvg) {
        var parent_svg, child_svg;
        if ((parentSvg == undefined) && (childSvg == undefined)) {
            parent_svg = this.adjusters.svg;
            child_svg = this.adjusters.local_svg;
        } else {
            parent_svg = parentSvg;
            child_svg = childSvg;
        }

        if ((document.getElementById($(child_svg).attr('id')) == null) ||
            (document.getElementById($(child_svg).attr('id')).getAttribute('viewBox') == null)) {
            return {x: 1, y: 1}
        } else {
            var root_viewBox = document.getElementById($(parent_svg).attr('id')).getAttribute('viewBox').split(' ');
            var local_viewBox = document.getElementById($(child_svg).attr('id')).getAttribute('viewBox').split(' ');
            return {
                x: parseFloat(local_viewBox[2]) / parseFloat(root_viewBox[2]),
                y: parseFloat(local_viewBox[3]) / parseFloat(root_viewBox[3])
            }
        }
    },

    //================== Set controls to be visible or hidden in tooltip ==================//
    setTooltipContentVisibility: function () {
        this.adjusters.text_template.find('input#submit_text-' + this.options.id).hide();
        this.adjusters.text_template.find('textarea#template_textarea-' + this.options.id).attr('readonly', true);
        if (!this.sketch.options.linkable.capability) {
            this.adjusters.link_template.find('a#sheet_link_edit-' + this.options.id).remove();
            this.adjusters.link_template.find('i#ptm_icon-' + this.options.id).remove();

            if ((this.options.link_sheet_id == undefined) || (this.options.link_sheet_id == '')) {
                this.adjusters.link_template.find('img#drawing_sheet_link-' + this.options.id).remove();
            }
        }

        if (!this.sketch.options.textable.capability) {
            this.adjusters.text_template.find('input#submit_text-' + this.options.id).remove();
            this.adjusters.text_template.find('.template_textarea').val(this.options.text);
            this.adjusters.text_template.find('i#ptm_icon-' + this.options.id).remove();
        }
        if (!this.sketch.options.linkable.capability) {
            this.adjusters.text_template.find('textarea').text(this.options.text);
            this.adjusters.text_option_a.tooltipster('content', this.adjusters.text_template);
        }
    },

    //================== provision whether tooltip should be shown or not ==================//
    setTooltipVisibility: function () {
        if (this.options.editable) {
            if (this.sketch.options.linkable.capability) {
                this.adjusters.link_option_a.tooltipster('content', this.adjusters.link_template);

                if (this.options.active_template == 'sheet_link') {
                    this.adjusters.link_option_a.tooltipster('show');
                }
            }
            if (this.sketch.options.textable.capability) {
                this.adjusters.text_option_a.tooltipster('content', this.adjusters.text_template);
                this.adjusters.text_option_a.tooltipster('show');
            }
        } else {
            switch (this.options.active_template) {
                case 'sheets_list':
                    this.adjusters.link_option_a.tooltipster('hide');
                    break;
                case 'sheet_link':
                    this.adjusters.link_option_a.tooltipster('content', this.adjusters.link_template);
                    this.adjusters.link_option_a.tooltipster('show');
                    break;
                case 'text':
                    this.adjusters.text_option_a.tooltipster('content', this.adjusters.text_template);
                    this.adjusters.text_option_a.tooltipster('show');
            }
        }
    },

    //================== provisions the belonging of the drawing ==================//
    setBelonging: function (status) {
        var _this = this;
        var title, new_class;
        if (status == 'new') {
            if (this.options.editable) {
                new_class = 'ptm_icon fa fa-graduation-cap';
                title = 'Available to all'
            } else {
                new_class = 'ptm_icon fa fa-child';
                title = 'Push to master';
            }
        } else {
            if (this.options.belonging == 'master_copy') {
                title = 'Available to all';
                new_class = 'ptm_icon fa fa-graduation-cap';

            } else {
                title = 'Push to master';
                new_class = 'ptm_icon fa fa-child';
            }
        }
        _this.adjusters.link_template.find('i#ptm_icon-' + _this.options.id)
            .attr({'class': new_class, 'title': title});
        _this.adjusters.sheet_list_template.find('i#ptm_icon-' + _this.options.id).attr({
            'class': new_class,
            'title': title
        });
        _this.adjusters.text_template.find('i#ptm_icon-' + _this.options.id)
            .attr({'class': new_class, 'title': title});
    },

    //================== provisions the role of the user for drawing ==================//
    setAuthorization: function () {
        this.options.editable ? $.extend(this.options, {user_role: 'owner'}) :
            $.extend(this.options, {user_role: 'guest'});
        if (this.options.plate.logging) console.log('(Arrow) setAuthorization---------', this.options.user_role)
    },

    //==================  Save newly created drawing  ================//
    saveDrawing: function (options) {
        $.ajax({
            method: this.options.plate.options.endpoints.create_drawing.method,
            url: this.options.plate.options.endpoints.create_drawing.url,
            data: JSON.stringify(options.data),
            contentType: "application/json",
            dataType: 'script'
        })
    },
    //==================  update created drawing  ================//
    updateDrawing: function (options) {
        $.ajax({
            method: this.options.endpoints.update_drawing.method,
            url: this.options.endpoints.update_drawing.url,
            data: JSON.stringify(options.data),
            contentType: "application/json",
            dataType: 'script'
        })
    },

    updateBelonging: function (event, options) {
        if ($(event.target).attr('class').indexOf('fa-child') > -1) {
            $.ajax(options)
        }
    },

    disableActionTool: function (element) {
        $(element).attr('href', 'javascript:void(0);').css({'pointer-events': 'none'});
        //$(element).parent('span').attr('title', element.data().type.capitalize() + ' not available.')
        //    .css({'cursor': 'not-allowed'});
        $(element).find('i').css({'color': '#595959'})
    },

    SetActionsCapabilities: function () {
        var _this = this;
        if (this.sketch.options.deletable.capability) {
            this.adjusters.drawing_actions_template.find('a#drawing_delete').off().on('click', function (e) {
                _this.sketch.options.deletable.enable = true;
                if (confirm("Are you sure?")) _this.markDeleted();
                _this.options.plate.overlapping_drawings_container.empty().hide();
                _this.adjusters.actions_circle_a.tooltipster('hide');
                _this.options.plate.overlapping_drawings_container.empty().hide();
                _this.options.plate.toggleAllDrawings('show');
            });
        } else {
            _this.disableActionTool(this.adjusters.drawing_actions_template.find('a#drawing_delete'));
        }

        if (this.sketch.options.resizable.capability) {
            this.adjusters.drawing_actions_template.find('a#drawing_resize').off().on('click', function (e) {
                _this.sketch.options.resizable.enable = true;
                $.each(_this.adjusters.boundary_circles, function (position, circle) {
                    circle.css('display', 'block');
                });
                _this.adaptResizeModeBehaviour();
                _this.options.plate.overlapping_drawings_container.empty().hide();
            });
        } else {
            _this.disableActionTool(this.adjusters.drawing_actions_template.find('a#drawing_resize'));
        }

        if (this.sketch.options.draggable.capability) {
            this.adjusters.drawing_actions_template.find('a#drawing_drag').off().on('click', function (e) {
                _this.sketch.options.draggable.enable = true;
                $.each(_this.adjusters.boundary_circles, function (position, circle) {
                    circle.css('display', 'none');
                });
                _this.adaptDragModeBehaviour();
                _this.options.plate.overlapping_drawings_container.empty().hide();
            });
        } else {
            _this.disableActionTool(this.adjusters.drawing_actions_template.find('a#drawing_drag'));
        }

        if ($.inArray(this.options.type, ['scribble', 'line']) > -1) {
            if (this.sketch.options.textable.capability) {
                this.adjusters.drawing_actions_template.find('a#drawing_edit').off().on('click', function (e) {
                    _this.sketch.options.textable.enable = true;
                    _this.adjusters.actions_circle_a.tooltipster('hide');
                    _this.adjusters.text_template.find('input#submit_text-' + _this.options.id).show();
                    _this.adjusters.text_template.find('textarea').text(_this.options.text);
                    _this.adjusters.text_template.find('textarea#template_textarea-' + _this.options.id)
                        .attr('readonly', false);
                    if (_this.options.text == '') {
                        _this.adjusters.text_template.find('input.submit_text').val('Add');
                    } else {
                        _this.adjusters.text_template.find('input.submit_text').val('Update');
                    }
                    _this.adjusters.text_option_a.tooltipster('content', _this.adjusters.text_template);
                    _this.adjusters.text_option_a.tooltipster('show');
                    _this.options.plate.overlapping_drawings_container.empty().hide();
                });

                if (this.options.type == 'line') {
                    this.adjusters.drawing_actions_template.find('a#drawing_revert').off().on('click', function (e) {
                        _this.sketch.revertArrow();
                        _this.adjusters.text_option_a.tooltipster('hide');
                        _this.options.plate.overlapping_drawings_container.empty().hide();
                    });
                }

            } else {
                _this.disableActionTool(this.adjusters.drawing_actions_template.find('a#drawing_edit'));
                if (this.options.type == 'line') {
                    _this.disableActionTool(this.adjusters.drawing_actions_template.find('a#drawing_revert'))
                }
            }
        } else {
            if (this.sketch.options.linkable.capability) {
                this.adjusters.drawing_actions_template.find('a#drawing_edit').off().on('click', function (e) {
                    _this.sketch.options.linkable.enable = true;
                    _this.adjusters.actions_circle_a.tooltipster('hide');
                    _this.adjusters.link_option_a.tooltipster('content', _this.adjusters.sheet_list_template);
                    _this.adjusters.link_option_a.tooltipster('show');
                    _this.options.plate.overlapping_drawings_container.empty().hide();
                });
            } else {
                _this.disableActionTool(this.adjusters.drawing_actions_template.find('a#drawing_edit'));
            }
        }
    },

    adaptCreatedModeBehaviour: function () {
        var _this = this;
        this.setAuthorization();
        this.sketch.setCapabilities();
        this.sketch.toggleBoundary('show');
        this.SetActionsCapabilities();
        this.adjusters.drawing_element.css('cursor', 'default');
        this.sketch.options.draggable.enable = false;
        this.sketch.options.resizable.enable = false;
        this.adjusters.actions_circle_a.tooltipster('content', this.adjusters.drawing_actions_template);
        if ($.inArray(this.options.type, ['line', 'scribble']) == -1) {
            this.adjusters.actions_circle_a.tooltipster('show');
        }
        $.each(this.adjusters.boundary_circles, function (index, circle) {
            $(circle).css('display', 'none')
        });
        this.options.plate.options.svg.css('cursor', 'grab');
        this.adaptIdleModeBehaviour();
        //this.adjusters.boundary_path.css('display', 'block');
        this.setDrawingPointer();
        this.options.plate.provisionDrawingsFading('show');
    },

    adaptResizeModeBehaviour: function () {
        this.sketch.options.draggable.enable = false;
        this.sketch.options.resizable.enable = true;

        this.adjusters.actions_circle_a.tooltipster('hide');
        if (this.sketch.options.textable.capability) this.adjusters.text_option_a.tooltipster('hide');
        if (this.sketch.options.linkable.capability) this.adjusters.link_option_a.tooltipster('hide');
        this.adjusters.boundary_path.css('display', 'block');
        this.adjusters.drawing_element.css('cursor', 'default');
        this.options.plate.options.svg.css('cursor', 'grab');
        $.each(this.adjusters.boundary_circles, function (index, circle) {
            $(circle).css('display', 'block')
        });
    },

    adaptDragModeBehaviour: function () {
        this.sketch.options.draggable.enable = true;
        this.sketch.options.resizable.enable = false;

        this.adjusters.actions_circle_a.tooltipster('hide');
        if (this.sketch.options.textable.capability) this.adjusters.text_option_a.tooltipster('hide');
        if (this.sketch.options.linkable.capability) this.adjusters.link_option_a.tooltipster('hide');
        this.adjusters.boundary_path.css('display', 'block');
        this.adjusters.drawing_element.css('cursor', 'grab');
        this.options.plate.options.svg.css('cursor', 'grab');
        $.each(this.adjusters.boundary_circles, function (index, circle) {
            $(circle).css('display', 'none')
        });
    },

    adaptUnderDraggingModeBehaviour: function () {
        this.adjusters.drawing_element.css('cursor', 'grabbing');
    },

    adaptIdleModeBehaviour: function () {
        this.setDrawingPointer();
        this.adjusters.boundary_path.css('display', 'none');
        $.each(this.adjusters.boundary_circles, function (index, circle) {
            $(circle).css('display', 'none')
        });
    },

    setDrawingPointer: function () {
        if (this.sketch.options.textable.capability) {
            this.adjusters.drawing_element.css('cursor', 'pointer');
        } else {
            if ((this.sketch.options.linkable.capability)
                && ((this.options.link_sheet_id == '')
                || (this.options.link_sheet_id == undefined))) {
                this.adjusters.drawing_element.css('cursor', 'default');
            } else {
                this.adjusters.drawing_element.css('cursor', 'pointer');
            }
        }
    },

    adaptSelectedModeBehaviour: function () {
        this.sketch.options.draggable.enable = false;
        this.sketch.options.resizable.enable = false;
        this.sketch.options.deletable.enable = false;
        this.adjusters.boundary_path.css('display', 'block');
        this.adjusters.actions_circle_a.tooltipster('content', this.adjusters.drawing_actions_template);
        if (this.options.plate.current_mode != 'CREATE') {
            this.adjusters.actions_circle_a.tooltipster('show');
        }
    }
};