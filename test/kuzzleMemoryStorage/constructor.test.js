var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  KuzzleMemoryStorage = require('../../src/kuzzleMemoryStorage'),
  Kuzzle = rewire('../../src/kuzzle');

describe('KuzzleMemoryStorage constructor', function () {
  it('should initialize properties and return a valid KuzzleMemoryStorage object', () => {
    var
      kuzzle = new Kuzzle('foo'),
      ms;

    kuzzle.headers.some = 'headers';
    ms = new KuzzleMemoryStorage(kuzzle);

    // the collection "headers" should be a hard copy of the kuzzle ones
    kuzzle.headers = { someother: 'headers' };

    should(ms).be.an.instanceOf(KuzzleMemoryStorage);
    should(ms).have.propertyWithDescriptor('kuzzle', {enumerable: true, writable: false, configurable: false});
    should(ms).have.propertyWithDescriptor('headers', {enumerable: true, writable: true, configurable: false});
    should(ms.headers.some).be.exactly('headers');
    should(ms.headers.someother).be.undefined();
  });

  it('should promisify all methods', () => {
    var
      kuzzle,
      ms,
      functions;

    Kuzzle.prototype.bluebird = bluebird;

    kuzzle = new Kuzzle('foo');
    ms = new KuzzleMemoryStorage(kuzzle);

    functions = Object.getOwnPropertyNames(Object.getPrototypeOf(ms)).filter(p => (typeof ms[p] === 'function' && ['constructor', 'setHeaders'].indexOf(p) === -1));
    should(functions.length).be.eql(119);
    functions.forEach(f => {
      should(ms[f + 'Promise']).be.a.Function();
    });

    delete Kuzzle.prototype.bluebird;
  });

  it('should set headers using setHeaders', function () {
    var
      kuzzle = new Kuzzle('foo'),
      ms = new KuzzleMemoryStorage(kuzzle);

    ms.setHeaders({foo: 'bar'}, true);
    should(ms.headers).match({foo: 'bar'});

    ms.setHeaders({bar: 'foobar'}, false);
    should(ms.headers).match({foo: 'bar', bar: 'foobar'});
  });

});
