#!/usr/bin/env node
const program = require('commander')
const create = require('./create')

program
    .version('0.1.0')
        .command('create [source] [destination]')
    .description('create iconfont.js from svgs')
    .usage('\n example: iconfont-cli create  ./assets ./iconfont.js')
    .action((source, destination) => {
        create({
            source,
            destination
        })
    })


program.parse()
