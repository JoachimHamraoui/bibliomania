/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('user_answer', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.foreign('user_id').references('user.id');
        
        table.integer('question_id').unsigned();
        table.foreign('question_id').references('question.id');
        
        table.integer('chosen_option_id').unsigned();
        table.foreign('chosen_option_id').references('question_option.id');
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
