/** Why waste time with multidimentionality? */
CorruptionMatrixStride = 5,

/** The distance to offset the matrix. This centers the matrix. */
CorruptionRowOffset = 2,

/** The distance to offset the matrix. This centers the matrix. */
CorruptionColOffset = 2,

/** Layer that you expose when your corrupt shit. */
CorruptionLayer = "corruption";

/** TODO: This needs to be a function so that we can map all the various
* tile types. E.g. if its a floor it is one type of corruption if it is
* a wall it could be another. */
CorruptionTileId = 1;

/**
* The center of the corruption matrix is where the orb is before it is
* destroyed. The cells around it will be corrupted if they are 1, and left
* alone if they are 0.
*/
CorruptionMatrix = [
    0, 0, 1, 0, 0 ,
    0, 1, 1, 1, 0,
    1, 1, 1, 1, 1,
    0, 1, 1, 1, 0,
    0, 0, 1, 0, 0
];


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

        this.layer = me.game.currentLevel.getLayerByName( CorruptionLayer );
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
        var tilex = Math.floor(this.pos.x / me.game.currentLevel.tilewidth + .5);
        var tiley = Math.floor(this.pos.y / me.game.currentLevel.tileheight + .5);
        for( var y = 0; y < CorruptionMatrixStride; y++ ) {
            for( var x = 0; x < CorruptionMatrixStride; x++ ) {
                if( CorruptionMatrix[ y * CorruptionMatrixStride + x ] ) {
                    var targetx = tilex - CorruptionColOffset + x;
                    var targety = tiley - CorruptionRowOffset + y;
                    if( targetx > 0
                        && targety > 0
                        && targety < me.game.currentLevel.height
                        && targetx < me.game.currentLevel.width ) {
                        this.layer.setTile( targetx, targety, CorruptionTileId );
                    }
                    me.game.repaint();
                }
            }
        }
        
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


