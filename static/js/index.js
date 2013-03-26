/**
 * Dust.js stuff
 */
dust.onLoad = function(name, callback) {
    $.get(['views/', '.dust.html'].join(name), function(data) {
        callback(null, data);
    }, 'html').error(function() {
        console.log('Missing template "' + name + '".');
    });
};


/**
 * UI
 */
function scrollTo(element) {
    $("html, body").stop().animate({ scrollTop: element.offset().top - 5 },
            1000)
    $(element).addClass('animated pulse')
    window.setTimeout(function() {
        $(element).removeClass('pulse')
    }, 1000)
}


/**
 * Generic toggler
 *  Toggles the closest relative within the same article or section, whichever
 *  comes first, matching the selector specified by the clicked element's
 *  data-toggle attribute.
 *  : $('.toggle').on('click', on_toggle);
 *  !
 *   jQuery
 *   get_closest_ancestor
 */
var on_toggle = function() {
    var toggler = $(this);
    var ancestor = get_closest_ancestor(toggler, ['section', 'article']);
    if (!ancestor) return;
    ancestor.find(toggler.data('toggle')).toggle('slow', function() {
        toggler.attr('data-state', $(this).is(':visible'));
    });
};


/**
 * Get the closest ancestor matching one of the given selectors.
 * <
 *  jQuery object
 *  Array of CSS selectors (strings)
 */
var get_closest_ancestor = function(e, selectors) {
    if (!Array.isArray(selectors)) return;
    var p = e.parent();
    if (p.length == 0) return;
    for (var i = 0; i < selectors.length; i++)
        if (p.is(selectors[i]))
            return p;
    return get_closest_ancestor(p, selectors);
};


/**
 * ajaxify
 */
var ajaxify = {
    _methods: ['post', 'get', 'update', 'delete'],
    a: function(res_handler) {
        if (!res_handler) res_handler = this.default_handler;
        return function(e) {
            e.preventDefault();
            var method = $(this).data('method');
            method = (method && ajaxify._methods.indexOf(method) > -1 ?
                    method.toUpperCase() : 'GET' );
            var fid = feedback("AJAXing (" + this.href + ").").id;
            $.ajax({
                type: method,
                url: this.href,
                dataType: 'json',
                success: function(res) {
                    $('.feedback.item[data-id=' + fid + ']').remove();
                    res_handler(res, e, this);
                }
            }, 'json');
        };
    },
    form: function(res_handler) {
        if (!res_handler) res_handler = this.default_handler;
        return function(e) {
            e.preventDefault();
            var form = $(this).parents('form')[0];
            var data = $(form).serializeArray();
            var fid = feedback("AJAXing '" + form.action + "' with '" + JSON.stringify(data) + "'.").id;
            $.ajax({
                type: form.method,
                url: form.action,
                data: data,
                dataType: 'json',
                success: function(res) { 
                    $('.feedback.item[data-id=' + fid + ']').remove();
                    res_handler(res, e, this);
                }
            });
        };
    },
    default_handler: function(res, e, ajax) {
        console.log('default_handler(res, e, ajax): this', res, e, ajax, this);
    }
};


/**
 * ajaxified response handlers
 */
var on_res_post_add = function(res, e, ajax) {
    if (res.error)
        feedback.error('Error: [' + res.error + '].');
    else {
        console.log('res = ', res);
        dust.render('wall-post', res.post, function(err, out) {
            out = $(out);
            $('section.wall section.posts').append(out);
            scrollTo(out);
            $('section.wall form input[name=message]').val('');
        });
    }
};


/**
 * DOM ready
 */
$(function() {
    //* ajaxify
    $('body').on('click', 'section.wall form input[type=submit]',
        ajaxify.form(on_res_post_add));

    //* Hide all hidden toggleables.
    $('.toggle[data-state=false]').each(function() {
        on_toggle.call($(this));
    });

    //* UI init.
    $('body').on('click', '.toggle', on_toggle);
});
