/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  return knex('rank')
    .select("*")
    .then(function (d) {
      if(!d[0]) {
      return knex('rank').insert([
        {
          "rank": "Novice",
          "color": "#ffcc00"
        },
        {
          "rank": "Apprentice",
          "color": "#ff9933"
        },
        {
          "rank": "Amateur",
          "color": "#ff6600"
        },
        {
          "rank": "Intermediate",
          "color": "#ff3300"
        },
        {
          "rank": "Skilled",
          "color": "#ff0000"
        },
        {
          "rank": "Proficient",
          "color": "#cc0000"
        },
        {
          "rank": "Experienced",
          "color": "#990000"
        },
        {
          "rank": "Advanced",
          "color": "#660000"
        },
        {
          "rank": "Expert",
          "color": "#330000"
        },
        {
          "rank": "Master",
          "color": "#000000"
        }
      ]);
    };
    });
};
