
const assert = require('assert')
const { FunctionEngine } = require('../dist/engine')
const http = require('http')
const fs = require('fs/promises')

describe('FunctionEngine', () => {

  const options = {
    filename: 'CloudFunction.test_name',
    timeout: 1000,
    // microtaskMode: 'afterEvaluate',
    contextCodeGeneration: {
      strings: false
    }
  }

  it('constructor()', async () => {
    const engine = new FunctionEngine(require)

    assert.ok(engine)
  })

  it('run() should be ok', async () => {
    const engine = new FunctionEngine(require)
    
    const code = `
      exports.main = async function(ctx) {
        console.log('hi test log')
        return 123
      }
    `

    const res = await engine.run(code, {}, options)
    
    assert.strictEqual(res.data, 123)
    assert.ok(res.logs[0].indexOf('hi test log') > 0)
    assert.ok(res.time_usage > 0)
  })

  it('run() with synchronous main() should be ok', async () => {
    const engine = new FunctionEngine(require)
    
    const code = `
      exports.main = function(ctx) {
        return 123
      }
    `

    const res = await engine.run(code, {}, options)
    
    assert.strictEqual(res.data, 123)
    assert.ok(res.time_usage > 0)
  })

  it('run() with error code should be ok', async () => {
    const engine = new FunctionEngine(require)
    
    const code = `
      exports.main = async function(ctx) {
        error code
        return 123
      }
    `
    const res = await engine.run(code, {}, options)

    assert.strictEqual(res.data, undefined)
    assert.ok(res.error instanceof Error)
    assert.strictEqual(res.error.message, 'Unexpected identifier')
    assert.ok(res.logs.length)
  })

  it('run() with timeout should be ok', async () => {
    const engine = new FunctionEngine(require)
    
    const code = `
      exports.main = async function(ctx) {
        while(true) {}
      }
    `
    const res = await engine.run(code, {}, options)

    assert.ok(res.error)
    assert.strictEqual(res.error.code, 'ERR_SCRIPT_EXECUTION_TIMEOUT')
    assert.ok(res.time_usage > 1000)
  })

  // it('run() with async timeout & microtaskMode === "afterEvaluate" should be ok', async () => {
  //   // 如果不设置 microtaskMode: 'afterEvaluate' 这种情况当前会让程序陷入黑洞，尚无办法处理
  //   const engine = new FunctionEngine(require)
    
  //   const code = `
  //     exports.main = async function(ctx) {
  //       Promise.resolve().then(() => { while(true) { }})
  //       return 123
  //     }
  //   `
  //   const res = await engine.run(code, {}, options)

  //   assert.ok(res.error)
  //   assert.strictEqual(res.error.code, 'ERR_SCRIPT_EXECUTION_TIMEOUT')
  //   assert.ok(res.time_usage > 1000)
  // })

  it('run() with timeout & microtaskMode === "afterEvaluate" should be ok', async () => {
    const engine = new FunctionEngine(require)
    
    const code = `
      exports.main = async function(ctx) {
        return 123
      }
    `
    const res = await engine.run(code, {}, options)

    assert.strictEqual(res.data, 123)
  })

  it('run() with eval() should be ok', async () => {
    const engine = new FunctionEngine(require)
    
    const code = `
      exports.main = async function(ctx) {
        const r = eval('1234')
        return r
      }
    `
    const res = await engine.run(code, {}, options)

    assert.strictEqual(res.error.name, 'EvalError')
    assert.strictEqual(res.error.message, 'Code generation from strings disallowed for this context')
  })

  // it('run() debug', async () => {
  //   // 如果设置 microtaskMode: 'afterEvaluate', 异步 Io 会让程序陷入黑洞
  //   const engine = new FunctionEngine(require)
    
  //   const code = `
  //     const http = require('http')
  //     const fs = require('fs/promises')

  //     exports.main = async function(ctx) {
  //       await fs.readFile('test')
    
  //       return 123
  //     }
  //   `
  //   const res = await engine.run(code, {}, options)
  //   console.log(res)

  // })

})