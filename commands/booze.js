const axios = require('axios')
const { MessageEmbed } = require('discord.js')
const sounds = require('../kitten-sounds.js')

const urlBase = 'https://www.thecocktaildb.com/api/json/v1/1/'

function sendMenu(drinks, interaction) {
  // Create response
  const embed = new MessageEmbed()
    .setColor(client.config.color)

  // Add drink results to response
  const content = []
  drinks.forEach((drink, i) => {
    content.push(`${String(i)} - ${drink.strDrink ?? 'Mystery drink!'}`)
  })
  embed.addField(`Found ${drinks.length}:`, content.join('\n'))

  // Send response
  return interaction.reply({ embeds: [embed] }).catch(e => { })
}

function sendRecipe(drink, interaction) {
  // Get ingredients
  const ingredients = []
  for (let i = 1; i < 16; i++) {
    const amount = drink[`strMeasure${i}`]
    const ingredient = drink[`strIngredient${i}`]
    if (amount === null || ingredient === null) break
    // ingredient = ingredient.split('')
    // ingredient[0] = ingredient[0].toLowerCase()
    ingredients.push(`${amount} ${ingredient.toLowerCase()}`)
  }

  // Create response
  const embed = new MessageEmbed()
    .setColor('BLUE')
    .setTitle(drink.strDrink ?? 'Mystery drink!')
    .setThumbnail(`${drink.strDrinkThumb}/preview`)
    .addField('Category', drink.strCategory ?? 'None')
    .addField('IBA', drink.strIBA ?? 'None')
    .addField('Glass', drink.strGlass ?? 'None')
    .addField('Ingredients', ingredients.join('\n'))
    .addField('Instructions', drink.strInstructions ?? 'None')

  // Send response
  return interaction.reply({ embeds: [embed] }).catch(e => { })
}

module.exports = {
  description: 'Make a booze!',
  name: 'booze',
  options: [{
    description: 'Cocktail name to search for',
    name: 'name',
    type: 'STRING',
    required: false
  }],
  voiceChannel: false,
  run: async (client, interaction) => {
    const url = interaction.args.length
      ? `${urlBase}search.php?s=${interaction.args.join('_')}`
      : `${urlBase}random.php`

    axios.get(
      url
    ).then((response) => {
      // Send sad sound if no results
      const drinks = response.data.drinks
      if (!drinks) {
        return interaction.reply({
          content: `${sounds.oops()} :zero: :crying_cat_face:`,
          ephemeral: true
        }).catch(e => { })
      }

      // Send recipe if there is only one drink
      if (drinks.length === 1) {
        return sendRecipe(drinks[0], interaction)
      }

      // Send menu if there are multiple drinks
      return sendMenu(drinks, interaction)
    }).catch((err) => {
      console.log(err)
    })
  }
}
