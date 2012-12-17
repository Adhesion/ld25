var CountDown = me.HUD_Item.extend({
    // constructor
    init: function(x, y)
    {
        this.parent( x || 0, y || 0 );
        this.font = new me.BitmapFont("64x64_font", 64);
        this.font.set( "left" );
    },

    draw : function (context, x, y)
    {
        this.font.draw(
            context,
            "" + this.value,
            this.pos.x + x,
            this.pos.y + y
        );
    }
});
