var Door = me.ObjectEntity.extend({

    init: function( x, y, settings )
    {
        settings = settings || {};
        settings.image        = settings.image || me.loader.getImage( settings.width > settings.height ? "hdoor" : "vdoor" );

        if( ! settings.require ) {
            throw "Must set required count on door";
        }


        this.parent( x, y, settings );

        this.door = 1;
        this.gravity = 0;
        this.require = settings.require;
        this.collidable   = true;

        me.state.current().doors.push(this);
    },
});


