const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const model = require('../../models/User');
const { selects } = require('../libs/selectGraphql');

const resolvers = {
    Query: {
        Groups: async (parent, args, context) => {
            return selects(model, args);
        },
    },
    Mutation: {
        Group_create: async (parent, args, context) => {
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
