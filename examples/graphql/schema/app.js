

    const { composeResolvers } = require('@graphql-tools/resolvers-composition');
    const models = require('../../models/Apps');
    const auth = require('../libs/authGraphql');
    const { selects } = require('../libs/selectGraphql');
     
    const resolvers = {
        Query: {
            Apps: async (parent, args, context) => {
                return selects({
                    
                    model_name: 'Apps',
                    parent: parent,
                    args: args,
                    context: context,
                    find_rule_final: { deleted: { $ne: true } },
                });
            },
        },
        Mutation: {
            App_create: async (parent, args, context) => {
                var data = new models(args);
                await data.save();
                return data;
            },
            App_update: async (parent, args, context) => {
                var result = await models.findByIdAndUpdate(args._id, args, { new: true });
                return result;
            },
            App_delete: async (parent, args, context) => {
                var result = await models.findByIdAndRemove(args._id);
                return result;
            },
        },
    };
     
    const resolversComposition = {
        'Query.Users': [auth.authentication()],
    };
     
    module.exports = composeResolvers(resolvers, resolversComposition);

