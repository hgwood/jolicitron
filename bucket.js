"use strict"

const _ = require("lodash")
const assert = require("assert")

module.exports = _.assign({buildParser}, parserify({
  int, number, array, object, pair, merge
}))

function parserify(parsers) {
  return _.mapValues(parsers, parser => {
    return (a, b, c, d, e, f) => str => {
      console.error(parser.name, JSON.stringify(str.split(/\n|\r\n/)))
      return parser(str, a, b, c, d, e, f)
    }
  })
}

function buildParser(builder) {
  return builder(module.exports)
}

function number(str) {
  const result = parseFloat(str)
  assert(!_.isNaN(result), `expected number but found '${str}'`)
  const remaining = str.substring(str.indexOf(result.toString()) + result.toString().length)
  return {result, remaining}
}

function int(str) {
  const result = parseInt(str)
  assert(_.isInteger(result), `expected int but found '${str}'`)
  const remaining = str.substring(str.indexOf(result.toString()) + result.toString().length)
  return {result, remaining}
}

function array(str, length, itemParser) {
  if (_.isString(length)) length = variable(length)
  assert(_.isInteger(length), "length must be an integer")
  const parsers = _.times(length, _.constant(itemParser))
  const concat = (results, nextResult) => results.concat(nextResult)
  return sequence(str, parsers, concat, [], _.identity)
}

function object(str, keys, valueParser) {
  const valuesParserResult = array(str, keys.length, valueParser)
  const result = _.zipObject(keys, valuesParserResult.result)
  _.each(result, (value, key) => variable(key, value))
  return {result, remaining: valuesParserResult.remaining}
}

function pair(str, key, valueParser) {
  const valueParserResult = valueParser(str)
  const result = {[key]: valueParserResult.result}
  _.each(result, (value, key) => variable(key, value))
  return {result, remaining: valueParserResult.remaining}
}

function merge(str, parsers) {
  const trimNewLine = remaining => _.trimStart(remaining, "\r\n")
  return sequence(str, parsers, _.assign, {}, trimNewLine)
}

function variable(name, value) {
  console.error("variable", name, value)
  if (_.isUndefined(value)) return variable[name]
  else return variable[name] = value
}

function sequence(str, parsers, resultReducer, initialResult, remainingHandler) {
  return _.reduce(parsers, (sequenceParserResult, parser) => {
    const parserResult = parser(sequenceParserResult.remaining)
    const updatedResult = resultReducer(sequenceParserResult.result, parserResult.result)
    const updatedRemaining = remainingHandler(parserResult.remaining)
    return {result: updatedResult, remaining: updatedRemaining}
  }, {result: initialResult, remaining: str})
}