var Commands = []
var Logger = require('../internal/logger.js').Logger
var Giphy = require('../giphy.js')
var Cb = require('cleverbot-node')
var config = require('../../config.json')
var unirest = require('unirest')
var cleverbot = new Cb()
Cb.prepare(function () {
  Logger.debug('Käynnistettiin cleverbotti')
})

Commands.gif = {
  name: 'gif',
  help: "Etsin Giphysta gif-kuvaa joka sopii tageihisi.",
  aliases: ['giphy'],
  timeout: 10,
  level: 0,
  fn: function (msg, suffix) {
    var tags = suffix.split(' ')
    Giphy.get_gif(tags, function (id) {
      if (typeof id !== 'undefined') {
        msg.reply('http://media.giphy.com/media/' + id + '/giphy.gif [Tags: ' + tags + ']')
      } else {
        msg.reply('Sori! Epäsopivat tagit, kokeile jotain muuta. Esimerkiksi jotain, joka on olemassa! (Olemattomia tageja on vaikea etsiä) [Tagit: ' + tags + ']')
      }
    })
  }
}

Commands.lehmä = {
  name: 'lehmä',
  help: "Hommaan satunnaisen onnilehmän! En kuitenkaan tiedä, mikä se on.",
  module: 'fun',
  timeout: 20,
  level: 0,
  fn: function (msg) {
    unirest.get('https://thibaultcha-fortunecow-v1.p.mashape.com/random')
      .header('X-Mashape-Key', config.api_keys.mashape)
      .header('Accept', 'text/plain')
      .end(function (result) {
        msg.reply('```' + result.body + '```')
      })
  }
}

Commands.kissa = {
  name: 'kissa',
  help: "Hommaan satunnaisen kissakuvan sinulle! Kissakuvat ovat parhaita, vai mitä? (Jos katsoo mitä DD ja appelsiinikissa puuhavaavat tämän komennon kanssa koko ajan)",
  module: 'fun',
  timeout: 10,
  level: 0,
  fn: function (msg) {
    unirest.get('https://nijikokun-random-cats.p.mashape.com/random')
      .header('X-Mashape-Key', config.api_keys.mashape)
      .header('Accept', 'application/json')
      .end(function (result) {
        msg.reply(result.body.source)
      })
  }
}

Commands.leetspeak = {
  name: 'leetspeak',
  help: "3nK00d44N v1357151 l3375P@4k1k51!",
  aliases: ['leetspeek', 'leetspeach'],
  level: 0,
  fn: function (msg, suffix) {
    if (suffix.length > 0) {
      var leetspeak = require('leetspeak')
      var thing = leetspeak(suffix)
      msg.reply(thing)
    } else {
      msg.reply('*Sinun pitää kirjoittaa jotain muuttaaksesi viestisi l3375p@4k1k51!*')
    }
  }
}

Commands.stroke = {
  name: 'stroke',
  help: "Minä isken jonkun egoon!",
  timeout: 5,
  level: 0,
  fn: function (msg, suffix) {
    var name
    if (suffix) {
      name = suffix.split('"')
      if (name.length === 1) {
        name = ['', name]
      }
    } else {
      name = ['Andrei', 'Zbikowski']
    }
    var request = require('request')
    request('http://api.icndb.com/jokes/random?escape=javascript&firstName=' + name[0] + '&lastName=' + name[1], function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          return
        }
        var joke = JSON.parse(body)
        msg.channel.sendMessage(joke.value.joke)
      }
    })
  }
}

Commands.yomomma = {
  name: 'yomomma',
  help: "Hommaan satunnaisen yomomma-vitsin sinulle! Kohta kuulet hauskoja asioita **sun mutsistas** C:",
  timeout: 5,
  level: 0,
  fn: function (msg, suffix) {
    var request = require('request')
    request('http://api.yomomma.info/', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          return
        }
        var yomomma = JSON.parse(body)
        if (suffix === '') {
          msg.channel.sendMessage(yomomma.joke)
          msg.channel.sendMessage()
        }
      }
    })
  }
}

Commands.advice = {
  name: 'advice',
  help: "Annan sinulle elämänohjeita! Pakotan sinut myös noudattamaan näitä... ( ͡° ͜ʖ ͡° )",
  noDM: true, // Ratelimits Ratelimits Ratelimits Ratelimits
  timeout: 5,
  level: 0,
  fn: function (msg) {
    var request = require('request')
    request('http://api.adviceslip.com/advice', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          return
        }
        var advice = JSON.parse(body)
        msg.reply(advice.slip.advice)
      }
    })
  }
}

Commands.yesno = {
  name: 'yesno',
  help: 'Palauttaa gif-kuvan joka sanoo kyllä tai ei. Tämä on kauheaa uhkapeliä!',
  timeout: 5,
  level: 0,
  fn: function (msg, suffix) {
    var request = require('request')
    request('http://yesno.wtf/api/?force=' + suffix, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          return
        }
        var yesNo = JSON.parse(body)
        msg.reply(yesNo.image)
      }
    })
  }
}

Commands.urbandictionary = {
  name: 'urbandictionary',
  help: "Minä katson, mitä idiootit internetissä ajattelevat sanoista. Se voi olla ihan eri asia, you know!",
  aliases: ['ud', 'urban'],
  timeout: 10,
  level: 0,
  fn: function (msg, suffix) {
    var request = require('request')
    request('http://api.urbandictionary.com/v0/define?term=' + suffix, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          return
        }
        var uD = JSON.parse(body)
        if (uD.result_type !== 'no_results') {
          var msgArray = []
          msgArray.push('**' + uD.list[0].word + '**')
          msgArray.push(uD.list[0].definition)
          msgArray.push('\n```')
          msgArray.push(uD.list[0].example)
          msgArray.push('```')
          msg.channel.sendMessage(msgArray.join('\n'))
        } else {
          msg.reply(suffix + ":Tämä sana on niin pärinöissä, ettei edes urbaanilla sanakirjalla ole siihen vastausta.")
        }
      }
    })
  }
}

Commands.fact = {
  name: 'fact',
  help: "Kerron sinulle kiinnostavia faktoja!",
  timeout: 5,
  level: 0,
  fn: function (msg) {
    var request = require('request')
    var xml2js = require('xml2js')
    request('http://www.fayd.org/api/fact.xml', function (error, response, body) {
      if (error) {
        Logger.error(error)
      }
      if (!error && response.statusCode === 200) {
        xml2js.parseString(body, function (err, result) {
          if (err) {
            Logger.error(err)
          }
          try {
            msg.reply(result.facts.fact[0])
          } catch (e) {
            msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          }
        })
      }
    })
  }
}

Commands.dice = {
  name: 'dice',
  help: "Heitän noppaa! Next-gen arpapeliä!",
  timeout: 5,
  level: 0,
  fn: function (msg, suffix) {
    var dice
    if (suffix) {
      dice = suffix
    } else {
      dice = 'd6'
    }
    var request = require('request')
    request('https://rolz.org/api/?' + dice + '.json', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          return
        }
        var roll = JSON.parse(body)
        msg.reply('Sinun ' + roll.input + ' toi tuloksen ' + roll.result + ' ' + roll.details)
      }
    })
  }
}

Commands.fancyinsult = {
  name: 'fancyinsult',
  help: "Loukkaan ystäviäsi, eivätkä he enää ole ystäviäsi!",
  aliases: ['insult'],
  timeout: 5,
  level: 0,
  fn: function (msg, suffix) {
    var request = require('request')
    request('http://quandyfactory.com/insult/json/', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          return
        }
        var fancyinsult = JSON.parse(body)
        if (suffix === '') {
          msg.channel.sendMessage(fancyinsult.insult)
        } else {
          msg.channel.sendMessage(suffix + ', ' + fancyinsult.insult)
        }
      }
    })
  }
}

Commands.cleverbot = {
  name: 'cleverbot',
  help: 'Puhu cleverbotille! Hänellä on vastaus kaikkeen! (Ei muuten ole)',
  aliases: ['chat', 'cb', 'talk'],
  level: 0,
  fn: function (msg, suffix) {
    msg.channel.sendTyping()
    var type = setInterval(function () {
      msg.channel.sendTyping()
    }, 5000)
    cleverbot.write(suffix, function (r) {
      msg.channel.sendMessage(r.message)
      clearInterval(type)
    })
  }
}

Commands.catfacts = {
  name: 'catfacts',
  help: "Kerron sinulle kiinnostavia kissafaktoja",
  timeout: 10,
  level: 0,
  fn: function (msg) {
    var request = require('request')
    request('http://catfacts-api.appspot.com/api/facts', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
          return
        }
        var catFact = JSON.parse(body)
        msg.reply(catFact.facts[0])
      }
    })
  }
}

Commands.e621 = {
  name: 'e621',
  help: 'e621, eli *Lopeta internetistä puhuminen niin tosissasi.*', // Mitä vittua Evill?
  usage: '<tags> multiword tags need to be typed like: wildbeast_is_a_discord_bot',
  level: 0,
  nsfw: true,
  fn: function (msg, suffix) {
    msg.channel.sendTyping()
    unirest.post('https://e621.net/post/index.json?limit=30&tags=' + suffix) // Fetching 30 posts from E621 with the given tags
      .end((result) => {
        if (result.body.length < 1) {
          msg.reply('anteeksi, mitään ei löytynyt.') // Correct me if it's wrong.
        } else {
          var count = Math.floor((Math.random() * result.body.length))
          var FurryArray = []
          FurryArray.push(msg.author.mention + ", etsit `" + suffix + '`') // hehe no privacy if you do the nsfw commands now.
          FurryArray.push(result.body[count].file_url)
          msg.channel.sendMessage(FurryArray.join('\n'))
        }
      })
  }
}

Commands.rule34 = {
  name: 'rule34',
  help: 'Pornoa? Ei tipu!.',
  level: 0,
  nsfw: true,
  fn: function (msg, suffix) {
    msg.channel.sendTyping()
    unirest.post('http://rule34.xxx/index.php?page=dapi&s=post&q=index&tags=' + suffix) // Fetching 100 rule34 pics
      .end(function (result) {
        var xml2js = require('xml2js')
        if (result.body.length < 75) {
          msg.reply('anteeksi, mitään ei löytynyt. Google on hyvä vaihtoehto!') // Correct me if it's wrong.
        } else {
          xml2js.parseString(result.body, (err, reply) => {
            if (err) {
              msg.channel.sendMessage('API palautti epäsovinnaisen vastauksen. LW käsittää kyllä mitä tämä meinaa.')
            } else {
              var count = Math.floor((Math.random() * reply.posts.post.length))
              var FurryArray = []
              if (!suffix) {
                FurryArray.push(msg.author.mention + ", etsit `satunnaisesti`")
              } else {
                FurryArray.push(msg.author.mention + ", etsit `" + suffix + '`')
              }
              FurryArray.push('http:' + reply.posts.post[count].$.file_url)
              msg.channel.sendMessage(FurryArray.join('\n'))
            }
          })
        }
      })
  }
}

Commands.meme = {
  name: 'meme',
  help: "Teen meemin suffixeillasi!",
  timeout: 10,
  usage: '<memetype> "<Upper line>" "<Bottom line>" **Lainausmerkit ovat tärkeitä!**',
  level: 0,
  fn: function (msg, suffix, bot) {
    var tags = suffix.split('"')
    var memetype = tags[0].split(' ')[0]
    var meme = require('./memes.json')
    var Imgflipper = require('imgflipper')
    var imgflipper = new Imgflipper(config.api_keys.imgflip.username, config.api_keys.imgflip.password)
    imgflipper.generateMeme(meme[memetype], tags[1] ? tags[1] : '', tags[3] ? tags[3] : '', (err, image) => {
      if (err) {
        msg.reply('Yritä uudestaan.')
      } else {
        var guild = msg.guild
        var user = bot.User
        var guildPerms = user.permissionsFor(guild)
        if (guildPerms.Text.MANAGE_MESSAGES) {
          msg.delete()
          msg.reply(image)
        } else {
          msg.reply(image)
          msg.channel.sendMessage('*Tämä toimii parhaiten kun minulla on oikeudet poistaa viestejä!*')
        }
      }
    })
  }
}

exports.Commands = Commands
