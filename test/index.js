#!/usr/bin/env node

require('shelljs/global');
cd('test');
exec('../bin/apidocSwagger.js -i . .', () => {
  exec('swagger-tools validate ./doc/swagger.json');
});
