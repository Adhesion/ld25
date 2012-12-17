var Door = me.ObjectEntity.extend({

    init: function( x, y, settings )
    {
        settings = settings || {};
        settings.image        = settings.image || me.loader.getImage( settings.width > settings.height ? "hdoor" : "vdoor" );
        settings.spritewidth = settings.width > settings.height ? 192 : 96;
        settings.spriteheight = settings.width > settings.height ? 96 : 192;
        console.log ( settings.width, settings.height );

        if( ! settings.require ) {
            throw "Must set required count on door";
        }

        this.parent( x, y, settings );

        this.addAnimation( "play", [ 0, 1, 2 ] );
        this.setCurrentAnimation( "play" );

        this.door = 1;
        this.gravity = 0;
        this.require = settings.require;
        this.collidable   = true;

        me.state.current().doors.push(this);
    },

    update: function()
    {
        return this.parent( this );
    }
});


