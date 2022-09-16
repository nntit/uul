const { graphql, parse, Source, validate } = require('graphql');
const ejs = require('ejs');

const readBody = require('../readBody');

const depthLimitQuery = require('./libs/depthLimitQuery');
const disableIntrospection = require('./libs/disableIntrospection');

const optionDefault = {
    depthLimit: 10,
    production: false,
    schema: null,
    typeResolver: null,
    folderFilesTypeDefs: null,
    folderFilesResolvers: null,
};

module.exports = (App, url, endpoint, options) => {
    if (options) {
        Object.assign(optionDefault, options);
    }

    if (schema == null && typeResolver == null && folderFilesTypeDefs != null && folderFilesResolvers != null) {
        const typeDefs = mergeTypeDefs(
            loadFilesSync(path.join(__dirname, 'graphql/schema'), {
                recursive: false,
                extensions: ['gql'],
            })
        );
        const resolvers = mergeResolvers(
            loadFilesSync(path.join(__dirname, 'graphql/schema'), {
                recursive: false,
                extensions: ['js'],
            })
        );
        const schema = makeExecutableSchema({
            typeDefs,
            resolvers,
        });
        optionDefault.schema = schema;
    }

    var variableValues = !optionDefault.production
        ? []
        : [depthLimitQuery(optionDefault.depthLimit), disableIntrospection];

    if (!optionDefault.production) {
        App.get(url, (res, req) => {
            ejs.renderFile(__dirname + '/playground.ejs', { endpoint: endpoint }, (err, str) => {
                res.end(str);
            });
        });
    }

    App.options(url, (res, req) => {
        res.writeHeader('Access-Control-Allow-Headers', 'authorization,content-type');
        res.writeHeader('Access-Control-Allow-Methods', 'GET,POST');
        res.writeHeader('Access-Control-Allow-Origin', '*');
        res.writeHeader('Access-Control-Max-Age', '86400');
        res.writeStatus('204').end();
    });

    App.post(url, (res, req) => {
        res.writeHeader('Access-Control-Allow-Origin', '*');
        typeInfo = req.getHeader('content-type');
        var token = req.getHeader('authorization');
        if (token === '') {
            token = req.getHeader('token');
        }
        var context = {};
        context.token = token;
        readBody(res, (correct, data) => {
            JSONdata = correct ? tryParseJSON(data) : 'error parse json';
            if (correct && typeInfo == 'application/json' && JSONdata) {
                try {
                    var validateRes = validate(schema, createDocument(JSONdata.query), variableValues);
                    if (validateRes == 0) {
                        graphql({
                            schema: optionDefault.schema,
                            typeResolver: optionDefault.typeResolver,
                            source: JSONdata.query,
                            variableValues: JSONdata.variables,
                            contextValue: context,
                        })
                            .then((result) => {
                                if (!res.aborted) {
                                    res.writeHeader('Content-Type', 'application/json').end(JSON.stringify(result));
                                }
                            })
                            .catch((error) => {
                                resEndErrors(res, optionDefault.production ? null : error.message);
                            });
                    } else {
                        resEndErrors(res, optionDefault.production ? null : JSON.stringify(validateRes));
                    }
                } catch (error) {
                    resEndErrors(res, optionDefault.production ? null : error.message);
                }
            } else {
                resEndErrors(res);
            }
        });
        res.onAborted(() => {
            res.aborted = true;
        });
    });
};

function tryParseJSON(json, result = null) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return result;
    }
}

function createDocument(query) {
    const source = new Source(query);
    return parse(source);
}

function resEndErrors(res, message = null) {
    if (!res.aborted) {
        res.writeHeader('Content-Type', 'application/json').end(
            JSON.stringify({
                errors: [
                    {
                        message: message ? message : 'Must provide valid query string.',
                    },
                ],
            })
        );
    }
}
