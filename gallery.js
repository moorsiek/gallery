var Gallery = function(){
    var $HTML = $('html'),
        $BODY = $('body');
    
    var defaultOptions = {
        itemSelector: '.slider__item',
        namespace: 'slider'
    };
    
    function Gallery(elem, options) {
        this._o = this._options = $.extend({}, options, defaultOptions);
        
        this._$node = $(elem);
        this._$parent = this._$node.parent();
        this._$items = this._$node.find(this._o.itemSelector)
            .detach();
        this._$viewport = $('<div class="slider__viewport"/>');
        
        this._$node.replaceWith(this._$viewport);
        
        _setViewportSize.call(this);
        
        //this._$items.appendTo(this._$canvas);
        
        _setupProvider.call(this);
        _setupCanvas.call(this);

        _setupHandlers.call(this);
    }
    
    function _setupCanvas() {
        var that = this;
        this._$canvas = $('<div class="slider__canvas"/>')
            .css({
                position: 'relative'
            })
            .appendTo(this._$viewport);
        this._canvas = new SliderCanvas(this._$canvas, this._provider, {
            onload: function(){
                that._currentIdx = 0;
                _go.call(that, 0);
            }
        });
    }
    
    function _setupProvider() {
        var config = {
            slides: []
        };
        this._$items.each(function(){
            var slide = {};
            slide.src = $(this).prop('src');
            config.slides.push(slide);
        });
        //this._provider = new StaticSlideProvider(config);
        this._provider = new AjaxSlideProvider(config);
    }
    
    function _resolvePosition(where) {
        var newIdx;
        switch (where) {
            case 'next':
                newIdx = this._currentIdx + 1;
                if (newIdx >= this._provider.getLength()) {
                    newIdx = 0;
                }
                return newIdx;
                break;
            case 'prev':
                newIdx = this._currentIdx - 1;
                if (newIdx < 0) {
                    newIdx = this._provider.getLength() - 1;
                }
                return newIdx;
                break;
            default:
                return where;
                break;
        }
    }
    
    function _go(where) {
        where = _resolvePosition.call(this, where);
        this._canvas.go(where);
        this._currentIdx = where;
    }
    
    function _setupHandlers() {
        var that = this;
        this._$viewport.on('click.' + this._o.namespace, function(e){
            e.preventDefault();
            
            _go.call(that, 'next');
        });
    }
    
    function _setViewportSize() {
        if (this._o.viewportWidth == null) {
            this._o.viewportWidth = this._$parent.width();
        }
        if (this._o.viewportHeight == null) {
            this._o.viewportHeight = this._$parent.height();
        }
        this._$viewport.css({
            width: this._o.viewportWidth,
            height: this._o.viewportHeight
        });
    }
    
    function StaticImageProvider(elem) {
        this._$elem = $(elem);
        this._$items = this._$elem.find('')
    }
    
    return Gallery;
}();

var SlideProvider = function(){
    var CLASS_NAME = 'SlideProvider';
    
    function SlideProvider(config) {
        throw new Error(CLASS_NAME + ': the class is abstract!');
    }
    SlideProvider.prototype.getLength = function(){
           
    };
    SlideProvider.prototype.getThumb = function(){

    };
    SlideProvider.prototype.getThumbs = function(){

    };
    SlideProvider.prototype.getSlide = function(){

    };
    SlideProvider.prototype.getSlides = function(){
        
    };
    
    return SlideProvider;
}();

var StaticSlideProvider = function(){
    var CLASS_NAME = 'StaticSlideProvider';
    
    function StaticSlideProvider(config){
        _processConfig.call(this, config);
        this._cache = {};
    }
    
    StaticSlideProvider.prototype = $.extend({}, SlideProvider.prototype);
    StaticSlideProvider.prototype.constructor = StaticSlideProvider;
    
    function _processConfig(config){
        if (!config.slides || !config.slides.length) {
            throw new Error(CLASS_NAME + ': bad config! config variable "slides" must be present and be an array of slide definitions.');
        }
        this._slides = config.slides;
    }
    StaticSlideProvider.prototype.getLength = function(){
        return this._slides.length;
    };
    StaticSlideProvider.prototype.getThumb = function(idx){
        if (idx > this._slides.length || idx < 0) {
            throw new Error(CLASS_NAME + ': there\'s no thumb with index ' + idx);
        }
        return this._slides[idx].thumb;
    };
    StaticSlideProvider.prototype.getThumbs = function(){
        if (!this._cache.thumbs) {
            this._cache.thumbs = new Array(this._slides.length);
            for (var i = this._slides.length - 1; i >= 0; --i) {
                this._cache.thumbs[i] = this._slides[i].thumb;
            }
        }
        return this._cache.thumbs;
    };
    StaticSlideProvider.prototype.getSlide = function(idx){
        if (idx > this._slides.length || idx < 0) {
            throw new Error(CLASS_NAME + ': there\'s no slide with index ' + idx);
        }
        return this._slides[idx]; 
    };
    StaticSlideProvider.prototype.getSlides = function(){
        if (!this._cache.images) {
            this._cache.images = new Array(this._slides.length);
            for (var i = this._slides.length - 1; i >= 0; --i) {
                this._cache.images[i] = new Image;
                this._cache.images[i].src = this._slides[i].src; 
            }
        }
        return this._cache.images; 
    };

    return StaticSlideProvider;
}();

var AjaxSlideProvider = function(){
    var CLASS_NAME = 'AjaxSlideProvider';

    function AjaxSlideProvider(config){
        this._cache = {};
        _processConfig.call(this, config);
    }

    AjaxSlideProvider.prototype = $.extend({}, SlideProvider.prototype);
    AjaxSlideProvider.prototype.constructor = AjaxSlideProvider;

    function _processConfig(config){
        if (!config.slides || !config.slides.length) {
            throw new Error(CLASS_NAME + ': bad config! config variable "slides" must be present and be an array of slide definitions.');
        }
        this._slides = config.slides;
        this._cache.images = new Array(this._slides.length);
    }
    AjaxSlideProvider.prototype.getLength = function(){
        return this._slides.length;
    };
    AjaxSlideProvider.prototype.getThumb = function(idx){
        if (idx > this._slides.length || idx < 0) {
            throw new Error(CLASS_NAME + ': there\'s no thumb with index ' + idx);
        }
        return this._slides[idx].thumb;
    };
    AjaxSlideProvider.prototype.getThumbs = function(){
        if (!this._cache.thumbs) {
            this._cache.thumbs = new Array(this._slides.length);
            for (var i = this._slides.length - 1; i >= 0; --i) {
                this._cache.thumbs[i] = this._slides[i].thumb;
            }
        }
        return this._cache.thumbs;
    };
    AjaxSlideProvider.prototype.getSlide = function(idx){
        if (idx > this._slides.length || idx < 0) {
            throw new Error(CLASS_NAME + ': there\'s no slide with index ' + idx);
        }
        
        return new RSVP.Promise(function(resolve, reject){
            if (!this._cache.images[idx]) {
                var img = new Image,
                    that = this;
                img.onerror = img.onload = function(){
                    that._cache.images[idx] = img.src;
                    resolve(img);
                };
                img.src = this._slides[idx].src;
            } else {
                resolve(this._slides[idx]);
            }
        });
    };
    AjaxSlideProvider.prototype.getSlides = function(){
        return RSVP.resolve();
        return false;
        if (!this._cache.images) {
            this._cache.images = new Array(this._slides.length);
            for (var i = this._slides.length - 1; i >= 0; --i) {
                this._cache.images[i] = new Image;
                this._cache.images[i].src = this._slides[i].src;
            }
        }
        return this._cache.images;
    };

    return AjaxSlideProvider;
}();

var SliderCanvas = function(){
    //TODO: config.sameSlideSize = true/false 
    function SliderCanvas(node, provider, config) {
        this._config = $.extend({}, config);
        this._$node = $(node);
        this._provider = provider;
        _init.call(this)
            .then(config.onload);
    }
    
    //TODO: handle case when there's no (= 0) slides
    function _init() {
        var that = this;
        
        return _loadSlides.call(this)
            .then(function(){
                if (that._config.slideWidth == null) {
                    _getSlide.call(this, function($node){
                        that._config.slideWidth = that._images[0].width;
                        rest();
                    });
                } else {
                    rest();
                }
    
                function rest() {
                    that._$node.css({
                        width: that._config.slideWidth * that._provider.getLength()
                    });
                }
            });
    }

    function _loadSlides() {
        var that = this;
        return this._provider.getSlides()
            .then(function(images){
                if (images) {
                    that._images = images;
                } else {
                    that._images = new Array(that._provider.getLength());
                }
                that._$slides = new Array(that._images.length);

                var $node;
                for (var i = 0, ilim = that._images.length; i < ilim; ++i) {
                    if (that._images[i] != null) {
                        $node = $('<img alt="" class="slider__item"/>')
                            .prop('src', that._images[i].src);
                    } else {
                        $node = $('<span class="slider__fakeItem"/>')
                            .data('idx', i);
                    }
                    that._$slides[i] = $node;
                    that._$node.append($node);
                }
            });
    }
    
    function _getSlide(idx) {
        var that = this;
        
        return new RSVP.Promise(function(reject, resolve){
            var $node;
            
            if (that._images[idx] == null) {
                that._provider.getSlide(idx)
                    .then(function(image){
                        that._images[idx] = image;
    
                        $node = $('<img alt=""/>')
                            .prop('src', that._images[idx].src);
                        that._$node
                            .find('[data-idx="' + idx + '"]')
                            .replaceWith($node);
                        that._$slides[idx] = $node;
                        
                        resolve($node);
                    });
            } else {
                $node = this._$slides[idx];
                resolve($node);
            }
        });
    }

    SliderCanvas.prototype.go = function(idx){
        console.log('go ' + idx);
        console.log(this._images[idx]);
        
        var that = this;
        
        return _getSlide.call(this)
            .then(function($node){
                that._$node.stop().animate({
                    left: -$node.offset().left + (parseFloat(that._$node.css('left')) || 0) + 'px'
                });
            });
    };
    
    return SliderCanvas;
}();