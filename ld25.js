/*
* ld25.js
*
* Main file for LD25 entry.
*/


var jsApp = {
    onload: function()
    {
        if ( !me.video.init( 'game', 800, 600) )
        {
            alert( "Sorry, it appears your browser does not support HTML5." );
            return;
        }

        me.audio.init( "mp3,ogg" );

        me.loader.onload = this.loaded.bind( this );
        me.loader.preload( gameResources );

        me.state.change( me.state.LOADING );
    },

    loaded: function()
    {
        me.state.set( me.state.PLAY, new PlayScreen() );

        me.entityPool.add( "player", Player );
        me.entityPool.add( "hugger", Hugger );
        me.entityPool.add( "pusher", Pusher );
        me.entityPool.add( "door", Door);
        me.entityPool.add( "orb", Orb );

        me.state.change( me.state.PLAY );
        me.debug.renderHitBox = false;
    }
};

var PlayScreen = me.ScreenObject.extend({
    init: function()
    {
        this.parent( true );
        // Doors in this current level
        me.input.bindKey( me.input.KEY.ENTER, "enter", true );
    },

    getLevel: function()
    {
        return this.parseLevel( me.levelDirector.getCurrentLevelId() );
    },

    parseLevel: function( input )
    {
        var re = /level(\d+)/;
        var results = re.exec( input );
        return results[1];
    },

    updateTimer: function() {
        if( me.game.HUD.getItemValue( "timer" ) <= 0 ) {
            this.timerStart = me.timer.getTime();
            me.game.HUD.setItemValue( "timer" , 60000 );
        }
        else {
            var v = ( ( 60000 - ( me.timer.getTime() - this.timerStart ) ) / 1000 ).toFixed(1);
            if( v < 0 ) { v= 0; }
            if( v != me.game.HUD.getItemValue( "timer" ) ) {
                me.game.HUD.setItemValue( "timer", v );
            }
        }
    },

    update: function()
    {
        this.updateTimer();
    },

    /** Update the level display & music. Called on all level changes. */
    changeLevel: function( )
    {
    },

    getCurrentMusic: function()
    {
    },

    startLevel: function( level )
    {
        this.doors = [];
        me.levelDirector.loadLevel( level );
        me.game.sort();

        this.changeLevel();
    },

    // this will be called on state change -> this
    onResetEvent: function()
    {
        me.game.addHUD( 0, 0, me.video.getWidth(), me.video.getHeight() );
        me.game.HUD.addItem( "timer", new CountDown());

        this.startLevel( location.hash.substr(1) || "level1" );
        me.input.bindKey( me.input.KEY.ENTER, "enter", true );
    },

    onDestroyEvent: function()
    {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.game.disableHUD();
    }
});

window.onReady( function()
{
    jsApp.onload();
});
