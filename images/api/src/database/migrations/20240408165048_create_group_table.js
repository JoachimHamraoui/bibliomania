/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("group", function (table) {
        table.increments("id").primary();
        table.string("name").notNullable().unique();
        table.string("image").notNullable();
        table.string("description").notNullable();
        table.integer('created_by').unsigned();
        table.foreign('created_by').references('user.id');
        table.string("code", 10).notNullable().unique();
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('world');
};
