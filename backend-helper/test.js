const core = require("./build/Release/CarbonVideoBackendHelper");
const assert = require("assert");

// validateStorageKey()

assert(core.validateStorageKey("abc") === true);
assert(core.validateStorageKey("-") === true);
assert(core.validateStorageKey("abc_") === true);
assert(core.validateStorageKey("") === false);
assert(core.validateStorageKey() === false);
assert(core.validateStorageKey(null) === false);
assert(core.validateStorageKey(1) === false);

console.log("Pass: validateStorageKey()");

//validateExtName()

assert(core.validateExtName("abc") === true);
assert(core.validateExtName("-") === false);
assert(core.validateExtName("abc_") === false);
assert(core.validateExtName("") === false);
assert(core.validateExtName() === false);
assert(core.validateExtName(null) === false);
assert(core.validateExtName(1) === false);

console.log("Pass: validateExtName()");
