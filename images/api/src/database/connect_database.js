require('dotenv').config();

const knex = require('knex');
const knexFile = require('./knexfile.js');

const environment = "development";

console.log('Environment:', environment);
console.log('Knex Configuration:', knexFile[environment]);

module.exports = knex(knexFile[environment]);