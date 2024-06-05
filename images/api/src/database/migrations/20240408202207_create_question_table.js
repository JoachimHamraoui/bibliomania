/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("question", function (table) {
        table.increments("id").primary();
        table.integer('question_about').unsigned();
        table.foreign('question_about').references('book.id');
        table.string("question", 500).notNullable();
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
