/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('question_option', function(table) {
        table.increments('id').primary();
        table.integer('question_id').unsigned();
        table.foreign('question_id').references('question.id');

        table.integer('book_id').unsigned();
        table.foreign('book_id').references('book.id');

        table.integer('group_id').unsigned();
        table.foreign('group_id').references('group.id');

        table.string('option', 255);
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('question_option');
};
