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
        this.lastorb = settings.lastorb;
        this.hp = 3;

        var level = me.game.currentLevel;
        this.corrupted = level.getLayerByName( "corrupted background" );
        this.normal = level.getLayerByName( "normal background" );
        /*
        for( var i = 40; i < 80; i ++) {
            var s = '';
            for( var j = 40; j < 80; j ++) {
                s += this.corrupted.getTileId( i, j ) + ', ';
            }
            console.log(s);
        }
        */
        
    },

    onCollision: function( res, obj )
    {
        if( this.hp <= 0 ) {
            return;
        }

        if( obj == me.game.player ) {
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
    },

    update: function()
    {
        return false;
    }
});


