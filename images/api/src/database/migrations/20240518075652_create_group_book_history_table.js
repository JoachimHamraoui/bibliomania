/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("group_book_history", function (table) {
        table.increments("id").primary();
       
        table.integer('group_id').unsigned();
        table.foreign('group_id').references('group.id');

        table.integer('book_id').unsigned();
        table.foreign('book_id').references('book.id');

        table.boolean("completed").defaultTo(false);

        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('group_book_history');
};
