const { graphql, parse, Source, validate } = require('graphql');
const ejs = require('ejs');
const path = require('path');
const qs = require('qs');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const getBody = require('../getBody');

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

    if (
        optionDefault.schema == null &&
        optionDefault.typeResolver == null &&
        optionDefault.folderFilesTypeDefs != null &&
        optionDefault.folderFilesResolvers != null
    ) {
        const typeDefs = mergeTypeDefs(
            loadFilesSync(optionDefault.folderFilesTypeDefs, {
                recursive: false,
                extensions: ['gql'],
            })
        );
        const resolvers = mergeResolvers(
            loadFilesSync(optionDefault.folderFilesResolvers, {
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
            ejs.renderFile(__dirname + '/graphiql.ejs', { endpoint: endpoint }, (err, str) => {
                res.end(str);
            });
        });
        App.get(url + '/qs', (res, req) => {
            ejs.renderFile(__dirname + '/json.ejs', { endpoint: endpoint }, (err, str) => {
                res.end(str);
            });
        });
        App.post(url + '/qs', (res, req) => {
            getBody(res, (correct, data) => {
                try {
                    res.end(qs.stringify(JSON.parse(data), { encodeValuesOnly: true }));
                } catch (error) {
                    res.end('error');
                }
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
        var context = {};
        context.schema = optionDefault.schema;
        if (token = getCookie(req, "token") || req.getHeader("token") || req.getHeader("authorization")) {
            context.token = token;
        }
        getBody(res, (correct, data) => {
            JSONdata = correct ? tryParseJSON(data) : 'error parse json';
            if (correct && typeInfo == 'application/json' && JSONdata) {
                try {
                    var validateRes = validate(optionDefault.schema, createDocument(JSONdata.query), variableValues);
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
