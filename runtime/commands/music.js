'use strict'
var v = require('../internal/voice.js')
var Commands = []

Commands.pause = {
  name: 'pause',
  help: "Laitan musiikin paussille ja pois! Toisaalta, kuka edes haluaisi pausata musiikin?",
  aliases: ['playpause'],
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.pausePlay(msg, suffix, bot)
  }
}

Commands.volume = {
  name: 'volume',
  help: "Säädän äänenvoimakkuuttani ylös ja alas. Hyödyllistä jos ääneni katoaa kuin pieru Saharaan tai jos korvaraiskaan täyttä päätä.",
  aliases: ['vol'],
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.volume(msg, suffix, bot)
  }
}

Commands['leave-voice'] = {
  name: 'leave-voice',
  help: "Poistun tämänhetkisestä äänikanavasta. En kyllä ymmärrä, miksi haluaisit, että poistuisin...",
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.leave(msg, suffix, bot)
  }
}

Commands.skip = {
  name: 'skip',
  help: "Skippaan tämän biisin, jos et pidä siitä. Se on kyllä aika surullista jos oikeasti skippaat tämän :C",
  noDM: true,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.skip(msg, suffix, bot)
  }
}

Commands.playlist = {
  name: 'playlist',
  help: "Noudan sinulle soittolistan jota soitan tällä hetkellä. Kipaisen hakemassa sen kioskilta :D",
  aliases: ['list'],
  noDM: true,
  timeout: 10,
  level: 0,
  fn: function (msg) {
    v.fetchList(msg).then((r) => {
      var arr = []
      arr.push('Tällä hetkellä soitan **' + r.info[0] + '** \n')
      for (var i = 1; i < r.info.length; i++) {
        arr.push((i + 1) + '. **' + r.info[i] + '** Kappaletta pyysi ' + r.requester[i])
        if (i === 9) {
          arr.push('Ja suurin piirtein ' + (r.info.length - 10) + ' biisiä lisää.')
          break
        }
      }
      msg.channel.sendMessage(arr.join('\n'))
    }).catch(() => {
      msg.channel.sendMessage("Tällä serverillä ei näy olevan soittolistaa.")
    })
  }
}

Commands.voice = {
  name: 'voice',
  help: "Liityn äänikanavaan, olen hyvä laulamaan. Trust me bro.",
  aliases: ['join-voice'],
  noDM: true,
  timeout: 10,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.join(msg, suffix, bot)
  }
}

Commands.request = {
  name: 'request',
  help: 'Käytä tätä pyytääksesi musiikkia! Khyl toimii.',
  aliases: ['queue'],
  noDM: true,
  usage: 'link',
  timeout: 10,
  level: 0,
  fn: function (msg, suffix, bot) {
    v.request(msg, suffix, bot)
  }
}

exports.Commands = Commands
