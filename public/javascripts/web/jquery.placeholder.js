$("[placeholder]").focus(function(){var a=$(this);a.val()==a.attr("placeholder")&&(a.val(""),a.removeClass("placeholder"))}).blur(function(){var a=$(this);if(a.val()==""||a.val()==a.attr("placeholder"))a.addClass("placeholder"),a.val(a.attr("placeholder"))}).blur(),$("[placeholder]").parents("form").submit(function(){$(this).find("[placeholder]").each(function(){var a=$(this);a.val()==a.attr("placeholder")&&a.val("")})});
