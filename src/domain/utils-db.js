const db = require("../../db");
const {
    queryClause,
    insertClause,
    insertWithoutClause,
    deleteClause,
    updateClause
} = require("./utils.js");

class Query {
    constructor(name) {
        this.name = name;
    }
    async getAll(req) {
        const query = queryClause(`SELECT * FROM ${this.name} `, req.query);
        return await db.query(query, Object.values(req.query));

    }
    async getById(req) {
        const query = `SELECT * FROM ${this.name} WHERE id = $1`;
        return await db.query(query, Object.values(req.params));
    }
    async insertWithUnique(req, { unique, value },type) {
        const query = insertClause(`INSERT INTO ${this.name}`, req.body, `SELECT 1 FROM books WHERE ${unique} = '${value}'`,type)
        return await db.query(query);
    }
    async insert(req,type) {
        const query = insertWithoutClause(`INSERT INTO ${this.name}`, req.body,type)
        console.log(query);
        return await db.query(query);
    }
    async updateById(req) {
        const query = updateClause(`UPDATE ${this.name}`, req.body, `id = ${req.params.id}`);
        return await db.query(query, Object.values(req.body));
    }
    async deleteById(req) {
        const query = deleteClause(`DELETE FROM ${this.name}`, `id = ${req.params.id}`);
        return await db.query(query);
    }
}

module.exports = Query;