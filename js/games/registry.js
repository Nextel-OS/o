/**
 * Игры — реестр
 */
(function () {
  'use strict';
  NX.gameIds = ['snake', 'g2048', 'mines', 'ttt', 'tetris', 'memory', 'pong', 'reaction', 'breakout', 'guess'];
  NX.isGame = id => NX.gameIds.includes(id);
})();
