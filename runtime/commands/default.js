var Commands = []
var request = require('request')
var config = require('../../config.json')
var Logger = require('../internal/logger.js').Logger

Commands.pingbot = {
  name: 'pingbot',
  help: "Tällä komennolla voit tarkistaa jos toimin oikein.",
  module: 'default',
  timeout: 10,
  level: 0,
  fn: function (msg) {
    msg.reply('Mmhäh? Juu, pystyssä ollaan. Ennenkuin leivon pullat.')
  }
}

Commands.sano = {
  name: 'sano',
  help: 'Toista jälkeeni.',
  aliases: ['echo', 'repeat', 'say'],
  module: 'default',
  timeout: 10,
  level: 0,
  fn: function (msg, suffix) {
    var re = /(discord(\.gg|app\.com\/invite)\/([\w]{16}|([\w]+-?){3}))/
    if (msg.mentions.length >= 5) {
      msg.reply('Vain viisi mainintaa kerrallaan, okei?')
    } else if (re.test(msg.content)) {
      msg.reply('En lähetä tuota ihan heti.')
    } else {
      msg.channel.sendMessage('\u200B' + suffix)
    }
  }
}

Commands.poista = {
  name: 'poista',
  help: 'Käytä tätä massapoistaaksesi viestejä, enintään 100.',
  usage: '<määrä>',
  aliases: ['prune', 'purge'],
  noDM: true,
  timeout: 30,
  level: 0,
  fn: function (msg, suffix, bot) {
    var guild = msg.guild
    var user = msg.author
    var userPerms = user.permissionsFor(guild)
    var botPerms = bot.User.permissionsFor(guild)
    if (!userPerms.Text.MANAGE_MESSAGES) {
      msg.reply('Sinulla ei ole oikeuksia hallinnoida viestejä!')
    } else if (!botPerms.Text.MANAGE_MESSAGES) {
      msg.reply('Minulla ei ole oikeuksia hallinnoida viestejä!')
    } else {
      if (!suffix || isNaN(suffix) || suffix > 100 || suffix < 0) {
        msg.reply('Kokeile uudestaan luvuilla **nollasta sataan**.')
      } else {
        msg.channel.fetchMessages(suffix).then((result) => {
          bot.Messages.deleteMessages(result.messages)
        }).catch((error) => {
          msg.channel.sendMessage('En voinut noutaa viestejä poistettavaksi, koeta myöhemmin uudestaan.') //Siis noutaa viestejä niinkuin koira luita?
          Logger.error(error)
        })
      }
    }
  }
}

Commands.eval = {
  name: 'eval',
  help: 'Ajaa JavaScript-koodia. Älä koske tähän ellet tiedä mitä teet.',
  level: 'master',
  fn: function (msg, suffix, bot) {
    if (msg.author.id === bot.User.id) return
    var util = require('util')
    try {
      var returned = eval(suffix)
      var str = util.inspect(returned, {
        depth: 1
      })
      if (str.length > 1900) {
        str = str.substr(0, 1897)
        str = str + '...'
      }
      str = str.replace(new RegExp(bot.token, 'gi'), '¯\\\_(ツ)_/¯')
      msg.channel.sendMessage('```xl\n' + str + '\n```').then((ms) => {
        if (returned !== undefined && returned !== null && typeof returned.then === 'function') {
          returned.then(() => {
            var str = util.inspect(returned, {
              depth: 1
            })
            if (str.length > 1900) {
              str = str.substr(0, 1897)
              str = str + '...'
            }
            ms.edit('```xl\n' + str + '\n```')
          }, (e) => {
            var str = util.inspect(e, {
              depth: 1
            })
            if (str.length > 1900) {
              str = str.substr(0, 1897)
              str = str + '...'
            }
            ms.edit('```xl\n' + str + '\n```')
          })
        }
      })
    } catch (e) {
      msg.channel.sendMessage('```xl\n' + e + '\n```')
    }
  }
}

Commands.plaineval = {
  name: 'plaineval',
  help: 'Ajaa JavaScript-koodia. Älä koske tähän ellet tiedä mitä teet.',
  level: 'master',
  fn: function (msg, suffix, bot) {
    if (msg.author.id === bot.User.id) return
    var evalfin = []
    try {
      evalfin.push('```xl')
      evalfin.push(eval(suffix))
      evalfin.push('```')
    } catch (e) {
      evalfin = []
      evalfin.push('```xl')
      evalfin.push(e)
      evalfin.push('```')
    }
    msg.channel.sendMessage(evalfin.join('\n'))
  }
}

Commands.stream = {
  name: 'stream',
  help: 'Kertoo, onko joku streamaaja livenä Twitchissä.',
  aliases: ['twitch'],
  level: 0,
  fn: function (msg, suffix) {
    if (!suffix) {
      msg.channel.sendMessage('Kanavaa ei määritetty!')
      return
    }
    var url = 'https://api.twitch.tv/kraken/streams/' + suffix
    request({
      url: url,
      headers: {
        'Accept': 'application/vnd.twitchtv.v3+json'
      }
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var resp
        try {
          resp = JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
        }
        if (resp.stream !== null) {
          msg.channel.sendMessage(suffix + ' on tällä hetkellä livenä kanavalla https://www.twitch.tv/' + suffix)
          return
        } else if (resp.stream === null) {
          msg.channel.sendMessage(suffix + ' ei streamaa tällä hetkellä.')
          return
        }
      } else if (!error && response.statusCode === 404) {
        msg.channel.sendMessage('Kanavaa ei ole olemassa!') //Sääd stoori, bro
        return
      }
    })
  }
}

Commands.modify = {
  name: 'modify',
  help: 'Muokkaa toimintojani, joko hyvään tai huonoon suuntaan...',
  aliases: ['customize'],
  noDM: true,
  level: 3,
  fn: function (msg, suffix) {
    var c = require('../databases/controllers/customize.js')
    suffix = suffix.split(' ')
    var x = suffix.slice(1, suffix.length).join(' ')
    if (suffix[0] === 'help') {
      c.helpHandle(msg)
    } else {
      c.adjust(msg, suffix[0], x).then((r) => {
        msg.channel.sendMessage(':ok_hand: Muokattiin ' + suffix[0] + ' arvoon `' + r + '`')
      }).catch((e) => {
        msg.channel.sendMessage('Huppistakeikkaa, ' + e)
      })
    }
  }
}

Commands.info = {
  name: 'info',
  help: "Kipaisen Googlen puolella hakemassa vähän tietoja itsestäni.",
  timeout: 10,
  level: 0,
  fn: function (msg) {
    var msgArray = []
    msgArray.push(`**KarpaloX - Kehitetty KarpaloCraftin sisäiseen käyttöön.**`)
    msgArray.push('Pääasialliset kehittäjät LWTechGaming ja Evill. Dougleyn, Mirrowin ja Perpetucaken lähdekoodin pohjalta.')
    msgArray.push('Voit saada minusta lisätietoja myös GitHubissa: https://github.com/KarpaloCraft/KarpaloX')
    msgArray.push('**Kiitos avusta myös seuraaville henkilöille jotka auttoivat kehityksessä:**')
    msgArray.push('Evill - Käännökset suomeksi')
    msgArray.push('**Teknisiä tietoja niistä kiinnostuneille:**')
    msgArray.push('Kieli: JavaScript')
    msgArray.push('Library: Discordie 0.5.x')
    msgArray.push('Dependencyt: Node, FFMPEG')
    msg.channel.sendMessage(msgArray.join('\n'))
  }
}

Commands.poistu = {
  name: 'poistu',
  help: "Poistun täältä jos vihaatte minua oikeasti :c",
  noDM: true,
  level: 3,
  fn: function (msg) {
    if (msg.isPrivate) {
      msg.channel.sendMessage('Et voi tehdä minulle tätä yksityisviestillä!')
    } else {
      msg.channel.sendMessage('Haters gonna hate, minä lähden!') //Nyt kun miettii tarkemmin, tuo käännös oli aika syöpää.
      msg.guild.leave()
    }
  }
}

Commands.killswitch = {
  name: 'killswitch',
  help: 'Tämä lopettaa kaikki toimintoni kuin seinään. Käytä ainoastaan jos minulla lyö tyhjää.',
  level: 'master',
  fn: function (msg, suffix, bot) {
    bot.disconnect()
    Logger.warn('Killswitchi ainakin toimi.')
    process.exit(0)
  }
}

Commands.namechanges = {
  name: 'namechanges',
  help: 'Ilmoitan millä nimillä käyttäjä on esiintynyt.',
  noDM: true,
  level: 0,
  fn: function (msg) {
    const n = require('../databases/controllers/users.js')
    if (msg.mentions.length === 0) {
      msg.channel.sendMessage('Määritä käyttäjä, ole hyvä.') //Tämä kaksinaamaisuusjuttu ei ollut niin järkevä, rollbackattu.
      return
    }
    msg.mentions.map((u) => {
      n.names(u).then((n) => {
        msg.channel.sendMessage(n.join(', '))
      })
    })
  }
}

Commands.setperms = {
  name: 'setperms',
  help: 'Tämä vaihtaa käyttäjän oikeustasoa. (Tämä täytyy tehdä oikeustalossa)', //Oikeustalossa? Mitä minä oikein mietin näiden suomentamisessa?
  aliases: ['setlevel'],
  noDM: true,
  module: 'default',
  level: 3,
  fn: function (msg, suffix) {
    var Permissions = require('../databases/controllers/permissions.js')
    suffix = suffix.split(' ')
    if (isNaN(suffix[0])) {
      msg.reply('Ensimmäinen parametrisi ei ole numero, päärynä!')
    } else if (suffix[0] > 3) {
      msg.channel.sendMessage('Taso yli kolmen ei ole sallittua, tai sinut pidätetään.')
    } else if (msg.mentions.length === 0 && msg.mention_roles.length === 0) {
      msg.reply('Mainitse käyttäjä(t), joiden oikeudet haluat muuttaa.')
    } else {
      Permissions.checkLevel(msg.guild, msg.author.id, msg.member.roles).then(function (level) {
        if (suffix[0] > level) {
          msg.reply("Et voi laittaa oikeustasoa omaa tasoasi isommaksi. Sinut oikeasti pidätetään kohta, jos et lopeta. (LW ja Allu, hilatkaa perseenne tänne!)")
        }
      }).catch(function (error) {
        msg.channel.sendMessage('Helppiä! Jokin leipo kiinni!')
        Logger.error(error)
      })
      Permissions.adjustLevel(msg, msg.mentions, parseFloat(suffix[0]), msg.mention_roles).then(function () {
        msg.channel.sendMessage('Onnittelut! Oikeudet säädettiin kuntoon. Olet loppujen lopuksi kunnon kansalainen...')
      }).catch(function (err) {
        msg.channel.sendMessage('Helppiä! Jokin leipo kiinni!')
        Logger.error(err)
      })
    }
  }
}

Commands.setnsfw = {
  name: 'setnsfw',
  help: 'Tällä komennolla voi sallia pornokomennot Discordissa.', //Tällä ei KC:ssa ole väliä, meillä ei pornoa jaella t. Evill (LW kyllä sanoi tuon, mutta joo.)
  noDM: true,
  module: 'default',
  usage: '<on | off>',
  level: 3,
  fn: function (msg, suffix) {
    var Permissions = require('../databases/controllers/permissions.js')
    if (msg.guild) {
      if (suffix === 'on' || suffix === 'off') {
        Permissions.adjustNSFW(msg, suffix).then((allow) => {
          if (allow) {
            msg.channel.sendMessage('Pornokomennot ovat nyt päällä kanavalla ' + msg.channel.mention)
          } else if (!allow) {
            msg.channel.sendMessage('Pornokomennot ovat nyt pois päältä kanavalla ' + msg.channel.mention)
          }
        }).catch(() => {
          msg.reply("Ai peppu, homma meni päin ~~mäntyä~~ Koivua.")
        })
      } else {
        msg.channel.sendMessage('Suffiksin pitää olla joko `on` tai `off`, päärynä!')
      }
    } else {
      msg.channel.sendMessage("Pornokomennot eivät ole käytettävissä yksityisviestissä. Mene muualle tumputtamaan.")
    }
  }
}

Commands.terve = {
  name: 'terve',
  help: "Tervehdin sinua!",
  aliases: ['terse', 'tersehdys'],
  timeout: 20,
  level: 0,
  fn: function (msg, suffix, bot) {
    msg.channel.sendMessage('Hei ' + msg.author.username + ", olen " + bot.User.username + '!')
  }
}

Commands.status = {
  name: 'status',
  help: "Haen tietoa itsestäni, kuten uptimeni ja palvelinmääräni!",
  timeout: 20,
  level: 0,
  fn: function (msg, suffix, bot) {
    var msgArray = []
    msgArray.push('Hellou ' + msg.author.username + ' , olen ' + bot.User.username + ', mukava tavata!')
    msgArray.push("Minua on käytetty " + bot.Guilds.length + ' palvelimissa, ' + bot.Channels.length + ' kanavassa, ja ' + bot.Users.length + ' käyttäjän toimesta!')
    msg.channel.sendMessage(msgArray.join('\n'))
  }
}

Commands.setstatus = {
  name: 'setstatus',
  help: 'Tämä vaihtaa tilani. Tällä ei nyt sitten pelleillä, Allu.', //Ei Allu tuota kuuntele, usko vaan.
  module: 'default',
  usage: '<online / idle / twitch url> [playing status]',
  level: 'master',
  fn: function (msg, suffix, bot) {
    var first = suffix.split(' ')
    if (/^http/.test(first[0])) {
      bot.User.setStatus(null, {
        type: 1,
        name: suffix.substring(first[0].length + 1),
        url: first[0]
      })
      msg.channel.sendMessage(`Asetettiin status streamaamiseen viestillä ${suffix.substring(first[0].length + 1)}`)
    } else {
      if (['online', 'idle'].indexOf(first[0]) > -1) {
        bot.User.setStatus(first[0], {
          name: suffix.substring(first[0].length + 1)
        })
        msg.channel.sendMessage(`Asetettiin status arvoon ${first[0]} viestillä ${suffix.substring(first[0].length + 1)}`)
      } else {
        msg.reply('Voin vain olla `online` tai `idle`!')
      }
    }
  }
}

Commands['server-info'] = {
  name: 'server-info',
  help: "Kerron sinulle tietoa palvelimesta, jossa olet nyt.", //Eli KCsta
  aliases: ['serverinfo'],
  noDM: true,
  module: 'default',
  timeout: 20,
  level: 0,
  fn: function (msg) {
    //Jos ei PM, tietoa servusta
    if (msg.guild) {
      var roles = msg.guild.roles.map((r) => r.name)
      roles = roles.splice(0, roles.length).join(', ').toString()
      roles = roles.replace('@everyone', '@every' + '\u200b' + 'one')
      var msgArray = []
      msgArray.push('Tietoa pyysi ' + msg.author.mention)
      msgArray.push('Palvelimen nimi: **' + msg.guild.name + '** (id: `' + msg.guild.id + '`)')
      msgArray.push('Omistaja: **' + msg.guild.owner.username + '** (id: `' + msg.guild.owner_id + '`)')
      msgArray.push('Nykyinen alue: **' + msg.guild.region + '**.')
      msgArray.push('Tällä palvelimella on **' + msg.guild.members.length + '** jäsentä')
      msgArray.push('Tällä palvelimella on **' + msg.guild.textChannels.length + '** tekstikanavaa.')
      msgArray.push('Tällä palvelimella on **' + msg.guild.voiceChannels.length + '** äänikanavaa.')
      msgArray.push('Tällä palvelimella **' + msg.guild.roles.length + '** roolia rekisteröitynä.')
      msgArray.push("Tämän palvelimen roolit ovat **" + roles + '**')
      if (msg.guild.afk_channel === null) {
        msgArray.push('AFK-kanavaa ei ole olemassa.')
      } else {
        msgArray.push('AFK-kanava: **' + msg.guild.afk_channel.name + '** (id: `' + msg.guild.afk_channel.id + '`)')
      }
      if (msg.guild.icon === null) {
        msgArray.push('Palvelimella ei ole kuvaa, miksei?')
      } else {
        msgArray.push('Palvelimen kuva: ' + msg.guild.iconURL)
      }
      msg.channel.sendMessage(msgArray.join('\n'))
    } else {
      msg.channel.sendMessage("Et voi tehdä tuota yksityisviestissä, typerys!")
    }
  }
}

Commands.userinfo = {
  name: 'userinfo',
  help: "Googlaan mainitun käyttäjän.",
  noDM: true,
  module: 'default',
  level: 0,
  fn: function (msg) {
    var Permissions = require('../databases/controllers/permissions.js')
    if (msg.isPrivate) {
      msg.channel.sendMessage("Et voi käyttää tätä yksityisviestissä. FeelsBadMan") //Joo, tuosta oli pakko tehdä emote.
    }                                                                               //Tuo näkyy vain BetterDiscord-käyttäjille, päärynä. Terveisin, LW
    if (msg.mentions.length === 0) {
      Permissions.checkLevel(msg, msg.author.id, msg.member.roles).then((level) => {
        var msgArray = []
        var roles = msg.member.roles.map((r) => r.name)
        roles = roles.splice(0, roles.length).join(', ')
        msgArray.push('```')
        msgArray.push('Pyydetty käyttäjä: ' + msg.author.username + '#' + msg.author.discriminator)
        msgArray.push('ID: ' + msg.author.id)
        msgArray.push('Tila: ' + msg.author.status)
        if (msg.author.gameName) {
          msgArray.push('Pelaa: ' + msg.author.gameName)
        }
        msgArray.push('Roolit: ' + roles)
        msgArray.push('Nykyinen oikeustaso: ' + level)
        if (msg.author.avatarURL) {
          msgArray.push('Avatar: ' + msg.author.avatarURL)
        }
        msgArray.push('```')
        msg.channel.sendMessage(msgArray.join('\n'))
      }).catch((error) => {
        msg.channel.sendMessage('Jokin leipo kiinni!')
        Logger.error(error)
      })
      return
    }
    msg.mentions.map(function (user) {
      Permissions.checkLevel(msg, user.id, user.memberOf(msg.guild).roles).then(function (level) {
        var msgArray = []
        var guild = msg.guild
        var member = guild.members.find((m) => m.id === user.id)
        var roles = member.roles.map((r) => r.name)
        roles = roles.splice(0, roles.length).join(', ')
        msgArray.push('Tietoa pyysi: ' + msg.author.username)
        msgArray.push('```', 'Pyydetty käyttäjä: ' + user.username + '#' + user.discriminator)
        msgArray.push('ID: ' + user.id)
        msgArray.push('Tila: ' + user.status)
        if (user.gameName) {
          msgArray.push('Pelaa: ' + user.gameName)
        }
        msgArray.push('Roolit: ' + roles)
        msgArray.push('Nykyinen oikeustaso: ' + level)
        if (user.avatarURL) {
          msgArray.push('Avatar: ' + user.avatarURL)
        }
        msgArray.push('```')
        msg.channel.sendMessage(msgArray.join('\n'))
      }).catch(function (err) {
        Logger.error(err)
        msg.channel.sendMessage('Jokin leipo kiinni!')
      })
    })
  }
}

Commands['join-server'] = {
  name: 'join-server',
  help: "Liityn serveriin, johon käsket minun liittyä, kunhan kutsu on kunnossa ja minulla ei ole banaaneja.",
  aliases: ['join', 'joinserver', 'invite'],
  module: 'default',
  usage: '<bot-mention> <instant-invite>',
  level: 0,
  fn: function (msg, suffix, bot) {
    if (bot.User.bot) {
      msg.channel.sendMessage("Sori, botit eivät käytä enää kutsuja, käytä minun OAuth-URLiani: " + config.bot.oauth)
      return
    }
    var re = /(discord(\.gg|app\.com\/invite)\/([\w]{16}|([\w]+-?){3}))/
    var code = re.exec(suffix.split(' '))
    if (msg.guild && bot.User.isMentioned(msg)) {
      bot.Invites.resolve(code[3]).then(function (server) {
        if (bot.Guilds.get(server.guild.id)) {
          msg.channel.sendMessage("Olen jo palvelimella **" + server.guild.name + '**')
        } else {
          bot.Invites.accept(server).then(function (server) {
            Logger.log('debug', 'Liityin palvelimeen ' + server.guild.name + ', tämän henkilön toimesta: ' + msg.author.username)
            msg.channel.sendMessage("Liityin palvelimeen **" + server.guild.name + '**  koska pyysit. C:') //Evill pls, piste emojin jälkeen. Rly?
          })
        }
      }).catch(function (error) {
        Logger.warn('Kutsu, tarjonnut ' + msg.author.username + ' antoi virheen: ' + error)
        if (error.status === 403) {
          msg.channel.sendMessage("Minulla on porttikiellot palvelimellasi, ei pakolla.")
        } else {
          msg.channel.sendMessage("Invite jonka heitit on epäkelpo! Siellä on se instant-invite-nappi, käytä sitä!")
        }
      })
    } else if (msg.isPrivate) {
      bot.Invites.resolve(code[3]).then(function (server) {
        if (bot.Guilds.get(server.guild.id)) {
          msg.channel.sendMessage("Olen jo palvelimella **" + server.guild.name + '**', "en voi tulla sinne uudestaan. Paitsi jos ostat velhonhatun minulle :D")
        } else {
          bot.Invites.accept(server).then(function (server) {
            Logger.log('debug', 'Liityin palvelimeen ' + server.guild.name + ', koska ' + msg.author.username 'pyysi.')
            msg.channel.sendMessage("Liityin palvelimeen **" + server.guild.name + '** koska pyysit. C:')
          })
        }
      }).catch(function (error) {
        Logger.warn('Kutsu, tarjonnut ' + msg.author.username + ' antoi virheen: ' + error + "Pls, leivon kiinni ja kunnolla!")
        if (error.status === 403) {
          msg.channel.sendMessage("Minulla on porttikiellot palvelimellasi, ei pakolla.")
        } else {
          msg.channel.sendMessage("Invite jonka heitit on epäkelpo! Siellä on se instant-invite-nappi, käytä sitä!")
        }
      })
    }
  }
}

Commands.kick = {
  name: 'kick',
  help: 'Anna käyttäjille kalossinkuvaa perskankkuun!',
  noDM: true,
  module: 'default',
  usage: '<user-mention>',
  level: 0,
  fn: function (msg, suffix, bot) {
    var guild = msg.guild
    var user = msg.author
    var botuser = bot.User
    var guildPerms = user.permissionsFor(guild)
    var botPerms = botuser.permissionsFor(guild)
    if (!guildPerms.General.KICK_MEMBERS) {
      msg.channel.sendMessage('Sori, et saa potkia potkia porukkaa perseelle tällä serverillä.')
    } else if (!botPerms.General.KICK_MEMBERS) {
      msg.reply("Minulla ei ole permejä potkia porukkaa perseelle! Lapsuuden unelma-ammatti jäi haaveeksi...")
    } else if (msg.mentions.length === 0) {
      msg.channel.sendMessage('Mainitse henkilöt joille haluat antaa kalossinkuvan perseeseen.')
      return
    } else {
      msg.mentions.map(function (user) {
        var member = msg.guild.members.find((m) => m.id === user.id)
        member.kick().then(() => {
          msg.channel.sendMessage('Henkilöllä' + user.username + 'on nyt kunnon kalossinkuva perseessä!')
        }).catch((error) => {
          msg.channel.sendMessage('Henkilöä ' + user.username + 'ei voitu potkia perseelle, hänellä on joku perseellepotkimisesto tai jotain. (LW hilaa persees tänne!)')
          Logger.error(error)
        })
      })
    }
  }
}

Commands.ban = {
  name: 'ban',
  help: 'Osta jollekulle liput banaanisaarille!',
  noDM: true,
  module: 'default',
  usage: '<user-mention> [days]',
  level: 0,
  fn: function (msg, suffix, bot) {
    var guild = msg.guild
    var user = msg.author
    var botuser = bot.User
    var guildPerms = user.permissionsFor(guild)
    var botPerms = botuser.permissionsFor(guild)
    if (!guildPerms.General.BAN_MEMBERS) {
      msg.reply('Sinulla ei ole tarpeeksi oikeuksia banaanisaaria varten.')
    } else if (!botPerms.General.BAN_MEMBERS) {
      msg.channel.sendMessage('Minulla ei ole oikeuksia lähettämään porukkaa banaanisaarille!')
    } else if (msg.mentions.length === 0) {
      msg.channel.sendMessage('Kerro nyt kenet lähetät sinne banaanisaarille!')
    } else {
      var days = suffix.split(' ')[msg.mentions.length] || 0
      if ([0, 1, 7].indexOf(parseFloat(days)) > -1) {
        msg.mentions.map(function (user) {
          var member = msg.guild.members.find((m) => m.id === user.id)
          member.ban(days).then(() => {
            msg.channel.sendMessage("Ostin henkilölle " + user.username + ' liput banaanisaarille, poistetaan ' + days + ' päivän viestit.')
          }).catch((error) => {
            msg.channel.sendMessage('Henkilöä ' + user.username + " ei onnistuttu lähettämään banaanisaarille.")
            Logger.error(error)
          })
        })
      } else {
        msg.reply('Viimeinen argumenttisi pitää olla 0, 1 tai 7! Se ei toimi muuten, ymmärrä jo.') //Olin suomentanut tuon alunperin "Viimeisin", hyvä soomi taas..
      }
    }
  }
}

Commands.afk = {  //Todella aikainen versio, päivityksiä ja parannuksia tulossa piakkoin
  name: 'afk',
  help: "Ilmoita että et ole tavoitettavissa hetkeen.",
  noDM: true,
  module: 'default',
  timeout: 10,
  level: 0,
  fn: function (msg) {
    msg.reply(user.username + "on nyt AFK.")
  }
}

Commands.back = {
  name: 'back',
  help: "Ilmoita paluustasi.",
  noDM: true,
  module: 'default',
  timeout: 10,
  level: 0,
  fn: function (msg) {
    msg.reply(user.username + "on palannut.")
  }
}

exports.Commands = Commands
