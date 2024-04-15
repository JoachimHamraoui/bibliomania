/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("user_book", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned();
    table.foreign("user_id").references("user.id");

    table.integer("book_id").unsigned();
    table.foreign("book_id").references("book.id");

    table.integer("world_id").unsigned();
    table.foreign("world_id").references("world.id");

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
