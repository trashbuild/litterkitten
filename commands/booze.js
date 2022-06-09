const axios = require('axios')
const { MessageEmbed } = require('discord.js')

module.exports = {
  description: 'Get a random cocktail.',
  name: 'booze',
  options: [],
  voiceChannel: false,
  run: async (client, interaction) => {
    // Get data
    const response = await axios.get(
      'https://www.thecocktaildb.com/api/json/v1/1/random.php'
    ).then((response) => {
      // console.log(response)
      return response
    }).catch((err) => {
      console.log(err)
    })

    // Parse response
    const drink = response.data.drinks[0]
    const ingredients = []
    for (let i = 1; i < 16; i++) {
      const amount = drink[`strMeasure${i}`]
      const ingredient = drink[`strIngredient${i}`]
      if (amount === null || ingredient === null) break
      // ingredient = ingredient.split('')
      // ingredient[0] = ingredient[0].toLowerCase()
      ingredients.push(`${amount} ${ingredient.toLowerCase()}`)
    }

    // Create embed
    const embed = new MessageEmbed()
      .setColor('BLUE')
      .setTitle(drink.strDrink)
      .setThumbnail(`${drink.strDrinkThumb}/preview`)
      .addField('Category', drink.strCategory)
      .addField('IBA', drink.strIBA)
      .addField('Glass', drink.strGlass)
      .addField('Ingredients', ingredients.join('\n'))
      .addField('Instructions', drink.strInstructions)

    // Reply
    interaction.reply({ embeds: [embed] }).catch(e => { })
  }
}
