#!/usr/bin/env node

require('shelljs/global');
cd('test');
exec('../bin/apidocSwagger.js -i . . --verbose --markdown', () => {
  exec('swagger-tools validate ./doc/swagger.json');
});
