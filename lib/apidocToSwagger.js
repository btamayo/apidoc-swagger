const _ = require('lodash');
const pathToRegexp = require('path-to-regexp');

const swagger = {
  swagger: "2.0",
  info: {},
  paths: {},
  definitions: {}
};


// === Conversion ===
/**
 * Extracts paths provided in json format
 * post, patch, put request parameters are extracted in body
 * get and delete are extracted to path parameters
 * @param apidocJson
 * @returns {{}}
 */
function extractPaths(apidocJson){
  console.log('swagger:');
  console.log(swagger);
  console.log('------------');
	let apiPaths = groupByUrl(apidocJson);

  console.log('apiPaths');
  console.log(apiPaths);
  console.log();

	let paths = {};
	for (let i = 0; i < apiPaths.length; i++) {
		let verbs = apiPaths[i].verbs;
		let url = verbs[0].url;
		let pattern = pathToRegexp(url, null);
		let matches = pattern.exec(url);

		// Surrounds URL parameters with curly brackets -> :email with {email}
		let pathKeys = [];
		for (let j = 1; j < matches.length; j++) {
			let key = matches[j].substr(1);
			url = url.replace(matches[j], "{"+ key +"}");
			pathKeys.push(key);
		}

		for (let j = 0; j < verbs.length; j++) {
			let verb = verbs[j];
			let type = verb.type;

			let obj = paths[url] = paths[url] || {};

			if (type == 'post' || type == 'patch' || type == 'put') {
				_.extend(obj, createPostPushPutOutput(verb, swagger.definitions, pathKeys));
			} else {
				_.extend(obj, createGetDeleteOutput(verb, swagger.definitions, pathKeys));
			}
		}
	}
	return paths;
}

// Some credit to https://github.com/fsbahman/apidoc-swagger/pull/31/files
function createPostPushPutOutput(verbs, definitions, pathKeys) {
	let postPushPutObject = {};
	let verbDefinitionResult = createVerbDefinitions(verbs, definitions);

	// Swagger params object to populate:
  let swaggerParams = [];


  if (verbs.parameter && verbs.parameter.fields) {

    if (verbs.parameter.fields.Parameter) {
      // Path params:

      // _.remove() removes elements from array (mutates), and returns array with removed elements based on predicate
      let pathParams = _.remove(verbs.parameter.fields.Parameter, (param) => {
        return pathKeys.indexOf(param.field) !== -1; // param field (name) is found in path params;
      });

      swaggerParams = createParametersAtPlace(pathParams, 'path');

      // What is have left is now non-path params (query/@TODO header/body)
      let _remainingParams = verbs.parameter.fields.Parameter;

      /**
       * Body - The payload that's appended to the HTTP request. Since there can only be one payload, there can only be one body parameter. The name of the body parameter has no effect on the parameter itself and is used for documentation purposes only. Since Form parameters are also in the payload, body and form parameters cannot exist together for the same operation.
       */

      // Body params:
      // Body params go into a "body" object with a schema that is determined with the body param names/types/etc

      // Body Object wrapper:
      let body = {
        "in": "body",
        "name": "" + verbs.name + "Body", // apidoc name of endpoint, used to match schema def later
        "description": removeTags(verbs.description),
        "required": true, // body obj itself is required
      };

      // Construct schema object for body (this is required)
      // http://swagger.io/specification/#parameter-object-44

      // @TODO: Different content-types

      /**
       * Body parameters MUST have a schema. A schema can either be a $ref to a definition (e.g. a model), an array, or primitives
       */

      let schema = {}; // @TODO




      // @TODO: Header fields
    }
  }

	let required = verbs.parameter && verbs.parameter.fields && verbs.parameter.fields.Parameter.length > 0;

	//params.push({
	//		"in": "body",
	//		"name": "body",
	//		"description": removeTags(verbs.description),
	//		"required": required,
	//		"schema": {
	//			"$ref": "#/definitions/" + verbDefinitionResult.topLevelParametersRef
	//		}
	//	});

  postPushPutObject[verbs.type] = {
		tags: [verbs.group],
		summary: removeTags(verbs.description),
		consumes: [
			"application/json" // @TODO: other content-types
		],
		produces: [
			"application/json"
		],
		parameters: swaggerParams
	};

	if (verbDefinitionResult.topLevelSuccessRef) {
    postPushPutObject[verbs.type].responses = {
      "200": {
        "description": "successful operation",
        "schema": {
          "$ref": "#/definitions/" + verbDefinitionResult.topLevelSuccessRef
        }
      }
    };
  }

  return postPushPutObject;
}

function createVerbDefinitions(verbs, definitions) {
  console.log('verbs:');
  console.log(verbs);
  console.log();
  console.log('definitions');
  console.log(definitions);
  console.log('==========');
  let result = {
		topLevelParametersRef : null,
		topLevelSuccessRef : null,
		topLevelSuccessRefType : null
	};

  // Signature: createFieldArrayDefinitions(fieldArray, definitions, topLevelRef, defaultObjectName)

	let fieldArrayResult = {};
	if (verbs && verbs.parameter && verbs.parameter.fields) {
		fieldArrayResult = createFieldArrayDefinitions(verbs.parameter.fields.Parameter, definitions, verbs.name, verbs.name);
		result.topLevelParametersRef = fieldArrayResult.topLevelRef;
  }
  if (verbs && verbs.success && verbs.success.fields) {
		fieldArrayResult = createFieldArrayDefinitions(verbs.success.fields["Success 200"], definitions, verbs.name, verbs.name);
		result.topLevelSuccessRef = fieldArrayResult.topLevelRef;
		result.topLevelSuccessRefType = fieldArrayResult.topLevelRefType;
  }
  return result;
}

/**
 * Creates swagger definitions for an array of fields/params.
 * @param fieldArray input array of fields (e.g. parameters)
 * @param definitions By default, this is a reference to swagger.definitions
 * @param topLevelRef Usually, this will be the name of the api (apidoc verbs.name e.g. "getPet")
 * @param defaultObjectName Also the name of the api (apidoc verbs.name)
 * @returns {{topLevelRef: *, topLevelRefType: null}}
 */
function createFieldArrayDefinitions(fieldArray, definitions, topLevelRef, defaultObjectName) {
	let result = {
		topLevelRef: topLevelRef,
		topLevelRefType: null
	};

	if (!fieldArray) {
		return result;
	}

	for (let i = 0; i < fieldArray.length; i++) {
		let parameter = fieldArray[i];

		let nestedName = createNestedName(parameter.field);
		let objectName = nestedName.objectName;

		if (!objectName) {
			objectName = defaultObjectName;
		}

		let type = parameter.type;
		if (i == 0) {
			result.topLevelRefType = type;

			if (parameter.type == "Object") {
				objectName = nestedName.propertyName;
				nestedName.propertyName = null;
			} else if (parameter.type == "Array") {
				objectName = nestedName.propertyName;
				nestedName.propertyName = null;				
				result.topLevelRefType = "array";
			}

			result.topLevelRef = objectName;
    }

    definitions[objectName] = definitions[objectName] || {
                                                            properties : {},
                                                            required : []
                                                          };

		if (nestedName.propertyName) {
			let prop = {
			  type: (parameter.type || "").toLowerCase(),
        description: removeTags(parameter.description)
			};

			if (parameter.type == "Object") {
				prop.$ref = "#/definitions/" + parameter.field;
			}

			let typeIndex = type.indexOf("[]");
			if (typeIndex !== -1 && typeIndex === (type.length - 2)) {
				prop.type = "array";
				prop.items = {
					type: type.slice(0, type.length - 2)
				};
			}


			definitions[objectName]['properties'][nestedName.propertyName] = prop;

			if (!parameter.optional) {
				let arr = definitions[objectName]['required'];
				if (arr.indexOf(nestedName.propertyName) === -1) {
					arr.push(nestedName.propertyName);
				}
      }
    }
  }

	return result;
}


/**
 * Generate get, delete method output
 * @param verbs
 * @param definitions
 * @param pathKeys
 * @returns {{}}
 */
function createGetDeleteOutput(verbs, definitions, pathKeys) {
	let getOrDeleteObject = {};
	verbs.type = verbs.type === "del" ? "delete" : verbs.type;

	let verbDefinitionResult = createVerbDefinitions(verbs, definitions);

	// _.remove() removes elements from array (mutates), and returns array with removed elements based on predicate
	let pathParams = _.remove(verbs.parameter.fields.Parameter, (param) => {
	  return pathKeys.indexOf(param.field) !== -1; // param field (name) is found in path params;
  });

	// What if have left is now non-path params (query/@TODO header/body)
  let _remainingParams = verbs.parameter.fields.Parameter;

  // Final params
  let swaggerParams = createParametersAtPlace(pathParams, 'path');
  swaggerParams = swaggerParams.concat(createParametersAtPlace(_remainingParams, 'query')); // @TODO: Other places for params

  getOrDeleteObject[verbs.type] = {
		tags: [verbs.group],
		summary: removeTags(verbs.description),
		consumes: [
			"application/json"
		],
		produces: [
			"application/json"
		],
		parameters: swaggerParams
	};

  if (verbDefinitionResult.topLevelSuccessRef) {
    getOrDeleteObject[verbs.type].responses = {
      "200": {
        "description": "successful operation",
        "schema": {
          "$ref": "#/definitions/" + verbDefinitionResult.topLevelSuccessRef
        }
      }
    };
  }
  return getOrDeleteObject;
}

/**
 * Given an array of params and the place they belong in, format it into a parameter object
 * @param params
 * @param place
 * @returns {Array}
 */
function createParametersAtPlace(params, place) {
	let parametersObject = [];

  for (let i = 0; i < params.length; i++) {
    let param = params[i];
    let field = param.field;
    parametersObject.push({
      name: field,
      in: place, // type === "file" ? "formData" : _in, // @TODO: File uploads
      required: !param.optional,
      type: param.type.toLowerCase(),
      description: removeTags(param.description)
    });
	}

	return parametersObject;
}

function groupByUrl(apidocJson) {
	return _.chain(apidocJson)
		.groupBy("url")
		.pairs()
		.map(function (element) {
			return _.object(_.zip(["url", "verbs"], element));
		})
		.value();
}

function createNestedName(field) {
  let propertyName = field;
  let objectName;
  let propertyNames = field.split(".");

  if (propertyNames && propertyNames.length > 1) {
    propertyName = propertyNames[propertyNames.length - 1];
    propertyNames.pop();
    objectName = propertyNames.join(".");
  }

  return {
    propertyName: propertyName,
    objectName: objectName
  }
}

// === UTILS ===
/**
 * Removes <p> </p> tags from text
 * @param text
 * @returns {string}
 */
function removeTags(text) {
  const tagsRegex = /(<([^>]+)>)/ig;
  return text ? text.replace(tagsRegex, "") : text;
}

function addInfo(projectJson) {
  const info = {};
  info["title"] = projectJson.title || projectJson.name;
  info["version"] = projectJson.version;
  info["description"] = projectJson.description;
  return info;
}

// === EXEC ===
function toSwagger(apidocJson, projectJson) {
  swagger.info = addInfo(projectJson);
  swagger.paths = extractPaths(apidocJson);
  return swagger;
}

// === EXPORTS ===
module.exports = {
	toSwagger: toSwagger
};