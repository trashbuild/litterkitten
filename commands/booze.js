const axios = require('axios')
const sounds = require('../kitten-sounds.js')
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')

function sendMenu(drinks, client, interaction) {
  // Create menu
  const menu = drinks.map((drink, i) => {
    return `${String(i)} - ${drink.strDrink ?? 'Mystery drink!'}`
  }).join('\n')
  // Create response
  const embed = new EmbedBuilder()
    .setColor(client.config.color)
    .addFields(
      { name: `${drinks.length} matches:`, value: menu }
    )
  // Send response
  return interaction.reply({ embeds: [embed] })
    .catch(e => { console.log(e) })
}

function sendRecipe(drink, client, interaction) {
  // Get ingredients (max 16 per API spec)
  const ingredients = []
  for (let i = 1; i < 16; i++) {
    const amount = drink[`strMeasure${i}`]
    if (amount === null) break
    const ingredient = drink[`strIngredient${i}`]
    if (ingredient === null) break
    ingredients.push(`${amount} ${ingredient.toLowerCase()}`)
  }
  // Create response
  const embed = new EmbedBuilder()
    .setColor(client.config.color)
    .setTitle(drink.strDrink ?? 'Mystery drink!')
    .setThumbnail(`${drink.strDrinkThumb}/preview`)
    .addFields(
      { name: 'Category', value: drink.strCategory ?? 'None' },
      { name: 'IBA', value: drink.strIBA ?? 'None' },
      { name: 'Glass', value: drink.strGlass ?? 'None' },
      { name: 'Ingredients', value: ingredients.join('\n') },
      { name: 'Instructions', value: drink.strInstructions ?? 'None' }
    )
  // Send response
  return interaction.reply({ embeds: [embed] })
    .catch(e => { console.log(e) })
}

// Main
module.exports = {
  name: 'booze',
  type: 1,
  description: 'Make a booze!',
  options: [{
    name: 'name',
    type: ApplicationCommandOptionType.String,
    description: 'Search terms. If not provided, will return a random drink.',
    required: false
  }],
  voiceChannel: false,

  run: async (client, interaction) => {
    // Set request url based on whether search terms are given or not
    const urlBase = 'https://www.thecocktaildb.com/api/json/v1/1/'
    const url = interaction.args.length
      ? `${urlBase}search.php?s=${interaction.args.join('_')}`
      : `${urlBase}random.php`

    // Send request url and handle results
    axios.get(url).then((response) => {
      // Send sad sound if no results
      const drinks = response.data.drinks
      if (!drinks) {
        return interaction.reply({
          content: `${sounds.no()} :zero:`,
          ephemeral: true
        }).catch(e => { console.log(e) })
      }
      // Send recipe if there is only one drink
      if (drinks.length === 1) {
        return sendRecipe(drinks[0], client, interaction)
      }
      // Send menu if there are multiple drinks
      return sendMenu(drinks, client, interaction)
    }).catch((err) => { console.log(err) })
  }
}
