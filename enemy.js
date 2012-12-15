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
        this.parent( x, y, settings );
        this.gravity = 0;
        this.type = me.game.ENEMY_TYPE;
        this.collidable = true;
        this.playerCollidable = true;
    },
});

var Hugger = Enemy.extend({
    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        this.setMaxVelocity(10, 10);
        this.setFriction( 0.35, 0.35 );
    },

    /** Run towards the player when it's in range. */
    update: function() {
        if( ! me.game.player ) {
            return;
        }

        var direction = new me.Vector2d(
            me.game.player.pos.x - this.pos.x,
            me.game.player.pos.y - this.pos.y
        );
        var dist = direction.length();
        if( dist < 200 && dist > 0) {
            direction.normalize();
            this.vel.x = direction.x * 5;
            this.vel.y = direction.y * 5;
            this.direction = direction;
        }
        else {
            this.vel.x = 0;
            this.vel.y = 0;
        }

        this.updateMovement();
        this.parent( this );
        return ( this.vel.x || this.vel.y );
    }
});

