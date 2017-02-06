require('shelljs/global');

const isProduction = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() === 'production' : false;

if (!isProduction) {
  cd('test');
  exec('../bin/apidocSwagger.js -i . .', function() {
    exec('swagger-tools validate ./doc/swagger.json');
  });
} else {
  console.log('Usage: ./bin/apidocSwagger.js -i [input] [output]');
}