//######################################################################################################//
//               Parts Factory to create and provision all parts of drawing products
//######################################################################################################//

function AdjustersFactory(options) {
    this.options = {
        id: null,
        factory: null,
        product: null,
        plate: null,

        text_content: {height: 100, width: 200}
    };
    $.extend(this.options, options);

    this.mainContainer = null;
    this.svg = null;
    this.local_svg = null;

    this.boundary_group = null;
    this.boundary_path = null;
    this.boundary_circles = null;
    this.rotate_circle = null;
    this.rotate_handle = null;
    this.delete_link = null;

    this.tooltip = null;
    this.link_option_group = null;
    this.link_option = null;
    this.link_option_a = null;

    this.text_option_group = null;
    this.text_option = null;
    this.text_option_a = null;

    this.element_group = null;
    this.drawing_element = null;
    this.drawingLink = null;
    this.text = null;

    this.horizontal_median = null;
    this.vertical_median = null;
    this.center_circle = null;

    var _this = this;

    this.mainContainer = this.options.factory.options.plate.options.container;
    this.svg = this.options.factory.options.plate.options.svg;

    //######################################################################################################//
    //                              Selects or creates new parts
    //######################################################################################################//

    this.local_svg = this.getSvg({
        id: 'local_svg-' + this.options.id, class: 'local_svg'
    }, {'z_index': this.options.id});
    //---------------------------------//
    var element;
    this.options.factory.options.type == 'scribble' ? element = 'path' : element = this.options.factory.options.type;
    this.drawing_element = this.getElement(element, {
        id: this.options.id,
        stroke: this.options.plate.options.stroke_color
    }, {});
    //---------------------------------//
    this.boundary_group = this.getElement('g',
        {
            id: 'boundary_group-' + this.options.id, 'transform': 'rotate(0 0 0) translate(0 0) ',
            class: 'main_' + this.options.factory.options.type + ' boundary_group'
        }, {});

    this.boundary_path = this.getElement('path',
        {id: 'boundary-' + this.options.id, class: 'boundary_element boundary'}, {'z_index': 1});

    this.boundary_circles = {
        top: this.getElement('circle', {
            id: 'boundary_circle-' + this.options.id, class: 'boundary_element boundary_circle top_circle',
            r: 5, fill: '#ffffff', stroke: '#000000'
        }, {'z_index': 500}),

        right: this.getElement('circle', {
            id: 'boundary_circle-' + this.options.id, class: 'boundary_element boundary_circle right_circle',
            r: 5, fill: '#ffffff', stroke: '#000000'
        }, {'z_index': 500}),

        bottom: this.getElement('circle', {
            id: 'boundary_circle-' + this.options.id,
            class: 'boundary_element boundary_circle bottom_circle', r: 5, fill: '#ffffff', stroke: '#000000'
        }, {'z_index': 500}),

        left: this.getElement('circle', {
            id: 'boundary_circle-' + this.options.id, class: 'boundary_element boundary_circle left_circle',
            r: 5, fill: '#ffffff', stroke: '#000000'
        }, {'z_index': 500})
    };

    this.actions_circle_group = this.getElement('g', {
        id: 'actions_circle_group-' + this.options.id, class: 'boundary_element actions_circle_group'
    }, {'z_index': 101});

    this.actions_circle_a = this.getElement('a', {
        id: 'actions_circle_a-' + this.options.id, class: 'boundary_element actions_circle_a'
    }, {'z_index': 101});

    this.actions_circle = this.getElement('circle', {
        id: 'actions_circle-' + this.options.id,
        class: 'boundary_element actions_circle ', r: 2, fill: 'transparent', 'stroke-width': 0
    }, {});

    this.rotate_circle = this.getElement('circle',
        {
            id: 'boundary_transform_circle-' + this.options.id,
            class: 'boundary_element boundary_transform_circle top_transform_circle', r: 5
        }, {'z_index': 2});

    this.rotate_handle = this.getElement('path',
        {
            id: 'boundary_transform_bar-' + this.options.id,
            class: 'boundary_element boundary_transform_bar transform_bar'
        },
        {'z_index': 2});

    this.delete_link = this.getElement('circle',
        {
            id: 'delete_circle-' + this.options.id, class: 'boundary_element delete_drawing',
            r: 7, stroke: 'red', 'stroke-width': '1', fill: 'red'
        }, {'z_index': 500});

    this.link_option_group = this.getElement('g', {
        id: 'link_option_group-' + this.options.id, class: 'boundary_element link_option_group '
    }, {'z_index': 101});

    this.link_option_a = this.getElement('a', {
        id: 'link_option_a-' + this.options.id, class: 'boundary_element link_option_a '
    }, {'z_index': 101});

    this.link_option = this.getElement('circle', {
        id: 'link_option-' + this.options.id,
        class: 'boundary_element link_option_circle ', r: 5, fill: 'transparent', 'stroke-width': 0
    }, {});

    this.text_option_group = this.getElement('g', {
        id: 'text_option_group-' + this.options.id, class: 'boundary_element text_option_group '
    }, {'z_index': 210});

    this.text_option_a = this.getElement('a', {
        id: 'text_option_a-' + this.options.id, class: 'boundary_element text_option_a '
    }, {});

    this.text_option = this.getElement('circle', {
        id: 'text_option-' + this.options.id, class: 'text_option_circle ',
        r: 1, fill: 'transparent', 'stroke-width': 0
    }, {'z_index': 1});

    this.element_group = this.getElement('g',
        {id: 'elements_group-' + this.options.id}, {'z_index': 100});

    this.drawingLink = this.getElement('a', {
        id: 'drawing_link-' + this.options.id, class: 'drawing_link', href: 'javascript:void(0)'
    }, {});

    this.horizontal_median = this.getElement('path', {
        id: 'boundaryLine1-' + this.options.id, class: 'boundary_element boundaryLine1'
    }, {'z_index': 5});

    this.vertical_median = this.getElement('path', {
        id: 'boundaryLine2-' + this.options.id, class: 'boundary_element boundaryLine2'
    }, {'z_index': 5});

    this.center_circle = this.getElement('circle', {
        id: 'center_circle-' + this.options.id, class: 'boundary_element center_circle '
    }, {'z_index': 5});

    this.text = this.getElement('text', {
        id: 'center_text-' + this.options.id, class: 'boundary_element center_text',
        'text-anchor': 'middle', 'stroke-width': '2'
    }, {'z_index': 103})
        .append(this.getElement('tspan', {id: 'element_text-' + this.options.id, class: 'element_text'}, {}))
        .append(this.getElement('tspan', {
            id: 'text_content-' + this.options.id,
            class: 'text_content', fill: this.options.plate.options.stroke_color
        }, {'z_index': 103}));

    //######################################################################################################//
    //                              Templates to be shown in tooltip                                        //
    //######################################################################################################//

    this.sheet_list_template = $(this.options.plate.options.sheet_list_template);
    this.provisionSheetList();

    this.link_template = $(this.options.plate.options.drawing_link_template);
    this.provisionSheetLinkData();

    this.text_template = $(this.options.plate.options.drawing_text_template);
    this.provisionTextTemplateData();

    this.drawing_actions_template = $(this.options.plate.options.drawing_actions_template);
    if ($.inArray(this.options.factory.options.type, ['scribble', 'line']) > -1) {
        if (this.options.factory.options.type == 'scribble') {
            $(this.drawing_actions_template.find('span#drawing_revert_span')).remove();
        }
        $(this.drawing_actions_template).find('a#drawing_edit').find('i').attr('class', 'fa fa-pencil');
    } else {
        $(this.drawing_actions_template.find('span#drawing_revert_span')).remove();
    }
    this.tooltip = this.sheet_list_template;
}

//######################################################################################################//
//                              Parts factory instance level methods                                    //
//######################################################################################################//

AdjustersFactory.prototype = {
    //=============================  Selects or create new elements  ====================================//
    getElement: function (element, attributes, data) {
        if ($(element + '#' + attributes.id).size() > 0) {
            return $(element + '#' + attributes.id);
        } else {
            $.extend(attributes, {'vector-effect': 'non-scaling-stroke'});
            return $(document.createElementNS("http://www.w3.org/2000/svg", element)).attr(attributes).data(data);
        }
    },
    //===============================================================================================//
    getHtmlElement: function (element, attributes, data) {
        if ($(element + '#' + attributes.id).size() > 0) {
            return $(element + '#' + attributes.id);
        } else {
            return $(document.createElement(element)).attr(attributes).data(data);
        }
    },

    //=============================  Selects or create new SVG  ====================================//
    getSvg: function (attributes, data) {
        if ($('svg' + '#' + attributes.id).size() > 0) {
            return $('svg' + '#' + attributes.id);
        } else {
            return $('<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"></svg>')
                .attr(attributes).data(data);
        }
    },

    //==============  Sheets list is prepared with data in sheet_list_template  =============//
    provisionSheetList: function () {
        var _this = this;
        $.each(this.options.plate.options.sheets_data, function (i, v) {
            _this.sheet_list_template.find('ul.sheet_list')
                .append(_this.getHtmlElement('li', {
                    class: 'list_item', id: 'sheet_item-' + _this.options.id
                }, {
                    'thumbnail_url': v.thumbnail_url, 'name': v.name, 'sheet_no': v.sheet_no,
                    sheet_token: v.token, sheet_id: v.id, path: v.path
                }).append($('<img class="sheets_list_thumbnail">').attr({
                    id: 'sheets_list_thumbnail-' + _this.options.id, src: v.thumbnail_url
                })).append($('<span class="sheets_list_text"></span>')
                    .attr('id', 'sheets_list_text-' + _this.options.id)
                    .text((v.name == null ? 'Sheet' : v.name.trimToLength(15))
                    + ' | '
                    + (v.sheet_no == null ? 'Sheet no' : v.sheet_no.trimToLength(10))
                ).attr('title', v.name + ' | ' + v.sheet_no))
            );
        });
        this.sheet_list_template.find('i.ptm_icon').attr('id', 'ptm_icon-' + this.options.id);
    },

    // ================= Sheet_link_template data is prepared ================== //
    provisionSheetLinkData: function () {
        var _this = this;
        this.link_template.find('div.sheet_thumbnail_container')
            .attr('id', 'sheet_thumbnail_container-' + this.options.id);
        this.link_template.find('span.template_sheet_no').attr('id', 'sheet_no-' + this.options.id);
        this.link_template.find('span.template_sheet_name').attr('id', 'sheet_name-' + this.options.id);
        this.link_template.find('a.sheet_link').attr('id', 'sheet_link-' + this.options.id);
        this.link_template.find('img.drawing_sheet_link').attr('id', 'drawing_sheet_link-' + this.options.id);
        this.link_template.find('div.sheet_link_footer').attr('id', 'sheet_link_footer-' + this.options.id);
        this.link_template.find('a.sheet_link_edit').attr('id', 'sheet_link_edit-' + this.options.id);
        this.link_template.find('i.ptm_icon').attr('id', 'ptm_icon-' + this.options.id);

        $.each(this.options.plate.options.sheets_data, function (index, sheet_data) {
            if (sheet_data.id == _this.options.factory.options.link_sheet_id) {
                _this.link_template.find('img.drawing_sheet_link').attr('src', sheet_data.thumbnail_url);
                _this.link_template.find('span.template_sheet_no').html(sheet_data.sheet_no.trimToLength(15));
                _this.link_template.find('span.template_sheet_name').html(sheet_data.name.trimToLength(15));
            }
        })
    },

    provisionTextTemplateData: function () {
        this.text_template.find('div.text_template').attr('id', 'text_template-' + this.options.id);
        this.text_template.find('textarea.template_textarea').attr('id', 'template_textarea-' + this.options.id);
        this.text_template.find('div.submit_text_container').attr('id', 'submit_text_container-' + this.options.id);
        this.text_template.find('input.submit_text').attr('id', 'submit_text-' + this.options.id);
        this.text_template.find('i.ptm_icon').attr('id', 'ptm_icon-' + this.options.id);
    },

    //=============================  Provision parts based on respective product capabilities ================//
    provisionBoundary: function (boundary_points) {
        var _this = this;
        this.svg.append(this.boundary_group);
        var b_group = this.boundary_group
            .append(this.text);
        this.text.find('tspan#text_content-' + this.options.id).attr({
            x: boundary_points.diagonal_mid[0],
            y: boundary_points.diagonal_mid[1]
        });

        b_group
            .append(this.boundary_path.hide().attr({
                d: 'M ' + boundary_points.lt + ' L' + boundary_points.rt +
                ' L' + boundary_points.rb + ' L' + boundary_points.lb + ' Z'
            }));

        b_group
            .append(this.actions_circle_group
                .append(this.actions_circle_a
                    .append(this.actions_circle.attr({
                        cx: boundary_points.right_mid[0], cy: boundary_points.right_mid[1] - 5
                    }))));

        this.actions_circle_a.tooltipster({
            animation: 'fade', delay: 500, arrowColor: '#000000', interactive: true, contentAsHTML: true,
            positionTracker: true, onlyOne: true, hideOnClick: true, updateAnimation: false, position: 'right',
            trigger: 'click', multiple: true
        });

        if (this.options.sketch.options.linkable.capability) {
            b_group
                .append(this.link_option_group
                    .append(this.link_option_a
                        .append(this.link_option.attr({
                            cx: boundary_points.diagonal_mid[0], cy: boundary_points.diagonal_mid[1]
                        }))));

            this.link_option_a.tooltipster({
                animation: 'fade',
                delay: 500,
                arrowColor: '#000000',
                interactive: true,
                contentAsHTML: true,
                positionTracker: true,
                onlyOne: true,
                hideOnClick: true,
                updateAnimation: false,
                position: 'top',
                trigger: 'click',
                multiple: true
            });
        }

        if (this.options.sketch.options.resizable.capability) {
            b_group.append(this.boundary_circles.right.hide().attr({
                cx: boundary_points.right_mid[0], cy: boundary_points.right_mid[1]
            }))
                .append(this.boundary_circles.bottom.hide().attr({
                    cx: boundary_points.bottom_mid[0], cy: boundary_points.bottom_mid[1]
                }))
                .append(this.boundary_circles.left.hide().attr({
                    cx: boundary_points.left_mid[0], cy: boundary_points.left_mid[1]
                }))
                .append(this.boundary_circles.top.hide().attr({
                    cx: boundary_points.top_mid[0], cy: boundary_points.top_mid[1]
                }))
        }

        if (this.options.sketch.options.rotatable.capability) {
            b_group.append(this.rotate_circle.hide().attr({
                cx: boundary_points.top_mid[0], cy: (boundary_points.top_mid[1] - 30)
            }))
                .append(this.rotate_handle.hide().attr({
                    d: 'M ' + boundary_points.top_mid[0] + ' ' + boundary_points.top_mid[1] +
                    ' L ' + boundary_points.top_mid[0] + ' ' + (boundary_points.top_mid[1] - 30)
                }))
        }

        if (this.options.sketch.options.textable.capability) {
            b_group
                .append(this.text_option_group
                    .append(this.text_option_a
                        .append(this.text_option.attr({
                            cx: boundary_points.diagonal_mid[0], cy: boundary_points.diagonal_mid[1]
                        }))));

            this.text_option_a.tooltipster({
                animation: 'fade',
                delay: 500,
                arrowColor: '#000000',
                interactive: true,
                contentAsHTML: true,
                positionTracker: true,
                onlyOne: true,
                hideOnClick: true,
                updateAnimation: false,
                position: 'top',
                trigger: 'click',
                multiple: true
            });
        }

        this.local_svg.appendTo(this.svg);
        b_group.appendTo(this.local_svg);
        if (this.options.plate.logging) console.log('(Arrow) Boundary provisioned');
        return b_group;
    }
};