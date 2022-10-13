const axios = require('axios')
const sounds = require('../kitten-sounds.js')
const {
  EmbedBuilder,
  // SelectMenuBuilder,
  SlashCommandBuilder
} = require('discord.js')

// TODO: use SelectMenu instead of numbers
function sendMenu(drinks, interaction) {
  // Create menu
  const menu = drinks.map((drink, i) => {
    return `${String(i)} - ${drink.strDrink ?? 'Mystery drink!'}`
  }).join('\n')
  // Create response
  const embed = new EmbedBuilder()
    .addFields(
      { name: `${drinks.length} matches:`, value: menu }
    )
  // Send response
  return interaction.reply({ embeds: [embed] })
    .catch(e => { console.log(e) })
}

function sendRecipe(drink, interaction) {
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
  data: new SlashCommandBuilder()
    .setName('booze')
    .setDescription('Make a booze!')
    .addStringOption(option =>
      option.setName('terms')
        .setDescription('Search terms.')
        .setRequired(false)),

  async execute(interaction) {
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
        return sendRecipe(drinks[0], interaction)
      }
      // Send menu if there are multiple drinks
      return sendMenu(drinks, interaction)
    }).catch((err) => { console.log(err) })
  }
}
