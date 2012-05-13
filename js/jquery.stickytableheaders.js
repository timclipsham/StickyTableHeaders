/*! Copyright (c) 2011 by Jonas Mosbech - https://github.com/jmosbech/StickyTableHeaders
    MIT license info: https://github.com/jmosbech/StickyTableHeaders/blob/master/license.txt */

(function ($) {
	$.StickyTableHeaders = function (el, options) {
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this;

		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;

		// Cache DOM refs for performance reasons
		base.$window = $(window);
		base.$clonedHeader = null;
		base.$originalHeader = null;

		// Add a reverse reference to the DOM object
		base.$el.data('StickyTableHeaders', base);

		base.init = function () {
			base.options = $.extend({}, $.StickyTableHeaders.defaultOptions, options);

			base.$el.each(function () {
				var $this = $(this);

				// remove padding on <table> to fix issue #7
				$this.css('padding', 0);

				$this.wrap('<div class="divTableWithFloatingHeader"></div>');

				base.$originalHeader = $('thead:first', this);
				base.$clonedHeader = base.$originalHeader.clone();

				base.$clonedHeader.addClass('tableFloatingHeader');
				base.$clonedHeader.css({
					'position': 'fixed',
					'top': 0,
					'left': $this.css('margin-left'),
					'display': 'none'
				});

				base.$originalHeader.addClass('tableFloatingHeaderOriginal');

				base.$originalHeader.after(base.$clonedHeader);

				// enabling support for jquery.tablesorter plugin
				// forward clicks on clone to original
				$('th', base.$clonedHeader).click(function(e){
					var index = $('th', base.$clonedHeader).index(this);
					$('th', base.$originalHeader).eq(index).click();
				});
				$this.bind('sortEnd', base.updateCloneFromOriginal );
			});

			base.updateTableHeaders();

			if($.browser.msie && $.browser.version <= 7) {
				base.$window.scroll(function() {
					clearTimeout(base.$originalHeader.data("timer"));
					base.$originalHeader.data("timer", setTimeout(base.updateTableHeaders, 200));
				});

				base.$window.resize(function() {
					clearTimeout(base.$originalHeader.data("timer"));
					base.$originalHeader.data("timer", setTimeout(base.updateTableHeaders, 200));
				});
			} else {
				base.$window.scroll(base.updateTableHeaders);
				base.$window.resize(base.updateTableHeaders);
			}
		};

		base.updateTableHeaders = function () {
			base.$el.each(function () {
				var $this = $(this);

				var fixedHeaderHeight = isNaN(base.options.fixedOffset) ? base.options.fixedOffset.height() : base.options.fixedOffset;

				var offset = $this.offset();
				var scrollTop = base.$window.scrollTop() + fixedHeaderHeight;
				var scrollLeft = base.$window.scrollLeft();

				if ((scrollTop > offset.top) && (scrollTop < offset.top + $this.height())) {
					if($.browser.msie && $.browser.version <= 7) {
						var tops = $("tr", base.$originalHeader).map(function() {
							return $(this).position().top;
						});

						$("tr", base.$clonedHeader).each(function(index) {
							$(this).css({
								"position": "absolute",
								"top": scrollTop + (tops[index] - tops[0])
							});
						});

						base.$clonedHeader.show();
					} else {
						base.$clonedHeader.css({
							'top': fixedHeaderHeight,
							'margin-top': 0,
							'left': offset.left - scrollLeft
						}).fadeIn(base.options.fadeDuration);

						base.updateCloneFromOriginal();
					}
				}
				else {
					base.$clonedHeader.fadeOut(base.options.fadeDuration);
				}
			});
		};

		base.updateCloneFromOriginal = function () {
			// Copy cell widths and classes from original header
			$('th', base.$clonedHeader).each(function (index) {
				var $this = $(this);
				var origCell = $('th', base.$originalHeader).eq(index);
				$this.removeClass().addClass(origCell.attr('class'));
				$this.css('width', origCell.width());
			});

			// Copy row width from whole table
			base.$clonedHeader.css('width', base.$originalHeader.width());
		};

		// Run initializer
		base.init();
	};

	$.StickyTableHeaders.defaultOptions = {
		fixedOffset: 0,
		fadeDuration: 100
	};

	$.fn.stickyTableHeaders = function (options) {
		return this.each(function () {
			(new $.StickyTableHeaders(this, options));
		});
	};

})(jQuery);
