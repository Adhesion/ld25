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
    }
});

var Hugger = Enemy.extend({
    init: function( x, y, settings )
    {
        this.range = settings.range || 200;
        this.speed = settings.speed || 6;
        this.parent( x, y, settings );

        this.setMaxVelocity(10, 10);
        this.setFriction( 0.35, 0.35 );
    },

    /** Run towards the player when it's in range. */
    update: function()
    {
        this.parent( this );

        var direction = this.toPlayer();
        var move = false;
        if( direction ) {
            var dist = direction.length();
            if( dist < this.range && dist > 0) {
                direction.normalize();
                this.vel.x = direction.x * this.speed;
                this.vel.y = direction.y * this.speed;
                this.direction = direction;
                move = true;
            }
        }

        if( ! move ) {
            this.vel.x = 0;
            this.vel.y = 0;
        }

        this.updateMovement();

        return move;
    }
});

var Pusher = Enemy.extend({
    init: function( x, y, settings ) {
        this.range = settings.range || 200;
        this.speed = settings.speed || 6;
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
                this.vel.x = this.speed * this.direction.x;
                this.vel.y = this.speed * this.direction.y;
            }
        }

        this.updateMovement();
        return ( this.vel.x || this.vel.y );
    }
});

