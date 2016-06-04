var Commands = []
var Database = require('nedb')
var Config = require('../../config.json')
var db = new Database({
  filename: './runtime/databases/tags',
  autoload: true
})

Commands.tag = {
  name: 'tag',
  help: 'Tageja!',
  level: 0,
  usage: '<create/delete> <tagname> [content] OR <tagname>',
  aliases: ['t'],
  noDM: true,
  fn: function (msg, suffix, bot) {
    var index = suffix.split(' ')
    if (index[0].toLowerCase() === 'create') {
      if (Config.permissions.master.indexOf(msg.author.id) === -1) {
        var re = /(discord(\.gg|app\.com\/invite)\/([\w]{16}|([\w]+-?){3}))/
        if (msg.mentions.length >= 5) {
          msg.reply('Enintään viisi mainintaa kerrallaan, ok? Muuten tulee turpiin.')
          return
        } else if (re.test(msg.content)) {
          msg.reply('Kiitos ei, en tallenna tuota.')
          return
        }
      }
      var content = index.slice(2, index.length).join(' ')
      db.find({
        _id: index[1].toLowerCase()
      }, function (err, res) {
        if (err) {
          msg.channel.sendMessage('Jokin leipo kiinni!')
        } else if (res) {
          if (res.length > 0) {
            msg.channel.sendMessage('Tuon niminen tagi on jo olemassa. Logiikkani on siinä mielessä loistava, että maailmassa ei voi olla kahta samannimistä asiaa.')
            return
          }
        }
      })
      db.insert({
        _id: index[1].toLowerCase(),
        content: content,
        owner: msg.author.id
      }, function (err, res) {
        if (err) {
          msg.channel.sendMessage('Jokin leipo kiinni!')
        } else if (res) {
          msg.channel.sendMessage('Tagi luotiin :ok_hand:')
        }
      })
    } else if (index[0] === 'owner') {
      db.find({
        _id: index[1].toLowerCase()
      }, function (err, res) {
        if (err) {
          msg.channel.sendMessage('Jokin leipo kiinni!')
        } else if (res) {
          if (res.length === 0) {
            msg.channel.sendMessage('Tuota tagia ei ole olemassa. Olematonta tagia on aika vaikea löytää, you know?')
            return
          } else {
            msg.channel.sendMessage(`Tuon tagin omistaja on ${bot.Users.get(res[0].owner).username}`)
          }
        }
      })
    } else if (index[0].toLowerCase() === 'edit') {
      db.find({
        _id: index[1].toLowerCase()
      }, function (err, res) {
        if (err) {
          msg.channel.sendMessage('Jokin leipo kiinni!')
        } else if (res) {
          if (res.length === 0) {
            msg.channel.sendMessage('Tuota tagia ei ole olemassa. Olematonta tagia on aika vaikea löytää, you know?')
            return
          }
          if (res[0].owner !== msg.author.id && Config.permissions.master.indexOf(msg.author.id) === -1) {
            msg.channel.sendMessage('Et omista tuota tagia, joten et voi muokata sitä. Rikot lakia, aye?')
          } else {
            if (Config.permissions.master.indexOf(msg.author.id) === -1) {
              var re = /(discord(\.gg|app\.com\/invite)\/([\w]{16}|([\w]+-?){3}))/
              if (msg.mentions.length >= 5) {
                msg.reply('Enintään viisi mainintaa kerrallaan, ok? Muuten tulee turpiin.')
                return
              } else if (re.test(msg.content)) {
                msg.reply('Kiitos ei, en tallenna tuota.')
                return
              }
            }
            var content = index.slice(2, index.length).join(' ')
            db.update({
              _id: index[1].toLowerCase()
            }, {
              content: content
            }, function (err, res) {
              if (err) {
                msg.channel.sendMessage('Jokin leipo kiinni!')
              } else if (res) {
                msg.channel.sendMessage('Tagia muokattu.')
              }
            })
          }
        }
      })
    } else if (index[0].toLowerCase() === 'delete') {
      db.find({
        _id: index[1].toLowerCase()
      }, function (err, res) {
        if (err) {
          msg.channel.sendMessage('Jokin leipo kiinni!')
        } else if (res) {
          if (res.length === 0) {
            msg.channel.sendMessage('Tuota tagia ei ole olemassa. Olematonta tagia on aika vaikea löytää, you know?')
            return
          }
          if (res[0].owner !== msg.author.id && Config.permissions.master.indexOf(msg.author.id) === -1) {
            msg.channel.sendMessage('Et omista tuota tagia, joten et voi poistaa sitä. Rikot lakia, aye?')
          } else {
            db.remove({
              _id: index[1].toLowerCase()
            }, function (err, res) {
              if (err) {
                msg.channel.sendMessage('Jokin leipo kiinni!')
              } else if (res) {
                msg.channel.sendMessage('Tagia muokattu.')
              }
            })
          }
        }
      })
    } else {
      db.find({
        _id: index[0].toLowerCase()
      }, function (err, res) {
        if (err) {
          msg.channel.sendMessage('Jokin leipo kiinni!')
        } else if (res) {
          if (res.length === 0) {
            msg.channel.sendMessage('Tuota tagia ei ole olemassa. Olematonta tagia on aika vaikea löytää, you know?')
            return
          } else {
            msg.channel.sendMessage(res[0].content.replace('@everyone', '@every\u200Bone').replace('@here', '@he\u200Bre'))
          }
        }
      })
    }
  }
}

exports.Commands = Commands
