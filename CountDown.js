var CountDown = me.HUD_Item.extend({
    // constructor
    init: function(x, y)
    {
        this.parent( x || 0, y || 0 );
        this.font = new me.BitmapFont("16x16_font", 16);
        this.font.set( "left" );
    },

    draw : function (context, x, y)
    {
        this.font.draw(
            context,
            "TIMER: " + this.value,
            this.pos.x + x,
            this.pos.y + y
        );
    }
});
