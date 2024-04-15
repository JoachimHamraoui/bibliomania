/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("book", function (table) {
        table.increments("id").primary();
        table.string("bookTitle").notNullable();
        table.string("bookDescription").notNullable();
        table.string("bookCover").notNullable();
        table.integer('world').unsigned();
        table.foreign('world').references('world.id');
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('book');
};
