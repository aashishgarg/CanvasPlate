function Toolbox(options) {
    this.options = {
        drawing_container: null,
        toolbox: null,
        tools: [],
        active_tools: [],
        annotation_tools: [],
        drawing_tools: [],
        selectedTool: null,
        selectedToolType: null,
        canvas_plate: null
    };
    $.extend(this.options, options);

    this.options.active_tools = this.options.tools.not($('.disable'));
    this.bindActiveToolsClick();
    this.bindViewerClick();
}

Toolbox.prototype = {

    bindActiveToolsClick: function () {
        var _this = this;
        $.each(this.options.active_tools, function (index, tool) {
            $(tool).on('click', function () {
                _this.unselectAllTools(tool);
                $(tool).toggleClass('selected');
                _this.selectedTool();
            });
        });
    },

    bindViewerClick: function () {
        var _this = this;
        this.options.drawing_container.on('click', function () {
            _this.unselectAllTools();
            _this.toolTypeSelected();
        });
    },

    unselectAllTools: function (except_tool) {
        $.each(this.options.tools, function (index, tool) {
            if (except_tool == undefined) {
                $(tool).removeClass('selected');
            } else {
                if (tool != except_tool) {
                    $(tool).removeClass('selected');
                }
            }
        })
    },

    toolTypeSelected: function () {
        if (this.options.selectedTool == null) {
            this.options.selectedToolType = null;
        } else {
            if (this.options.selectedTool.hasClass('drawing')) {
                this.options.selectedToolType = 'drawing';
            } else if (this.options.selectedTool.hasClass('annotation')) {
                this.options.selectedToolType = 'annotation';
            } else {
                this.options.selectedToolType = 'other';
            }
        }
    },

    selectedTool: function () {
        var selected_tool = $.map(this.options.tools, function (tool) {
            if ($(tool).hasClass('selected')) {
                return $(tool);
            }
        })[0];

        if (selected_tool == undefined) {
            this.options.selectedTool = null;
            this.options.selectedToolType = null;
        } else {
            this.options.selectedTool = selected_tool;
            this.toolTypeSelected();
        }
    }
};