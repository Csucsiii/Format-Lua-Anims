const fs = require("fs");
const path = require("path");

const INPUT_FOLDER_PATH = path.join(__dirname, "/input");
const INPUT_JSON_PATH = path.join(INPUT_FOLDER_PATH, "/anims.json");

const OUTPUT_FOLDER_PATH = path.join(__dirname, "/output");
const OUTPUT_JSON_PATH = path.join(OUTPUT_FOLDER_PATH, "/anims.json");
const OUTPUT_LUA_PATH = path.join(OUTPUT_FOLDER_PATH, "/anims.lua");

const jsObjToLuaTable = (jsObj, indentLevel = 0) => {
    const indent = " ".repeat(indentLevel * 4);
    let luaTable = "{\n";

    let isFirst = true;

    for (const key in jsObj) {
        if (jsObj.hasOwnProperty(key)) {
            const value = jsObj[key];
            if (!isFirst) {
                luaTable += ",\n";
            } else {
                isFirst = false;
            }
            luaTable += `${indent}    ${key} = ${toLuaValue(
                value,
                indentLevel + 1
            )}`;
        }
    }

    luaTable += `\n${indent}}`;
    return luaTable;
};

const toLuaValue = (value, indentLevel) => {
    if (typeof value === "object" && !Array.isArray(value)) {
        return jsObjToLuaTable(value, indentLevel);
    } else if (typeof value === "string") {
        return `"${value}"`;
    } else {
        return value;
    }
};

const main = async () => {
    if (!fs.existsSync(INPUT_FOLDER_PATH)) {
        fs.mkdirSync(INPUT_FOLDER_PATH);
        console.log(
            "A(z) 'input' mappa létrehozva, másold be ide a(z) anims.json fájlt."
        );
        return;
    }

    if (!fs.existsSync(INPUT_JSON_PATH)) {
        console.log("Nem található a(z) anims.json fájl.");
        return;
    }

    const file = fs.readFileSync(INPUT_JSON_PATH, "utf-8");
    const anims = JSON.parse(file);

    if (typeof anims !== "object") return;

    const formattedAnims = {};

    Object.keys(anims).forEach((key) => {
        const anim = anims[key];
        const targetAnim = anims[anim["4"]];

        const obj = {};

        obj.dict = anim["1"];
        obj.name = anim["2"];
        obj.label = anim["3"];

        if (typeof anim["AnimationOptions"] !== "undefined") {
            obj.AnimationOptions = anim["AnimationOptions"];
        }

        if (typeof targetAnim !== "undefined") {
            obj.target = {};
            obj.target.dict = targetAnim["1"];
            obj.target.name = targetAnim["2"];

            if (typeof targetAnim["AnimationOptions"] !== "undefined") {
                obj.target.AnimationOptions = targetAnim["AnimationOptions"];
            }
        }

        formattedAnims[key] = obj;
    });

    if (!fs.existsSync(OUTPUT_FOLDER_PATH)) {
        fs.mkdirSync(OUTPUT_FOLDER_PATH);
    }

    try {
        const json = JSON.stringify(formattedAnims, null, 4);
        fs.writeFileSync(OUTPUT_JSON_PATH, json);

        fs.writeFileSync(
            OUTPUT_LUA_PATH,
            `local anims = ${jsObjToLuaTable(formattedAnims)}`
        );

        console.log(
            `Sikeresen átformáztad a fájlokat! Elérési út: ${OUTPUT_JSON_PATH}`
        );
    } catch (err) {
        console.log("Hiba történt a fájl létrehozása során.", err);
    }
};

main().catch((err) => console.log(err));