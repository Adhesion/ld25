/*
 * gameResources.js
 *
 * Defines game resources (maps, images, sounds) for the game.
 *
 * @author Adhesion
 */

var gameResources = [
    { name: "player", type: "image", src: "data/avatar.png" },
    { name: "enemy", type: "image", src: "data/tempenemy.png" },
    { name: "weakattack", type: "image", src: "data/tempattack.png" },
    { name: "strongattack", type: "image", src: "data/tempattack.png" },

	{ name: "collision_tiles", type: "image", src: "data/collision_tiles.png" },
	{ name: "maptile", type: "image", src: "data/maptile.png" },

    { name: "testlevel", type: "tmx", src: "data/testlevel.tmx" },
	{ name: "fudge", type: "tmx", src: "data/fudge.tmx" },
	{ name: "16x16_font", type: "image", src: "data/16x16_font.png" },
	{ name: "32x32_font", type: "image", src: "data/32x32_font.png" },
	{ name: "64x64_font", type: "image", src: "data/64x64_font.png" }
];
