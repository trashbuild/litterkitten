const axios = require('axios')
const { MessageEmbed } = require('discord.js')
const sounds = require('../kitten-sounds.js')

function sendMenu(drinks, client, interaction) {
  // Create response
  const embed = new MessageEmbed()
    .setColor(client.config.color)
  // Add drink results to response
  const content = drinks.map((drink, i) => {
    return `${String(i)} - ${drink.strDrink ?? 'Mystery drink!'}`
  })
  embed.addField(`${drinks.length} matches:`, content.join('\n'))
  // Send response
  return interaction.reply({ embeds: [embed] })
    .catch(e => { console.log(e) })
}

function sendRecipe(drink, client, interaction) {
  // Get ingredients (max 16 per API spec)
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
    .setColor(client.config.color)
    .setTitle(drink.strDrink ?? 'Mystery drink!')
    .setThumbnail(`${drink.strDrinkThumb}/preview`)
    .addField('Category', drink.strCategory ?? 'None')
    .addField('IBA', drink.strIBA ?? 'None')
    .addField('Glass', drink.strGlass ?? 'None')
    .addField('Ingredients', ingredients.join('\n'))
    .addField('Instructions', drink.strInstructions ?? 'None')
  // Send response
  return interaction.reply({ embeds: [embed] })
    .catch(e => { console.log(e) })
}

// Main
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
