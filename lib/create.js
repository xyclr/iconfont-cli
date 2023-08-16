const path = require("path");
const fs = require('fs');
const ejs = require('ejs');
const cwd = process.cwd()
const svgstore = require('svgstore');
const svgson = require('svgson')
const open = require("open");
const {
    ICON_FONT_FILE_PATH,
    OUTPUT_PATH,
    SVG_FILE_PATH,
    EXCLUDE_SVG_ATTRS,
    EXCLUDE_SVG_TAGS,
    EXAMPLE_PATH
} = require('./config')


const getAllFile = async function (dir) {
    let res = []

    function traverse(dir) {
        fs.readdirSync(dir).forEach((file) => {
            const pathname = path.join(dir, file)
            if (fs.statSync(pathname).isDirectory()) {
                traverse(pathname)
            } else {
                res.push(pathname)
            }
        })
    }

    traverse(dir)
    return res;
}

const getPureSvgString = (svg) => {
    for (let key in svg.attributes) {
        if (svg.name === 'g') {
            delete svg.attributes
        } else {
            if (EXCLUDE_SVG_ATTRS.indexOf(key) !== -1) {
                delete svg.attributes[key]
            }
        }
    }
    // console.log('svg', svg)
    svg.children = svg.children
        .filter(c => EXCLUDE_SVG_TAGS.indexOf(c.name.toLocaleLowerCase()) === -1)
        .map(c => getPureSvgString(c))
    return svg
}

const generateServerFiles = async (content, svgFileNames) => {
    const template = await fs.readFileSync(path.resolve(__dirname, '../template/example_index.ejs'), 'utf-8')
    const htmlContent = ejs.render(template, {
        svgs: svgFileNames
    }, {});
    await fs.writeFileSync(path.resolve(EXAMPLE_PATH, './index.html'), htmlContent, 'utf-8')
    await fs.writeFileSync(path.resolve(EXAMPLE_PATH, './iconfont.js'), content, 'utf-8')
    open(path.resolve(EXAMPLE_PATH, './index.html'), "chrome");
}

module.exports = async ({
                            source, destination
                        }) => {
    const sourcePath = source ? path.resolve(cwd, source) : SVG_FILE_PATH
    const destinationPath = destination ? path.resolve(cwd, destination) : OUTPUT_PATH
    const svgFiles = (await getAllFile(sourcePath)).filter(file => path.extname(file) == ".svg");
    var sprites = svgstore()
    const svgFileNames = []
    for (let file of svgFiles) {
        let fileName = file.split("/").slice(-1)[0].split(".svg")[0]
        let svgJson = await svgson.parseSync(fs.readFileSync(file, 'utf8'))

        svgFileNames.push({
            fileName
        })
        let svgStr = svgson.stringify(getPureSvgString(svgJson));
        sprites = sprites.add(`icon-${fileName}`, svgStr, 'utf8')
    }
    const template = await fs.readFileSync(ICON_FONT_FILE_PATH, 'utf-8')
    const svgs = JSON.stringify(sprites.toString({inline: true}))
    const content = ejs.render(template, {
        svgs,
        version: new Date().getTime()
    }, {});
    fs.writeFileSync(destinationPath, content, 'utf-8')
    generateServerFiles(content, svgFileNames)
    console.info(`create iconfont.js from ${sourcePath} success, in  ${destinationPath}`)
}
