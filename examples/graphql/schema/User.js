const { composeResolvers } = require('@graphql-tools/resolvers-composition');
// const { selects } = require('../libs/selectGraphql');

const resolvers = {
    Query: {
        Users: async (parent, args, context) => {
            // return selects({
            //     model_name: 'User',
            //     parent: parent,
            //     args: args,
            //     context: context,
            // });
        },
        User: async (parent, args, context) => {
            var data = await models.Users.findOne(args).lean();
            return data;
        },
    },
    Mutation: {
        createUser: async (parent, args, context) => {
            var model = models.User();
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
