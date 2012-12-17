CorruptionRowOffset = 10;
CorruptionColOffset = 10;

var Orb = me.ObjectEntity.extend({

    init: function( x, y, settings )
    {
        settings = settings || {};

        settings.image        = settings.image        || "orb",
        settings.spritewidth  = settings.spritewidth  || 96,
        settings.spriteheight = settings.spriteheight || 96
        settings.collidable   = true;

        this.last = settings.last;
        this.addLock = true;
        if ( this.last )
            settings.image = "lastorb";

        this.parent( x, y, settings );

        this.addAnimation( "play", [ 0, 0, 0, 0, 1, 2, 3, 4 ] );
        this.setCurrentAnimation( "play" );
        this.animationspeed = 7;

        this.gravity = 0;
        this.hp = 7;
		this.lastHit = null; 
		
        var level = me.game.currentLevel;
        this.corrupted = level.getLayerByName( "corrupted background" );
        this.normal = level.getLayerByName( "corrupted foreground" );

        this.fade = settings.fade;
        this.duration = settings.duration;
        this.fading = false;

        me.state.current().orbs.push( this );
    },

    onCollision: function( res, obj )
    {
        if( this.hp <= 0 ) {
            return;
        }
		if(this.hitDelay > 0) this.hitDelay--;
		
        if( obj != this.lastHit && obj.type == "weakAttack" || obj.type == "strongAttack" ) {
            
			this.lastHit = obj;
			if( this.last ) {
				var orbs = me.state.current().orbs;
				for( var i = 0; i < orbs.length; i ++ ){
					if( ! orbs[i].last ) {
						me.audio.play( "ping" );
						return;
					}
				}
			}
			this.hp -= 1;
			me.audio.play( "hit" );
			me.game.viewport.shake(10, 5, me.game.viewport.AXIS.BOTH);
			
        }

        if( this.hp <= 0 ) {
			me.game.viewport.shake(20, 20, me.game.viewport.AXIS.BOTH);
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
                if( newtile ) {
                    this.normal.setTile( ~~(x / tw), ~~(y / th), newtile);
                }
            }
        }
        me.game.repaint();

        var opened = [];
        var state = me.state.current();
        for( var d = 0; d < state.doors.length; d++ ) {
            var door = state.doors[d];
            door.require--;
            if( door.require == 0 ) {
                me.audio.play( "door" );
                // TODO mark as opened?
                me.game.remove(door);
                opened.push(door);
            }
        }
        for( var d = 0; d < opened.length; d++ ) {
            state.doors.splice( state.doors.indexOf( opened[d] ), 1 );
        }

        state.orbs.splice( state.orbs.indexOf( this ), 1 );

        me.audio.play( "orbdeath" );

        // end of level?
        if( state.orbs.length == 0 )
            me.state.current().nextLevel();
        else if ( state.orbs.length == 1 )
            state.orbs[ 0 ].hideLock();

        // not sure if it's safe to remove
        this.visible = false;
    },

    hideLock: function()
    {
        if ( this.lock )
        {
            this.lock.visible = false;
        }
    },

    update: function()
    {
        // why the fuck do i have to do this here FFFFFF
        if ( this.addLock ) // FUCK THIS SHIT
        {
            var lockSettings = new Object();
            lockSettings.image = "orblock";
            lockSettings.spritewidth = 96;
            lockSettings.spriteheight = 96;
            console.log ( "lockstuff", this.pos.toString(), lockSettings.spritewidth );
            this.lock = new me.SpriteObject( this.pos.x, this.pos.y, lockSettings );
            // z hack?
            me.game.add( this.lock, this.z-1 );
            me.game.sort();
            this.addLock = false;
        }

        return this.parent( this );
    }
});
