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
  const result = parseInt(str)
  assert(_.isInteger(result), `expected int but found '${str}'`)
  const remaining = str.substring(str.indexOf(result.toString()) + result.toString().length)
  return {result, remaining}
}

function number(str) {
  const result = parseFloat(str)
  assert(!_.isNaN(result), `expected number but found '${str}'`)
  const remaining = str.substring(str.indexOf(result.toString()) + result.toString().length)
  return {result, remaining}
}

function array(str, length, itemParser) {
  if (_.isString(length)) length = variable(length)
  assert(_.isInteger(length), "length must be an integer")
  const parsers = _.times(length, _.constant(itemParser))
  return sequence(str, parsers, _.concat, [], _.identity)
}

function object(str, keys, valueParser) {
  const {result: values, remaining} = array(str, keys.length, valueParser)
  const result = _.zipObject(keys, values)
  _.each(result, (value, key) => variable(key, value))
  return {result, remaining}
}

function pair(str, key, valueParser) {
  const {result: value, remaining} = valueParser(str)
  const result = {[key]: value}
  _.each(result, (value, key) => variable(key, value))
  return {result, remaining}
}

function merge(str, parsers) {
  const trimNewLine = remaining => _.trimStart(remaining, "\r\n")
  return sequence(str, parsers, _.assign, {}, trimNewLine)
}

function sequence(str, parsers, combineResults, initialResult, transformRemaining) {
  return _.reduce(parsers, ({result: previousResult, remaining: previousRemaining}, parser) => {
    const {result, remaining} = parser(previousRemaining)
    const nextResult = combineResults(previousResult, result)
    const nextRemaining = transformRemaining(remaining)
    return {result: nextResult, remaining: nextRemaining}
  }, {result: initialResult, remaining: str})
}

function variable(name, value) {
  debug("variable", name, value)
  if (_.isUndefined(value)) return variable[name]
  else return variable[name] = value
}
