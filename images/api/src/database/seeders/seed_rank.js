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
          "color": "#ffdd55"
        },
        {
          "rank": "Apprentice",
          "color": "#ffaa66"
        },
        {
          "rank": "Amateur",
          "color": "#ff8844"
        },
        {
          "rank": "Intermediate",
          "color": "#ff6655"
        },
        {
          "rank": "Skilled",
          "color": "#ff5555"
        },
        {
          "rank": "Proficient",
          "color": "#ff4444"
        },
        {
          "rank": "Experienced",
          "color": "#ff3333"
        },
        {
          "rank": "Advanced",
          "color": "#ff2222"
        },
        {
          "rank": "Expert",
          "color": "#ff1111"
        },
        {
          "rank": "Master",
          "color": "#ff0000"
        }
      ]);
    };
    });
};
