/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("world", function (table) {
        table.increments("id").primary();
        table.string("worldName").notNullable().unique();
        table.string("worldImage").notNullable();
        table.string("worldDescription");
        table.integer('created_by').unsigned();
        table.foreign('created_by').references('user.id');
        table.boolean('privrate').defaultTo(false);
        table.string("code", 10);
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
