const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const model = require('../../models/User');
const { selects } = require('../libs/selectGraphql');

const resolvers = {
    Query: {
        Users: async (parent, args, context) => {
            return selects(model, args);
        },
        User: async (parent, args, context) => {
            var data = await model.findOne(args).lean();
            return data;
        },
    },
    Mutation: {
        createUser: async (parent, args, context) => {
            var data = new model(args);
            await data.save();
            return data;
        },
    },
};

const resolversComposition = {
    // 'Query.users': [auth.authentication()],
    // 'Query.user': [auth.authentication()],
    // 'Mutation.createUser': [auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
