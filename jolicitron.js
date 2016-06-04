"use strict"

const _ = require("lodash")
const {int, array, object, merged} = require("./parsers")
const {hash, queue} = require("./memory")

module.exports = {build}

function build(builder) {
  const {enqueue, dequeue} = queue()
  const {get, set} = hash()
  const n = feed(keyArrayPair, dequeue)
  n.usingName = (name, ...args) => feed(keyArrayPair, get(name))(...args)
  const save = extract(int(), enqueue)
  save.usingName = name => extract(int(), set(name), enqueue)
  return fromKeysOrParsers(builder(save, n))
}

function keyArrayPair(length, storageKey, options, ...keysOrParsers) {
  if (!_.isObjectLike(options)) {
    if (options || keysOrParsers.length > 0) keysOrParsers.unshift(options)
    options = {indices: false}
  }
  return object([storageKey], array(length, fromKeysOrParsers(keysOrParsers), options))
}

function fromKeysOrParsers(keysOrParsers) {
  if (keysOrParsers.length === 0) return int()
  else return merged(_.map(keysOrParsers, fromKeyOrParser))
}

function fromKeyOrParser(keyOrParser) {
  return _.isString(keyOrParser) ? fromKey(keyOrParser) : keyOrParser
}

function fromKey(key) {
  return object([key], int())
}

function feed(parserFactory, feeder) {
    return (...args) => str => parserFactory(feeder(), ...args)(str)
}

function extract(parser, ...extractors) {
  return str => _.tap(parser(str), ({parsedValue}) => _.each(extractors, extractor => extractor(parsedValue)))
}
