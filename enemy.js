/*
 * enemy.js
 *
 * Defines basic enemy type.
 *
 * @author Adhesion
 */

var Enemy = me.ObjectEntity.extend({
    init: function( x, y, settings )
    {
        settings.image        = settings.image        || 'testenemy';
        settings.spritewidth  = settings.spritewidth  || 48;
        settings.spriteheight = settings.spriteheight || 48;

        this.parent( x, y, settings );
        this.gravity = 0;
        this.type = me.game.ENEMY_TYPE;
        this.collidable = true;
        this.playerCollidable = true;

        this.origVelocity = 6;
        this.setMaxVelocity( this.origVelocity, this.origVelocity );

        this.hp = 3;

        this.directionString = "down";
    },

    updateDirectionString: function()
    {
        if ( this.vel.y > 0.0 )
            this.directionString = "down";
        if ( this.vel.y < 0.0 )
            this.directionString = "up";
        if ( this.vel.x > 0.0 )
            this.directionString = "right";
        if ( this.vel.x < 0.0 )
            this.directionString = "left";
    },

    /** Get a vector to the player. */
    toPlayer: function()
    {
        if( me.game.player ) {
            return new me.Vector2d(
                me.game.player.pos.x
                    + me.game.player.width / 2
                    - this.pos.x - this.width / 2,
                me.game.player.pos.y
                    + me.game.player.height / 2
                    - this.pos.y - this.height / 2
            );
        }
        return;
    },

    onCollision: function( res, obj )
    {
        if( obj.type == "weakAttack" || obj.type == "strongAttack" ||
            ( obj == me.game.player && me.game.player.isDashing() ) )
        {
            this.knockback( obj );
        }
    },

    knockback: function( obj )
    {
        this.hp -= 1;
        var knockback = 12.0;
        if ( obj.type == "strongAttack" )
            knockback = 18.0;

        this.setMaxVelocity( knockback, knockback );
        this.collidable = false;
        this.flicker( 60, function()
        { this.setMaxVelocity( this.origVelocity, this.origVelocity );
            this.collidable = true; } );

        this.vel.x += this.toPlayer().x * knockback * -0.5;
        this.vel.y += this.toPlayer().y * knockback * -0.5;
    }
});

var Hugger = Enemy.extend({
    init: function( x, y, settings )
    {
        this.range = settings.range || 200;
        this.speed = settings.speed || .6;
        settings.image = "hugger";
        this.parent( x, y, settings );

        this.setFriction( 0.35, 0.35 );

        this.isAttached = false;

        this.posDiffX = 0;
        this.posDiffY = 0;

        var directions = [ "down", "left", "up", "right" ];
        for ( var i = 0; i < directions.length; i++ )
        {
            var index = i * 4;
            this.addAnimation( directions[ i ] + "run",
                [ index, index + 1, index, index + 2 ] );
            this.addAnimation( directions[ i ] + "grab", [ index + 3 ] );
        }
    },

    onCollision: function( res, obj )
    {
        this.parent( res, obj );

        // attach if player collision
        if ( obj == me.game.player && !me.game.player.isDashing() )
        {
            console.log( "attachment" );
            this.isAttached = true;
            this.posDiffX = me.game.player.pos.x - this.pos.x;
            this.posDiffY = me.game.player.pos.y - this.pos.y;
            this.collidable = false;
            obj.addAttached( this );
        }
    },

    shakeOff: function()
    {
        this.isAttached = false;
        this.flicker( 60, function() { this.collidable = true } );
    },

    /** Run towards the player when it's in range. */
    update: function()
    {
        //this.parent( this );
        this.updateDirectionString();

        if ( this.isAttached )
        {
            this.setCurrentAnimation( this.directionString + "grab" );
            this.pos.x = me.game.player.pos.x - this.posDiffX;
            this.pos.y = me.game.player.pos.y - this.posDiffY;
            this.vel.x = 0;
            this.vel.y = 0;
        }
        else if ( this.collidable )
        {
            var direction = this.toPlayer();
            var move = false;
            if( direction ) {
                var dist = direction.length();
                if( dist < this.range && dist > 0) {
                    this.setCurrentAnimation( this.directionString + "run" );
                    direction.normalize();
                    this.vel.x += direction.x * this.speed;
                    this.vel.y += direction.y * this.speed;
                    this.direction = direction;
                    move = true;
                }
            }

            // disabling this for now
            if( ! move ) {
                //this.vel.x = 0;
                //this.vel.y = 0;
            }
        }

        this.updateMovement();

        // need to check collidable to finish flicker
        if ( move || !this.collidable )
            this.parent( this );
        return move;
    }
});

var Pusher = Enemy.extend({
    init: function( x, y, settings ) {
        this.range = settings.range || 200;
        this.speed = settings.speed || .6;
        if( settings.direction == 'left' ) {
            this.direction = new me.Vector2d( -1, 0 );
        }
        else if( settings.direction == 'right' ) {
            this.direction = new me.Vector2d( 1, 0 );
        }
        else if( settings.direction == 'up' ) {
            this.direction = new me.Vector2d( 0, -1 );
        }
        else if( settings.direction == 'down' ) {
            this.direction = new me.Vector2d( 0, 1 );
        }
        else {
            throw "Pusher needs a direction.";
        }
        this.parent( x, y, settings );
    },

    /* When the player gets close, move in a straight line */
    update: function() {
        this.parent( this );

        var direction = this.toPlayer();
        var move = false;
        if( direction ) {
            var dist = direction.length();
            if( dist < this.range && dist > 0) {
                this.vel.x += this.speed * this.direction.x;
                this.vel.y += this.speed * this.direction.y;
            }
        }

        this.updateMovement();
        return ( this.vel.x || this.vel.y );
    }
});

var Shooter = Enemy.extend(
{

});

var Doctor = Enemy.extend(
{

});

var Boss = Enemy.extend(
{

});
