"use strict"

const _ = require("lodash")
const assert = require("assert")
const debug = require("debug")("hash-code-parser")

module.exports = _.assign({build}, parserify({
  int, number, array, object, pair, merge,
}))

function build(builder) {
  return builder(module.exports)
}

function parserify(parsers) {
  return _.mapValues(parsers, parser => (...args) => str => {
    debug(parser.name, JSON.stringify(str.split(/\n|\r\n/)))
    return parser(str, ...args)
  })
}

function int(str) {
  const parsedValue = parseInt(str)
  assert(_.isInteger(parsedValue), `expected int but found '${str}'`)
  const remaining = str.substring(str.indexOf(parsedValue.toString()) + parsedValue.toString().length)
  return {parsedValue, remaining}
}

function number(str) {
  const parsedValue = parseFloat(str)
  assert(!_.isNaN(parsedValue), `expected number but found '${str}'`)
  const remaining = str.substring(str.indexOf(parsedValue.toString()) + parsedValue.toString().length)
  return {parsedValue, remaining}
}

function array(str, length, itemParser) {
  if (_.isString(length)) length = variable(length)
  assert(_.isInteger(length), "length must be an integer")
  const parsers = _.times(length, _.constant(itemParser))
  return sequence(str, parsers, _.concat, [], _.identity)
}

function object(str, keys, valueParser) {
  const {parsedValue: values, remaining} = array(str, keys.length, valueParser)
  const parsedValue = _.zipObject(keys, values)
  _.each(parsedValue, (value, key) => variable(key, value))
  return {parsedValue, remaining}
}

function pair(str, key, valueParser) {
  const {parsedValue: value, remaining} = valueParser(str)
  const parsedValue = {[key]: value}
  _.each(parsedValue, (value, key) => variable(key, value))
  return {parsedValue, remaining}
}

function merge(str, parsers) {
  const trimNewLine = remaining => _.trimStart(remaining, "\r\n")
  return sequence(str, parsers, _.assign, {}, trimNewLine)
}

function sequence(str, parsers, combineParsedValues, initialParsedValue, transformRemaining) {
  return _.reduce(parsers, ({parsedValue: previousParsedValue, remaining: previousRemaining}, parser) => {
    const {parsedValue, remaining} = parser(previousRemaining)
    const nextParsedValue = combineParsedValues(previousParsedValue, parsedValue)
    const nextRemaining = transformRemaining(remaining)
    return {parsedValue: nextParsedValue, remaining: nextRemaining}
  }, {parsedValue: initialParsedValue, remaining: str})
}

function variable(name, value) {
  debug("variable", name, value)
  if (_.isUndefined(value)) return variable[name]
  else return variable[name] = value
}
