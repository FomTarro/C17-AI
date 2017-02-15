var EventEmitter2, MESSAGE_TYPES, PokeClient, Promise, WebSocket, ref, request, sanitize, toMessageType,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

EventEmitter2 = require('eventemitter2').EventEmitter2;

Promise = require('bluebird');

WebSocket = require('ws');

request = Promise.promisify(require('request'));

sanitize = require('sanitize-html');

ref = require('./symbols'), toMessageType = ref.toMessageType, MESSAGE_TYPES = ref.MESSAGE_TYPES;

PokeClient = (function(superClass) {
  extend(PokeClient, superClass);

  function PokeClient(_server, _loginServer) {
    this._server = _server != null ? _server : 'ws://sim.smogon.com:8000/showdown/websocket';
    this._loginServer = _loginServer != null ? _loginServer : 'http://play.pokemonshowdown.com/action.php';
    this.socket = null;
    this.user = null;
    this._challstr = '';
    this._loginRequest = request.defaults({
      url: this._loginServer,
      method: 'POST'
    });
    this._login = function(options) {
      return this._loginRequest({
        form: options
      });
    };
    PokeClient.__super__.constructor.call(this, {
      wildcard: true,
      delimiter: ':'
    });
  }

  PokeClient.prototype.connect = function() {
    this.socket = new WebSocket(this._server);
    this.socket.on('message', (function(_this) {
      return function(data, flags) {
        return _this._handle(data);
      };
    })(this));
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return _this.socket.on('open', function() {
          _this.emit('connect');
          return resolve();
        });
      };
    })(this));
  };

  PokeClient.prototype.disconnect = function() {
    var done;
    done = new Promise((function(_this) {
      return function(resolve, reject) {
        return _this.socket.on('close', function(code, message) {
          _this.emit('disconnect', code, message);
          return resolve(code, message);
        });
      };
    })(this));
    this.socket.close();
    return done;
  };

  PokeClient.prototype.login = function(name, password) {
    var assertion;
    if (name && password && password.length > 0) {
      assertion = this._login({
        act: 'login',
        name: name,
        pass: password,
        challstr: this._challstr
      }).then(function(arg) {
        var body, user;
        body = arg.body;
        user = JSON.parse(body.substr(1));
        return user.assertion;
      });
    } else if (name) {
      assertion = this._login({
        act: 'getassertion',
        userid: name,
        challstr: this._challstr
      }).then(function(arg) {
        var body;
        body = arg.body;
        return body;
      });
    } else {
      return;
    }
    return assertion.then((function(_this) {
      return function(assertion) {
        _this.send("/trn " + name + ",0," + assertion);
        return new Promise(function(resolve, reject) {
          return _this.once('self:changed', function(data) {
            _this.emit('login', data);
            return resolve();
          });
        });
      };
    })(this));
  };

  PokeClient.prototype.send = function(message, room) {
    var payload;
    if (room == null) {
      room = '';
    }
    payload = room + "|" + message;
    //console.log(payload)
    this.socket.send(payload);
    return this.emit('internal:send', payload);
  };

  PokeClient.prototype._handle = function(data) {
    console.log(data);
    var i, len, message, messages, results;
    this.emit('internal:raw', data);
    messages = this._lex(data);
    results = [];
    for (i = 0, len = messages.length; i < len; i++) {
      message = messages[i];
      switch (message.type) {
        case MESSAGE_TYPES.GLOBAL.POPUP:
          this.emit('info:popup', message);
          break;
        case MESSAGE_TYPES.GLOBAL.PM:
          this.emit('chat:private', message);
          break;
        case MESSAGE_TYPES.GLOBAL.USERCOUNT:
          this.emit('info:usercount', message);
          break;
        case MESSAGE_TYPES.GLOBAL.NAMETAKEN:
          this.emit('error:login', message);
          break;
        case MESSAGE_TYPES.GLOBAL.CHALLSTR:
          this._challstr = message.data;
          this.emit('ready');
          break;
        case MESSAGE_TYPES.GLOBAL.UPDATEUSER:
          this.user = message.data;
          this.emit('self:changed', message);
          break;
        case MESSAGE_TYPES.GLOBAL.FORMATS:
          this.emit('info:formats', message);
          break;
        case MESSAGE_TYPES.GLOBAL.UPDATESEARCH:
          this.emit('info:search', message);
          break;
        case MESSAGE_TYPES.GLOBAL.UPDATECHALLENGES:
          this.emit('self:challenges', message);
          break;
        case MESSAGE_TYPES.GLOBAL.QUERYRESPONSE:
          this.emit('info:query', message);
          break;
        case MESSAGE_TYPES.ROOM_INIT.INIT:
          this.emit('room:joined', message);
          break;
        case MESSAGE_TYPES.ROOM_INIT.DEINIT:
          this.emit('room:left', message);
          break;
        case MESSAGE_TYPES.ROOM_INIT.TITLE:
          this.emit('room:title', message);
          break;
        case MESSAGE_TYPES.ROOM_INIT.USERS:
          this.emit('room:users', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.MESSAGE:
          this.emit('chat:message', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.HTML:
          this.emit('chat:html', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.UHTML:
          this.emit('chat:uhtml', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.UHTMLCHANGE:
          this.emit('chat:uhtmlchange', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.JOIN:
          this.emit('user:joined', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.LEAVE:
          this.emit('user:left', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.NAME:
          this.emit('user:changed', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.CHAT:
          message.data.timestamp = Date.now();
          this.emit('chat:public', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.CHAT_TIMESTAMP:
          this.emit('chat:public', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.TIMESTAMP:
          this.emit('chat:timestamp', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.BATTLE:
          this.emit('battle:start', message);
          break;
        case MESSAGE_TYPES.ROOM_MESSAGES.RAW:
          this.emit('chat:raw', message);
          break;
        case MESSAGE_TYPES.OTHER.UNKNOWN:
          this.emit('internal:unknown', message);
      }
      results.push(this.emit('message', message));
    }
    return results;
  };

  PokeClient.prototype._lex = function(data) {
    var i, len, line, lines, message, messages, room;
    lines = data.split('\n');
    room = null;
    if (lines[0].startsWith('>')) {
      room = lines[0].substr(1);
      lines = lines.slice(1);
    } else {
      room = 'lobby';
    }
    messages = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        results.push(this._lexLine(line));
      }
      return results;
    }).call(this);
    for (i = 0, len = messages.length; i < len; i++) {
      message = messages[i];
      if (!message.room) {
        message.room = room;
      }
    }
    return messages;
  };

  PokeClient.prototype._lexLine = function(line) {
    var abbreviations, ability, action, amount, avatar, condition, data, description, details, formats, hp, hpStatus, html, item, json, megastone, message, move, name, named, oldid, player, pokemon, position, querytype, reason, receiver, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref4, ref5, ref6, ref7, ref8, ref9, roomid, sender, side, specialCases, species, status, target, timestamp, type, update, updateType, user, user1, user2, username;
    if ((line.startsWith('||')) || !line.startsWith('|')) {
      return {
        type: MESSAGE_TYPES.ROOM_MESSAGES.MESSAGE,
        data: line
      };
    }
    line = line.substr(1);
    ref1 = line.split(/\|(.+)/), type = ref1[0], data = ref1[1];
    abbreviations = {
      c: 'chat',
      j: 'join',
      J: 'join',
      l: 'leave',
      L: 'leave',
      n: 'name',
      N: 'name',
      b: 'battle',
      B: 'battle'
    };
    specialCases = {
      'c:': 'chat+timestamp',
      ':': 'timestamp'
    };
    if (type in abbreviations) {
      type = abbreviations[type];
    }
    if (type in specialCases) {
      type = specialCases[type];
    }
    type = toMessageType(type);
    switch (type) {
      case MESSAGE_TYPES.GLOBAL.POPUP:
        return {
          type: type,
          data: data.replace(/\|\|/g, '\n', {
            room: 'global'
          })
        };
      case MESSAGE_TYPES.GLOBAL.PM:
        ref2 = data.split('|'), sender = ref2[0], receiver = ref2[1], message = ref2[2];
        return {
          type: type,
          data: {
            sender: sender,
            receiver: receiver,
            message: message
          },
          room: 'global'
        };
      case MESSAGE_TYPES.GLOBAL.USERCOUNT:
        return {
          type: type,
          data: parseInt(data, {
            room: 'global'
          })
        };
      case MESSAGE_TYPES.GLOBAL.NAMETAKEN:
        ref3 = data.split('|'), username = ref3[0], message = ref3[1];
        return {
          type: type,
          data: {
            username: username,
            message: message
          },
          room: 'global'
        };
      case MESSAGE_TYPES.GLOBAL.CHALLSTR:
        return {
          type: type,
          data: data,
          room: 'global'
        };
      case MESSAGE_TYPES.GLOBAL.UPDATEUSER:
        ref4 = data.split('|'), username = ref4[0], named = ref4[1], avatar = ref4[2];
        named = named === '1';
        return {
          type: type,
          data: {
            username: username,
            named: named,
            avatar: avatar
          },
          room: 'global'
        };
      case MESSAGE_TYPES.GLOBAL.FORMATS:
        formats = data.split('|');
        return {
          type: type,
          data: formats,
          room: 'global'
        };
      case MESSAGE_TYPES.GLOBAL.UPDATESEARCH:
        return {
          type: type,
          data: JSON.parse(data, {
            room: 'global'
          })
        };
      case MESSAGE_TYPES.GLOBAL.UPDATECHALLENGES:
        return {
          type: type,
          data: JSON.parse(data, {
            room: 'global'
          })
        };
      case MESSAGE_TYPES.GLOBAL.QUERYRESPONSE:
        ref5 = data.split('|'), querytype = ref5[0], json = ref5[1];
        return {
          type: type,
          data: {
            querytype: querytype,
            json: JSON.parse(json)
          },
          room: 'global'
        };
      case MESSAGE_TYPES.ROOM_INIT.INIT:
        return {
          type: type,
          data: data
        };
      case MESSAGE_TYPES.ROOM_INIT.DEINIT:
        return {
          type: type,
          data: data
        };
      case MESSAGE_TYPES.ROOM_INIT.TITLE:
        return {
          type: type,
          data: data
        };
      case MESSAGE_TYPES.ROOM_INIT.USERS:
        return {
          type: type,
          data: data.split(', ')
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.HTML:
        return {
          type: type,
          data: sanitize(data)
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.UHTML:
        ref6 = data.split('|'), name = ref6[0], html = ref6[1];
        return {
          type: type,
          data: {
            name: name,
            html: sanitize(html)
          }
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.UHTMLCHANGE:
        ref7 = data.split('|'), name = ref7[0], html = ref7[1];
        return {
          type: type,
          data: {
            name: name,
            html: sanitize(html)
          }
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.RAW:
        return {
          type: type,
          data: sanitize(data)
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.JOIN:
        return {
          type: type,
          data: data.trim()
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.LEAVE:
        return {
          type: type,
          data: data.trim()
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.NAME:
        ref8 = data.split('|'), user = ref8[0], oldid = ref8[1];
        return {
          type: type,
          data: {
            user: user,
            oldid: oldid
          }
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.CHAT:
        ref9 = data.split('|'), user = ref9[0], message = ref9[1];
        return {
          type: type,
          data: {
            user: user,
            message: message
          }
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.CHAT_TIMESTAMP:
        ref10 = data.split('|'), timestamp = ref10[0], user = ref10[1], message = ref10[2];
        timestamp = new Date(1000 * parseInt(timestamp));
        return {
          type: type,
          data: {
            timestamp: timestamp,
            user: user,
            message: message
          }
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.TIMESTAMP:
        return {
          type: type,
          data: new Date(1000 * parseInt(data))
        };
      case MESSAGE_TYPES.ROOM_MESSAGES.BATTLE:
        ref11 = data.split('|'), roomid = ref11[0], user1 = ref11[1], user2 = ref11[2];
        return {
          type: type,
          data: {
            roomid: roomid,
            user1: user1,
            user2: user2
          }
        };
      case MESSAGE_TYPES.BATTLE.PLAYER:
        ref12 = data.split('|'), player = ref12[0], username = ref12[1], avatar = ref12[2];
        return {
          type: type,
          data: {
            player: player,
            username: username,
            avatar: avatar
          }
        };
      case MESSAGE_TYPES.BATTLE.GAMETYPE:
        return {
          type: type,
          data: data
        };
      case MESSAGE_TYPES.BATTLE.GEN:
        return {
          type: type,
          data: parseInt(data)
        };
      case MESSAGE_TYPES.BATTLE.TIER:
        return {
          type: type,
          data: data
        };
      case MESSAGE_TYPES.BATTLE.RATED:
        return {
          type: type
        };
      case MESSAGE_TYPES.BATTLE.RULE:
        ref13 = data.split(': '), name = ref13[0], description = ref13[1];
        return {
          type: type,
          data: {
            name: name,
            description: description
          }
        };
      case MESSAGE_TYPES.BATTLE.CLEARPOKE:
        null;
        break;
      case MESSAGE_TYPES.BATTLE.POKE:
        null;
        break;
      case MESSAGE_TYPES.BATTLE.TEAMPREVIEW:
        null;
        break;
      case MESSAGE_TYPES.BATTLE.REQUEST:
        return {
          type: type,
          data: JSON.parse(data)
        };
      case MESSAGE_TYPES.BATTLE.INACTIVE:
        return {
          type: type,
          data: data
        };
      case MESSAGE_TYPES.BATTLE.INACTIVEOFF:
        return {
          type: type,
          data: data
        };
      case MESSAGE_TYPES.BATTLE.START:
        return {
          type: type
        };
      case MESSAGE_TYPES.BATTLE.WIN:
        return {
          type: type,
          data: data
        };
      case MESSAGE_TYPES.BATTLE.TIE:
        return {
          type: type
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MAJOR.MOVE:
        ref14 = data.split('|'), pokemon = ref14[0], move = ref14[1], target = ref14[2];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            move: move,
            target: target
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MAJOR.SWITCH:
        ref15 = data.split('|'), pokemon = ref15[0], details = ref15[1], hpStatus = ref15[2];
        ref16 = hpStatus.split(' '), hp = ref16[0], status = ref16[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            details: details,
            hp: hp,
            status: status
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MAJOR.DRAG:
        ref17 = data.split('|'), pokemon = ref17[0], details = ref17[1], hpStatus = ref17[2];
        ref18 = hpStatus.split(' '), hp = ref18[0], status = ref18[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            details: details,
            hp: hp,
            status: status
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MAJOR.SWAP:
        ref19 = data.split('|'), pokemon = ref19[0], position = ref19[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            position: position
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MAJOR.DETAILSCHANGE:
        null;
        break;
      case MESSAGE_TYPES.BATTLE.ACTIONS.MAJOR.CANT:
        ref20 = data.split('|'), pokemon = ref20[0], reason = ref20[1], move = ref20[2];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            reason: reason,
            move: move
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MAJOR.FAINT:
        return {
          type: type,
          data: {
            pokemon: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.FAIL:
        ref21 = data.split('|'), pokemon = ref21[0], action = ref21[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            action: action
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.DAMAGE:
        ref22 = data.split('|'), pokemon = ref22[0], hpStatus = ref22[1];
        ref23 = hpStatus.split(' '), hp = ref23[0], status = ref23[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            hp: hp,
            status: status
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.HEAL:
        ref24 = data.split('|'), pokemon = ref24[0], hpStatus = ref24[1];
        ref25 = hpStatus.split(' '), hp = ref25[0], status = ref25[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            hp: hp,
            status: status
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.STATUS:
        ref26 = data.split('|'), pokemon = ref26[0], status = ref26[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            status: status
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.CURESTATUS:
        ref27 = data.split('|'), pokemon = ref27[0], status = ref27[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            status: status
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.CURETEAM:
        return {
          type: type,
          data: {
            pokemon: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.BOOST:
        ref28 = data.split('|'), pokemon = ref28[0], status = ref28[1], amount = ref28[2];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            status: status,
            amount: amount
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.UNBOOST:
        ref29 = data.split('|'), pokemon = ref29[0], status = ref29[1], amount = ref29[2];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            status: status,
            amount: amount
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.WEATHER:
        return {
          type: type,
          data: {
            weather: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.FIELDSTART:
        return {
          type: type,
          data: {
            condition: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.FIELDEND:
        return {
          type: type,
          data: {
            condition: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.SIDESTART:
        ref30 = data.split('|'), side = ref30[0], condition = ref30[1];
        return {
          type: type,
          data: {
            side: side,
            condition: condition
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.SIDEEND:
        ref31 = data.split('|'), side = ref31[0], condition = ref31[1];
        return {
          type: type,
          data: {
            side: side,
            condition: condition
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.CRIT:
        return {
          type: type,
          data: {
            pokemon: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.SUPEREFFECTIVE:
        return {
          type: type,
          data: {
            pokemon: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.RESISTED:
        return {
          type: type,
          data: {
            pokemon: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.IMMUNE:
        return {
          type: type,
          data: {
            pokemon: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.ITEM:
        ref32 = data.split('|'), pokemon = ref32[0], item = ref32[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            item: item
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.ENDITEM:
        ref33 = data.split('|'), pokemon = ref33[0], item = ref33[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            item: item
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.ABILITY:
        ref34 = data.split('|'), pokemon = ref34[0], ability = ref34[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            ability: ability
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.ENDABILITY:
        return {
          type: type,
          data: {
            pokemon: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.TRANSFORM:
        ref35 = data.split('|'), pokemon = ref35[0], species = ref35[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            species: species
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.MEGA:
        ref36 = data.split('|'), pokemon = ref36[0], megastone = ref36[1];
        return {
          type: type,
          data: {
            pokemon: pokemon,
            megastone: megastone
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.ACTIVATE:
        return {
          type: type,
          data: {
            effect: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.HINT:
        return {
          type: type,
          data: {
            message: data
          }
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.CENTER:
        return {
          type: type
        };
      case MESSAGE_TYPES.BATTLE.ACTIONS.MINOR.MESSAGE:
        return {
          type: type,
          data: {
            message: data
          }
        };
      case MESSAGE_TYPES.OTHER.TOURNAMENT:
        ref37 = data.split('|'), updateType = ref37[0], update = ref37[1];
        if (updateType === 'update') {
          update = JSON.parse(update);
        }
        return {
          type: type,
          data: {
            updateType: updateType,
            update: update
          }
        };
    }
    return {
      type: MESSAGE_TYPES.OTHER.UNKNOWN,
      data: data
    };
  };

  PokeClient.MESSAGE_TYPES = MESSAGE_TYPES;

  return PokeClient;

})(EventEmitter2);

module.exports = PokeClient;

// ---
// generated by coffee-script 1.9.2