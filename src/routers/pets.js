const express = require('express')
const router = express.Router()

const Query = require("../domain/utils-db.js");
const petsQuery = new Query("pets");

const pet = {
    name: "",
    age: 0,
    type: "",
    breed: "",
    microchip: true,
}

const checkNullRequest = (request, res, columns) => {
    const notNullList = Object.keys(columns);
    const isEqual = Object.keys(request).every((key, index) => key === notNullList[index]);
    if (!isEqual) {
        return res.status(400).json({
            error: "Missing fields in request body,Cannot be null"
        })
    }
    return;

}
const checkDBStatus = (db, res) => {
    if (!db.rows.length) {
        return res.status(404).json({ eror: 'id provided doest not exists' });
    }
}


router.get("", async (req, res) => {
    const queryResult = await petsQuery.getAll(req);
    res.status(200).json({ pets: queryResult.rows });
})
router.get("/:id", async (req, res) => {
    const queryResult = await petsQuery.getById(req);

    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(200).json({ pet: queryResult.rows });
})
router.post("", async (req, res) => {
    const isNull = checkNullRequest(req.body, res, pet);
    if (isNull) return isNull;

    const queryResult = await petsQuery.insert(req,pet);
    console.log(queryResult);
    res.status(201).json({ pet: queryResult.rows })

});
router.patch("/:id", async (req, res) => {
    const queryResult = await petsQuery.updateById(req);

    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(201).json({ pet: queryResult.rows });

})
router.delete("/:id", async (req, res) => {
    const queryResult = await petsQuery.deleteById(req);
    const isEror = checkDBStatus(queryResult, res);
    if (isEror) return isEror;
    res.status(201).json({ pet: queryResult.rows });

})
module.exports = router
