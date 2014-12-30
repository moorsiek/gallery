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
        /*this._$items = this._$node.find(this._o.itemSelector)
            .detach();*/
        this._$viewport = $('<div class="slider__viewport"/>');
        
        this._$node.replaceWith(this._$viewport);
        
        _setViewportSize.call(this);
        
        //this._$items.appendTo(this._$canvas);
        
        _setupProvider.call(this, this._o.slides);
        _setupCanvas.call(this);

        _setupHandlers.call(this);

        this._plugins = [];
        for (var i = 0, ilim = Gallery.plugins.length; i < ilim; ++i) {
            this._plugins = new Gallery.plugins[i](this);
        }
        
        if (this._handlers && this._handlers.init.length) {
            for (var i = 0, ilim = this._handlers.init.length; i < ilim; ++i) {
                this._handlers.init[i]();
            }
        }
    }
    Gallery.plugins = []; 
    
    Gallery.prototype.go = function(idx){
        _go.call(this, idx);
    };
    
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
    
    function _setupProvider(slides) {
        var config = {
            //slides: slides.map(function(item){
            //    return {
            //        src: item
            //    };
            //})
            slides: slides
        };
        //this._$items.each(function(){
        //    var slide = {};
        //    slide.src = $(this).prop('src');
        //    config.slides.push(slide);
        //});
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

        if (this._handlers && this._handlers.go.length) {
            for (var i = 0, ilim = this._handlers.go.length; i < ilim; ++i) {
                this._handlers.go[i](where);
            }
        }
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
    
    Gallery.prototype.on = function(event, handler){
        this._handlers = this._handlers || {};
        this._handlers[event] = this._handlers[event] || [];
        this._handlers[event].push(handler);
    };
    
    Gallery.registerPlugin = function(plugin) {
        this.plugins = this.plugins || [];
        this.plugins.push(plugin);
    };
    
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

var HtmlSlide = function(){
    function HtmlSlide(html) {
        this._html = html;
        this._$node = null;
    }
    
    HtmlSlide.prototype.load = function(){
        var that = this;        
        return new RSVP.Promise(function(resolve, reject){
            var images,
                $node,
                $imgs,
                imagesLeft;
            $node = $(that._html);
            $imgs = $node.find('img[src]');
            imagesLeft = $imgs.length;
            if (imagesLeft === 0) {
                afterLoad();
            }
            
            images = new Array(imagesLeft);
            $imgs.each(function(idx){
                images[idx] = this.src;
                
                var img = new Image;
                img.onerror = img.onload = function(){
                    images[idx] = img.src;
                    console.log("Loading of image '" + img.src + "' is done");
                    afterLoad();
                };
                img.src = this.src;
            });

            function afterLoad() {
                if (--imagesLeft <= 0) {
                    resolve(that);
                }
            }
        });
    };

    HtmlSlide.prototype.getHtml = function(){
        if (!this._$node) {
            this._$node = $(this._html);
        }
        return this._$node;
    };
    
    HtmlSlide.prototype.getWidth = function(){
        var $node = this.getHtml(),
            revertCss = {
                visibility: $node.css('visibility'),
                top: $node.css('top')
            },
            width;
        
        $node
            .css({
                visibility: 'hidden',
                top: '-6000px'
            })
            .appendTo('body');
        
        width = $node.outerWidth(true);
        
        $node
            .css(revertCss)
            .detach();
        
        return width;
    };
    
    return HtmlSlide;
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
        this._cache.slides = new Array(this._slides.length);
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
        
        var that = this;
        return new RSVP.Promise(function(resolve, reject){
            if (!that._cache.slides[idx]) {
                var slide = new HtmlSlide(that._slides[idx]);
                slide.load()
                    .then(function(){
                        that._cache.slides[idx] = slide;
                        resolve(slide);
                    });
            } else {
                resolve(that._cache.slides[idx]);
            }
            
/*            if (!that._cache.slides[idx]) {
                var img = new Image;
                img.onerror = img.onload = function(){
                    that._cache.images[idx] = img.src;
                    resolve(img);
                };
                img.src = that._slides[idx].src;
            } else {
                resolve(that._slides[idx]);
            }*/
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
        this._currentSlideIdx = 0;
        this._$slides = null;
        _init.call(this)
            .then(config.onload);
    }
    
    //TODO: handle case when there's no (= 0) slides
    function _init() {
        var that = this;
        
        /*return new RSVP.Promise(function(resolve, reject){
            
        })*/
        
        return _loadSlides.call(this)
            .then(function(){
                if (that._config.slideWidth == null) {
                    _getSlide.call(that, 0)
                        .then(function($node){
                            that._config.slideWidth = that._slides[0].getWidth();
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
            .then(function(slides){
                if (slides) {
                    that._slides = slides;
                } else {
                    that._slides = new Array(that._provider.getLength());
                }
                that._$slides = new Array(that._slides.length);

                for (var i = 0, ilim = that._slides.length; i < ilim; ++i) {
                    _insertSlide.call(that, that._slides[i], i)
                }
            });
    }

    /**
     * Insert a new slide (or a fake slide, if no image given) into canvas.
     * 
     * @param image Image|null An image to server as a source for new slide. If null, then fake slide is inserted
     * @param idx int Index of the slide
     * @private
     */
    function _insertSlide(slide, idx) {
        var $node;
        if (slide != null) {
            $node = $('<div class="slider__item"/>')
                .append(slide.getHtml());
            
            //$node = $('<img alt="" class="slider__item"/>')
            //    .prop('src', image.src);
        } else {
            $node = $('<span class="slider__fakeItem"/>');
        }
            
        $node.prop('id', 'slider_item_' + idx);

        if (this._$slides[idx]) {
            this._$slides[idx].replaceWith($node);
            this._$slides[idx] = $node;
        } else {
            this._$slides[idx] = $node;
            this._$node.append($node);
        }
        
        //if (this._$slides[this._currentSlideIdx].prevAll().filter(function(){ return this === $node[0]; }).length) {
        //console.log('Idxses: ', idx, this._currentSlideIdx);
        if (idx < this._currentSlideIdx) {
            this._$node.css({
                left: -this._$slides[this._currentSlideIdx].offset().left + (parseFloat(this._$node.css('left')) || 0) + 'px'
            });
        }
        
        return $node;
    }
    
    function _getSlide(idx) {
        var that = this;
        
        return new RSVP.Promise(function(resolve, reject){
            var $node;
            
            if (that._slides[idx] == null) {
                that._provider.getSlide(idx)
                    .then(function(slide){
                        that._slides[idx] = slide;
                        
                        var $node = _insertSlide.call(that, that._slides[idx], idx);
                        
                        resolve($node);
                    });
            } else {
                $node = that._$slides[idx];
                resolve($node);
            }
        });
    }

    SliderCanvas.prototype.go = function(idx){
        console.log('go ' + idx);
        console.log(this._slides[idx]);
        
        var that = this;
        
        return _getSlide.call(this, idx)
            .then(function($node){
                console.log($node[0]);
                console.log('new pos ' + (-$node.offset().left + (parseFloat(that._$node.css('left')) || 0) + 'px'));
                that._$node.stop().animate({
                    left: -$node.offset().left + (parseFloat(that._$node.css('left')) || 0) + 'px'
                });
                that._currentSlideIdx = idx;
            });
    };
    
    return SliderCanvas;
}();

var GalleryBulletsPlugin = function(){
    function GalleryBulletsPlugin(api) {
        this._api = api;
        
        if (!this._api._o.bullets) {
            return;
        }
        
        var that = this;
        api.on('init', function(){
            _init.call(that);
            api._$node.parent();
        });
        
        api.on('go', function(idx){
            _go.call(that, idx);
        });
        
        console.log('constructed');
    }

    function _init() {
        console.log('inited');
        
        var that = this,
            $ctr = this._api._$viewport.parent(),
            $li,
            $a;
            
        this._$wrap = $('<div class="slider-bullets"/>')
            .appendTo($ctr)
            .css('text-align', 'center');
        if (this._api._o.bullets.style === 'bullets') {
            this._$wrap.addClass('slider-bullets_style_bullets');
        }
        this._$node = $('<ul class="slider-bullets__inner"/>')
            .appendTo(this._$wrap);
        
        for (var i = 0, ilim = this._api._provider.getLength(); i < ilim; ++i) {
            $li = $('<li class="slider-bullets__item"/>');
            $a = $('<a href="#"/>');
            if (this._api._o.bullets.style === 'bullets') {
                $a.html('&middot;');
            } else {
                $a.text(i);
            }
            $li.append($a);
            this._$node.append($li);
        }
        
        this._$node.on('click', 'a', function(e){
            e.preventDefault();
            that._api.go($(this).parent().index());
        });
    }
    
    function _go(idx) {
        this._$node.find('li')
            .removeClass('slider-bullets__item_active')
            .eq(idx)
                .addClass('slider-bullets__item_active');
    }
    
    return GalleryBulletsPlugin;
}();

Gallery.registerPlugin(GalleryBulletsPlugin);