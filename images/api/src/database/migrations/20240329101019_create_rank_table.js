/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('rank', function(table) {
        table.increments('id').primary();
        table.string('rank', 255).notNullable();
        table.string('color', 255).notNullable();

        table.timestamps(true, true);
        
        // Additional columns and constraints can be added here
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
