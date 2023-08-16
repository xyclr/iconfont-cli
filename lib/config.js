const path = require("path");
const cwd = process.cwd()

module.exports = {
    ICON_FONT_FILE_PATH: path.resolve(__dirname, '../template/iconfont.ejs'),
    OUTPUT_PATH: path.resolve(cwd, './iconfont.js'),
    SVG_FILE_PATH: path.resolve(__dirname, '../assets/'),
    EXAMPLE_PATH: path.resolve(__dirname, '../example/'),
    EXCLUDE_SVG_ATTRS: ['width', 'height', "fill", "stroke", "stroke-width", "fill-rule", "transform"],
    EXCLUDE_SVG_TAGS: ['title', 'desc'],
}