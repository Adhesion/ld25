CorruptionRowOffset = 10;
CorruptionColOffset = 10;

var Orb = me.ObjectEntity.extend({

    init: function( x, y, settings )
    {
        settings = settings || {};
        settings.image        = settings.image        || me.loader.getImage( "maptile" ),
        settings.spritewidth  = settings.spritewidth  || 48,
        settings.spriteheight = settings.spriteheight || 48
        settings.collidable   = true;

        this.parent( x, y, settings );

        this.gravity = 0;
        this.last = settings.last;
        this.hp = 3;

        var level = me.game.currentLevel;
        this.corrupted = level.getLayerByName( "corrupted background" );
        this.normal = level.getLayerByName( "normal background" );
        me.state.current().orbs.push( this );
    },

    onCollision: function( res, obj )
    {
        if( this.hp <= 0 ) {
            return;
        }

        if( obj == me.game.player ) {
            if( this.last ) {
                var orbs = me.state.current().orbs;
                for( var i = 0; i < orbs.length; i ++ ){
                    if( ! orbs[i].last ) {
                        return;
                    }
                }
            }
            this.hp -= 1;
        }

        if( this.hp <= 0 ) {
            this.corrupt();
        }

    },

    corrupt: function()
    {
        var tw = me.game.currentLevel.tilewidth;
        var th = me.game.currentLevel.tileheight;

        var tilex = Math.max(0, this.pos.x  - CorruptionColOffset * tw );
        var tiley = Math.max(0, this.pos.y  - CorruptionRowOffset * th );
        var endx = Math.min(me.game.currentLevel.realwidth, this.pos.x + CorruptionColOffset * tw );
        var endy = Math.min(me.game.currentLevel.realheight, this.pos.y + CorruptionRowOffset * th );

        for( var x = tilex; x < endx; x += tw ) {
            for( var y = tiley; y < endy; y += th ) {
                // TODO I love mellon's asynmetrical API. Pixels here tiles
                // there, WHY NOT?!
                var newtile = this.corrupted.getTileId( x, y );
                this.normal.setTile( ~~(x / tw), ~~(y / th), newtile);
            }
        }
        me.game.repaint();

        var opened = [];
        var state = me.state.current();
        for( var d = 0; d < state.doors.length; d++ ) {
            var door = state.doors[d];
            door.require--;
            if( door.require == 0 ) {
                // TODO mark as opened?
                me.game.remove(door);
                opened.push(door);
            }
        }
        for( var d = 0; d < opened.length; d++ ) {
            state.doors.splice( state.doors.indexOf( opened[d] ), 1 );
        }

        state.orbs.splice( state.orbs.indexOf( this ), 1 );
    },

    update: function()
    {
        return false;
    }
});


