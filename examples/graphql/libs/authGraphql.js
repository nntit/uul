const jws = require('jws');
var { DateTime } = require('luxon');

module.exports = {
    authentication: () => (next) => async (root, args, context, info) => {
        try {
            if (jws.verify(context.token, 'HS256', 'secret')) {
                var decode = jws.decode(context.token);
                if (DateTime.fromISO(JSON.parse(decode.payload).exTime).plus({ hours: 24 }) >= DateTime.local()) {
                    return next(root, args, context, info);
                }
            }
        } catch (error) {
            throw new Error('You are not authenticated!');
        }
        throw new Error('You are not authenticated!');
    },
    authorization: (role) => (next) => async (root, args, context, info) => {
        return next(root, args, context, info);
    },
    getUser: () => {},
};
