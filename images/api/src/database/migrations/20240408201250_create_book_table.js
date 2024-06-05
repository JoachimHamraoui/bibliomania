/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("book", function (table) {
        table.increments("id").primary();
        table.string("title").notNullable();
        table.string("author").notNullable();
        table.string("description").notNullable();
        table.string("cover").notNullable();
        table.integer('group').unsigned();
        table.foreign('group').references('group.id');
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
