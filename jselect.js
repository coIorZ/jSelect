// jQuery dependent

(function(factory) {
  if (typeof define === 'function') {
    define(['jquery'], function($) {
      return factory($);
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
})(function($) {
  var defaults = {
    // should be array of object(must contain 'text' property) or string
    data: null,
    width: 230,
    height: 30,
    panelHeight: null,
    fontSize: 14,
    // line-clamp of item text
    clamp: 2,
    // item backgroundcolor on hover
    color: '#cccccc',
    // set readonly for input
    readonly: true,
    // filter items according to input value
    filter: false,
    // whether highlight matched text in items under 'filter mode'
    highlight: true,
    // fires when an item is clicked
    onSelect: null,
    // fires when hit 'enter'
    onEnter: null
  };

  function JSelect(el, options) {
    this.el = el;
    this.$el = $(el);
    this.options = options || {};
    this.createEls().setStyle().bindEvents();
  }

  $.extend(JSelect.prototype, {
    // create the basic html elements
    createEls: function() {
      this.$input = $('<input type="text">');
      this.$btn = $('<span>&or;</span>');
      this.$panel = $('<div></div>');
      this.$list = $('<ul></ul>');
      this.$panel.append(this.$list);
      this.$el.append(this.$input).append(this.$btn).append(this.$panel);
      return this;
    },
    // create item elements
    buildList: function() {
      var data_select = this.$el.attr('data-select'),
        data, html_data;
      html_data = data_select && data_select.split(';');
      this.data = data = this.options.data || html_data;
      this.$list.empty();
      if (data) {
        for (var i = 0, len = data.length; i < len; i++) {
          if (data[i] && typeof data[i] === 'object') {
            this.$list.append($('<li data-index="' + i + '">' + data[i]
              .text + '</li>'));
          } else {
            this.$list.append($('<li data-index="' + i + '">' + data[i] +
              '</li>'));
          }
        }
      }
      return this;
    },
    setStyle: function() {
      this.$el.css({
        'display': 'inline-block',
        'position': 'relative',
      });
      this.$input.css({
        'border': '1px solid #cccccc',
        'box-sizing': 'border-box'
      });
      this.$btn.css({
        'position': 'absolute',
        'right': 0,
        'top': 0,
        'font-size': 12,
        'text-align': 'center'
      });
      this.$panel.css({
        'display': 'none',
        'position': 'absolute',
        'left': 0,
        'padding': '0 5px',
        'border': '1px solid #cccccc',
        'box-sizing': 'border-box',
        'background-color': '#ffffff',
        'overflow': 'auto'
      });
      this.$list.css({
        'width': '100%',
        'margin': 0,
        'padding': 0,
        'list-style': 'none'
      });
      return this;
    },
    // will update both css and data when new options passed to existing jselect
    reset: function() {
      this.buildList();
      var options = this.options,
        lis = this.$list.find('li');
      this.$input.css({
        'padding': '4px ' + options.height + 'px 4px 6px',
        'width': options.width,
        'height': options.height,
        'font-size': options.fontSize,
      });
      this.$btn.css({
        'width': options.height,
        'height': options.height,
        'line-height': options.height + 'px'
      });
      this.$panel.css({
        'top': options.height,
        'width': options.width,
        'max-height': options.panelHeight || options.width * 0.8
      });
      this.$list.css({
        'font-size': options.fontSize
      });
      lis.css({
        'margin': '3px 0',
        'padding': '0.2em 3px',
        'color': '#999999',
        'cursor': 'pointer',
        'line-height': '1.4em',
        'overflow': 'hidden',
        'max-height': (options.clamp * 1.4 - 0.2) + 'em'
      });

      if (options.readonly) {
        this.$input.prop('readonly', true);
      } else {
        this.$input.prop('readonly', false);
      }
      return this;
    },
    bindEvents: function() {
      var self = this,
        options = self.options;

      self.$input
        .on('focus', function() {
          $(this).select();
          self.$panel.show();
        })
        .on('blur', function() {
          setTimeout(function() {
            self.$panel.hide();
          }, 150);
        })
        .on('keyup', function(e) {
          var text = $(this).val();
          if (e.which === 13) {
            if (typeof options.onEnter === 'function') {
              options.onEnter(text);
            }
          }
          if (options.filter) {
            clearTimeout(self.timer);
            self.timer = setTimeout(function() {
              self.filter(text);
            }, 500);
          }
        });

      self.$btn.on('click', function() {
        self.$input.trigger('focus');
      });

      self.$list.on('mouseover', 'li', function() {
        $(this).css({
          'background-color': options.color,
          'color': '#ffffff'
        });
      }).on('mouseout', 'li', function() {
        $(this).css({
          'background-color': '#ffffff',
          'color': '#999999'
        });
      }).on('click', 'li', function() {
        var index = $(this).attr('data-index'),
          value = self.data[index];
        if (value && typeof value === 'object') {
          self.$input.val(value.text);
        } else {
          // in case data array consists of string
          self.$input.val(value);
        }
        self.$panel.hide();
        if (typeof options.onSelect === 'function') {
          options.onSelect(value, index, self.data);
        }
      });

      return self;
    },
    filter: function(str) {
      var options = this.options,
        lis = this.$list.find('li');
      lis.each(function() {
        var text = $(this).text(),
          reg = new RegExp(str, 'g');
        if (reg.test(text)) {
          $(this).show();
          if (options.highlight) {
            text = text.replace(reg, '<span style="color:red;">' +
              str + '</span>');
            $(this).html(text);
          }
        } else {
          $(this).hide();
        }
      });
      return this;
    },
    // get value of input
    get: function() {
      return this.$input.val();
    },
    // set value of input
    set: function(value) {
      this.$input.val(value);
      return this;
    }
  });

  $.fn.jSelect = function(settings) {
    var select, options;
    if (!(select = this[0].jSelect)) {
      options = $.extend({}, defaults, settings);
      this[0].jSelect = select = new JSelect(this[0], options);
    }
    if (settings && typeof settings === 'object') {
      $.extend(select.options, settings);
    }

    if (settings === 'get') return select.get();

    if (settings === 'set') {
      select.set(arguments[1]);
      return this;
    }

    select.reset();
    // return jQuery object
    return this;
  };

  $.fn.jSelect.Constructor = JSelect;
});
