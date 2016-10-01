/*!
 * Vue.js v2.0.0-rc.6
 * (c) 2014-2016 Evan You
 * Released under the MIT License.  
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Vue = factory());
}(this, (function () { 'use strict';

/*  */

/**
 * Convert a value to a string that is actually rendered.
 */

// 将一个valeu 转化成一个字符串
function _toString (val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */

// 将一个值转化为数字

function toNumber (val) {
  var n = parseFloat(val, 10)
  return (n || n === 0) ? n : val
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null)
  var list = str.split(',')
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
} // 返回一个函数，接受一个val 参数,如果map中有val对应的属性，返回true

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true) // 可以使用内建的标签，<slot> , <component>

/**
 * Remove an item from an array
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Check if value is primitive
 */
function isPrimitive (value) {
  return typeof value === 'string' || typeof value === 'number'
}

/**
 * Create a cached version of a pure function.
 */

// 为每一个函数创建一个缓存运算值的函数，返回的函数都有一个对应的cache对象，保存之前运算过的值
function cached (fn) {
  var cache = Object.create(null)
  return function cachedFn (str) {
    var hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

/**
 * Camelize a hyphen-delmited string.   //  连字符格式 转换为 驼峰式
 */
var camelizeRE = /-(\w)/g
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })  //  replace ?
  // 有多个捕获组的情况下，第一个参数是模式的匹配项，第二个参数是第一个捕获组的匹配项，依次类推，所有这里的 c 指的是第一个匹配项
})

/**
 * Capitalize a string.  // 首字母大写
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * Hyphenate a camelCase string.  将驼峰式转换为连字符格式
 */
var hyphenateRE = /([^-])([A-Z])/g
var hyphenate = cached(function (str) {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
}) 



/**
 * Simple bind, faster than native  //  重写原生的bind函数
 */
function bind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length
  return boundFn
}


/**
 * Convert an Array-like object to a real Array. // 将类数组对象转化为真正的对象
 */
function toArray (list, start) {
  start = start || 0
  var i = list.length - start
  var ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key]
  }
  return to  // 混合对象 
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'  // obj 可以是对象，数组  注意 typeof function() {}  === 'function'
}

// typeof null === 'object' ，so first obj !== null

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
var toString = Object.prototype.toString
var OBJECT_STRING = '[object Object]'
function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
} // 严格检查对象，排除 数组，set 等其他数据结构


/**
 * Merge an Array of Objects into a single Object.  // 将一个数组里的所有对象合并成一个对象
 */
function toObject (arr) {
  var res = {}
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}  

/**
 * Perform no operation.
 */
function noop () {}  // 一个什么都不做的函数

/**
 * Always return false.
 */
var no = function () { return false; } //   一个始终返回 false 的函数

/**
 * Generate a static keys string from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}  //  ？？？？

/*  */


// Vue.config and other   Vue.config的选项

var config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),  //  合并策略，主要用于mixin时的冲突并

  /**
   * Whether to suppress warnings.
   */
  silent: false,  // 默认提示错误信息

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',  // ?

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,  // 提供给watcher的错误处理函数

  /**
   * Ignore certain custom elements
   */
  ignoredElements: null,  // ?

  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),  //  键码快捷键

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,  // 是否是 Reserved 标签

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no, // 是否是未知函数

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,  // 元素的命名空间

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,  // 某个属性是否

  /**
   * List of asset types that a component can own.  ?
   */
  _assetTypes: [
    'component',
    'directive',
    'filter'
  ],

  /**
   * List of lifecycle hooks.  生命周期钩子函数
   */
  _lifecycleHooks: [
    'beforeCreate', // 替换了 init
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated'
  ],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
  _maxUpdateCount: 100,  // 最大scheduler数量

  /**
   * Server rendering?
   */
  _isServer: "client" === 'server' // 是否服务端渲染
}

/*  */

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {   // 属性名是否以 $ 或 _开头
  var c = (str + '').charCodeAt(0)  // charCodeAt
  return c === 0x24 || c === 0x5F  
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
} // 配置某个对象的某个属性，可配置的是value 和 enumerable(默认是false 不可枚举) 

/**
 * Parse simple path.  解析一个路径
 */
var bailRE = /[^\w\.\$]/  
/*
 * 如果 path = 'a.b.c'
 * obj = {
 * 	`a: {
 * 	 	b: {
 * 	 		c: 
 * 	 	}
 * 	}
 * }
 */ 
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  } else {
    var segments = path.split('.')
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) return
        obj = obj[segments[i]]
      }
      return obj
    }
  }  // 解析路径
}

/*  */

/* global MutationObserver */  // 变动观察器
// can we use __proto__?
var hasProto = '__proto__' in {}  // 是否支持 __proto__ 属性

// Browser environment sniffing  浏览器嗅探技术
var inBrowser =
  typeof window !== 'undefined' &&
  Object.prototype.toString.call(window) !== '[object Object]'  // window存在且是一个plainObject

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__  // 是否安装了 vuetools

// UA sniffing for working around browser-specific quirks
// 浏览器检测

var UA = inBrowser && window.navigator.userAgent.toLowerCase()

// ios检测 移动端？ iphone ipad ipod ios
var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA)
var iosVersionMatch = UA && isIos && UA.match(/os ([\d_]+)/)
var iosVersion = iosVersionMatch && iosVersionMatch[1].split('_')

// MutationObserver is unreliable in iOS 9.3 UIWebView
// detecting it by checking presence of IndexedDB
// ref #3027

var hasMutationObserverBug =
  iosVersion &&
  Number(iosVersion[0]) >= 9 &&
  Number(iosVersion[1]) >= 3 &&
  !window.indexedDB

/*******************************************************************************************************************************
 * Defer a task to execute it asynchronously(异步). Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */
var nextTick = (function () {
  var callbacks = [] 
  var pending = false  // pending的作用
  var timerFunc
  function nextTickHandler () {
    pending = false
    var copies = callbacks.slice(0)
    callbacks = []
    for (var i = 0; i < copies.length; i++) {
      copies[i]() 
    }
  } 

  /* istanbul ignore else */
  if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
    var counter = 1
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = function () {
      counter = (counter + 1) % 2
      textNode.data = String(counter)
    }
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    var context = inBrowser
      ? window
      : typeof global !== 'undefined' ? global : {}
    timerFunc = context.setImmediate || setTimeout
  }
  return function (cb, ctx) {
    var func = ctx
      ? function () { cb.call(ctx) }
      : cb
    callbacks.push(func)
    if (pending) return
    pending = true
    timerFunc(nextTickHandler, 0)
  }
})()

// ***************************************************************************************************************************


// 如果支持Set就使用Set，否则就创建一个Set

var _Set
/* istanbul ignore if */
if (typeof Set !== 'undefined' && /native code/.test(Set.toString())) {
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = (function () {  // set的数据结构此时是个对象，和ES6的Set不同
    function Set () {
      this.set = Object.create(null)
    }
    Set.prototype.has = function has (key) {
      return this.set[key] !== undefined
    };
    Set.prototype.add = function add (key) {  // 只是增加一个键，值设为1
      this.set[key] = 1
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null)
    };

    return Set;
  }())
}

/* not type checking this file because flow doesn't play well with Proxy */

var hasProxy;
var proxyHandlers;
var initProxy;
if ("development" !== 'production') {
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  )

  // 是否支持 proxy
  
  hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/)

  proxyHandlers = {
    has: function has (target, key) {
      var has = key in target
      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_'
      if (!has && !isAllowed) {
        warn(
          "Property or method \"" + key + "\" is not defined on the instance but " +
          "referenced during render. Make sure to declare reactive data " +
          "properties in the data option.",
          target
        )
      }
      return has || !isAllowed
    }
  }


  // 
  initProxy = function initProxy (vm) {
    if (hasProxy) {
      vm._renderProxy = new Proxy(vm, proxyHandlers) // 
    } else {
      vm._renderProxy = vm // 如果没有 什么都不做
    }
  }
}

/*  */

// ****************************************************************************************************************
var uid$2 = 0  // 


/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
// 
var Dep = function Dep () {
  this.id = uid$2++  // 每个dep实例都有一个不同的uid
  this.subs = []  //  都有一个数组储存 subs ,subs数组里的元素是 watcher实例。
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub)
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub)
};

Dep.prototype.depend = function depend () { // dep.target?
  if (Dep.target) {  // Dep的targe若存在
    Dep.target.addDep(this) // Dep.target有一个addDep方法，添加该实例,Dep.target 指向的是一个watcher实例，这个watcher实例增加这个dep
  }
};

Dep.prototype.notify = function notify () {
  // stablize the subscriber list first
  var subs = this.subs.slice() 
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()  // subs里的元素是watcher实例，调用每个watcher实例上的update方法。
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.  任何时候只能计算一次watcher

Dep.target = null // 一个watcher实例
var targetStack = []  // 储存watcher

function pushTarget (_target) {
  if (Dep.target) targetStack.push(Dep.target)  // 如果有新的值，就把当前值推入一个targetStack，并把参数赋值给Dep.target
  Dep.target = _target
}

function popTarget () {
  Dep.target = targetStack.pop() // 出栈
}

// ****************************************************************************************************************

/*  */

//  scheduler 的初始状态

var queue = []  // 储存watcher,
var has = {}    // 作用？
var circular = {}
var waiting = false
var flushing = false
var index = 0  // 只是数组的索引

/**
 * Reset the scheduler's state.  重置调度程序的状态
 */

// 重置调度程序状态

function resetSchedulerState () {
  queue.length = 0
  has = {}
  if ("development" !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  flushing = true

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; }) // queue 是一个数组，watcher实例有id属性
  // 按id从大到小排序，也就是后创建的在前，先创建的在后

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    var watcher = queue[index]  //  queue的数组元素是watcher
    var id = watcher.id    // 读取watch的id 属性
    has[id] = null  // ?
    watcher.run()   //  执行实例的run方法 ？

    // in dev build, check and stop circular updates.
    // ？？？？？？？
    if ("development" !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > config._maxUpdateCount /* 100 */) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }

  resetSchedulerState()  //  flush完后，重置状态
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id
  if (has[id] == null) { //  undefined == null >-true    undefined === null >- false
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1
      while (i >= 0 && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}
// ***********************************************************************************************************************
/*  */

var uid$1 = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,  // 监视一个vm 实例
  expOrFn, // 函数或者一个表达式
  cb, //  一个回调函数
  options // 其他选项
) {
  if ( options === void 0 ) options = {}; // options 默认值是一个空对象

  this.vm = vm  
  vm._watchers.push(this)  // vm的__watchers 是一个数组，储存watch这个vm的watcher实例
  // options
  
  this.deep = !!options.deep  
  this.user = !!options.user  // ?
  this.lazy = !!options.lazy  // ? 懒加载
  this.sync = !!options.sync  // ? 异步

  this.expression = expOrFn.toString()  // 如果是函数会返回一个函数表达式
  this.cb = cb   
  this.id = ++uid$1 // uid for batching,  给每个watcher也设置一个不同的id
  this.active = true  // 作用 ?
  this.dirty = this.lazy // for lazy watchers
  
  this.deps = []  //  
  this.newDeps = []  // ?
  this.depIds = new _Set() // ? 
  this.newDepIds = new _Set() // ?
  
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn   //  如果传入的exp是一个函数，该函数直接赋值给getter
  } else {
    this.getter = parsePath(expOrFn) // 否则解析
    if (!this.getter) {  // 如果getter函数不存在，则报错
      this.getter = function () {}
      "development" !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      )
    }
  }
  this.value = this.lazy  //  如果是懒(惰性)求值，该值暂时设为undefined，如果不是直接调用get函数求值
    ? undefined
    : this.get() // 
};

/**
 * Evaluate the getter, and re-collect dependencies.  // 重新收集依赖关系
 * 
 */
Watcher.prototype.get = function get () {
  pushTarget(this)  // 将之前的Dep.target 指向的watcher 推入栈中，并设置Dep.target为此 watcher实例
  // 初始化一个watcher实例（如果this.lazy为false）调用了get函数之后，Dep.target函数也将改变，变成当前的watcher实例
  var value = this.getter.call(this.vm, this.vm)  // this.vm作为参数传入getter函数
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) { // this.deep表示什么 监听对象内部值的变化
    traverse(value)  
  }
  popTarget() // ?
  this.cleanupDeps()
  return value
};

/**
 * Add a dependency to this directive.   为这个指令添加 一个依赖(一个dep实例)
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id  // 要添加的dep实例id
  if (!this.newDepIds.has(id)) {  //  如果newDepIds之前不存在
    this.newDepIds.add(id) // 就把id添加进去
    this.newDeps.push(dep) // 添加dep实例
    if (!this.depIds.has(id)) { // 如果depIds没有
      dep.addSub(this)   //  dep的subs里添加该watcher实例d
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
  var this$1 = this; 

  var i = this.deps.length
  while (i--) {
    var dep = this$1.deps[i]
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1)
    }
  }
  var tmp = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()
  tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = tmp
  this.newDeps.length = 0
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get()
      if (
        value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value
      this.value = value
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          "development" !== 'production' && warn(
            ("Error in watcher \"" + (this.expression) + "\""),
            this.vm
          )
          /* istanbul ignore else */
          if (config.errorHandler) {
            config.errorHandler.call(null, e, this.vm)
          } else {
            throw e
          }
        }
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get()
  this.dirty = false
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  var i = this.deps.length
  while (i--) {
    this$1.deps[i].depend()
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */
Watcher.prototype.teardown = function teardown () {
    var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed or is performing a v-for
    // re-render (the watcher list is then filtered by v-for).
    if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
      remove(this.vm._watchers, this)
    }
    var i = this.deps.length
    while (i--) {
      this$1.deps[i].removeSub(this$1)
    }
    this.active = false
  }
};
// **************************************************************************************************************************
/**
 * Recursively 递归 traverse 遍历 an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
var seenObjects = new _Set() 
function traverse (val, seen) { 
  var i, keys
  if (!seen) {
    seen = seenObjects
    seen.clear() // 初始化seen为一个set
  }
  var isA = Array.isArray(val)
  var isO = isObject(val)
  if ((isA || isO) && Object.isExtensible(val)) {
    if (val.__ob__) { 
      var depId = val.__ob__.dep.id
      if (seen.has(depId)) {
        return
      } else {
        seen.add(depId)  // 
      }
    }
    if (isA) {
      i = val.length
      while (i--) traverse(val[i], seen)
    } else if (isO) {
      keys = Object.keys(val)
      i = keys.length
      while (i--) traverse(val[keys[i]], seen)
    }
  }
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype
var arrayMethods = Object.create(arrayProto) // 新对象，原型是 Array.protorype

/**
 * Intercept 拦截 mutating methods and emit events  拦截数组的变异方法 并且 emit events 
 * 这段代码的作用是定义arrayMethods上的属性和属性值
 */
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method]  // 缓存 原始方法 
  def(arrayMethods, method, function mutator () {   // 分别对应 obj key value，enum
    // arrayMethods[method] = mutator
    var arguments$1 = arguments;  // 缓存 传入的参数 ,同样是个类数组

    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length
    var args = new Array(i)  // 
    while (i--) {
      args[i] = arguments$1[i]
    }
    // 传入的参数保存在了一个真正的数组里
    
    var result = original.apply(this, args)  // 调用原始方法，得到原值
    var ob = this.__ob__  //  this指向调用这个函数的对象
    var inserted  // 新加入的数组
    switch (method) {
      case 'push':
        inserted = args  // 
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted) //  ob.observeArray()
    // notify change
    ob.dep.notify()
    return result
  })
})

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods)  // 一个数组，元素是array的各个方法

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true,
  isSettingProps: false
}

/**
 * Observer class that are attached to each observed   // 将一个对象变为observerable
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 * 初始化一个实例后，将自动value,dep，vmCount属性
 */
var Observer = function Observer (value) {
  this.value = value
  this.dep = new Dep() // 初始化一个Observer实例的同时也初始化一个dep实例,用于缓存watcher实例
  this.vmCount = 0  // ?
  def(value, '__ob__', this) // 给传入的对象设置一个__ob__属性，指向这个observer实例
  if (Array.isArray(value)) {  //  如果value是一个数组
    var augment = hasProto  // 如果hasProto为true，即支持__proto__属性
      ? protoAugment  // (target,src)  将target的原型指向src  target.__proto__ = src
      : copyAugment   // (target,src,keys)  // target[key] = src[key] 默认不可枚举
    augment(value, arrayMethods, arrayKeys)  //  将传入的数据对象的原型设置为arrayMethods,这样的话在
    //value数组上调用数组方法时将绕过原生的数组方法，而使用之前 修改过的方法
    this.observeArray(value)  //  observe数组的每一项
  } else {
    this.walk(value) // 如果value是一个对象，将对象上的每一个属性都设置成响应式的
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj) 
  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], obj[keys[i]]) // 把obj上的所有属性都变成响应式的 
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i])  //  为数组中的每一个元素都创建一个observer。
  }
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * istanbul ignore next
 */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i]
    def(target, key, src[key]) //  target[key] = src[key]
  }
}

/**
 * Attempt to create an observer instance for a value,  为每一个data数据对象产生一个对应的Observer
 * returns the new observer if successfully observed,  返回一个新的observer
 * or the existing observer if the value already has one.  如果已经创建了，返回已经创建的observer
 */
function observe (value) {
  if (!isObject(value)) {  //  如果value不是一个对象，即原始值，则返回，什么都不做
    return
  }
  var ob  
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {  //  value的__ob__属性指向一个Observer实例，说明已经给
    // 这个对象创建过一个observer，那么就直接返回这个observer
    ob = value.__ob__  // 
  } else if (
    observerState.shouldConvert &&  // 是否需要convert to a reactive property
    !config._isServer &&  // 不是服务器端渲染
    (Array.isArray(value) || isPlainObject(value)) && // value是一个数组或者是一个对象{}
    Object.isExtensible(value) && // value必须是可拓展的（可以向对象添加属性）
    !value._isVue // ??
  ) {
    ob = new Observer(value)  // 生成一个vm的data所对应的observer,value上会增加一个__ob__属性，指向observer实例
  }
  return ob //  如果value.__ob__已经指向了一个Observer实例，那么返回这个实例，如果没有指向一个实例，先检查上面条件是否全部满足，如果满足，
            // 创建value的observer实例，否则返回 undefined
}

/**
 * Define a reactive property on an Object.  将对象的某个属性变成响应式
 */
function defineReactive (
  obj,  //  对象
  key,  //  属性
  val,  //  值
  customSetter  // setter
) {
  var dep = new Dep()   // 一个新的dep实例

  var property = Object.getOwnPropertyDescriptor(obj, key)  // 获得指定对象的指定属性的属性描述符
  if (property && property.configurable === false) {
    return
  }  // 如果不可配置，返回，什么都不做

  // cater for pre-defined getter/setters  
  var getter = property && property.get
  var setter = property && property.set
  /**
   * childOb: {
   *   value: val,
   *   dep: new Dep(),
   *   vmCount: 0
   * }
   **/
  var childOb = observe(val)  //  返回val对应的一个observer实例

  Object.defineProperty(obj, key, {  //  重新设置key的属性描述符
    enumerable: true,
    configurable: true,
    
    //  重新定义getter和setter
    
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val
      if (Dep.target) {  // 
        dep.depend()  // Dep.target.adddep(this)，添加依赖
        if (childOb) {
          childOb.dep.depend()  
        }
        if (Array.isArray(value)) {
          for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i]  // 遍历 value 数组
            e && e.__ob__ && e.__ob__.dep.depend()
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) { // 传入一个新值，newVal
      var value = getter ? getter.call(obj) : val
      if (newVal === value) {  // 没有变化，什么都不做
        return
      }
      if ("development" !== 'production' && customSetter) {
        customSetter()  // 如果有customSetter先执行
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = observe(newVal)  // 
      dep.notify()
    }
  })
}
//********************** **************************************************************************************************
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (obj, key, val) {
  if (Array.isArray(obj)) {   // 如果obj是一个数组，key应该是一个整数索引
    obj.splice(key, 1, val)
    return val  // 返回val
  }
  if (hasOwn(obj, key)) {
    obj[key] = val
    return
  }
  var ob = obj.__ob__  // 指向obj对应的observer
  if (obj._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return
  }
  if (!ob) {  // 不存在ob属性，对象还没有observe
    obj[key] = val
    return
  }
  defineReactive(ob.value, key, val)  // 要添加的key变成响应式
  ob.dep.notify() // ob.dep.notify() 通知更新
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (obj, key) {
  var ob = obj.__ob__
  if (obj._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}
//*****************************************************************************************************************************
/*
 * 初始化state
 * 包括 props, data, computed, methods, watch
 * 同时vm添加一个_watchers的内部属性
 */

function initState (vm) {
  vm._watchers = []
  initProps(vm)
  initData(vm)
  initComputed(vm) // ?
  initMethods(vm)
  initWatch(vm)
}

/*
 * 初始化props
 */
function initProps (vm) {   
  var props = vm.$options.props   】
  var propsData = vm.$options.propsData
  if (props) {

    var keys = vm.$options._propKeys = Object.keys(props) // 获得props的所有属性数组，同时vm.$options上增加一个_propKeys属性
    var isRoot = !vm.$parent

    // root instance props should be converted
    // 根实例上的props应该全部转化为响应式的
    observerState.shouldConvert = isRoot 
    var loop = function ( i ) {
      var key = keys[i] 
      /* istanbul ignore else */  // ？
      if ("development" !== 'production') {
        //  props对应的每一个key都变成了vm上响应式的直接属性，同时验证这些key值，返回一个value(如果有效的话)，并且提供一个自定义的setter
        //  
        defineReactive(vm, key, validateProp(key, props, propsData, vm), function () {  // 对象  属性 值 自定义的setter
          //  key是props对象的key，validateProp返回一个value
          if (vm.$parent && !observerState.isSettingProps) {
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            )
          }
        })
      } else {}
    };
    // 遍历props属性数组，将props上的每一个属性都变成响应式的
    for (var i = 0; i < keys.length; i++) loop( i );
    observerState.shouldConvert = true
  }
}

/*
 * 初始化data
 * data如果是一个函数，执行这个函数，返回一个data对象
 * 函数的作用
 * 1. props中有的属性，data中就不能再出现了
 * 2. 使用proxy函数处理vm
 *    也就是 data中的每一个属性都变成了vm的属性，同时在set和get vm[key]是，操作都是在vm._data上进行的
 *    vm._data来自初始化定义的data
 *    这也就解释了后来添加到data上的属性不能变成响应式的
 */
function initData (vm) {
  var data = vm.$options.data
  data = vm._data = typeof data === 'function'  // vm增加一个直接属性_data，注意，不是在vm.$options上添加
    ? data.call(vm)   // 执行data这个函数，返回一个对象
    : data || {}  // 如果不是函数，data为vm.$options.data,如果不存在，默认设置为一个空对象{}
  if (!isPlainObject(data)) {  // 函数必须返回一个对象
    data = {}
    "development" !== 'production' && warn(
      'data functions should return an object.',
      vm
    )
  }
  // 得到data对象后，开始对它处理
  // proxy data on instance
  var keys = Object.keys(data)  // 获得data的属性数组
  var props = vm.$options.props  // 获得props
  var i = keys.length 
  while (i--) {
    if (props && hasOwn(props, keys[i])) {  // props中有的就不要再放在data中了
      "development" !== 'production' && warn(
        "The data property \"" + (keys[i]) + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      )
    } else {
      proxy(vm, keys[i])  
      // 
    }
  }
  // observe data
  observe(data) // 
  data.__ob__ && data.__ob__.vmCount++ // 
}

var computedSharedDefinition = { // 属性修饰符
  enumerable: true,
  configurable: true,
  get: noop, 
  set: noop
}

/*
 * 初始化计算属性
 * 计算属性的核心是添加依赖(dep)关系
 * 
 */

function initComputed (vm) {
  var computed = vm.$options.computed
  if (computed) {  
    for (var key in computed) { // 遍历computed对象
      var userDef = computed[key]  
      // usrtDef可以是对象，也可以是个函数，如果是个对象，对象中应该有 get 和 set 函数
      
      if (typeof userDef === 'function') { // 如果是函数
        computedSharedDefinition.get = makeComputedGetter(userDef, vm)   //??????
        computedSharedDefinition.set = noop
      } else {
        computedSharedDefinition.get = userDef.get  // 如果是个对象，先检查有没有get属性，
          ? userDef.cache !== false  // 如果有，检查cache 属性是否为true
            ? makeComputedGetter(userDef.get, vm) // cache为true,使用这种方法绑定 
            : bind(userDef.get, vm) // 否则使用这种方式绑定
          : noop //如果get属性不存在，空函数，什么都不做
        computedSharedDefinition.set = userDef.set //  set属性如果存在，绑定之
          ? bind(userDef.set, vm)
          : noop // 否则什么都不做
      }
      Object.defineProperty(vm, key, computedSharedDefinition) // 同样，计算属性变成vm的直接属性
    }
  }
}

function makeComputedGetter (getter, owner) {  //  useDef:function  
  // watcher.vm = owner  watcher.getter = getter
  
  var watcher = new Watcher(owner, getter, noop, {
    lazy: true  //  默认是true
  }) // 因此watcher.dirty = watcher.lazy = true

  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate() // watcher执行evaluate方法，watcher.value = watcher.get() , watcher.dirty = false
    }
    if (Dep.target) {  // 如果执行了之前的watcher.get(),Dep.target 还是等于原来的Dep.target
      watcher.depend() // watcher的deps 每一项执行depend方法
    }
    return watcher.value // 返回watcher.value
  }
}
/*
 * 将methods中定义的方法绑定到vm上
 */
function initMethods (vm) { 
  var methods = vm.$options.methods  
  if (methods) { 
    for (var key in methods) {  
      if (methods[key] != null) {  
        vm[key] = bind(methods[key], vm)  
      } else if ("development" !== 'production') {
        warn(("Method \"" + key + "\" is undefined in options."), vm)
      }
    }
  }
}

/*
 * 监视对象 一个对象，键是观察表达式，值是对应回调。
 * 值也可以是方法名，或者是对象，包含选项。在实例化时为每个键调用 $watch() 。
 * 如果是字符串，那就是方法名
 * 如果是对象，对象包括handler属性和deep属性
 */
function initWatch (vm) {  // 初始化watch
  var watch = vm.$options.watch  
  
  if (watch) {
    for (var key in watch) {
      var handler = watch[key]  //  这里handler可能是对象，字符串，或是方法名
      if (Array.isArray(handler)) {  // 如果是数组,遍历每一项
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i])  // 分别对应实例，属性名，处理函数，每一项都执行createWatcher方法
        }
      } else {
        createWatcher(vm, key, handler)  // 如果不是，直接createWatcher
      }
    }
  }
}

/*
 * 产生一个watcher
 * 函数的作用是
 * 如果传入的handler是一个对象，里面应该有一个handler属性
 * 如果handler是一个对象字符串形式，那么在vm中去找，应该是在methods中定义过的函数
 * 
 */
function createWatcher (vm, key, handler) {  // 产生一个watcher
  var options
  if (isPlainObject(handler)) {  // 如果handler是对象
    options = handler  
    handler = handler.handler  //  那么handler对象里必须要有handler属性
  }
  if (typeof handler === 'string') {  
    handler = vm[handler]  
  }
  vm.$watch(key, handler, options)  // 调用vm.$watch方法
}

function stateMixin (Vue) {   
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {}
  dataDef.get = function () {
    return this._data
  }
  if ("development" !== 'production') {
    dataDef.set = function (newData) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)  // ******

  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn,  //  key
    cb,  // handler
    options  //  options (可以有 deep和immediate 两个属性)
  ) {
    var vm = this  
    options = options || {}
    options.user = true  //  增加一个user属性 干嘛用的？
    var watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {  //  options的immediate属性
      cb.call(vm, watcher.value)  // 原handler
    }
    return function unwatchFn () {  //  返回一个取消监听函数
      watcher.teardown()
    }
  }
}
/*
 * 函数两个作用
 * 1. 把key直接定义在了vm上
 * 2. get和set都是在vm._data上操作，而_data只能记录初始化时的data,而不管data之后怎么更新
 */
function proxy (vm, key) {
  if (!isReserved(key)) {  //  key不是以 $或者_开头
    Object.defineProperty(vm, key, {  
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return vm._data[key]  // 从vm._data中取值
      },
      set: function proxySetter (val) {
        vm._data[key] = val  // 在vm._data中设置值
      }
    })
  }
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  ns,  //  命名空间  namespace
  context,
  componentOptions
) {
  this.tag = tag
  this.data = data
  this.children = children 
  this.text = text
  this.elm = elm
  this.ns = ns
  this.context = context
  this.key = data && data.key 
  this.componentOptions = componentOptions
  this.child = undefined
  this.parent = undefined 

  this.raw = false
  this.isStatic = false
  this.isRootInsert = true
  this.isComment = false
  this.isCloned = false
  // apply construct hook.
  // this is applied during render, before patch happens.
  // unlike other hooks, this is applied on both client and server.
  var constructHook = data && data.hook && data.hook.construct  // data还有一个hook属性，hook还有一个construct属性？
  if (constructHook) {
    constructHook(this)
  }
};

var emptyVNode = function () {
  var node = new VNode()
  node.text = ''
  node.isComment = true
  return node
} 

// optimized shallow clone  优化浅复制
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.  //  elm reference ? 
function cloneVNode (vnode) { // 传入要复制的vnode结点
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.ns,
    vnode.context,
    vnode.componentOptions
  )
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isCloned = true  //  标志 这是一个复制的结点
  return cloned
}

function cloneVNodes (vnodes) {  //  批量复制
  var res = new Array(vnodes.length)
  for (var i = 0; i < vnodes.length; i++) {
    res[i] = cloneVNode(vnodes[i])
  }
  return res  // 返回一个结点数组
}

/*
 * 函数的作用
 * 
 * 返回一个子组件数组
 */

function normalizeChildren (  //   标准化子组件，
  children,  
  ns,
  nestedIndex  //  嵌套层次
) {
  if (isPrimitive(children)) {  //  如果传入的children是一个原始值
    return [createTextVNode(children)] // 返回一个数组，数组元素是一个文本结点
  }
  if (Array.isArray(children)) {  // 如果是一个数组
    var res = []  // 要返回的结果
    for (var i = 0, l = children.length; i < l; i++) {
      var c = children[i]
      var last = res[res.length - 1]  //  每一次遍历，last都指向最后一个元素
      //  nested
      if (Array.isArray(c)) {  // 如果还是一个数组
        res.push.apply(res, normalizeChildren(c, ns, i))
      } else if (isPrimitive(c)) {  //  如果c是原始值
        if (last && last.text) {  // 如果最后一个元素存在，而且最后一个元素的text存在，那么直接加上
          last.text += String(c)
        } else if (c !== '') { // 如果最后一个元素不存在
          // convert primitive to vnode
          res.push(createTextVNode(c)) // 新建一个文本结点
        }
      } else if (c instanceof VNode) {  //  如果c是一个vnode结点
        if (c.text && last && last.text) {
          last.text += c.text
        } else {
          // inherit parent namespace
          if (ns) {
            applyNS(c, ns)
          }
          // default key for nested array children (likely generated by v-for)
          if (c.key == null && nestedIndex != null) {
            c.key = "__vlist_" + nestedIndex + "_" + i + "__"
          }
          res.push(c)
        }
      }
    }
    return res
  }
}

function createTextVNode (val) {  //  产生一个文本结点
  return new VNode(undefined, undefined, undefined, String(val))
}

function applyNS (vnode, ns) {  // 对该组件和该组件的所有子组件都设置ns,当然如果之前存在ns 就不用设置了，直接返回
  if (vnode.tag && !vnode.ns) {
    vnode.ns = ns
    if (vnode.children) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        applyNS(vnode.children[i], ns)
      }
    }
  }
}

function getFirstComponentChild (children) {  // 第一个组件类型的子元素，是不是组件类型，是检查是否有compoOptions选项
  return children && children.filter(function (c) { return c && c.componentOptions; })[0]
}
/**
 * def = {
 *   key: hook ,
 *   __injected: {
 *       key: Boolean
 *     }
 * }
 * 有点类似装饰者模式，如果之前有hook函数，把返回一个新的hook函数，这个新hook函数先执行之前的hook函数，再执行传入的hook函数
 * 这里还需要判断之前是否已经注入过，判断依据是 传入的def的对象的__injected属性值，如果和key的同名属性值为true，说明之前已经注入过
 */
function mergeVNodeHook (def, key, hook) {  
  var oldHook = def[key]   
  if (oldHook) {  //  如果之前存在
    var injectedHash = def.__injected || (def.__injected = {})  //  def是否有__injected属性，如果没有，默认为一个空对象
    if (!injectedHash[key]) {  // 如果之前没有inject过，那么injectedHash[key] 应该为false
      injectedHash[key] = true  // 把它设为true，表示已经injected
      def[key] = function () {  // 设置def[key]为一个函数，函数执行后，旧钩子先执行一遍，新钩子再执行一遍
        oldHook.apply(this, arguments)
        hook.apply(this, arguments)
      }
    }
  } else {
    def[key] = hook  // 如果之前不存在，直接赋值
  }
}

function updateListeners ( 
  on,  //  对象
  oldOn, // 同样一个对象
  add,  // 要增加的监听函数
  remove // 要移除的监听函数
) {
  /**
   * 
   */
  var name, cur, old, fn, event, capture
  for (name in on) {   // 遍历on里的全部属性
    cur = on[name]  //
    old = oldOn[name]
    if (!cur) {  //  如果属性值为undefined，报错
      "development" !== 'production' && warn(
        ("Handler for event \"" + name + "\" is undefined.")
      )
    } else if (!old) {  //  在on里存在 而在 oldOn里不存在
      capture = name.charAt(0) === '!' // 是否以 ! 开头
      event = capture ? name.slice(1) : name  // 如果name 不是以!开头，name直接赋值给event，否则，去掉!后再赋值给event
      if (Array.isArray(cur)) {  // cur 可以是数组，数组元素是函数
        add(event, (cur.invoker = arrInvoker(cur)), capture)  //  add？
      } else {  // old 存在
        if (!cur.invoker) {  // 如果 cur.invoker不存在
          fn = cur  
          cur = on[name] = {}
          cur.fn = fn
          cur.invoker = fnInvoker(cur)  
        }
        add(event, cur.invoker, capture)
      }
    } else if (cur !== old) {
      if (Array.isArray(old)) {
        old.length = cur.length
        for (var i = 0; i < old.length; i++) old[i] = cur[i]
        on[name] = old
      } else {
        old.fn = cur
        on[name] = old
      }
    }
  }
  for (name in oldOn) {
    if (!on[name]) {  // 如果oldOn中存在的属性on中没有，
      event = name.charAt(0) === '!' ? name.slice(1) : name
      remove(event, oldOn[name].invoker) // 移除event数组中的 oldOn[name].invoker
    }
  }
}

function arrInvoker (arr) {
  return function (ev) {
    var arguments$1 = arguments;  //  ev

    var single = arguments.length === 1 //  是否只传入了一个参数 Boolean
    for (var i = 0; i < arr.length; i++) {
      single ? arr[i](ev) : arr[i].apply(null, arguments$1) // arr是一个函数数组，依次执行里面的函数
      // 如果只传入一个参数，直接执行，否则，使用apply方法。
    }
  }
}
/**
 * o: {
 *   fn: function
 * }
 */
function fnInvoker (o) { // 传入一个对象，这个对象有fn属性，为一个函数
  return function (ev) {
    var single = arguments.length === 1
    single ? o.fn(ev) : o.fn.apply(null, arguments) // 执行o.fn
  }
}

/*  
 * 初始化生命周期相关的一些属性 包括 parent,children,root,refs
 * vm.$parent
 * vm.$root
 * vm.$children = []
 * vm.$refs = {}
 * 以及一些内部属性
 */

var activeInstance = null

function initLifecycle (vm) {  // 生命周期初始化，初始化一些属性
  var options = vm.$options  //  获得options

  // locate first non-abstract parent  // 找到第一个 non-abstract 父组件
  var parent = options.parent  //  对组件的父组件的引用
  if (parent && !options.abstract) {  // abstract ?  parent存在，且abstract属性为false
    while (parent.$options.abstract && parent.$parent) {  // 一旦碰到abstract为true,或者$parent不存在，循环终止
      parent = parent.$parent
    } 
    parent.$children.push(vm)
  } 

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm  

  vm.$children = []
  vm.$refs = {} 

  vm._watcher = null   
  vm._inactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
/**
 * 在Vue原型上定义一些生命周期相关方法
 * [_mount,_update,_updateFromParent,$forceUpdate,$destroy]
 */
function lifecycleMixin (Vue) {  

  Vue.prototype._mount = function (
    el, // 挂载到el元素上
    hydrating  // 混合？
  ) {
    var vm = this  // 指向一个Vue实例
    vm.$el = el //  设置$el属性
    if (!vm.$options.render) {  //  如果不存在render函数(如果存在，跳过)
      vm.$options.render = emptyVNode // render初始化为一个创建空结点的函数
      if ("development" !== 'production') {
        /* istanbul ignore if */
        if (vm.$options.template) {  //不存在render函数但存在temlate属性 报这个错
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'option is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          )
        } else { // 
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          )
        }
      }
    }
    callHook(vm, 'beforeMount')  // 执行beforeMount钩子函数
    vm._watcher = new Watcher(vm, function () {  // 初始化一个_watcher
      vm._update(vm._render(), hydrating)  // vm._render函数执行后，返回一个vnode结点
    }, noop) //  初始化 vm._watcher

    hydrating = false
    // root instance, call mounted on self
    // mounted is called for child components in its inserted hook // 子组件执行自己的钩子的函数
    if (vm.$root === vm) {  //  如果自己就是根实例，执行mounted钩子函数，将vm._isMounted变为true
      vm._isMounted = true
      callHook(vm, 'mounted')
    }
    return vm  // 返回vm实例
  }

  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')  // 如果已经mounted 执行beforeUpaated钩子函数
    }
    var prevEl = vm.$el  //  缓存当前的el
    var prevActiveInstance = activeInstance // 缓存之前的activeInstance
    activeInstance = vm // 将vm 赋值给当前的activeInstance 当前的vm就是activeInstance
    var prevVnode = vm._vnode  // 缓存之前的vm._vnode 
    vm._vnode = vnode // 此时vm._vnode 等于传入的vnode
    if (!prevVnode) {  // 如果之前不存在
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      // 如果之前不存在vnode，
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating)  // vm.__patch__ ?
    } else { // 如果存在
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    activeInstance = prevActiveInstance
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    if (vm._isMounted) {
      callHook(vm, 'updated')
    }
  }

  Vue.prototype._updateFromParent = function (
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    var vm = this
    var hasChildren = !!(vm.$options._renderChildren || renderChildren)
    vm.$options._parentVnode = parentVnode
    vm.$options._renderChildren = renderChildren

    // update props
    if (propsData && vm.$options.props) {
      observerState.shouldConvert = false
      if ("development" !== 'production') {
        observerState.isSettingProps = true
      }
      var propKeys = vm.$options._propKeys || [] // _propKeys就是传入的option.props
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i]
        vm[key] = validateProp(key, vm.$options.props, propsData, vm) // propKeys的每一项变成vm的属性
      }
      observerState.shouldConvert = true
      if ("development" !== 'production') {
        observerState.isSettingProps = false
      }
    }
    // update listeners
    if (listeners) {
      var oldListeners = vm.$options._parentListeners
      vm.$options._parentListeners = listeners
      vm._updateListeners(listeners, oldListeners)
    }
    // resolve slots + force update if has children
    if (hasChildren) {
      vm.$slots = resolveSlots(renderChildren)
      vm.$forceUpdate()
    }
  }

  Vue.prototype.$forceUpdate = function () {  //  强制更新
    var vm = this
    if (vm._watcher) {
      vm._watcher.update() // 调用update()方法
    }
  }

  Vue.prototype.$destroy = function () {
    var vm = this
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    var parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    var i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
  }
}
/*
 * 遍历钩子函数，依次执行
 * 同时vm.$emit方法触发钩子函数
 */
function callHook (vm, hook) {
  var handlers = vm.$options[hook]  //  在$options里找对应的hook属性，hook对应于$options里的属性
  if (handlers) { // 是个数组，遍历，依次执行
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm)
    }
  }
  vm.$emit('hook:' + hook) // 还要触发事件？事件名以 hook:开头来标识
}

/*  */

var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy }
var hooksToMerge = Object.keys(hooks) //  ['init','prepatch','insert','destroy']

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (!Ctor) {
    return
  }
  // Ctor如果是以对象的形式传入，包装成一个Sub构造函数
  if (isObject(Ctor)) {  
    Ctor = Vue.extend(Ctor) //  返回一个Sub构造函数
  }

  if (typeof Ctor !== 'function') { // 如果Ctor既不是一个对象，又不是一个函数，报错
    if ("development" !== 'production') {
      warn(("Invalid Component definition: " + (String(Ctor))), context)
    }
    return
  }

  // async component
  // Ctor.cid  Ctor.resolved ？
  if (!Ctor.cid) { 
    if (Ctor.resolved) {
      Ctor = Ctor.resolved
    } else {
      Ctor = resolveAsyncComponent(Ctor, function () {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered by the scheduler.
        context.$forceUpdate() // context is a vm?
      })
      if (!Ctor) {
        // return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
        return
      }
    }
  }

  data = data || {}

  // extract props
  var propsData = extractProps(data, Ctor)

  // functional component
  if (Ctor.options.functional) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on
  // replace with listeners with .native modifier
  data.on = data.nativeOn

  if (Ctor.options.abstract) {
    // abstract components do not keep anything
    // other than props & listeners
    data = {}
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data)

  // return a placeholder vnode
  var name = Ctor.options.name || tag
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }
  )
  return vnode
}

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  context,
  children
) {
  var props = {}
  var propOptions = Ctor.options.props
  if (propOptions) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData)
    }
  }
  return Ctor.options.render.call(
    null,
    context.$createElement,
    {
      props: props,
      data: data,
      parent: context,
      children: normalizeChildren(children),
      slots: function () { return resolveSlots(children); }
    }
  )
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent // activeInstance in lifecycle state
) {
  var vnodeComponentOptions = vnode.componentOptions
  var options = {
    _isComponent: true,
    parent: parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children
  }
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate
  if (inlineTemplate) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnodeComponentOptions.Ctor(options)
}

function init (vnode, hydrating) {
  if (!vnode.child || vnode.child._isDestroyed) {
    var child = vnode.child = createComponentInstanceForVnode(vnode, activeInstance)
    child.$mount(hydrating ? vnode.elm : undefined, hydrating)
  }
}

function prepatch (
  oldVnode,
  vnode
) {
  var options = vnode.componentOptions
  var child = vnode.child = oldVnode.child
  child._updateFromParent(
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  )
}

function insert (vnode) {
  if (!vnode.child._isMounted) {
    vnode.child._isMounted = true
    callHook(vnode.child, 'mounted')
  }
  if (vnode.data.keepAlive) {
    vnode.child._inactive = false
    callHook(vnode.child, 'activated')
  }
}

function destroy (vnode) {
  if (!vnode.child._isDestroyed) {
    if (!vnode.data.keepAlive) {
      vnode.child.$destroy()
    } else {
      vnode.child._inactive = true
      callHook(vnode.child, 'deactivated')
    }
  }
}
/*
 * 
 */
function resolveAsyncComponent ( // ????
  factory, // 传入的是一个Ctor
  cb
) {
  if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb)
  } else {
    factory.requested = true
    var cbs = factory.pendingCallbacks = [cb]
    var sync = true

    var resolve = function (res) {
      if (isObject(res)) {
        res = Vue.extend(res)
      }
      // cache resolved
      factory.resolved = res
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        for (var i = 0, l = cbs.length; i < l; i++) {
          cbs[i](res)
        }
      }
    }

    var reject = function (reason) {
      "development" !== 'production' && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      )
    }

    var res = factory(resolve, reject)

    // handle promise
    if (res && typeof res.then === 'function' && !factory.resolved) {
      res.then(resolve, reject)
    }

    sync = false
    // return in case resolved synchronously
    return factory.resolved
  }
}
/*
 * Ctor 要么是Vue，要么是Sub 
 * 函数的作用是
 * 首先获得Ctor.options.props，以及data.attrs,data.props,data.domProps
 * 简单点说，就是拷贝props中的属性在data.attrs,props,domprops中的属性值
 * 到一个对象res中
 * 是从data中抽离出属性，只是抽离的属性必须是Ctor.options.props中存在的
 */
function extractProps (data, Ctor) {
  // we are only extrating raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props
  if (!propOptions) {
    return
  }
  var res = {}
  var attrs = data.attrs;
  var props = data.props;
  var domProps = data.domProps;
  if (attrs || props || domProps) {
    for (var key in propOptions) {
      var altKey = hyphenate(key)
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey) ||
      checkProp(res, domProps, key, altKey)
    }
  }
  return res
}
/*
 * 函数的作用是
 * 提供一个key或者altkey
 * 首先检查hash中是否有key或者altkey属性，都没有就返回false
 * 如果有的话，给res[key]，返回true.
 * 然后根据preserve决定是否在hash中保留
 */
function checkProp (
  res,
  hash,
  key,
  altKey, // 替代key，替身？
  preserve // 是否在hash中保留 如果为false,则使用 delete方法 删除key属性
) {
  if (hash) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key]
      if (!preserve) {
        delete hash[key]
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey]
      if (!preserve) {
        delete hash[altKey]
      }
      return true
    }
  }
  return false
}
/*
 * 设置data.hook
 * 从 data.hook 和 hooks中提取hook函数
 * var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy }
 * 合并至data.hook
 * 只是用于合并生命周期相关的hooks
 */
function mergeHooks (data) {
  if (!data.hook) {
    data.hook = {}
  }
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i]
    var fromParent = data.hook[key]
    var ours = hooks[key]
    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours
  }
}

function mergeHook$1 (a, b) {
  // since all hooks have at most two args, use fixed args
  // to avoid having to use fn.apply().
  return function (_, __) {
    a(_, __)
    b(_, __)
  }
}

/*  */

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  tag,
  data,
  children
) {
  if (data && (Array.isArray(data) || typeof data !== 'object')) {
    children = data
    data = undefined
  }
  // make sure to use real instance instead of proxy as context
  return _createElement(this._self, tag, data, children)
}

function _createElement (
  context,
  tag,
  data,
  children
) {
  if (data && data.__ob__) {
    "development" !== 'production' && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode()
  }
  if (typeof tag === 'string') {
    var Ctor
    var ns = config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      return new VNode(
        tag, data, normalizeChildren(children, ns),
        undefined, undefined, ns, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      return createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      return new VNode(
        tag, data, normalizeChildren(children, ns),
        undefined, undefined, ns, context
      )
    }
  } else {
    // direct component options / constructor
    return createComponent(tag, data, context, children)
  }
}

/*
 * 初始化render
 */

function initRender (vm) {
  vm.$vnode = null // the placeholder node in parent tree
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null
  vm.$slots = resolveSlots(vm.$options._renderChildren) // 定义$slots属性
  // bind the public createElement fn to this instance
  // so that we get proper render context inside it.
  vm.$createElement = bind(createElement, vm) // 定义$createElement属性
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}

function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {  // 原型上设置$nextTick
    nextTick(fn, this)
  }

  Vue.prototype._render = function () {
    var vm = this
    var ref = vm.$options;
    var render = ref.render;
    var staticRenderFns = ref.staticRenderFns;
    var _parentVnode = ref._parentVnode;

    if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (var key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key])
      }
    }

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = []
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    var vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      if ("development" !== 'production') {
        warn(("Error when rendering " + (formatComponentName(vm)) + ":"))
      }
      /* istanbul ignore else */
      if (config.errorHandler) {
        config.errorHandler.call(null, e, vm)
      } else {
        if (config._isServer) {
          throw e
        } else {
          setTimeout(function () { throw e }, 0)
        }
      }
      // return previous vnode to prevent render error causing blank component
      vnode = vm._vnode
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if ("development" !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = emptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }

  // shorthands used in render functions
  Vue.prototype._h = createElement
  // toString for mustaches
  Vue.prototype._s = _toString
  // number conversion
  Vue.prototype._n = toNumber
  // empty vnode
  Vue.prototype._e = emptyVNode

  // render static tree by index
  Vue.prototype._m = function renderStatic (
    index,
    isInFor
  ) {
    var tree = this._staticTrees[index]
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree by doing a shallow clone.
    if (tree && !isInFor) {
      return Array.isArray(tree)
        ? cloneVNodes(tree)
        : cloneVNode(tree)
    }
    // otherwise, render a fresh tree.
    tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy)
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        tree[i].isStatic = true
        tree[i].key = "__static__" + index + "_" + i
      }
    } else {
      tree.isStatic = true
      tree.key = "__static__" + index
    }
    return tree
  }

  // filter resolution helper
  var identity = function (_) { return _; }
  /*
   * 返回this.$options[filters][id]
   */
  Vue.prototype._f = function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  // render v-for
  // 列表渲染
  // 根据val对应的三种类型的值，渲染list
  // val 为传入的值，render为一个render函数
  // 返回一个经过render函数处理过的数组
  Vue.prototype._l = function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key
    if (Array.isArray(val)) {
      ret = new Array(val.length)
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i)
      }
    } else if (typeof val === 'number') {
      ret = new Array(val)
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i) // 从1开始
      }
    } else if (isObject(val)) {
      keys = Object.keys(val)
      ret = new Array(keys.length)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = render(val[key], key, i)
      }
    }
    return ret
  }

  // renderSlot
  Vue.prototype._t = function (
    name,
    fallback
  ) {
    var slotNodes = this.$slots[name]
    // warn duplicate slot usage
    if (slotNodes && "development" !== 'production') {
      slotNodes._rendered && warn(
        "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
        "- this will likely cause render errors.",
        this
      )
      slotNodes._rendered = true
    }
    return slotNodes || fallback
  }

  // apply v-bind object
  // 函数的作用
  Vue.prototype._b = function bindProps (
    vnode,
    value,
    asProp) {
    if (value) { //  value必须是一个对象或者数组
      if (!isObject(value)) {
        "development" !== 'production' && warn(
          'v-bind without argument expects an Object or Array value',
          this
        )
      } else {
        if (Array.isArray(value)) { 
          value = toObject(value) // 合并成一个对象
        }
        var data = vnode.data
        for (var key in value) {
          // 如果key是class 或者 style，变成data的属性
          if (key === 'class' || key === 'style') {
            data[key] = value[key] // 在data中添加属性
          } else {
            var hash = asProp || config.mustUseProp(key) // 
              ? data.domProps || (data.domProps = {}) // data.domProps？
              : data.attrs || (data.attrs = {}) //data.attrs
            hash[key] = value[key] // 在data.attrs 或 data.domProps中添加属性
          }
        }
      }
    }
  }

  // expose v-on keyCodes 
  // 获得键码
  Vue.prototype._k = function getKeyCodes (key) {
    return config.keyCodes[key]
  }
}
/*
 * 函数的作用
 * 返回一个slots对象
 */
function resolveSlots (
  renderChildren
) {
  var slots = {}
  if (!renderChildren) {
    return slots
  }
  var children = normalizeChildren(renderChildren) || []
  var defaultSlot = []
  var name, child
  for (var i = 0, l = children.length; i < l; i++) {
    child = children[i]
    if (child.data && (name = child.data.slot)) {
      delete child.data.slot
      var slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children)
      } else {
        slot.push(child)
      }
    } else {
      defaultSlot.push(child)
    }
  }
  // ignore single whitespace
  if (defaultSlot.length && !(
    defaultSlot.length === 1 &&
    (defaultSlot[0].text === ' ' || defaultSlot[0].isComment)
  )) {
    slots.default = defaultSlot
  }
  return slots
}

/*
 * 初始化事件
 * 
 */

function initEvents (vm) {
  vm._events = Object.create(null)    // 
  // init parent attached events
  var listeners = vm.$options._parentListeners // _parentListeners
  var on = bind(vm.$on, vm) 
  var off = bind(vm.$off, vm)  //  updateListeners
  vm._updateListeners = function (listeners, oldListeners) {
    updateListeners(listeners, oldListeners || {}, on, off)
  }
  if (listeners) {
    vm._updateListeners(listeners)
  }
}

function eventsMixin (Vue) {
  /*
   * _events: {
   *   event1: [],
   *   event2: []
   * }
   */
  Vue.prototype.$on = function (event, fn) {
    var vm = this
    ;(vm._events[event] || (vm._events[event] = [])).push(fn) //  创建一个监听列表数组，
    return vm
  }

  Vue.prototype.$once = function (event, fn) {
    var vm = this
    function on () {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn // ??
    vm.$on(event, on)  
    return vm
  }

  Vue.prototype.$off = function (event, fn) {  // 取消监听一个事件
    var vm = this
    // all
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // specific event
    var cbs = vm._events[event]
    if (!cbs) {
      return vm
    }
    if (arguments.length === 1) {
      vm._events[event] = null
      return vm
    }
    // specific handler
    var cb
    var i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  Vue.prototype.$emit = function (event) {
    var vm = this
    var cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      var args = toArray(arguments, 1) // 要传入事件函数的参数
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(vm, args)
      }
    }
    return vm
  }
}

/*  */

var uid = 0
/*
 * 初始化mixin，主要是在Vue.prototype上定义_init方法
 * _init方法：在返回的实例上定义一系列属性
 * 
 * 
 * 
 */
function initMixin (Vue) {  // 初始化各种Mixin
  Vue.prototype._init = function (options) {
    var vm = this   //  vm指向创建的Vue实例
    // a uid
    vm._uid = uid++ // 实例的_uid属性
    // a flag to avoid this being observed
    vm._isVue = true  // 表示是vue实例
    // merge options
    if (options && options._isComponent) { // options._isComponent属性
      // optimize internal component instantiation // 充分利用内部组件实例
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)  // 初始化内部组件
    } else {
      vm.$options = mergeOptions( // 初始化一个$options属性
        resolveConstructorOptions(vm), // 总之把构造函数上的包括super(如果有的话)上的各种Options都薅过来了
        options || {}, // 传入的options
        vm
      )
    }
    /* istanbul ignore else */
    if ("development" !== 'production') {
      initProxy(vm) //
    } else {}
    // expose real self
    vm._self = vm // 增加一个_self属性，指向自身
    initLifecycle(vm) 
    initEvents(vm)  // some questions
    callHook(vm, 'beforeCreate') 
    initState(vm)
    callHook(vm, 'created')
    initRender(vm)
  }

  function initInternalComponent (vm, options) { // 初始化vm.$options 添加了一些属性
    var opts = vm.$options = Object.create(resolveConstructorOptions(vm)) // 原型委托在返回的options对象上
    // doing this because it's faster than dynamic enumeration.
    // 定义一些属性
    opts.parent = options.parent
    opts.propsData = options.propsData
    opts._parentVnode = options._parentVnode
    opts._parentListeners = options._parentListeners
    opts._renderChildren = options._renderChildren
    opts._componentTag = options._componentTag

    if (options.render) {  // options render ?
      opts.render = options.render
      opts.staticRenderFns = options.staticRenderFns
    }
  }
  /*
   * 来自构造函数（Vue或Sub）的options
   * 
   */
  function resolveConstructorOptions (vm) { //  返回一个options对象
    var Ctor = vm.constructor  // vm可能是Vue构造函数，也可能是Vue.extend()处理后返回的构造函数

    var options = Ctor.options // Super.options 和 自身传入的options
    if (Ctor.super) { //  super指向的Vue
      var superOptions = Ctor.super.options // 获得Vue的Options
      var cachedSuperOptions = Ctor.superOptions  // 同上
      if (superOptions !== cachedSuperOptions) {  
        // super option changed
        Ctor.superOptions = superOptions // 重新给Ctor.superOptions赋值
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions) 
        // Ctor.extendOptions 指的的使用Vue.extend()传入的options
        if (options.name) {
          options.components[options.name] = Ctor
        }
      }
    }
    return options
  }
}

function Vue (options) {
  this._init(options) // 初始化实例时执行_init方法
}
/*
 * 在Vue.propotype上添加属性
 */
initMixin(Vue) 
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

var warn
var formatComponentName

if ("development" !== 'production') {
  var hasConsole = typeof console !== 'undefined'

  warn = function (msg, vm) { // 用于报错
    if (hasConsole && (!config.silent)) {
      console.error("[Vue warn]: " + msg + " " + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ))
    }
  }
  // 格式化component name
  // 如果是根实例
  // 返回 root instance
  // 如果vm是Vue实例，在vm.$options中找name或者_componentTag属性，否则找vm的name属性
  // name如果不存在，返回 anonymous component
  // 
  formatComponentName = function (vm) {  
    if (vm.$root === vm) { 
      return 'root instance' 
    }
    var name = vm._isVue 
      ? vm.$options.name || vm.$options._componentTag 
      : vm.name 
    return name ? ("component <" + name + ">") : "anonymous component"
  }
  // 格式化 location
  // 
  var formatLocation = function (str) {
    if (str === 'anonymous component') {
      str += " - use the \"name\" option for better debugging messages."
    }
    return ("(found in " + str + ")")
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option  // 怎么合并父组件和子组件的选项
 * value into the final value.
 * 
 * config.optionMergeStrategies: Object.create(null)
 */
var strats = config.optionMergeStrategies // 初始化时是一个空对象

/**
 * Options with restrictions
 */
if ("development" !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }

  strats.name = function (parent, child, vm) {
    if (vm && child) {
      warn(
        'options "name" can only be used as a component definition option, ' +
        'not during instance creation.'
      )
    }
    return defaultStrat(parent, child)
  }
}

/**
 * Helper that recursively merges two data objects together.
 * 合并规则：
 * 1. 如果from中的某个属性to中有，保留to中的，什么都不做。
 * 2. 如果to中没有，赋值。y
 * 3. 如果to中和from中的某个属性值都是对象，递归调用。
 */
function mergeData (to, from) { 
  var key, toVal, fromVal
  for (key in from) {
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * data的合并策略是
 * 如果vm不存在
 * 1. 如果childVal不存在 返回parentVal
 * 2. 如果childVal不是一个函数，报错，返回parentVal
 * 3. 如果parentVal不存在，返回childVal
 * 4. 如果都存在，调用mergeData函数，合并parentVal和childVal函数的返回值,最终还是以childVal为主
 *
 * 如果vm存在，且parentVal和childVal至少一个存在时，返回一个函数
 * 
 */
strats.data = function (
  parentVal, // function
  childVal, // function
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (typeof childVal !== 'function') {
      "development" !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        childVal.call(this),
        parentVal.call(this)
      )
    }
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

/**
 * Hooks and param attributes are merged as arrays.
 * 合并策略：
 * 1. 如果childVal不存在，直接返回parentVal
 * 2. 如果childVal存在
 *    1. 如果parentVal存在，返回一个合并后的数组，但是parentVal在前
 *    2. 如果parentVal不存在，
 *       1. 如果childVal是一个数组，直接返回childVal
 *       2. 否则，把childVal包装成一个数组返回
 */
function mergeHook (
  parentVal, // Array
  childVal // Array
) {
  return childVal
    ? parentVal // 如果 childVal存在
      ? parentVal.concat(childVal) // 如果parent存在，直接合并
      : Array.isArray(childVal) // 如果parentVal不存在
        ? childVal  // 如果chilidVal是数组，直接返回
        : [childVal] // 包装成一个数组返回
    : parentVal  // 如果childVal 不存在 直接返回parentVal 
}
// strats中添加属性，属性名为生命周期各个钩子
config._lifecycleHooks.forEach(function (hook) {
  strats[hook] = mergeHook
})

/**
 * Assets // components,directives,filters
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 * 如果childVal不存在，返回一个原型为parentVal的空对象
 * 如果childVal存在，合并parentVal和childVal
 * 
 */
function mergeAssets (parentVal, childVal) { // parentVal: Object childVal: Object
  var res = Object.create(parentVal || null) // 原型委托
  return childVal
    ? extend(res, childVal)
    : res
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 * 不应该重写（覆盖）,应该保存在一个数组里
 * 合并策略
 * 1. 如果
 * 返回的是一个新对象
 */
strats.watch = function (parentVal, childVal) { // parentVal: Object childVal: Object
  /* istanbul ignore if */
  if (!childVal) return parentVal
  if (!parentVal) return childVal
  var ret = {}
  extend(ret, parentVal) // ret首先获得parentVal的全部属性
  for (var key in childVal) {
    var parent = ret[key]
    var child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent] // 如果parent不是一个数组，将其变成一个数组
    }
    ret[key] = parent
      ? parent.concat(child) // parent在前，child在后
      : [child]
  }
  return ret
}

/**
 * Other object hashes.
 * 合并策略
 * childVal和parentVal 有一个不存在，则返回另一个
 * 如果都存在，依次extend parentVal和childVal
 * 注意 这里是返回一个新对象
 * 
 */
strats.props =
strats.methods =
strats.computed = function (parentVal, childVal) { // parentVal: Object childVal: Object
  if (!childVal) return parentVal
  if (!parentVal) return childVal
  var ret = Object.create(null)
  extend(ret, parentVal)
  extend(ret, childVal)
  return ret
}

/**
 * Default strategy.
 * 默认的合并策略
 * 子组件不存在，就用父组件的
 * 子组件存在，就用子组件自己的
 * 以子组件为主
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Make sure component options get converted to actual
 * constructors. //  actual constructors
 * 标准化组件选项 components
 * {
 *   component1: obj1,
 *   component2: obj2
 * } ->
 * {
 *   component1: Vue.extend(obj1),
 *   component2: Vue.extend(obj2)
 * }
 * 如果options中对应的属性值为object, 将它变成一个构造器。
 */
function normalizeComponents (options) {
  if (options.components) {
    var components = options.components  //  options里的components选项
    var def
    for (var key in components) { //  遍历每一个选项
      var lower = key.toLowerCase() // 属性名小写
      if (isBuiltInTag(lower) || config.isReservedTag(lower)) {  //  如果是内建的tag或者<component>,<slot>
        // 或者是 slot component  报错
        "development" !== 'production' && warn(
          'Do not use built-in or reserved HTML elements as component ' +
          'id: ' + key
        )
        continue // 进入下一个循环
      }
      def = components[key]  // def 是key对应的属性值，是一个option的对象
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def)  // components的所有值都变成一个构造器
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format. // 都变成 Object-based 格式
 * 该函数的作用是：
 * 如果props选项是个数组，如[props1,props,...],那么最后props会变成
 * {
 *   prop1: {
 *     type: null
 *   },
 *   prop2: {
 *     type: null
 *   }
 * }
 * 如果props是个对象，如
 * {
 *   prop1: String | Object,
 *   prop2: String | Object
 * } 
 * 变成 
 * {
 *   prop1: {
 *     type: String
 *   },
 *   prop2: {
 *   
 *   }
 * }
 */
function normalizeProps (options) { // 统一变成一个对象形式，并赋值给options.props
  var props = options.props
  if (!props) return
  var res = {}
  var i, val, name
  if (Array.isArray(props)) { //  如果props是一个数组
    i = props.length
    while (i--) { // 遍历 props数组
      val = props[i]
      if (typeof val === 'string') {  // 如果props[i]是一个字符串
        name = camelize(val) // 化成驼峰格式
        res[name] = { type: null }  //  写成一个对象形式
      } else if ("development" !== 'production') {
        warn('props must be strings when using array syntax.')  //  当props写成数组格式的时候，元素必须是字符串格式
      }
    }
  } else if (isPlainObject(props)) {  // 如果props是一个对象
    /**
     * eg:
     *   props: {
     *     a: {} | 表示 类型 的字符串
     *     b: {}
     *     
     *   }
     */
    for (var key in props) {
      val = props[key]
      name = camelize(key) 
      res[name] = isPlainObject(val)   // 如果val是对象 保持不变
        ? val 
        : { type: val } // 如果val不是对象，那就是字符串，说明所需要的type
    }
  }
  options.props = res  // 设置res为新的props
}

/**
 * Normalize raw function directives into object format.
 * 标准化指令选项 directives
 * {
 *   dir1: Function | Object
 * } ->
 * {
 *   dir1: Object,
 *   dir2: {
 *     bind: function,
 *     update: function
 *   }
 * }
 */
function normalizeDirectives (options) {  // 标准化指令选项
  var dirs = options.directives
  if (dirs) {
    for (var key in dirs) {  // 遍历指令选项
      var def = dirs[key]  // def: Object/Function
      if (typeof def === 'function') { // 如果是一个函数
        dirs[key] = { bind: def, update: def } // 给 bind 和 update都调用这个函数,unbind 不设置
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child, // child的选项?
  vm
) {
  // normaoize child的options.components,options.props,options.directives
  normalizeComponents(child)
  normalizeProps(child)
  normalizeDirectives(child)

  var extendsFrom = child.extends // child的extends选项

  if (extendsFrom) {
    parent = typeof extendsFrom === 'function'
      ? mergeOptions(parent, extendsFrom.options, vm)
      : mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {  // 子组件options的mixins选项 
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i]
      if (mixin.prototype instanceof Vue) {
        mixin = mixin.options
      }
      parent = mergeOptions(parent, mixin, vm)
    }
  }
  var options = {}
  var key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') { // options.type.id
    return
  }
  var assets = options[type]
  var res = assets[id] ||
    // camelCase ID
    assets[camelize(id)] ||
    // Pascal Case ID
    assets[capitalize(camelize(id))]
  if ("development" !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}

/*  */
/*
 * 函数的作用是验证 props上某个指定的属性
 * 传入的参数包括指定的key,propOptions === options.props，propsData，vm实例
 * 首先验证propOptions[key].type 如果需要返回布尔值，返回true 或者 false
 * 其次验证propsData是否存在指定的key属性值
 * 如果不存在，调用方法获得一个默认值
 * 如果存在，直接返回propsData[key]
 */
function validateProp ( 
  key, // 要验证的prop中的key 
  propOptions, 
  propsData, // required
  vm
) {
  /* istanbul ignore if */
  if (!propsData) return
  var prop = propOptions[key] // propOption 是 options.props，获得属性key对应的选项
  var absent = !hasOwn(propsData, key) //  propsData中没有key属性，返回true
  var value = propsData[key]  // 可能存在，也可能不存在
  // handle boolean props
  if (getType(prop.type) === 'Boolean') {  // 如果prop应该返回一个布尔值
    if (absent && !hasOwn(prop, 'default')) {  // 如果propsData没有key属性且prop对象中没有default属性
      value = false  //  默认值为false
    } else if (value === '' || value === hyphenate(key)) {  
      //如果propsData中提供了key属性，且值是空字符串或者key的连字符格式
      value = true 
    }
  }
  // check default value
  if (value === undefined) {  // 如果propsData中未给出key属性
    value = getPropDefaultValue(vm, prop, key) // 获得默认值
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldConvert = observerState.shouldConvert
    observerState.shouldConvert = true
    observe(value)  //  为value创建一个observer
    observerState.shouldConvert = prevShouldConvert
  }
  if ("development" !== 'production') {
    assertProp(prop, key, value, vm, absent)
  }
  return value  
}

/**
 * Get the default value of a prop.
 * prop: {
 *   default: ...,
 * }
 */
function getPropDefaultValue (vm, prop, name) { // for example: prop = props.prop1
  // no default, return undefined
  if (!hasOwn(prop, 'default')) { // 如果不存在default属性，返回undefined
    return undefined  //  没有default属性，直接返回undefined
  }
  var def = prop.default  
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) { // 如果def是对象，报错，对象和数组必须以函数的形式返回
    "development" !== 'production' && warn(
      'Invalid default value for prop "' + name + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    )
  }
  // call factory function for non-Function types
  return typeof def === 'function' && prop.type !== Function  // def是一个函数而且prop.type不是函数，那么就要执行这个函数
    // 并返回一个值
    ? def.call(vm) //
    : def  // 直接返回def
}

/**
 * Assert whether a prop is valid.  判断一个prop是否有效
 * prop: {
 *   required: ...,
 *   type: ...,
 *   validator: Function
 * }
 * name 只是用于报错信息
 * value是要验证的值
 * 
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent // 
) {
  if (prop.required && absent) { // 如果在prop中定义了required但是prop中没有
    warn(
      'Missing required prop: "' + name + '"',
      vm
    )
    return
  }

  if (value == null && !prop.required) {  // value 为undefined 而且不是必须项，直接返回
    return
  }
  /**
   * type 可以是一个数组，只要满足数组中任一个指定的类型即满足条件
   * 
   */
  var type = prop.type // prop 的type属性
  var valid = !type || type === true  // type不存在 或者 type 为true时 valid都为true
  var expectedTypes = []  // 
  if (type) {
    if (!Array.isArray(type)) { // 如果type不是一个数组
      type = [type] // type变成一个数组形式
    }
    // 如果type是一个数组，遍历它
    for (var i = 0; i < type.length && !valid; i++) {  // 一旦type 变为 true,结束循环
      var assertedType = assertType(value, type[i]) // a object {expectedType,valid}
      expectedTypes.push(assertedType.expectedType)
      valid = assertedType.valid
    }
  }

  if (!valid) {  // 如果遍历完数组还是无效，报错并·返回
    warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    )
    return
  }

  var validator = prop.validator //  可以给prop添加一个自定义validator函数，
  if (validator) { // 如果有的话
    if (!validator(value)) { // 但是必须返回true，否则value无效
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      )
    }
  }
}

/**
 * Assert the type of a value
 * 函数的作用是返回一个对象，包含valid,expectedType等信息
 * 
 */
function assertType (value, type) {  // 传入的type是什么? 字符串
  var valid
  var expectedType = getType(type)
  if (expectedType === 'String') { // 
    valid = typeof value === (expectedType = 'string')
  } else if (expectedType === 'Number') {
    valid = typeof value === (expectedType = 'number')
  } else if (expectedType === 'Boolean') {
    valid = typeof value === (expectedType = 'boolean')
  } else if (expectedType === 'Function') {
    valid = typeof value === (expectedType = 'function')
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value)
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value)
  } else {
    valid = value instanceof type  // 是否是自定义类型
  }
  return {
    valid: valid, // Boolean 
    expectedType: expectedType  // 构造函数函数名
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 * 函数的作用是
 * 用正则表达式来匹配函数名，来检查内置类型。
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/)  //  函数名来检查内建类型
  return match && match[1]
}


/*
 * 放置一些util函数
 */
var util = Object.freeze({
	defineReactive: defineReactive,
	_toString: _toString,
	toNumber: toNumber,
	makeMap: makeMap,
	isBuiltInTag: isBuiltInTag,
	remove: remove,
	hasOwn: hasOwn,
	isPrimitive: isPrimitive,
	cached: cached,
	camelize: camelize,
	capitalize: capitalize,
	hyphenate: hyphenate,
	bind: bind,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	toObject: toObject,
	noop: noop,
	no: no,
	genStaticKeys: genStaticKeys,
	isReserved: isReserved,
	def: def,
	parsePath: parsePath,
	hasProto: hasProto,
	inBrowser: inBrowser,
	devtools: devtools,
	UA: UA,
	nextTick: nextTick,
	get _Set () { return _Set; },
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	get warn () { return warn; },
	get formatComponentName () { return formatComponentName; },
	validateProp: validateProp
});

/*
 * 初始化init
 */

function initUse (Vue) {  //  
  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return
    }
    // additional parameters
    var args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else {
      plugin.apply(null, args)
    }
    plugin.installed = true
    return this
  }
}

/*  */

function initMixin$1 (Vue) { // 初始化Mixin
  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin)  // 充实一下options而已
  }
}

/*  
 * 初始化一个Vue.extend方法
 */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  var cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {}
    var Super = this // 指向Vue构造函数
    var isFirstExtend = Super.cid === 0
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor
    }
    var name = extendOptions.name || Super.options.name // 传入的对象中是否有name属性
    if ("development" !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) { // 命名必须以英文字母开头，只能包含字母数字或者连字符
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characaters and the hyphen.'
        )
        name = null
      }
    }
    var Sub = function VueComponent (options) {
      this._init(options) // 由于原型委托，可以使用Super，也就是Vue构造函数原型上的所有方法。
    }
    Sub.prototype = Object.create(Super.prototype) //  原型委托
    Sub.prototype.constructor = Sub
    Sub.cid = cid++ // 对不同的组件构造器加以区别
    Sub.options = mergeOptions( // 合并Vue的option对象和传入的options对象
      Super.options,
      extendOptions
    )
    Sub['super'] = Super // 设置一个Super属性
    // allow further extension
    Sub.extend = Super.extend // Vue.extend({}).extend({})... 有效
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type]
    }) // 同样可以注册component，directive,filter
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options // 定义一个superOptions指向Vue.options
    Sub.extendOptions = extendOptions // 缓存这个组件构造器传入的options
    // cache constructor
    if (isFirstExtend) { // ? a question why Super.cid === 0
      extendOptions._Ctor = Sub // 在extendOptions中缓存Sub
    }
    return Sub
  }
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   * Vue.component,Vue.filter,Vue.directive
   * 注册组件，注册过滤器，注册指令
   */
  config._assetTypes.forEach(function (type) { // ['component', 'directive', 'filter']
    Vue[type] = function (
      id, // name
      definition // object
    ) {
      if (!definition) { 
        return this.options[type + 's'][id] // 根据id在vm.options[type+'s']中去找
      } else {
        /* istanbul ignore if */
        if ("development" !== 'production') {
          if (type === 'component' && config.isReservedTag(id)) { // 不要使用原生html标签来注册组件
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            )
          }
        }
        if (type === 'component' && isPlainObject(definition)) { // 如果是注册组件
          definition.name = definition.name || id // 如果defination中提供了name，用提供的name，否则用id
          definition = Vue.extend(definition) // 返回一个构造器
        }
        if (type === 'directive' && typeof definition === 'function') {  // 如果是注册指令，而且defination是函数
          // 将defintion 变成对象形式，默认提供bind和update
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition // 在this.options[type + 's']里保存这个definition
        // 如果是注册component,返回一个Sub构造函数
        // 如果是注册directive,返回一个对象
        // 如果是注册filter，。。。，不好意思，没有filter了
        return definition
      }
    }
  })
}

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,
  created: function created () {
    this.cache = Object.create(null)
  },
  render: function render () {
    var vnode = getFirstComponentChild(this.$slots.default)
    if (vnode && vnode.componentOptions) {
      var opts = vnode.componentOptions
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? opts.Ctor.cid + '::' + opts.tag
        : vnode.key
      if (this.cache[key]) {
        vnode.child = this.cache[key].child
      } else {
        this.cache[key] = vnode
      }
      vnode.data.keepAlive = true
    }
    return vnode
  },
  destroyed: function destroyed () {
    var this$1 = this;

    for (var key in this.cache) {
      var vnode = this$1.cache[key]
      callHook(vnode.child, 'deactivated')
      vnode.child.$destroy()
    }
  }
}

var builtInComponents = {
  KeepAlive: KeepAlive
}

/*
 * 初始话全局API
 */
function initGlobalAPI (Vue) { 
  // config
  var configDef = {}
  configDef.get = function () { return config; }
  if ("development" !== 'production') {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef) // Vue.config = configDef
  Vue.util = util
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
  /*
   * Vue.options = {
   *    components: {},
   *    directives: {},
   *    filters: {} 
   * }
   */
  Vue.options = Object.create(null)
  config._assetTypes.forEach(function (type) { // ['component', 'directive', 'filter']
    Vue.options[type + 's'] = Object.create(null) // 存储已经注册的组件，指令，过滤器等等
  })

  extend(Vue.options.components, builtInComponents) // builtInComponents: {KeepAlive: KeepAlive}

  initUse(Vue)
  initMixin$1(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}

initGlobalAPI(Vue)

Object.defineProperty(Vue.prototype, '$isServer', {
  get: function () { return config._isServer; }
}) // Vue.prototype[$isServer] === config._isServer

Vue.version = '2.0.0-rc.6'

/*  */

// attributes that should be using props for binding
var mustUseProp = makeMap('value,selected,checked,muted') // 用于绑定的props

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck') // 可枚举属性

var isBooleanAttr = makeMap( // 布尔值属性
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
)

var isAttr = makeMap( // 属性
  'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' +
  'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' +
  'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,' +
  'name,contenteditable,contextmenu,controls,coords,data,datetime,default,' +
  'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,' +
  'form,formaction,headers,<th>,height,hidden,high,href,hreflang,http-equiv,' +
  'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' +
  'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' +
  'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' +
  'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' +
  'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' +
  'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' +
  'target,title,type,usemap,value,width,wrap'
)

var xlinkNS = 'http://www.w3.org/1999/xlink'

var isXlink = function (name) { // xlink:*
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
}

var getXlinkProp = function (name) { // 从第六位开始取
  return isXlink(name) ? name.slice(6, name.length) : ''
}

var isFalsyAttrValue = function (val) { // val是一个假值
  return val == null || val === false
}

/* 
 * 开始处理 class 
 * 合并一个结点的父节点，子节点的所有class 最终返回一个以空格分隔的字符串，
 * class 包括 staticClass 和 动态class
 */

function genClassForVnode (vnode) { // 收集一个组件的父组件和子组件的所有class
  var data = vnode.data
  var parentNode = vnode
  var childNode = vnode
  while (childNode.child) { // 直到不存在子节点
    childNode = childNode.child._vnode
    if (childNode.data) {
      /*
       * data: {
       *   staticClass,
       *   class
       * }
       */
      data = mergeClassData(childNode.data, data)
    }
  }
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data) {
      data = mergeClassData(data, parentNode.data)
    }
  }
  // data此时是一个对象，包含staticClass和class两个属性
  return genClassFromData(data)  // 返回一个字符串
}

/*
 * staticClass是字符串形式，class是数组形式
 */
function mergeClassData (child, parent) { 
  return {
    staticClass: concat(child.staticClass, parent.staticClass), // 子节点的在前，父节点的在后，static已经是一个字符串了
    class: child.class
      ? [child.class, parent.class]
      : parent.class
  }
}

function genClassFromData (data) { // data: Object
  var dynamicClass = data.class // 动态class
  var staticClass = data.staticClass // 静态class  String
  if (staticClass || dynamicClass) { // 有一个存在即可
    return concat(staticClass, stringifyClass(dynamicClass)) // 静态class在前，动态class在后
  }
  /* istanbul ignore next */
  return '' // 两个都不存在，返回一个空字符串
}

function concat (a, b) { // 返回 'a b'的形式
  return a ? b ?  (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) { // value: String | Array | Object
  var res = ''
  if (!value) {
    return res // value不存在，返回空字符串
  }
  if (typeof value === 'string') {
    return value // 是字符串的话，原样返回
  }
  if (Array.isArray(value)) { // 如果是数组，
    var stringified
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        if ((stringified = stringifyClass(value[i]))) {
          res += stringified + ' '
        }
      }
    }
    return res.slice(0, -1) // 去掉最后一个空格
  }
  if (isObject(value)) {
    for (var key in value) {
      if (value[key]) res += key + ' ' // 只要key，和value[key]只是做真假判断
    }
    return res.slice(0, -1)
  }
  /* istanbul ignore next */
  return res
}

/*
 * 处理html相关
 */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
}

var isHTMLTag = makeMap(  // 所有的html标签
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template'
)

var isUnaryTag = makeMap( // 一元标签 ？
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr',
  true // true表示应该小写
)

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap( // 自闭合标签
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source',
  true
)

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap(  // html5 phrasing标签 ？
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track',
  true
)

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap( // svg相关
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font,' +
  'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
)

var isPreTag = function (tag) { return tag === 'pre'; } //pre-tag

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag) // 是否是保留标签
  // 如果是HTML标签或者SVG
}

function getTagNamespace (tag) {  //  返回 svg 或 math
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null) // 一个空对象,缓存已处理过的tag
/*
 * 是否是未知元素
 */
function isUnknownElement (tag) { // 是否是未知标签
  /* istanbul ignore if */
  if (!inBrowser) { //inBrowser : Boolean
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase()
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {  
    return unknownElementCache[tag] // Boolean
  }
  var el = document.createElement(tag)
  if (tag.indexOf('-') > -1) { // tag字符串中有连字符
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

/*  */

var UA$1 = inBrowser && window.navigator.userAgent.toLowerCase() 
var isIE = UA$1 && /msie|trident/.test(UA$1) // 是否是IE
var isIE9 = UA$1 && UA$1.indexOf('msie 9.0') > 0 // 是否是IE9
var isAndroid = UA$1 && UA$1.indexOf('android') > 0 // 是否是安卓

/**
 * Query an element selector if it's not an element already.
 */
function query (el) { // el: String
  if (typeof el === 'string') {
    var selector = el
    el = document.querySelector(el)
    if (!el) {
      "development" !== 'production' && warn(
        'Cannot find element: ' + selector
      )
      return document.createElement('div') // 如果el是字符串，但文档中不存在，返回一个 div 
    }
  }
  return el // 返回文档中的元素，如果el不是一个字符串，原样返回
}

/*
 * 定义一些dom相关函数
 * 并且都放入nodeOps对象中
 */

function createElement$1 (tagName) {
  return document.createElement(tagName)
}

function createElementNS (namespace, tagName) { // namespace: 'math' or 'svg'
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode)
}

function removeChild (node, child) {
  node.removeChild(child)
}

function appendChild (node, child) {
  node.appendChild(child)
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text
}

function childNodes (node) {
  return node.childNodes
}

function setAttribute (node, key, val) {
  node.setAttribute(key, val)
}


var nodeOps = Object.freeze({  // 定义了一个nodeOps对象，封装了一些函数
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  childNodes: childNodes,
  setAttribute: setAttribute
});

/*
 * v-ref?？？ some questions
 */

var ref = { 
  create: function create (_, vnode) {
    registerRef(vnode)
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true) // 移除旧的
      registerRef(vnode) // 重新注册新的
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true)
  }
}

function registerRef (vnode, isRemoval) {  // ???
  var key = vnode.data.ref // ref 
  if (!key) return

  var vm = vnode.context // 获取vm实例
  var ref = vnode.child || vnode.elm  // ?
  var refs = vm.$refs  // vm.$refs 包含注册有v-ref的函数
  if (isRemoval) { // 处理remove逻辑
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) { // 处理添加逻辑
      if (Array.isArray(refs[key])) {
        refs[key].push(ref)
      } else {
        refs[key] = [ref]
      }
    } else {
      refs[key] = ref
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *

/*
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

/*
 * vdom diff 算法
 */

var emptyData = {}
var emptyNode = new VNode('', emptyData, [])
var hooks$1 = ['create', 'update', 'postpatch', 'remove', 'destroy'] // 生命周期钩子

function isUndef (s) { 
  return s == null
}

function isDef (s) { 
  return s != null
}

function sameVnode (vnode1, vnode2) { // 判断标准 key,tag,isComment,data
  return (
    vnode1.key === vnode2.key &&
    vnode1.tag === vnode2.tag &&
    vnode1.isComment === vnode2.isComment &&
    !vnode1.data === !vnode2.data
  )
}

function createKeyToOldIdx (children, beginIdx, endIdx) { // child: Array  
  var i, key
  var map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key // 如果该child上有key属性
    if (isDef(key)) map[key] = i 
  }
  /**
   * map: {
        key: i:Number
   * }
   */
  return map
}

function createPatchFunction (backend) { // ???
  var i, j 
  var cbs = {}
  /*
   * modules: [
   * 	{
   * 		create,
   *   		upadte,
   *   		...
   * 	},
   * 	{
   * 		create,
   *   		upadte,
   *   		...
   * 	}
   * ]
   */
  var modules = backend.modules;
  var nodeOps = backend.nodeOps;  

  for (i = 0; i < hooks$1.length; ++i) { // hooks$1 = ['create', 'update', 'postpatch', 'remove', 'destroy']
    cbs[hooks$1[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks$1[i]] !== undefined) cbs[hooks$1[i]].push(modules[j][hooks$1[i]])
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm) 
    // tag, data, children, text, element
    // 产生一个只有标签名的空node
  }

  function createRmCb (childElm, listeners) {
    function remove () {
      if (--remove.listeners === 0) {
        removeElement(childElm)
      }
    }
    remove.listeners = listeners
    return remove
  }

  function removeElement (el) { // 移除该元素
    var parent = nodeOps.parentNode(el)
    nodeOps.removeChild(parent, el)
  }

  function createElm (vnode, insertedVnodeQueue, nested) {
    var i
    var data = vnode.data
    vnode.isRootInsert = !nested
    if (isDef(data)) { 
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode)  // data.hook.init(vnode)
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(i = vnode.child)) {
        initComponent(vnode, insertedVnodeQueue)
        return vnode.elm
      }
    }
    var children = vnode.children
    var tag = vnode.tag
    if (isDef(tag)) {
      if ("development" !== 'production') {
        if (
          !vnode.ns &&
          !(config.ignoredElements && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          )
        }
      }
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag)
      setScope(vnode)
      createChildren(vnode, children, insertedVnodeQueue)
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
    } else if (vnode.isComment) {
      vnode.elm = nodeOps.createComment(vnode.text)
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text)
    }
    return vnode.elm
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; ++i) {
        nodeOps.appendChild(vnode.elm, createElm(children[i], insertedVnodeQueue, true))
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text))
    }
  }

  function isPatchable (vnode) {
    while (vnode.child) {
      vnode = vnode.child._vnode
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    if (isDef(i)) {
      if (i.create) i.create(emptyNode, vnode)
      if (i.insert) insertedVnodeQueue.push(vnode)
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (vnode.data.pendingInsert) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
    }
    vnode.elm = vnode.child.$el
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
      setScope(vnode)
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode)
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode)
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i
    if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '')
    }
    if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '')
    }
  }

  function addVnodes (parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      nodeOps.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before)
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j
    var data = vnode.data
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode)
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
    }
    if (isDef(i = vnode.child) && !data.keepAlive) {
      invokeDestroyHook(i._vnode)
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j])
      }
    }
  }

  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx]
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch)
          invokeDestroyHook(ch)
        } else { // Text node
          nodeOps.removeChild(parentElm, ch.elm)
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (rm || isDef(vnode.data)) {
      var listeners = cbs.remove.length + 1
      if (!rm) {
        // directly removing
        rm = createRmCb(vnode.elm, listeners)
      } else {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.child) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm)
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm)
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm)
      } else {
        rm()
      }
    } else {
      removeElement(vnode.elm)
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0
    var newStartIdx = 0
    var oldEndIdx = oldCh.length - 1
    var oldStartVnode = oldCh[0]
    var oldEndVnode = oldCh[oldEndIdx]
    var newEndIdx = newCh.length - 1
    var newStartVnode = newCh[0]
    var newEndVnode = newCh[newEndIdx]
    var oldKeyToIdx, idxInOld, elmToMove, before

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null
        if (isUndef(idxInOld)) { // New element
          nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        } else {
          elmToMove = oldCh[idxInOld]
          /* istanbul ignore if */
          if ("development" !== 'production' && !elmToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            )
          }
          if (elmToMove.tag !== newStartVnode.tag) {
            // same key but different element. treat as new element
            nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm)
            newStartVnode = newCh[++newStartIdx]
          } else {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm)
            newStartVnode = newCh[++newStartIdx]
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }

  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return
    }
    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (vnode.isStatic &&
        oldVnode.isStatic &&
        vnode.key === oldVnode.key &&
        vnode.isCloned) {
      vnode.elm = oldVnode.elm
      return
    }
    var i, hook
    var hasData = isDef(i = vnode.data)
    if (hasData && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode)
    }
    var elm = vnode.elm = oldVnode.elm
    var oldCh = oldVnode.children
    var ch = vnode.children
    if (hasData && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(hook) && isDef(i = hook.update)) i(oldVnode, vnode)
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (hasData) {
      for (i = 0; i < cbs.postpatch.length; ++i) cbs.postpatch[i](oldVnode, vnode)
      if (isDef(hook) && isDef(i = hook.postpatch)) i(oldVnode, vnode)
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (initial && vnode.parent) {
      vnode.parent.data.pendingInsert = queue
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i])
      }
    }
  }

  var bailed = false
  function hydrate (elm, vnode, insertedVnodeQueue) {
    if ("development" !== 'production') {
      if (!assertNodeMatch(elm, vnode)) {
        return false
      }
    }
    vnode.elm = elm
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */)
      if (isDef(i = vnode.child)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue)
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        var childNodes = nodeOps.childNodes(elm)
        // empty element, allow client to pick up and populate children
        if (!childNodes.length) {
          createChildren(vnode, children, insertedVnodeQueue)
        } else {
          var childrenMatch = true
          if (childNodes.length !== children.length) {
            childrenMatch = false
          } else {
            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!hydrate(childNodes[i$1], children[i$1], insertedVnodeQueue)) {
                childrenMatch = false
                break
              }
            }
          }
          if (!childrenMatch) {
            if ("development" !== 'production' &&
                typeof console !== 'undefined' &&
                !bailed) {
              bailed = true
              console.warn('Parent: ', elm)
              console.warn('Mismatching childNodes vs. VNodes: ', childNodes, children)
            }
            return false
          }
        }
      }
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
    }
    return true
  }

  function assertNodeMatch (node, vnode) { // 返回一个布尔值
    if (vnode.tag) {
      return (
        vnode.tag.indexOf('vue-component') === 0 || // 以vue-component开头
        vnode.tag === nodeOps.tagName(node).toLowerCase()  // 或者node.tagName.toLowerCase() 是否等于vnode.tag
      )
    } else {
      return _toString(vnode.text) === node.data  // 不存在node.tag 那就比较 vndoe.text 是否等于node.data
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    var elm, parent
    var isInitialPatch = false
    var insertedVnodeQueue = []

    if (!oldVnode) {
      // empty mount, create new root element
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
      var isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute('server-rendered')) {
            oldVnode.removeAttribute('server-rendered')
            hydrating = true
          }
          if (hydrating) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true)
              return oldVnode
            } else if ("development" !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              )
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode)
        }
        elm = oldVnode.elm
        parent = nodeOps.parentNode(elm)

        createElm(vnode, insertedVnodeQueue)

        // component root element replaced.
        // update parent placeholder node element.
        if (vnode.parent) {
          vnode.parent.elm = vnode.elm
          if (isPatchable(vnode)) {
            for (var i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, vnode.parent)
            }
          }
        }

        if (parent !== null) {
          nodeOps.insertBefore(parent, vnode.elm, nodeOps.nextSibling(elm))
          removeVnodes(parent, [oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}

/*
 * directives对象
 * 包括create, update, postpatch，destroy三个函数
 * 
 */

var directives = {
  create: function bindDirectives (oldVnode, vnode) {
    var hasInsert = false
    forEachDirective(oldVnode, vnode, function (def, dir) {
      callHook$1(def, dir, 'bind', vnode, oldVnode) // 依次执行钩子函数
      if (def.inserted) {
        hasInsert = true
      }
    })
    if (hasInsert) {
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
        applyDirectives(oldVnode, vnode, 'inserted')
      })
    }
  },
  update: function updateDirectives (oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'update')
    // if old vnode has directives but new vnode doesn't
    // we need to teardown the directives on the old one.
    if (oldVnode.data.directives && !vnode.data.directives) {
      applyDirectives(oldVnode, oldVnode, 'unbind')
    }
  },
  postpatch: function postupdateDirectives (oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'componentUpdated')
  },
  destroy: function unbindDirectives (vnode) {
    applyDirectives(vnode, vnode, 'unbind')
  }
}

var emptyModifiers = Object.create(null)
/*
 * 函数的作用是 
 * 1. 获得vnode.data.directives 然后依次遍历
 * 2. 对于每一个dir,通过resolveAsset函数获得def
 * 3. dir.oldValue被赋值
 * 4. dir.modifiers如果不存在，赋值一个空对象
 * 5. def和dir作为参数传入函数fn中
 */
function forEachDirective ( // 遍历directive
  oldVnode,
  vnode,
  fn
) {
  var dirs = vnode.data.directives // Array
  if (dirs) {
    for (var i = 0; i < dirs.length; i++) {  // 遍历数组
      var dir = dirs[i] 
      var def = resolveAsset(vnode.context.$options, 'directives', dir.name, true) // options.type.id
      // 简单点说就是 vnode.context.$options[directives][dir.name]，
      if (def) {
        var oldDirs = oldVnode && oldVnode.data.directives
        if (oldDirs) {
          dir.oldValue = oldDirs[i].value // 赋值给dir.oldValue
        } 
        if (!dir.modifiers) {
          dir.modifiers = emptyModifiers // dir.modifiers 不存在 就赋值一个空对象
        }
        fn(def, dir)
      }
    }
  }
}

function applyDirectives (
  oldVnode,
  vnode,
  hook
) {
  forEachDirective(oldVnode, vnode, function (def, dir) {
    callHook$1(def, dir, hook, vnode, oldVnode)
  })
}
/*
 * 在传入的def上找到对应的hook函数
 */
function callHook$1 (def, dir, hook, vnode, oldVnode) {
  var fn = def && def[hook]
  if (fn) {
    fn(vnode.elm, dir, vnode, oldVnode)
  }
}

var baseModules = [
  ref,
  directives
]

/* 
 * 
 */

function updateAttrs (oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {  // 同时都没有 返回 什么都不做
    return
  }
  var key, cur, old
  var elm = vnode.elm // elm是el
  var oldAttrs = oldVnode.data.attrs || {} 
  var attrs = vnode.data.attrs || {}
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = vnode.data.attrs = extend({}, attrs)
  }

  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      setAttr(elm, key, cur) // 在element上设置属性
    }
  }
  for (key in oldAttrs) { // 在oldAttrs值为空的属性，移除。
    if (attrs[key] == null) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key))
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key)
      }
    }
  }
}
/*
 * 函数的作用是根据key和value设置el的属性值
 * 
 */
function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {  // 如果key是布尔值的属性
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {  // 如果要设置为false，就移除该属性，否则给设置属性值
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, key)
    }
  } else if (isEnumeratedAttr(key)) {  // 这里必须设置一个false值
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true')
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key))
    } else {
      el.setAttributeNS(xlinkNS, key, value)
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, value)
    }
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
}

/*
 * 更新class值
 */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm // 获取dom结点
  var data = vnode.data
  var oldData = oldVnode.data
  if (!data.staticClass && !data.class &&
      (!oldData || (!oldData.staticClass && !oldData.class))) {
    return
  }

  var cls = genClassForVnode(vnode) // 返回的是一个字符串

  // handle transition classes
  var transitionClass = el._transitionClasses
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass)) // 把transitionClass加在后面
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls)
    el._prevClass = cls // 保存一个prevClass
  }
}

var klass = {
  create: updateClass,
  update: updateClass
}

// skip type checking this file because we need to attach private properties
// to elements

function updateDOMListeners (oldVnode, vnode) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }
  var on = vnode.data.on || {}
  var oldOn = oldVnode.data.on || {}
  var add = vnode.elm._v_add || (vnode.elm._v_add = function (event, handler, capture) {
    vnode.elm.addEventListener(event, handler, capture)
  })
  var remove = vnode.elm._v_remove || (vnode.elm._v_remove = function (event, handler) {
    vnode.elm.removeEventListener(event, handler)
  })
  updateListeners(on, oldOn, add, remove)
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
}

/*
 * 更新DOMProps
 */

function updateDOMProps (oldVnode, vnode) {
  if (!oldVnode.data.domProps && !vnode.data.domProps) {
    return
  }
  var key, cur
  var elm = vnode.elm
  var oldProps = oldVnode.data.domProps || {}
  var props = vnode.data.domProps || {}
  // clone observed objects, as the user probably wants to mutate it
  if (props.__ob__) {
    props = vnode.data.domProps = extend({}, props)
  }

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = undefined
    }
  }
  for (key in props) {
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if ((key === 'textContent' || key === 'innerHTML') && vnode.children) {
      vnode.children.length = 0
    }
    cur = props[key]
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur
      // avoid resetting cursor position when value is the same
      var strCur = cur == null ? '' : String(cur)
      if (elm.value !== strCur) {
        elm.value = strCur
      }
    } else {
      elm[key] = cur
    }
  }
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
}

/*got*/ 

var prefixes = ['Webkit', 'Moz', 'ms']

var testEl // a element
// 顾名思义 css属性名补全
var normalize = cached(function (prop) {
  testEl = testEl || document.createElement('div')
  prop = camelize(prop)
  if (prop !== 'filter' && (prop in testEl.style)) { // props是一个css属性名
    return prop
  }
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1)
  for (var i = 0; i < prefixes.length; i++) {
    var prefixed = prefixes[i] + upper
    if (prefixed in testEl.style) {
      return prefixed
    }
  }
})

function updateStyle (oldVnode, vnode) {
  if ((!oldVnode.data || !oldVnode.data.style) && !vnode.data.style) {
    return
  }
  var cur, name
  var el = vnode.elm
  var oldStyle = oldVnode.data.style || {}
  var style = vnode.data.style || {}

  // handle string
  // cssText 它是一组样式属性及其值的文本表示。这个文本格式化为一个 CSS 样式表，去掉了包围属性和值的元素选择器的花括号。
  // 如 obj.cssText = " width:200px;position:absolute;left:100px;";
  if (typeof style === 'string') {
    el.style.cssText = style
    return
  }

  var needClone = style.__ob__

  // handle array syntax
  if (Array.isArray(style)) {
    style = vnode.data.style = toObject(style) // 数组类型的style转化为object类型的
  }

  // clone the style for future updates,
  // in case the user mutates the style object in-place.
  if (needClone) {
    style = vnode.data.style = extend({}, style)
  }

  // 下面这两个for循环的意思是
  // 如果old里有的，cur没有，把cur里的设置成一个空字符串
  // 如果cur里有的，old没有，设置cur
  for (name in oldStyle) {
    if (!style[name]) {
      el.style[normalize(name)] = ''
    }
  }
  for (name in style) {
    cur = style[name]
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      el.style[normalize(name)] = cur || ''
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
}

/*got*/

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) { //  cls表示要添加的class项
  /* istanbul ignore else */
  if (el.classList) { // el.classList: Set
    if (cls.indexOf(' ') > -1) { // 说明有多个class名
      cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); })
    } else {
      el.classList.add(cls) // 没有空格的话，说明只需要添加一个class
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' '
    if (cur.indexOf(' ' + cls + ' ') < 0) { // 如果之前没有的话
      el.setAttribute('class', (cur + cls).trim())  // 把cls加在后面
    } // 如果没有 什么都不做
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 * 移除一个或多个class类名
 */
function removeClass (el, cls) {
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); })
    } else {
      el.classList.remove(cls)
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' '
    var tar = ' ' + cls + ' '
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ')
    }
    el.setAttribute('class', cur.trim())
  }
}

/*
 * 处理渐变
 */
var hasTransition = inBrowser && !isIE9 // 是否支持transition
var TRANSITION = 'transition'
var ANIMATION = 'animation'

// Transition property/event sniffing
var transitionProp = 'transition'
var transitionEndEvent = 'transitionend'
var animationProp = 'animation'
var animationEndEvent = 'animationend'
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition'
    transitionEndEvent = 'webkitTransitionEnd'
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation'
    animationEndEvent = 'webkitAnimationEnd'
  }
}

var raf = (inBrowser && window.requestAnimationFrame) || setTimeout  // ????
function nextFrame (fn) {
  raf(function () {
    raf(fn)
  })
}

function addTransitionClass (el, cls) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls)
  addClass(el, cls)
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls)
  }
  removeClass(el, cls)
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) return cb() // 如果type不存在，直接执行回调函数
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent // 事件类型
  var ended = 0 // 已经结束的
  var end = function () {
    el.removeEventListener(event, onEnd)
    cb()
  }
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end()
      }
    }
  }
  setTimeout(function () {
    if (ended < propCount) { // 如果没有全部结束，也移除事件
      end()
    }
  }, timeout + 1) // 
  el.addEventListener(event, onEnd)
}

var transformRE = /\b(transform|all)(,|$)/

function getTransitionInfo (el, expectedType) { // expectedType 只是表示 是渐变还是动画
  var styles = window.getComputedStyle(el) // 获得全部的计算属性
  var transitioneDelays = styles[transitionProp + 'Delay'].split(', ') // Array 渐变延迟时间
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ') // Array 渐变持续时间
  var transitionTimeout = getTimeout(transitioneDelays, transitionDurations) // Number 渐变最长时间
  var animationDelays = styles[animationProp + 'Delay'].split(', ') // Array 动画延迟时间
  var animationDurations = styles[animationProp + 'Duration'].split(', ') // Array 动画持续时间
  var animationTimeout = getTimeout(animationDelays, animationDurations) // Number 动画最长时间

  var type
  var timeout = 0
  var propCount = 0
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION
      timeout = transitionTimeout
      propCount = transitionDurations.length // 设置了几个时间 就当然是有多少个prop
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION
      timeout = animationTimeout
      propCount = animationDurations.length
    }
  } else { // 如果都不是
    timeout = Math.max(transitionTimeout, animationTimeout)
    type = timeout > 0 // 谁时间长选谁
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property'])
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
 // delays 和 durations为长度相同的的数组，将两个数组的每一项相加取一个最大值
  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s) { // 秒变毫秒
  return Number(s.slice(0, -1)) * 1000  // 这里的s.slice(0,-1) 表示去掉最后一个秒的单位s 
}

/*  */

function enter (vnode) {
  var el = vnode.elm 

  // call leave callback now
  if (el._leaveCb) {
    el._leaveCb.cancelled = true
    el._leaveCb()
  }

  var data = resolveTransition(vnode.data.transition)
  if (!data) {
    return
  }

  /* istanbul ignore if */
  if (el._enterCb || el.nodeType !== 1) { // 不是元素结点直接返回
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var transitionNode = activeInstance.$vnode
  var context = transitionNode && transitionNode.parent
    ? transitionNode.parent.context
    : activeInstance

  var isAppear = !context._isMounted || !vnode.isRootInsert

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear ? appearClass : enterClass
  var activeClass = isAppear ? appearActiveClass : enterActiveClass
  var beforeEnterHook = isAppear ? (beforeAppear || beforeEnter) : beforeEnter
  var enterHook = isAppear ? (typeof appear === 'function' ? appear : enter) : enter
  var afterEnterHook = isAppear ? (afterAppear || afterEnter) : afterEnter
  var enterCancelledHook = isAppear ? (appearCancelled || enterCancelled) : enterCancelled

  var expectsCSS = css !== false && !isIE9
  var userWantsControl =
    enterHook &&
    // enterHook may be a bound method which exposes
    // the length of original fn as _length
    (enterHook._length || enterHook.length) > 1

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, activeClass)
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass)
      }
      enterCancelledHook && enterCancelledHook(el)
    } else {
      afterEnterHook && afterEnterHook(el)
    }
    el._enterCb = null
  })

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
      var parent = el.parentNode
      var pendingNode = parent && parent._pending && parent._pending[vnode.key]
      if (pendingNode && pendingNode.tag === vnode.tag && pendingNode.elm._leaveCb) {
        pendingNode.elm._leaveCb()
      }
      enterHook && enterHook(el, cb)
    })
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el)
  if (expectsCSS) {
    addTransitionClass(el, startClass)
    addTransitionClass(el, activeClass)
    nextFrame(function () {
      removeTransitionClass(el, startClass)
      if (!cb.cancelled && !userWantsControl) {
        whenTransitionEnds(el, type, cb)
      }
    })
  }

  if (vnode.data.show) {
    enterHook && enterHook(el, cb)
  }

  if (!expectsCSS && !userWantsControl) {
    cb()
  }
}

function leave (vnode, rm) {
  var el = vnode.elm

  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true
    el._enterCb()
  }

  var data = resolveTransition(vnode.data.transition) // 
  if (!data) {
    return rm()
  }

  /* istanbul ignore if */
  if (el._leaveCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;

  var expectsCSS = css !== false && !isIE9
  var userWantsControl =
    leave &&
    // leave hook may be a bound method which exposes
    // the length of original fn as _length
    (leave._length || leave.length) > 1

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveActiveClass)
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass)
      }
      leaveCancelled && leaveCancelled(el)
    } else {
      rm()
      afterLeave && afterLeave(el)
    }
    el._leaveCb = null
  })

  if (delayLeave) {
    delayLeave(performLeave)
  } else {
    performLeave()
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode
    }
    beforeLeave && beforeLeave(el)
    if (expectsCSS) {
      addTransitionClass(el, leaveClass)
      addTransitionClass(el, leaveActiveClass)
      nextFrame(function () {
        removeTransitionClass(el, leaveClass)
        if (!cb.cancelled && !userWantsControl) {
          whenTransitionEnds(el, type, cb)
        }
      })
    }
    leave && leave(el, cb)
    if (!expectsCSS && !userWantsControl) {
      cb()
    }
  }
}

function resolveTransition (def) { // def: Object | String 
  if (!def) {
    return
  }
  /* istanbul ignore else */
  if (typeof def === 'object') { 
    var res = {}
    if (def.css !== false) { // def.css?
      extend(res, autoCssTransition(def.name || 'v'))
    }
    extend(res, def)
    return res
  } else if (typeof def === 'string') {
    return autoCssTransition(def)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    leaveClass: (name + "-leave"),
    appearClass: (name + "-enter"),
    enterActiveClass: (name + "-enter-active"),
    leaveActiveClass: (name + "-leave-active"),
    appearActiveClass: (name + "-enter-active")
  }
})

function once (fn) {
  var called = false
  return function () {
    if (!called) {
      called = true
      fn()
    }
  }
}

var transition = inBrowser ? {
  create: function create (_, vnode) {
    if (!vnode.data.show) {
      enter(vnode)
    }
  },
  remove: function remove (vnode, rm) {
    /* istanbul ignore else */
    if (!vnode.data.show) {
      leave(vnode, rm)
    } else {
      rm()
    }
  }
} : {}

var platformModules = [
  attrs, // { create: updateAttrs, update: updateAttrs }
  klass, // { create: updateClass, update: updateClass }
  events, // {create: updateDOMListeners,update: updateDOMListener }
  domProps, // { create: updateDOMProps,update: updateDOMProps }
  style, // { create: updateStyle,update: updateStyle}
  transition // {}
]

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules)  // baseModules: [ref, directives]

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules })

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 * 处理 v-model
 */

var modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_\-]*)?$/ // vue-compoent-一个数字？

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement // 返回文档中当前获得焦点的元素
    if (el && el.vmodel) { // 如果绑定了v-model  el.vmodel: Boolean
      trigger(el, 'input')
    }
  })
}

var model = {
  bind: function bind (el, binding, vnode) {
    if ("development" !== 'production') {
      if (!modelableTagRE.test(vnode.tag)) { // 只能绑定在上述标签中
        warn(
          "v-model is not supported on element type: <" + (vnode.tag) + ">. " +
          'If you are working with contenteditable, it\'s recommended to ' +
          'wrap a library dedicated for that purpose inside a custom component.',
          vnode.context
        )
      }
    }
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
    } else {
      if (!isAndroid) {
        //合成事件：DOM3级新增，用于处理IME的输入序列。
        //所谓IME，指的是输入法编辑器，可以让用户输入在物理键盘上找不到的字符。
        //compositionstart、compositionupdate、compositionend三种事件。
        el.addEventListener('compositionstart', onCompositionStart)
        el.addEventListener('compositionend', onCompositionEnd)
      }
      /* istanbul ignore if */
      if (isIE9) {
        el.vmodel = true
      }
    }
  },
  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matchig
      // option in the DOM.
      var needReset = el.multiple
        ? binding.value.some(function (v) { return hasNoMatchingOption(v, el.options); })
        : hasNoMatchingOption(binding.value, el.options)
      if (needReset) {
        trigger(el, 'change')
      }
    }
  }
}

function setSelected (el, binding, vm) { // vnode.context是一个vm
  var value = binding.value
  var isMultiple = el.multiple // el.multiple表示当前select可以多选
  if (isMultiple && !Array.isArray(value)) { // 如果是多选，那么value应该是一个数组
    "development" !== 'production' && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    )
    return
  }
  var selected, option
  for (var i = 0, l = el.options.length; i < l; i++) { // el.options: Array ？
    option = el.options[i]
    if (isMultiple) {
      selected = value.indexOf(getValue(option)) > -1
      if (option.selected !== selected) {
        option.selected = selected
      }
    } else {
      if (getValue(option) === value) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1
  }
}

function hasNoMatchingOption (value, options) { // options: Array
  for (var i = 0, l = options.length; i < l; i++) {
    if (getValue(options[i]) === value) {
      return false
    }
  }
  return true
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value || option.text
}

function onCompositionStart (e) {
  e.target.composing = true
}

function onCompositionEnd (e) {
  e.target.composing = false
  trigger(e.target, 'input')
}

function trigger (el, type) { // 触发事件
  var e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.child && (!vnode.data || !vnode.data.transition) 
    // 如果vnode.child存在而且vnode.data或vnode.transition不存在
    ? locateNode(vnode.child._vnode)
    : vnode // 
}

var show = {
  bind: function bind (el, ref, vnode) { // ref
    var value = ref.value;

    vnode = locateNode(vnode)
    var transition = vnode.data && vnode.data.transition
    if (value && transition && !isIE9) {
      enter(vnode)
    }
    var originalDisplay = el.style.display === 'none' ? '' : el.style.display
    el.style.display = value ? originalDisplay : 'none'
    el.__vOriginalDisplay = originalDisplay
  },
  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (value === oldValue) return
    vnode = locateNode(vnode)
    var transition = vnode.data && vnode.data.transition
    if (transition && !isIE9) {
      if (value) {
        enter(vnode)
        el.style.display = el.__vOriginalDisplay
      } else {
        leave(vnode, function () {
          el.style.display = 'none'
        })
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none'
    }
  }
}

var platformDirectives = {
  model: model,
  show: show
}

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String
}

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recrusively retrieve the real component to be rendered
// real child
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
    // return children && children.filter(function (c) { return c && c.componentOptions; })[0]
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {}
  var options = comp.$options
  // props
  for (var key in options.propsData) {
    data[key] = comp[key]
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1].fn
  }
  return data
}

function placeholder (h, rawChild) {
  return /\d-keep-alive$/.test(rawChild.tag)
    ? h('keep-alive')
    : null
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default //
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) { return c.tag; })
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if ("development" !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      )
    }

    var mode = this.mode

    // warn invalid mode
    if ("development" !== 'production' &&
        mode && mode !== 'in-out' && mode !== 'out-in') {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      )
    }

    var rawChild = children[0] 

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild)
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    child.key = child.key == null
      ? ("__v" + (child.tag + this._uid) + "__")
      : child.key
    var data = (child.data || (child.data = {})).transition = extractTransitionData(this)
    var oldRawChild = this._vnode
    var oldChild = getRealChild(oldRawChild)

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true
    }

    if (oldChild && oldChild.data && oldChild.key !== child.key) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data)

      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false
          this$1.$forceUpdate()
        })
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        var delayedLeave
        var performLeave = function () { delayedLeave() }
        mergeVNodeHook(data, 'afterEnter', performLeave)
        mergeVNodeHook(data, 'enterCancelled', performLeave)
        mergeVNodeHook(oldData, 'delayLeave', function (leave) {
          delayedLeave = leave
        })
      }
    }

    return rawChild
  }
}

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final disired state. This way in the second pass removed
// nodes will remain where they should be.

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps)

delete props.mode

var TransitionGroup = {
  props: props,

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span'
    var map = Object.create(null)
    var prevChildren = this.prevChildren = this.children
    var rawChildren = this.$slots.default || []
    var children = this.children = []
    var transitionData = extractTransitionData(this)

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i]
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c)
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData
        } else if ("development" !== 'production') {
          var opts = c.componentOptions
          var name = opts
            ? (opts.Ctor.options.name || opts.tag)
            : c.tag
          warn(("<transition-group> children must be keyed: <" + name + ">"))
        }
      }
    }

    if (prevChildren) {
      var kept = []
      var removed = []
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1]
        c$1.data.transition = transitionData
        c$1.data.pos = c$1.elm.getBoundingClientRect()
        if (map[c$1.key]) {
          kept.push(c$1)
        } else {
          removed.push(c$1)
        }
      }
      this.kept = h(tag, null, kept)
      this.removed = removed
    }

    return h(tag, null, children)
  },

  beforeUpdate: function beforeUpdate () {
    // force removing pass
    this.__patch__(
      this._vnode,
      this.kept,
      false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
    )
    this._vnode = this.kept
  },

  updated: function updated () {
    var children = this.prevChildren
    var moveClass = this.moveClass || (this.name + '-move')
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    children.forEach(function (c) {
      /* istanbul ignore if */
      if (c.elm._moveCb) {
        c.elm._moveCb()
      }
      /* istanbul ignore if */
      if (c.elm._enterCb) {
        c.elm._enterCb()
      }
      var oldPos = c.data.pos
      var newPos = c.data.pos = c.elm.getBoundingClientRect()
      var dx = oldPos.left - newPos.left
      var dy = oldPos.top - newPos.top
      if (dx || dy) {
        c.data.moved = true
        var s = c.elm.style
        s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)"
        s.transitionDuration = '0s'
      }
    })

    // force reflow to put everything in position
    var f = document.body.offsetHeight // eslint-disable-line

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm
        var s = el.style
        addTransitionClass(el, moveClass)
        s.transform = s.WebkitTransform = s.transitionDuration = ''
        el._moveDest = c.data.pos
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb)
            el._moveCb = null
            removeTransitionClass(el, moveClass)
          }
        })
      }
    })
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      if (this._hasMove != null) {
        return this._hasMove
      }
      addTransitionClass(el, moveClass)
      var info = getTransitionInfo(el)
      removeTransitionClass(el, moveClass)
      return (this._hasMove = info.hasTransform)
    }
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
}

/*  */

// install platform specific utils
Vue.config.isUnknownElement = isUnknownElement
Vue.config.isReservedTag = isReservedTag
Vue.config.getTagNamespace = getTagNamespace
Vue.config.mustUseProp = mustUseProp

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// install platform patch function
Vue.prototype.__patch__ = config._isServer ? noop : patch

// wrap mount
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && !config._isServer ? query(el) : undefined
  return this._mount(el, hydrating)
}

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue)
    } else if (
      "development" !== 'production' &&
      inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)
    ) {
      console.log(
        'Download the Vue Devtools for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      )
    }
  }
}, 0)

/*  */

// check whether current browser encodes a char inside attribute values
// 检查当前浏览器能否编码属性值里面的字符
function shouldDecode (content, encoded) {
  var div = document.createElement('div')
  div.innerHTML = "<div a=\"" + content + "\">"
  return div.innerHTML.indexOf(encoded) > 0
}

// According to
// https://w3c.github.io/DOM-Parsing/#dfn-serializing-an-attribute-value
// when serializing innerHTML, <, >, ", & should be encoded as entities.
// 当序列化innerHTML时，<, >, ", &, 都应该被编码
// However, only some browsers, e.g. PhantomJS, encodes < and >.
// this causes problems with the in-browser parser.

// 检查'>' 能否被编码成'&gt' 
var shouldDecodeTags = inBrowser ? shouldDecode('>', '&gt;') : false 

// #3663
// IE encodes newlines inside attribute values while other browsers don't
// 检查换行符'\n' 能否被编码成'&#10'
var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false

/*  */

var decoder = document.createElement('div')
/*
 * 返回传入的html去掉元素标签的所有文本
 */
function decodeHTML (html) {
  decoder.innerHTML = html
  return decoder.textContent // textContent 和 innerHTML 的区别是 textContent返回纯文本 而innerHTML返回带html标签的文本
}

/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// Regular Expressions for parsing tags and attributes
var singleAttrIdentifier = /([^\s"'<>\/=]+)/ // 不是空格，", ', <, >, \, /, = 
var singleAttrAssign = /(?:=)/ // 匹配 =
var singleAttrValues = [
  // attr value double quotes
  /"([^"]*)"+/.source,
  // attr value, single quotes
  /'([^']*)'+/.source,
  // attr value, no quotes
  /([^\s"'=<>`]+)/.source
]
var attribute = new RegExp(
  '^\\s*' + singleAttrIdentifier.source +
  '(?:\\s*(' + singleAttrAssign.source + ')' +
  '\\s*(?:' + singleAttrValues.join('|') + '))?'
)

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
var ncname = '[a-zA-Z_][\\w\\-\\.]*' //  /[a-zA-Z_][\w\-\.]*/  以字母或者下划线开头

// 关于qnameCapture
// 匹配一个ncname
// 如果出现:
// 后面一定要有[a-zA-Z_]
var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'
var startTagOpen = new RegExp('^<' + qnameCapture) // 匹配标签左开
var startTagClose = /^\s*(\/?)>/ // 标签右关
var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>') // 结束标签
var doctype = /^<!DOCTYPE [^>]+>/i  // doctype

var IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function (m, g) {  // ???
  IS_REGEX_CAPTURING_BROKEN = g === ''
})

// Special Elements (can contain anything)
var isSpecialTag = makeMap('script,style', true) // 是否是script 或者是 style

var reCache = {}

var ltRE = /&lt;/g // "<"
var gtRE = /&gt;/g // ">"
var nlRE = /&#10;/g // 换行
var ampRE = /&amp;/g // "&"
var quoteRE = /&quot;/g // """"

/*
 * 对属性进行解码
 */
function decodeAttr (value, shouldDecodeTags, shouldDecodeNewlines) {
  if (shouldDecodeTags) {
    value = value.replace(ltRE, '<').replace(gtRE, '>')
  }
  if (shouldDecodeNewlines) {
    value = value.replace(nlRE, '\n')
  }
  return value.replace(ampRE, '&').replace(quoteRE, '"')
}
/*
 * 解析html
 * 
 */
function parseHTML (html, options) {
  var stack = []
  var expectHTML = options.expectHTML
  var isUnaryTag = options.isUnaryTag || no
  var isFromDOM = options.isFromDOM
  var index = 0
  var last, lastTag
  while (html) {
    last = html
    // Make sure we're not in a script or style element
    if (!lastTag || !isSpecialTag(lastTag)) { // lastTag不存在，或者lastTag不是script或者style 
      var textEnd = html.indexOf('<')
      if (textEnd === 0) { // 如果html以<开头
        // Comment:
        if (/^<!--/.test(html)) {// 以<!--开头 下同
          var commentEnd = html.indexOf('-->') // 有配对的'--> '

          if (commentEnd >= 0) {
            advance(commentEnd + 3) // 切掉前面的注释
            continue // 执行下一次while
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        // 同样切掉
        if (/^<!\[/.test(html)) { 
          var conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // Doctype:  /^<!DOCTYPE [^>]+>/i 
        // 切掉doctype
        var doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // End tag:  new RegExp('^<\\/' + qnameCapture + '[^>]*>')
        var endTagMatch = html.match(endTag)
        if (endTagMatch) {  // 如果html中有结束标签
          var curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[0], endTagMatch[1], curIndex, index)
          continue
        }

        // Start tag: 
        var startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          continue
        }
      }

      var text
      if (textEnd >= 0) {
        text = html.substring(0, textEnd)
        advance(textEnd)
      } else {
        text = html
        html = ''
      }

      if (options.chars) {
        options.chars(text)
      }
    } else {
      var stackedTag = lastTag.toLowerCase()
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
      var endTagLength = 0
      var rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length
        if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
          text = text
            .replace(/<!--([\s\S]*?)-->/g, '$1')
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        }
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest.length
      html = rest
      parseEndTag('</' + stackedTag + '>', stackedTag, index - endTagLength, index)
    }

    if (html === last) {
      throw new Error('Error parsing template:\n\n' + html)
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  function advance (n) { // 去掉n之前的部分
    index += n
    html = html.substring(n)
  }
  /*
   * 函数的作用
   * 由于在开始标签中可能会定义一些属性等等，所以要对整个进行解析
   * 返回值match: {
   *   tagName: String,
   *   attrs: [String,...],
   *   start: Number,
   *   unarySlash: '/' | undefined,
   *   end: Number
   * }
   */
  function parseStartTag () {
    var start = html.match(startTagOpen) // startTagOpen: new RegExp('^<' + qnameCapture)   html要以开始标签打头
    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      advance(start[0].length) // 切掉这个开始标签
      var end, attr
      // startTagClose: /^\s*(\/?)>/
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) { // 匹配属性正则表达式
        advance(attr[0].length) // 再切掉html
        match.attrs.push(attr) // 
      } // 直到匹配到了startTagclose 或者匹配不到属性了
      if (end) { // 这里表示end匹配到了startTagClose ，循环结束。
        match.unarySlash = end[1] // 是否有/ 或者是不是自闭合标签
        advance(end[0].length) // 切掉整个startTagClose
        match.end = index // 同时在match上设置一个end属性
        return match
      }
    }
  }

  function handleStartTag (match) { // 参数是返回的match对象
    var tagName = match.tagName
    var unarySlash = match.unarySlash

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag('', lastTag)
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag('', tagName)
      }
    }

    var unary = isUnaryTag(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash

    var l = match.attrs.length
    var attrs = new Array(l)
    for (var i = 0; i < l; i++) {
      var args = match.attrs[i]
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        if (args[3] === '') { delete args[3] }
        if (args[4] === '') { delete args[4] }
        if (args[5] === '') { delete args[5] }
      }
      var value = args[3] || args[4] || args[5] || ''
      attrs[i] = {
        name: args[1],
        value: isFromDOM ? decodeAttr(
          value,
          options.shouldDecodeTags,
          options.shouldDecodeNewlines
        ) : value
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, attrs: attrs })
      lastTag = tagName
      unarySlash = ''
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  function parseEndTag (tag, tagName, start, end) { 
    var pos
    if (start == null) start = index
    if (end == null) end = index

    // Find the closest opened tag of the same type
    // stack用于缓存之前的startTag
    if (tagName) {
      var needle = tagName.toLowerCase()
      for (pos = stack.length - 1; pos >= 0; pos--) { // stack是函数一开始定义的一个数组，
        // 如果stack里之前存在needle，退出循环
        if (stack[pos].tag.toLowerCase() === needle) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if (options.end) { // options是parseHtml传入的options, Function
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (tagName.toLowerCase() === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (tagName.toLowerCase() === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}

/*
 * 解析filters
 * ？？？
 * 函数作用，抽离出filter表达式里的参数和各个filter
 * 首先传入一个exp字符串，依次遍历这个字符串
 * 检查 是否在单引号里面， 是否在双引号里面， 是否是管道符
 * 
 */

function parseFilters (exp) { //for example:  message | capitalize'
  // exp : String
  
  var inSingle = false // 单引号
  var inDouble = false // 双引号
  var curly = 0 // ()
  var square = 0 // []
  var paren = 0 // {}
  var lastFilterIndex = 0
  var c, prev, i, expression, filters

  for (i = 0; i < exp.length; i++) { // 
    prev = c // 保存之前的c
    c = exp.charCodeAt(i) // c是当前字符
    if (inSingle) { // 在单引号里
      // check single quote
      if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle // 0x27单引号 0x5c反斜线
    } else if (inDouble) { // 在双引号里
      // check double quote
      if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble // 0x22双引号
    } else if (
      c === 0x7C && // pipe | 如果没有碰到双引号或者单引号
      exp.charCodeAt(i + 1) !== 0x7C && // 而且下一个和前一个都不是 | 
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren // 之前没有有（左）圆括号 方括号 花括号 也就是说不在括号之中
    ) {
      if (expression === undefined) { 
        // first filter, end of expression
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim() // 第一个pipe之前的表达式
      } else {
        pushFilter() 
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break // " 第一次遇到双引号时，inDouble设为true
        case 0x27: inSingle = true; break // ' 第一次遇到单引号时，inSingle设为true
        case 0x28: paren++; break         // (
        case 0x29: paren--; break         // )
        case 0x5B: square++; break        // [
        case 0x5D: square--; break        // ]
        case 0x7B: curly++; break         // {
        case 0x7D: curly--; break         // }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim() // 如果一直没碰到pipe expression就是整个表达式
  } else if (lastFilterIndex !== 0) { 
    pushFilter()
  }

  function pushFilter () {  // exp传入的exp
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim()) // lastFilterIndex到i直接就是一个过滤器名称
    lastFilterIndex = i + 1
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}

/*
 * 包装filter
 * Vue.prototype._f, 接受一个id参数
 * 返回this.$options.filters[id] 是一个函数
 * 函数再接受(exp,args)参数
 */
function wrapFilter (exp, filter) { // 
  var i = filter.indexOf('(')
  if (i < 0) { // 如果没有左圆括号
    // _f: resolveFilter
    return ("_f(\"" + filter + "\")(" + exp + ")")  // _f("someFilter")(exp)
  } else {
    var name = filter.slice(0, i) // 以左圆括号分界
    var args = filter.slice(i + 1)
    return ("_f(\"" + name + "\")(" + exp + "," + args) // _f("name")(exp,args)  这里args已经包含了右括号，
  }
}

/*  */

var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g // {{.或者换行}} 至少一次，非贪婪模式
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g  // 元字符

var buildRegex = cached(function (delimiters) { //  delimiter是含有两个元素的数组
  var open = delimiters[0].replace(regexEscapeRE, '\\$&')
  var close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

function parseText (  // 解析文本
  text,
  delimiters // delimiters: Array
) {
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  if (!tagRE.test(text)) {
    return
  }
  var tokens = []
  var lastIndex = tagRE.lastIndex = 0
  var match, index
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)))
    }
    // tag token
    var exp = parseFilters(match[1].trim())
    tokens.push(("_s(" + exp + ")"))
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }
  return tokens.join('+')
}

/*  */

function baseWarn (msg) {
  console.error(("[Vue parser]: " + msg))
}
/*
 * 寻找modules中的每一个module中key属性值，过滤掉空值
 */
function pluckModuleFunction (
  modules,
  key
) {
  return modules
    ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; }) 
    // filter 过滤掉map过后数组元素为空的值
    : []
}
/*
 * el.props: [
 *   {
 *     name: name,
 *     value: value
 *   }
 * ]
 */
function addProp (el, name, value) {
  (el.props || (el.props = [])).push({ name: name, value: value })
}
/*
 * el.attrs: [
 *   {
 *     name: name,
 *     value: value
 *   }
 * ]
 */
function addAttr (el, name, value) {
  (el.attrs || (el.attrs = [])).push({ name: name, value: value })
}
/*
 * el.directives: [
 *  {
 *    name: name,
 *    value: value,
 *    arg: arg,
 *    modifiers: modifiers
 *  }
 * ]
 */
function addDirective (
  el,
  name,
  value,
  arg,
  modifiers
) {
  (el.directives || (el.directives = [])).push({ name: name, value: value, arg: arg, modifiers: modifiers })
}
/*
 * addHook
 * hooks: {
 *   name: [code1,code2,...]
 * }
 * 
 */
function addHook (el, name, code) { // code: String
  var hooks = el.hooks || (el.hooks = {})
  var hook = hooks[name]
  /* istanbul ignore if */
  if (hook) {
    hook.push(code)
  } else {
    hooks[name] = [code]
  }
}

function addHandler (
  el,
  name,
  value,
  modifiers,
  important
) {
  // check capture modifier
  if (modifiers && modifiers.capture) {
    delete modifiers.capture
    name = '!' + name // mark the event as captured
  }
  var events
  if (modifiers && modifiers.native) {
    delete modifiers.native
    events = el.nativeEvents || (el.nativeEvents = {})
  } else {
    events = el.events || (el.events = {})
  }
  var newHandler = { value: value, modifiers: modifiers }
  var handlers = events[name]
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler)
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler]
  } else {
    events[name] = newHandler
  }
}
/*
 * 得到绑定的属性
 * 函数的作用
 * 1. 先检查是否有dynamicValue，如果有，直接返回
 * 2. 如果没有通过v-bind绑定，再检查staticValue
 */
function getBindingAttr (
  el,
  name,
  getStatic
) {
  var dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name)
  if (dynamicValue != null) {
    return dynamicValue
  } else if (getStatic !== false) {
    var staticValue = getAndRemoveAttr(el, name)
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}
/*
 * 简而言之，函数的作用是
 * 1. 在el.attrsMap找name属性对应的值，并返回
 * 2. 在el.attrsList中找到某个对象，删掉
 * 函数的返回值el.attrsMap[name]
 */
function getAndRemoveAttr (el, name) { // attrsMap and attrsList
  var val
  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList
    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1)
        break
      }
    }
  }
  return val
}

/*  */

var dirRE = /^v-|^@|^:/ // 指令  以v-或者 @ 或者: 开头
var forAliasRE = /(.*)\s+(?:in|of)\s+(.*)/ // 用于v-for
var forIteratorRE = /\(([^,]*),([^,]*)(?:,([^,]*))?\)/
var bindRE = /^:|^v-bind:/ // v-bind  以v_bind 或者: 开头
var onRE = /^@|^v-on:/ // on 以@或者v-on开头
var argRE = /:(.*)$/ 
var modifierRE = /\.[^\.]+/g

var decodeHTMLCached = cached(decodeHTML)

// configurable state
var warn$1
var platformGetTagNamespace
var platformMustUseProp
var platformIsPreTag
var preTransforms
var transforms
var postTransforms
var delimiters

/**
 * Convert HTML string to AST.
 */
function parse (
  template,
  options
) {
  warn$1 = options.warn || baseWarn 
  platformGetTagNamespace = options.getTagNamespace || no
  platformMustUseProp = options.mustUseProp || no
  platformIsPreTag = options.isPreTag || no
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode') // options.modules[preTransformNode] 下同
  transforms = pluckModuleFunction(options.modules, 'transformNode') 
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')
  delimiters = options.delimiters
  var stack = []
  var preserveWhitespace = options.preserveWhitespace !== false
  var root
  var currentParent
  var inVPre = false
  var inPre = false
  var warned = false
  parseHTML(template, {
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    isFromDOM: options.isFromDOM,
    shouldDecodeTags: options.shouldDecodeTags,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    start: function start (tag, attrs, unary) {
      // check namespace.
      // inherit parent ns if there is one
      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

      // handle IE svg bug
      /* istanbul ignore if */
      if (options.isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs)
      }

      var element = {
        type: 1,
        tag: tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      }
      if (ns) {
        element.ns = ns
      }

      if ("client" !== 'server' && isForbiddenTag(element)) {
        element.forbidden = true
        "development" !== 'production' && warn$1(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          "<" + tag + ">."
        )
      }

      // apply pre-transforms
      for (var i = 0; i < preTransforms.length; i++) {
        preTransforms[i](element, options)
      }

      if (!inVPre) {
        processPre(element)
        if (element.pre) {
          inVPre = true
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true
      }
      if (inVPre) {
        processRawAttrs(element)
      } else {
        processFor(element)
        processIf(element)
        processOnce(element)

        // determine whether this is a plain element after
        // removing structural attributes
        element.plain = !element.key && !attrs.length

        processKey(element)
        processRef(element)
        processSlot(element)
        processComponent(element)
        for (var i$1 = 0; i$1 < transforms.length; i$1++) {
          transforms[i$1](element, options)
        }
        processAttrs(element)
      }

      function checkRootConstraints (el) {
        if ("development" !== 'production') {
          if (el.tag === 'slot' || el.tag === 'template') {
            warn$1(
              "Cannot use <" + (el.tag) + "> as component root element because it may " +
              'contain multiple nodes:\n' + template
            )
          }
          if (el.attrsMap.hasOwnProperty('v-for')) {
            warn$1(
              'Cannot use v-for on stateful component root element because ' +
              'it renders multiple elements:\n' + template
            )
          }
        }
      }

      // tree management
      if (!root) {
        root = element
        checkRootConstraints(root)
      } else if ("development" !== 'production' && !stack.length && !warned) {
        // allow 2 root elements with v-if and v-else
        if ((root.attrsMap.hasOwnProperty('v-if') && element.attrsMap.hasOwnProperty('v-else'))) {
          checkRootConstraints(element)
        } else {
          warned = true
          warn$1(
            ("Component template should contain exactly one root element:\n\n" + template)
          )
        }
      }
      if (currentParent && !element.forbidden) {
        if (element.else) {
          processElse(element, currentParent)
        } else {
          currentParent.children.push(element)
          element.parent = currentParent
        }
      }
      if (!unary) {
        currentParent = element
        stack.push(element)
      }
      // apply post-transforms
      for (var i$2 = 0; i$2 < postTransforms.length; i$2++) {
        postTransforms[i$2](element, options)
      }
    },

    end: function end () {
      // remove trailing whitespace
      var element = stack[stack.length - 1]
      var lastNode = element.children[element.children.length - 1]
      if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
        element.children.pop()
      }
      // pop stack
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      // check pre state
      if (element.pre) {
        inVPre = false
      }
      if (platformIsPreTag(element.tag)) {
        inPre = false
      }
    },

    chars: function chars (text) {
      if (!currentParent) {
        if ("development" !== 'production' && !warned) {
          warned = true
          warn$1(
            'Component template should contain exactly one root element:\n\n' + template
          )
        }
        return
      }
      text = inPre || text.trim()
        ? decodeHTMLCached(text)
        // only preserve whitespace if its not right after a starting tag
        : preserveWhitespace && currentParent.children.length ? ' ' : ''
      if (text) {
        var expression
        if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
          currentParent.children.push({
            type: 2,
            expression: expression,
            text: text
          })
        } else {
          currentParent.children.push({
            type: 3,
            text: text
          })
        }
      }
    }
  })
  return root
}

function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true
  }
}

function processRawAttrs (el) {
  var l = el.attrsList.length
  if (l) {
    var attrs = el.attrs = new Array(l)
    for (var i = 0; i < l; i++) {
      attrs[i] = {
        name: el.attrsList[i].name,
        value: JSON.stringify(el.attrsList[i].value)
      }
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true
  }
}

function processKey (el) {
  var exp = getBindingAttr(el, 'key')
  if (exp) {
    el.key = exp
  }
}

function processRef (el) {
  var ref = getBindingAttr(el, 'ref')
  if (ref) {
    el.ref = ref
    el.refInFor = checkInFor(el)
  }
}

function processFor (el) {
  var exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    var inMatch = exp.match(forAliasRE)
    if (!inMatch) {
      "development" !== 'production' && warn$1(
        ("Invalid v-for expression: " + exp)
      )
      return
    }
    el.for = inMatch[2].trim()
    var alias = inMatch[1].trim()
    var iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      el.alias = iteratorMatch[1].trim()
      el.iterator1 = iteratorMatch[2].trim()
      if (iteratorMatch[3]) {
        el.iterator2 = iteratorMatch[3].trim()
      }
    } else {
      el.alias = alias
    }
  }
}

function processIf (el) {
  var exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
  }
  if (getAndRemoveAttr(el, 'v-else') != null) {
    el.else = true
  }
}

function processElse (el, parent) {
  var prev = findPrevElement(parent.children)
  if (prev && prev.if) {
    prev.elseBlock = el
  } else if ("development" !== 'production') {
    warn$1(
      ("v-else used on element <" + (el.tag) + "> without corresponding v-if.")
    )
  }
}
/*
 * 处理v-once
 */
function processOnce (el) {
  var once = getAndRemoveAttr(el, 'v-once')
  if (once != null) {
    el.once = true
  }
}

function processSlot (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
  } else {
    var slotTarget = getBindingAttr(el, 'slot')
    if (slotTarget) {
      el.slotTarget = slotTarget
    }
  }
}

function processComponent (el) {
  var binding
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true
  }
}

function processAttrs (el) {
  var list = el.attrsList
  var i, l, name, value, arg, modifiers, isProp
  for (i = 0, l = list.length; i < l; i++) {
    name = list[i].name
    value = list[i].value
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true
      // modifiers
      modifiers = parseModifiers(name)
      if (modifiers) {
        name = name.replace(modifierRE, '')
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '')
        if (modifiers && modifiers.prop) {
          isProp = true
          name = camelize(name)
          if (name === 'innerHtml') name = 'innerHTML'
        }
        if (isProp || platformMustUseProp(name)) {
          addProp(el, name, value)
        } else {
          addAttr(el, name, value)
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler(el, name, value, modifiers)
      } else { // normal directives
        name = name.replace(dirRE, '')
        // parse arg
        var argMatch = name.match(argRE)
        if (argMatch && (arg = argMatch[1])) {
          name = name.slice(0, -(arg.length + 1))
        }
        addDirective(el, name, value, arg, modifiers)
      }
    } else {
      // literal attribute
      if ("development" !== 'production') {
        var expression = parseText(value, delimiters)
        if (expression) {
          warn$1(
            name + "=\"" + value + "\": " +
            'Interpolation inside attributes has been deprecated. ' +
            'Use v-bind or the colon shorthand instead.'
          )
        }
      }
      addAttr(el, name, JSON.stringify(value))
    }
  }
}
/*
 * 一直向上寻找
 * 如果el.for 存在，返回true,否则返回false
 * 检查是否for属性
 */
function checkInFor (el) {
  var parent = el
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent
  }
  return false
}
/*
 * 解析修饰符，各个修饰符存储在一个对象里
 * 如果某个修饰符存在，这个值设为true
 * 返回一个对象
 * {
 *   modifier1: true,
 *   modifier2: true
 *   ...
 * }
 */
function parseModifiers (name) {
  var match = name.match(modifierRE)  // modifierRE: /\.[^\.]+/g   以.开头
  if (match) {
    var ret = {}
    match.forEach(function (m) { ret[m.slice(1)] = true })
    return ret
  }
}

/*
 * attrs: [
 *   {
 *     name: ...
 *     value: ...
 *   }
 * ],
 * ->
 * map: {
 *   name: value
 * }
 */
function makeAttrsMap (attrs) {
  var map = {}
  for (var i = 0, l = attrs.length; i < l; i++) {
    if ("development" !== 'production' && map[attrs[i].name]) {
      warn$1('duplicate attribute: ' + attrs[i].name)
    }
    map[attrs[i].name] = attrs[i].value
  }
  return map
}
/*
 * 前一个元素
 * 元素必须有tag属性
 */
function findPrevElement (children) { 
  var i = children.length
  while (i--) {
    if (children[i].tag) return children[i]
  }
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

var ieNSBug = /^xmlns:NS\d+/
var ieNSPrefix = /^NS\d+:/

/* istanbul ignore next */
function guardIESVGBug (attrs) {
  var res = []
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i]
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '')
      res.push(attr)
    }
  }
  return res
}

/*  */

var isStaticKey
var isPlatformReservedTag

var genStaticKeysCached = cached(genStaticKeys$1)

/**
 * Goal of the optimizier: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
function optimize (root, options) { // ast options
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || (function () { return false; })
  // first pass: mark all non-static nodes.
  markStatic(root)
  // second pass: mark static roots.
  markStaticRoots(root, false)
}

function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
    (keys ? ',' + keys : '')
  )
}

function markStatic (node) { // root
  node.static = isStatic(node) // 增加node.static属性
  if (node.type === 1) {
    for (var i = 0, l = node.children.length; i < l; i++) {
      var child = node.children[i]
      markStatic(child) // 同样给chiil结点增加static属性
      if (!child.static) {
        node.static = false
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.once || node.static) { // 这里要先使用到static属性
      node.staticRoot = true // 增加一个staticRoot属性
      node.staticInFor = isInFor // 增加一个staticInFor属性
      return
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], !!node.for)
      }
    }
  }
}

function isStatic (node) { // 静态node
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    Object.keys(node).every(isStaticKey)
  ))
}

/*  */
//以字母，_或者$开头，+ 任意数量的\w，表示一个对象
//.aaa 或者   表示点字符读取属性
//['aaa'] 或者  表示[]读取属性
//["aaa"] 或者
//[123] 或者
//[abcd1] 
var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/
 

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
}

var modifierCode = { // 修饰符
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: 'if($event.target !== $event.currentTarget)return;'
}

/*
 * 函数的作用
 * 产生一个字符串res,res展开后是一个对象的形式
 * 
 */
function genHandlers (events, native) {
  var res = native ? 'nativeOn:{' : 'on:{'
  for (var name in events) { // events: Object
    res += "\"" + name + "\":" + (genHandler(events[name])) + ","
  }
  return res.slice(0, -1) + '}'
}

/*
 * 函数的作用
 * 传入一个handler
 * 
 */
function genHandler (
  handler
) {
  if (!handler) {
    return 'function(){}'
  } else if (Array.isArray(handler)) { // 如果handler是一个数组，遍历
    return ("[" + (handler.map(genHandler).join(',')) + "]")
  } else if (!handler.modifiers) { 
    return simplePathRE.test(handler.value) // handler.value
      ? handler.value
      : ("function($event){" + (handler.value) + "}")
  } else { // handler.modifiers存在
    var code = ''
    var keys = []
    for (var key in handler.modifiers) { // key可以有自定义的
      if (modifierCode[key]) {
        code += modifierCode[key]
      } else {
        keys.push(key)
      }
    }
    if (keys.length) {
      code = genKeyFilter(keys) + code // genKeyFilter(keys)在前
    }
    var handlerCode = simplePathRE.test(handler.value) // 
      ? handler.value + '($event)' // 这里如果handler是一个函数，传入参数$event
      : handler.value
    return 'function($event){' + code + handlerCode + '}' // 返回一个函数的全部内容，以字符串的形式
  }
}

function genKeyFilter (keys) {
  var code = keys.length === 1
    ? normalizeKeyCode(keys[0])
    : Array.prototype.concat.apply([], keys.map(normalizeKeyCode))
  if (Array.isArray(code)) {
    return ("if(" + (code.map(function (c) { return ("$event.keyCode!==" + c); }).join('&&')) + ")return;")
  } else {
    return ("if($event.keyCode!==" + code + ")return;")
  }
}

function normalizeKeyCode (key) { // key: Number | String
  return (
    parseInt(key, 10) || // number keyCode
    keyCodes[key] || // built-in alias
    ("_k(" + (JSON.stringify(key)) + ")") // custom alias
  )
}

/*  */

function bind$1 (el, dir) { // el.hooks[construct].push(code)
  addHook(el, 'construct', ("_b(n1," + (dir.value) + (dir.modifiers && dir.modifiers.prop ? ',true' : '') + ")"))
}

var baseDirectives = {
  bind: bind$1,
  cloak: noop
}

/*  */

// configurable state
var warn$2
var transforms$1
var dataGenFns
var platformDirectives$1
var staticRenderFns
var currentOptions

function generate (
  ast,
  options
) {
  // save previous staticRenderFns so generate calls can be nested
  var prevStaticRenderFns = staticRenderFns
  var currentStaticRenderFns = staticRenderFns = []
  currentOptions = options
  warn$2 = options.warn || baseWarn
  transforms$1 = pluckModuleFunction(options.modules, 'transformCode')
  dataGenFns = pluckModuleFunction(options.modules, 'genData')
  platformDirectives$1 = options.directives || {}
  var code = ast ? genElement(ast) : '_h("div")'
  staticRenderFns = prevStaticRenderFns
  return {
    render: ("with(this){return " + code + "}"),
    staticRenderFns: currentStaticRenderFns
  }
}

function genElement (el) {
  if (el.staticRoot && !el.staticProcessed) {
    // hoist static sub-trees out
    el.staticProcessed = true
    staticRenderFns.push(("with(this){return " + (genElement(el)) + "}"))
    return ("_m(" + (staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
  } else if (el.for && !el.forProcessed) {
    return genFor(el)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el)
  } else if (el.tag === 'template' && !el.slotTarget) {
    return genChildren(el) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el)
  } else {
    // component or element
    var code
    if (el.component) {
      code = genComponent(el)
    } else {
      var data = genData(el)
      var children = el.inlineTemplate ? null : genChildren(el)
      code = "_h('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")"
    }
    // module transforms
    for (var i = 0; i < transforms$1.length; i++) {
      code = transforms$1[i](el, code)
    }
    return code
  }
}

function genIf (el) {
  var exp = el.if
  el.ifProcessed = true // avoid recursion
  return ("(" + exp + ")?" + (genElement(el)) + ":" + (genElse(el)))
}

function genElse (el) {
  return el.elseBlock
    ? genElement(el.elseBlock)
    : '_e()'
}

function genFor (el) {
  var exp = el.for
  var alias = el.alias
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : ''
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : ''
  el.forProcessed = true // avoid recursion
  return "(" + exp + ")&&_l((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + (genElement(el)) +
    '})'
}

function genData (el) { // el.plain?
  if (el.plain) {
    return
  }

  var data = '{'

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  var dirs = genDirectives(el)
  if (dirs) data += dirs + ','

  // key
  if (el.key) {
    data += "key:" + (el.key) + ","
  }
  // ref
  if (el.ref) {
    data += "ref:" + (el.ref) + ","
  }
  if (el.refInFor) {
    data += "refInFor:true,"
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += "tag:\"" + (el.tag) + "\","
  }
  // slot target
  if (el.slotTarget) {
    data += "slot:" + (el.slotTarget) + ","
  }
  // module data generation functions
  for (var i = 0; i < dataGenFns.length; i++) {
    data += dataGenFns[i](el)
  }
  // attributes
  if (el.attrs) {
    data += "attrs:{" + (genProps(el.attrs)) + "},"
  }
  // DOM props
  if (el.props) {
    data += "domProps:{" + (genProps(el.props)) + "},"
  }
  // hooks
  if (el.hooks) {
    data += "hook:{" + (genHooks(el.hooks)) + "},"
  }
  // event handlers
  if (el.events) {
    data += (genHandlers(el.events)) + ","
  }
  if (el.nativeEvents) {
    data += (genHandlers(el.nativeEvents, true)) + ","
  }
  // inline-template
  if (el.inlineTemplate) {
    var ast = el.children[0]
    if ("development" !== 'production' && (
      el.children.length > 1 || ast.type !== 1
    )) {
      warn$2('Inline-template components must have exactly one child element.')
    }
    if (ast.type === 1) {
      var inlineRenderFns = generate(ast, currentOptions)
      data += "inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}"
    }
  }
  return data.replace(/,$/, '') + '}'
}

function genDirectives (el) {
  var dirs = el.directives // Array
  if (!dirs) return
  var res = 'directives:['
  var hasRuntime = false
  var i, l, dir, needRuntime
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    needRuntime = true
    var gen = platformDirectives$1[dir.name] || baseDirectives[dir.name]
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, warn$2)
    }
    if (needRuntime) {
      hasRuntime = true
      res += "{name:\"" + (dir.name) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},"
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

function genChildren (el) {
  if (el.children.length) {
    return '[' + el.children.map(genNode).join(',') + ']'
  }
}

function genNode (node) {
  if (node.type === 1) {
    return genElement(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  return text.type === 2 // 文本结点
    ? text.expression // no need for () because already wrapped in _s()
    : JSON.stringify(text.text)
}

function genSlot (el) {
  var slotName = el.slotName || '"default"'
  var children = genChildren(el)
  return children
    ? ("_t(" + slotName + "," + children + ")")
    : ("_t(" + slotName + ")")
}

function genComponent (el) {
  var children = genChildren(el)
  return ("_h(" + (el.component) + "," + (genData(el)) + (children ? ("," + children) : '') + ")")
}

/*
 * props: Array
 * prop: Object
 */
function genProps (props) {
  var res = ''
  for (var i = 0; i < props.length; i++) {
    var prop = props[i]
    res += "\"" + (prop.name) + "\":" + (prop.value) + ","
  }
  return res.slice(0, -1)
}

function genHooks (hooks) {
  var res = ''
  for (var key in hooks) {
    // why n1 n2
    res += "\"" + key + "\":function(n1,n2){" + (hooks[key].join(';')) + "},"
  }
  return res.slice(0, -1)
}

/*  */

/**
 * Compile a template.
 * 返回一个对象
 */
function compile$1 (
  template,
  options
) {
  var ast = parse(template.trim(), options) 
  optimize(ast, options)
  var code = generate(ast, options) // Object
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}

/*  */

// operators like typeof, instanceof and in are allowed
var prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b')
// check valid identifier for v-for
var identRE = /[A-Za-z_$][\w$]*/
// strip strings in expressions
var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g

// detect problematic expressions in a template
function detectErrors (ast) {
  var errors = []
  if (ast) {
    checkNode(ast, errors) // ast: node 
  }
  return errors
}

function checkNode (node, errors) {
  if (node.type === 1) {
    for (var name in node.attrsMap) {
      if (dirRE.test(name)) {
        var value = node.attrsMap[name]
        if (value) {
          if (name === 'v-for') {
            checkFor(node, ("v-for=\"" + value + "\""), errors)
          } else {
            checkExpression(value, (name + "=\"" + value + "\""), errors)
          }
        }
      }
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], errors)
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, errors)
  }
}

function checkFor (node, text, errors) {
  checkExpression(node.for || '', text, errors)
  checkIdentifier(node.alias, 'v-for alias', text, errors)
  checkIdentifier(node.iterator1, 'v-for iterator', text, errors)
  checkIdentifier(node.iterator2, 'v-for iterator', text, errors)
}

function checkIdentifier (ident, type, text, errors) {
  if (typeof ident === 'string' && !identRE.test(ident)) {
    errors.push(("- invalid " + type + " \"" + ident + "\" in expression: " + text))
  }
}

function checkExpression (exp, text, errors) {
  try {
    new Function(("return " + exp))
  } catch (e) {
    var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE)
    if (keywordMatch) {
      errors.push(
        "- avoid using JavaScript keyword as property name: " +
        "\"" + (keywordMatch[0]) + "\" in expression " + text
      )
    } else {
      errors.push(("- invalid expression: " + text))
    }
  }
}

/*  */

function transformNode (el, options) {
  var warn = options.warn || baseWarn
  var staticClass = getAndRemoveAttr(el, 'class')
  if ("development" !== 'production' && staticClass) {
    var expression = parseText(staticClass, options.delimiters)
    if (expression) {
      warn(
        "class=\"" + staticClass + "\": " +
        'Interpolation inside attributes has been deprecated. ' +
        'Use v-bind or the colon shorthand instead.'
      )
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass)
  }
  var classBinding = getBindingAttr(el, 'class', false /* getStatic */)
  if (classBinding) {
    el.classBinding = classBinding
  }

}

function genData$1 (el) {
  var data = ''
  if (el.staticClass) {
    data += "staticClass:" + (el.staticClass) + ","
  }
  if (el.classBinding) {
    data += "class:" + (el.classBinding) + ","
  }
  return data
}

var klass$1 = {
  staticKeys: ['staticClass'],
  transformNode: transformNode,
  genData: genData$1
}

/*  */

function transformNode$1 (el) {
  var styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

function genData$2 (el) {
  return el.styleBinding
    ? ("style:(" + (el.styleBinding) + "),")
    : ''
}

var style$1 = {
  transformNode: transformNode$1,
  genData: genData$2
}

var modules$1 = [
  klass$1,
  style$1
]

/*  */

var warn$3

function model$1 (
  el,
  dir,
  _warn
) {
  warn$3 = _warn
  var value = dir.value
  var modifiers = dir.modifiers
  var tag = el.tag
  var type = el.attrsMap.type
  if (tag === 'select') {
    return genSelect(el, value)
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value)
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value)
  } else {
    return genDefaultModel(el, value, modifiers)
  }
}

function genCheckboxModel (el, value) {
  if ("development" !== 'production' &&
    el.attrsMap.checked != null) {
    warn$3(
      "<" + (el.tag) + " v-model=\"" + value + "\" checked>:\n" +
      "inline checked attributes will be ignored when using v-model. " +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  var valueBinding = getBindingAttr(el, 'value') || 'null'
  var trueValueBinding = getBindingAttr(el, 'true-value') || 'true'
  var falseValueBinding = getBindingAttr(el, 'false-value') || 'false'
  addProp(el, 'checked',
    "Array.isArray(" + value + ")" +
      "?(" + value + ").indexOf(" + valueBinding + ")>-1" +
      ":(" + value + ")===(" + trueValueBinding + ")"
  )
  addHandler(el, 'change',
    "var $$a=" + value + "," +
        '$$el=$event.target,' +
        "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
    'if(Array.isArray($$a)){' +
      "var $$v=" + valueBinding + "," +
          '$$i=$$a.indexOf($$v);' +
      "if($$c){$$i<0&&(" + value + "=$$a.concat($$v))}" +
      "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
    "}else{" + value + "=$$c}",
    null, true
  )
}

function genRadioModel (el, value) {
  if ("development" !== 'production' &&
    el.attrsMap.checked != null) {
    warn$3(
      "<" + (el.tag) + " v-model=\"" + value + "\" checked>:\n" +
      "inline checked attributes will be ignored when using v-model. " +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  var valueBinding = getBindingAttr(el, 'value') || 'null'
  addProp(el, 'checked', ("(" + value + ")===(" + valueBinding + ")"))
  addHandler(el, 'change', (value + "=" + valueBinding), null, true)
}

function genDefaultModel (
  el,
  value,
  modifiers
) {
  if ("development" !== 'production') {
    if (el.tag === 'input' && el.attrsMap.value) {
      warn$3(
        "<" + (el.tag) + " v-model=\"" + value + "\" value=\"" + (el.attrsMap.value) + "\">:\n" +
        'inline value attributes will be ignored when using v-model. ' +
        'Declare initial values in the component\'s data option instead.'
      )
    }
    if (el.tag === 'textarea' && el.children.length) {
      warn$3(
        "<textarea v-model=\"" + value + "\">:\n" +
        'inline content inside <textarea> will be ignored when using v-model. ' +
        'Declare initial values in the component\'s data option instead.'
      )
    }
  }

  var type = el.attrsMap.type
  var ref = modifiers || {};
  var lazy = ref.lazy;
  var number = ref.number;
  var trim = ref.trim;
  var event = lazy || (isIE && type === 'range') ? 'change' : 'input'
  var needCompositionGuard = !lazy && type !== 'range'
  var isNative = el.tag === 'input' || el.tag === 'textarea'

  var valueExpression = isNative
    ? ("$event.target.value" + (trim ? '.trim()' : ''))
    : "$event"
  var code = number || type === 'number'
    ? (value + "=_n(" + valueExpression + ")")
    : (value + "=" + valueExpression)
  if (isNative && needCompositionGuard) {
    code = "if($event.target.composing)return;" + code
  }
  addProp(el, 'value', isNative ? ("_s(" + value + ")") : ("(" + value + ")"))
  addHandler(el, event, code, null, true)
  if (needCompositionGuard) {
    // need runtime directive code to help with composition events
    return true
  }
}

function genSelect (el, value) {
  if ("development" !== 'production') {
    el.children.some(checkOptionWarning)
  }
  var code = value + "=Array.prototype.filter" +
    ".call($event.target.options,function(o){return o.selected})" +
    ".map(function(o){return \"_value\" in o ? o._value : o.value})" +
    (el.attrsMap.multiple == null ? '[0]' : '')
  addHandler(el, 'change', code, null, true)
  // need runtime to help with possible dynamically generated options
  return true
}

function checkOptionWarning (option) {
  if (option.type === 1 &&
    option.tag === 'option' &&
    option.attrsMap.selected != null) {
    warn$3(
      "<select v-model=\"" + (option.parent.attrsMap['v-model']) + "\">:\n" +
      'inline selected attributes on <option> will be ignored when using v-model. ' +
      'Declare initial values in the component\'s data option instead.'
    )
    return true
  }
  return false
}

/*  */

function text (el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', ("_s(" + (dir.value) + ")"))
  }
}

/*  */

function html (el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"))
  }
}

var directives$1 = {
  model: model$1,
  text: text,
  html: html
}

/*  */

var cache = Object.create(null)

var baseOptions = {
  isIE: isIE,
  expectHTML: true,
  modules: modules$1,
  staticKeys: genStaticKeys(modules$1),
  directives: directives$1,
  isReservedTag: isReservedTag,
  isUnaryTag: isUnaryTag,
  mustUseProp: mustUseProp,
  getTagNamespace: getTagNamespace,
  isPreTag: isPreTag
}
/*
 * 编译模板
 * 
 */

function compile ( 
  template,
  options
) {
  options = options // 拓展options
    ? extend(extend({}, baseOptions), options) // 返回一个新对象，而不是在原baseOptions上直接操作
    : baseOptions
  return compile$1(template, options)
}
/*
 * compile string to functions
 * 函数的作用 模板转化为函数
 * 首先获得compiled: {
 *   render: String,
 *   staticRenderFns: [String,...]
 * }
 * 通过makeFunction函数，使得String 变成 真正的fuction
 * 最后返回一个对象res: {
 *   render: Function,
 *   staticRenderFns: [Function, ]
 * }
 */
function compileToFunctions (
  template,
  options,
  vm
) {
  var _warn = (options && options.warn) || warn
  // detect possible CSP restriction
  /* istanbul ignore if */
  if ("development" !== 'production') {  //
    try {
      new Function('return 1')
    } catch (e) {
      if (e.toString().match(/unsafe-eval|CSP/)) {
        _warn(
          'It seems you are using the standalone build of Vue.js in an ' +
          'environment with Content Security Policy that prohibits unsafe-eval. ' +
          'The template compiler cannot work in this environment. Consider ' +
          'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
          'templates into render functions.'
        )
      }
    }
  }
  var key = options && options.delimiters
    ? String(options.delimiters) + template
    : template
  if (cache[key]) { // cache初始化时是一个空对象
    return cache[key]
  }
  var res = {}
  var compiled = compile(template, options) // 返回一个对象
  res.render = makeFunction(compiled.render) // compiled.render: String
  var l = compiled.staticRenderFns.length
  res.staticRenderFns = new Array(l)
  for (var i = 0; i < l; i++) {
    res.staticRenderFns[i] = makeFunction(compiled.staticRenderFns[i])
  }
  if ("development" !== 'production') {
    if (res.render === noop || res.staticRenderFns.some(function (fn) { return fn === noop; })) {
      _warn(
        "failed to compile template:\n\n" + template + "\n\n" +
        detectErrors(compiled.ast).join('\n') +
        '\n\n',
        vm
      )
    }
  }
  return (cache[key] = res)
}
/*
 * code是一个字符串
 * 返回一个以code为函数体的函数
 */
function makeFunction (code) { // code: String  表示函数体里的内容
  try {
    return new Function(code)
  } catch (e) {
    return noop
  }
}

/*  */
// 根据id找模板
var idToTemplate = cached(function (id) {
  var el = query(id)
  return el && el.innerHTML
})

var mount = Vue.prototype.$mount // 设置一个mount全局变量
Vue.prototype.$mount = function (
  el,
  hydrating // 
) {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    "development" !== 'production' && warn(
      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
    )
    return this
  } // 不能直接挂载在body或html元素上

  var options = this.$options
  // resolve template/el and convert to render function
  // 将el或者template转化成render函数

  if (!options.render) { // render函数
    var template = options.template
    var isFromDOM = false
    if (template) {
      if (typeof template === 'string') { // template可能是以#开头的字符串
        if (template.charAt(0) === '#') {
          isFromDOM = true
          template = idToTemplate(template)
        }
      } else if (template.nodeType) { // template还有可能是一个dom结点
        isFromDOM = true
        template = template.innerHTML
      } else {
        if ("development" !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) { // 如果也不存在template属性，那就操作el
      isFromDOM = true
      template = getOuterHTML(el)
    } 
    if (template) { // 如果template存在，开始编译模板
      var ref = compileToFunctions(template, {
        warn: warn,
        isFromDOM: isFromDOM,
        shouldDecodeTags: shouldDecodeTags,
        shouldDecodeNewlines: shouldDecodeNewlines,
        delimiters: options.delimiters
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      // options获得render和staticRenderFns属性
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  return mount.call(this, el, hydrating) // mount函数绑定在vm上
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el) { // 和innerHTML的区别是包含元素标签
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    var container = document.createElement('div')
    container.appendChild(el.cloneNode(true)) // cloneNode属于原生方法，获得一个结点的拷贝，并返回该结点
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

return Vue;

})));