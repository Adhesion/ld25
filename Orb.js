/** Why waste time with multidimentionality? */
CorruptionMatrixStride = 5,

/** The distance to offset the matrix. This centers the matrix. */
CorruptionRowOffset = 2,

/** The distance to offset the matrix. This centers the matrix. */
CorruptionColOffset = 2,

/** Layer that you expose when your corrupt shit. */
CorruptionLayer = "col";

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


var Orb = me.SpriteObject.extend({
	init: function( x, y, settings )
	{
		if( ! settings ) { settings = {} }
		this.parent(
			x,
			y,
			settings.orb || me.loader.getImage( "maptile" ),
			settings.width || 48,
			settings.height || 48
		);

		this.layer = me.game.currentLevel.getLayerByName( CorruptionLayer );
	},

	corrupt: function() {
		// Round the tile position.
		var tilex = Math.floor(this.pos.x / me.game.currentLevel.tilewidth + .5);
		var tiley = Math.floor(this.pos.y / me.game.currentLevel.tileheight + .5);
		console.log( tilex, tiley);
		for( var y = 0; y < CorruptionMatrixStride; y++ ) {
			for( var x = 0; x < CorruptionMatrixStride; x++ ) {
				if( CorruptionMatrix[ y * CorruptionMatrixStride + x ] ) {
					this.layer.setTile(
						tilex - CorruptionColOffset + x,
						tiley - CorruptionRowOffset + y,
						CorruptionTileId
					);
					me.game.repaint();
				}
			}
		}
	},

	update: function()
	{
		if( me.input.isKeyPressed( "enter" ) ) {
			this.corrupt();
		}
	}
});


