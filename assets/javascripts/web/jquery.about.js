(function($, window) {
    'use strict';

    var privateMethods = {};
    var instance;

    function About (options) {
        this.options = options;
        return privateMethods.init(this);
    }

    privateMethods.helpers = {
        browserCheck: function() {
            return ($.browser.name === 'firefox' && $.browser.versionNumber >= 4)   ||
                   ($.browser.name === 'msie'    && $.browser.versionNumber >= 9)   ||
                   ($.browser.name === 'chrome'  && $.browser.versionNumber >= 10)  ||
                   ($.browser.name === 'opera'   && $.browser.versionNumber >= 9.8) ||
                   ($.browser.name === 'safari'  && $.browser.versionNumber >= 5);
        }
    };

    privateMethods.init = function(about) {
        $.extend(true, privateMethods, about);

        if (!privateMethods.helpers.browserCheck()) {
            return alert('Внимание: ваш браузер устарел, для работы чата обновите его.');
        }
    };

    $.fn.about = function(env, csrf) {
        return instance ? instance : instance = new About({ env: env, csrf: csrf });
    };
})(jQuery, window);