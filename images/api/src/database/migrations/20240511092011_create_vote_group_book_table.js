/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("vote_group_book", function (table) {
        table.increments("id").primary();

        table.integer('user_id').unsigned();
        table.foreign('user_id').references('user.id');

        table.integer('group_id').unsigned();
        table.foreign('group_id').references('group.id');

        table.integer('book_id').unsigned();
        table.foreign('book_id').references('book.id');

        table.integer('vote_id').unsigned();
        table.foreign('vote_id').references('vote.id');

        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('vote_group_book');
};

exports.down = function(knex) {
  
};
