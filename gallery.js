var Gallery = function(){
    function Gallery(elem) {
        this._$elem = $(elem);
        this._$items = this._$elem.find('.slider__item')
            .detach();
        this._$viewport = $('<div class="slider__viewport"/>');
        this._$canvas = $('<div class="slider__canvas"/>')
            .appendTo(this._$viewport);
        this._$items.appendTo(this._$canvas);
        this._$viewport.appendTo('body');//.replace(this._$elem);
        
        this._$canvas.css({
            'overflow': 'hidden',
            width: this._$items.width() * this._$items.length
        });
    }
    
    function StaticImageProvider(elem) {
        this._$elem = $(elem);
        this._$items = this._$elem.find('')
    }
    
    return Gallery;
}();