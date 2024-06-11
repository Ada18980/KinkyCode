import { Engine, HEIGHT, WIDTH } from './core/engine'
import { LoadingState } from './states/load/load'
import { GameState } from './states/game/game'
import { MenuState } from './states/menu/menu'
import { loadFont } from './core/font'
import { RandomizeSeed } from './core/random'

loadFont("3270condensed Regular", 'font/3270Condensed-Regular.ttf');

RandomizeSeed(false);

Engine.registerState(LoadingState, "Loading");
Engine.registerState(GameState, "Game");
Engine.registerState(MenuState, "Menu");
Engine.init(WIDTH, HEIGHT, "Loading");
