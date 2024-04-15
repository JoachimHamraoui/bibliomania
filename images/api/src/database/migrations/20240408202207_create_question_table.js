/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("question", function (table) {
        table.increments("id").primary();
        table.integer('bookQuestion').unsigned();
        table.foreign('bookQuestion').references('book.id');
        table.string("question").notNullable();
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('question');
};
