
const getMappedQueryByJoin = (queries, joined) => {
    const keys = Object.keys(queries);
    const mappedCols = keys.map((col, index) => {
        return `${col} = $${index + 1}`
    }
    )
    const query = mappedCols.join(`${joined}`);
    return query;
}
const queryClause = (sql, queries) => {
    if (Object.keys(queries).length === 0) return sql;
    const query = getMappedQueryByJoin(queries, " AND ");

    return `${sql} WHERE ${query}`;
}
const insertClause = (sql, insert, clause, type) => {
    const typeValue = Object.values(type);
    const columnNames = Object.keys(insert).join(",");
    const values = Object.values(insert).map((value, index) => {
        if (typeof typeValue[index] === "string") return `'${value}'`;
        return value;
    }).join(",");

    if (!clause) return `${sql}(${columnNames}) VALUES (${values})`;

    return `${sql}(${columnNames}) SELECT ${values} WHERE NOT EXISTS (${clause}) RETURNING *;`;

}
const insertWithoutClause = (sql, insert, type) => {
    const typeValue = Object.values(type);
    const columnNames = Object.keys(insert).join(",");
    const values = Object.values(insert).map((value, index) => {
        if (typeof typeValue[index] === "string") return `'${value}'`;
        
        return value;
    }).join(",");
    return `${sql}(${columnNames}) VALUES (${values})  RETURNING *;`;

}
const deleteClause = (sql, clauses) => {
    return `${sql} WHERE ${clauses} RETURNING *;`;
}
const updateClause = (sql, queries, clauses) => {
    const setQuery = getMappedQueryByJoin(queries, ",");

    return `${sql} SET ${setQuery} WHERE ${clauses} RETURNING *`

}

module.exports = {
    queryClause,
    insertClause,
    insertWithoutClause,
    deleteClause,
    updateClause
}