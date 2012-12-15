/**
 * player.js
 *
 * Defines the main player.
 *
 * Author: Andrew Ford
 */

var Player = me.ObjectEntity.extend(
{
    init: function( x, y, settings )
    {
        this.gravity = 0.0;
        this.setVelocity( 7.0, 7.0 );
        this.direction = new Vector2d( 0.0, 0.0 );

        this.dashTimer = 0;

        me.input.bindKey( me.input.KEY.LEFT, "left" );
        me.input.bindKey( me.input.KEY.RIGHT, "right" );
        me.input.bindKey( me.input.KEY.UP, "up" );
        me.input.bindKey( me.input.KEY.DOWN, "down" );
        me.input.bindKey( me.input.KEY.X, "weakAttack" );
        me.input.bindKey( me.input.KEY.C, "strongAttack" );
        me.input.bindKey( me.input.KEY.V, "dash" );
    },

    attack: function( type )
    {

    },

    // fix for multiple collision - if attack sprites are checking collision,
    // don't collide against player (would break out of loop and miss enemies)
    checkCollision: function( obj )
    {
        if ( obj.type == "weakAttack" || obj.type == "strongAttack" )
        {
            return null;
        }
        return this.parent( obj );
    },

    checkInput: function()
    {
        var tempDir = new Vector2d( 0.0, 0.0 );
        if ( me.input.isKeyPressed( "left" ) )
        {
            tempDir.x = -1.0;
        }
        if ( me.input.isKeyPressed( "right" ) )
        {
            tempDir.x = 1.0;
        }
        if ( me.input.isKeyPressed( "up" ) )
        {
            tempDir.y = -1.0;
        }
        if ( me.input.isKeyPressed( "down" ) )
        {
            tempDir.y = 1.0;
        }

        if ( tempDir.x != 0.0 || tempDir.y != 0.0 )
        {
            this.vel.x = tempDir.x * this.accel.x * me.timer.tick;
            this.vel.y = tempDir.y * this.accel.y * me.timer.tick;
            this.direction = tempDir;
        }

        if ( me.input.isKeyPressed( "weakAttack") )
        {
            console.log( "weak attack" );
        }
        else if ( me.input.isKeyPressed( "strongAttack" ) )
        {
            console.log( "weak attack" );
        }

        if ( me.input.isKeyPressed( "dash" ) && this.dashTimer == 0 )
        {
            this.dashTimer = 30;
            this.vel.x = this.direction.x * this.accel.x * me.timer.tick * 4.0;
            this.vel.y = this.direction.y * this.accel.y * me.timer.tick * 4.0;
        }
    },

    update: function()
    {
        checkInput();

        if ( this.dashTimer > 0 ) this.dashTimer--;
    }
});

var PlayerAttack = me.ObjectEntity.extend(
{
    init: function( x, y, sprite, spritewidth, speed, frames, type )
    {
        var settings = new Object();
        settings.image = sprite;
        settings.spritewidth = spritewidth;

        this.parent( x, y, settings );

        this.animationspeed = speed;
        this.addAnimation( "play", frames );
        this.setCurrentAnimation( "play", function() { me.game.remove( this ) } );
        this.type = type;
    },

    update: function()
    {
        me.game.collide( this );
        this.parent();
        return true;
    }
});
