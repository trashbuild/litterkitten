const sounds = require('../kitten-sounds.js')
const {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  SelectMenuBuilder,
  SlashCommandBuilder
} = require('discord.js')

async function sendRecipe(drink, interaction) {
  // Get ingredients (max 16 per API spec)
  const ingredients = []
  for (let i = 1; i < 16; i++) {
    const amount = drink[`strMeasure${i}`]
    if (amount === null) break
    const ingredient = drink[`strIngredient${i}`]
    if (ingredient === null) break
    ingredients.push(`${amount} ${ingredient.toLowerCase()}`)
  }

  // Create embed
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

  // Add embed
  return interaction.editReply({ embeds: [embed] })
    .catch(e => { console.log(e) })
}

async function sendMenu(drinks, interaction) {
  // Create menu options
  const options = drinks.map((drink, i) => {
    return {
      label: drink.strDrink ?? drink.strDrinkAlternate ?? 'Mystery drink!',
      description: drink.strCategory,
      value: String(i)
    }
  })

  // Create menu widget
  const row = new ActionRowBuilder()
    .addComponents(new SelectMenuBuilder()
      .setCustomId('booze')
      .setPlaceholder(`${drinks.length} results for "${interaction.args.join(' ')}"`)
      .addOptions(options)
    )

  // Show menu
  const message = await interaction.editReply({
    components: [row],
    fetchReply: true
  }).catch(e => { console.log(e) })

  // Show recipe based on selection
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.SelectMenu
  })
  collector.on('collect', selection => {
    selection.deferUpdate()
    sendRecipe(drinks[Number(selection.values[0])], interaction)
    collector.resetTimer()
  })
  collector.on('end', collected => {
    interaction.editReply({
      content: `Search for "${interaction.args.join(' ')}" complete.`,
      components: []
    })
  })
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
    // Tell Discord we're working on it
    interaction.deferReply()

    // Set request url based on whether search terms are given or not
    const urlBase = 'https://www.thecocktaildb.com/api/json/v1/1/'
    const url = interaction.args.length
      ? `${urlBase}search.php?s=${interaction.args.join('_')}`
      : `${urlBase}random.php`

    // Send request url and handle results
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Send sad sound if no results
        const drinks = data.drinks
        if (!drinks) {
          return interaction.editReply(`:zero: ${sounds.no()}`)
        }
        // Send recipe if there is only one drink
        if (drinks.length === 1) {
          return sendRecipe(drinks[0], interaction)
        }
        // Send menu if there are multiple drinks
        return sendMenu(drinks, interaction)
      })
      .catch((e) => {
        // Handle errors
        if (e.status === 504) {
          interaction.editReply(`:x::alarm_clock: ${sounds.no()}`)
        } else {
          interaction.editReply(`:x: ${sounds.confused()}`)
          console.log(e)
        }
      })
  }
}
