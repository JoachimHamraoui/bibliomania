/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("book_comments", function (table) {
        table.increments("id").primary();

        table.integer('user_id').unsigned();
        table.foreign('user_id').references('user.id');

        table.integer('group_id').unsigned();
        table.foreign('group_id').references('group.id');

        table.integer('book_id').unsigned();
        table.foreign('book_id').references('book.id');

        table.string("comment", 280).notNullable();
        table.string("image", 280).nullable();

        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('book_comments');
};
