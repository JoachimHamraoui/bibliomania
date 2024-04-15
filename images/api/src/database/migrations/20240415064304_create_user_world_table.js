/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('user_world', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.foreign('user_id').references('world.id');
        
        table.integer('world_id').unsigned();
        table.foreign('world_id').references('question.id');

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
