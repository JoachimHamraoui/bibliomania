/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('user_group', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.foreign('user_id').references('user.id');
        
        table.integer('group_id').unsigned();
        table.foreign('group_id').references('group.id');

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
