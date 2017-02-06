require('shelljs/global');

const fs = require('fs');
const chai = require('chai'),
      expect = chai.expect,
      should = chai.should(),
      assert = chai.assert;

const spec = require('swagger-tools').specs.v2;

let SWAGGER_OUT_PATH = './doc/swagger.json';

before(function(done) {
  cd('test');
  exec('../bin/apidocSwagger.js -i . .', function() {
    exec('swagger-tools validate ./doc/swagger.json');
    done();
  });
});

describe('APIDOC: basic validation', function() {
  beforeEach(function() {
    assert(fs.existsSync(SWAGGER_OUT_PATH) === true);
  });

  it('should return valid JSON', function() {
    let jsonFn = function() { JSON.parse(fs.readFileSync(SWAGGER_OUT_PATH)); };
    expect(jsonFn).to.not.throw('good function!');
  });

  it('should pass the swagger-tools v2 validation', function(done) {
    let json = require(SWAGGER_OUT_PATH);
    spec.validate(json, (err, result) => {
      expect(err).to.not.exist;
      expect(result).to.be.undefined;
      done();
    })
  })
});