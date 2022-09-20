var qs = require('qs');
const models = require('../../models');

// qs.stringify({$or:[{is_admin:false},{username:"sadmin"}]},{encodeValuesOnly: true})
// $or[0][is_admin]=false&$or[1][username]=RegExp:sadmin
// $or[0][code]=RegExp:${key}:i,$or[1][name]=RegExp:${key}:i

module.exports = {
    /**
     * select graphql
     *
     * @param {string} model_name model name
     * @param {object} parent parent graphql
     * @param {object} args args graphql
     * @param {object} context context graphql
     * @param {object} find_rule_final find final
     * @param {array[string]} find_field_allow field allow find in query (find: string qs)
     * @param aggregate function(aggregate){}
     * @returns {object} { data: object, total: number }
     */
    selects: async ({
        model_name,
        parent,
        args,
        context,
        find_rule_final = undefined,
        find_field_allow = undefined,
        aggregate = undefined,
    }) => {
        var sort = undefined;
        var skip = undefined;
        var limit = undefined;
        var find = undefined;
        var search = undefined;
        var model = undefined;
        var total = undefined;

        if (args && args.select) {
            sort = args.select.sort;
            skip = args.select.skip;
            limit = args.select.limit;
            find = args.select.find;
            search = args.select.search;
        }

        delete args.select;

        if (find) {
            find = qs.parse(find, {
                depth: 3,
                delimiter: /[&;,]/,
                allowDots: true,
                decoder: function (str, defaultDecoder, charset, type) {
                    if (type === 'value') {
                        if (str === 'false' || str === 'true') {
                            return str === 'true';
                        } else if (!isNaN(parseFloat(str)) && isFinite(str)) {
                            return Number(str);
                        } else if (typeof str === 'string' && str.indexOf('RegExp:') == 0) {
                            const strs = str.split(':');
                            return RegExp(strs[1], strs[2]);
                        } else {
                            return str.toString();
                        }
                    }
                    return str;
                },
            });
            if (!HasKeyObj(find, find_field_allow)) {
                throw new Error('You are find field not allow');
            }
        }

        if (search) {
            search = {
                $text: {
                    $search: search,
                },
            };
        }

        if (aggregate) {
            model = models[model_name](context.tenant).aggregate();
            model.match({
                $and: [search, find, args, find_rule_final].filter(Boolean),
            });
            if (typeof aggregate === 'function') {
                await aggregate(model);
            }
            model.facet({
                data: [
                    sort ? { $sort: sort } : undefined,
                    skip ? { $skip: skip } : undefined,
                    limit ? { $limit: limit } : { $limit: 50 },
                ],
                total: [
                    {
                        $count: 'count',
                    },
                ],
            });
            var data = await model.collation({ locale: 'vi', strength: 1 }).exec();
            return { data: data.data, total: data.total[0].count };
        } else {
            model = models[model_name](context.tenant).find({
                $and: [search, find, args, find_rule_final].filter(Boolean),
            });

            total = await models[model_name](context.tenant).count({
                $and: [search, find, args, find_rule_final].filter(Boolean),
            });
            if (sort) {
                model.sort(sort);
            }
            if (skip) {
                model.skip(skip);
            }
            if (limit) {
                model.limit(limit);
            } else {
                model.limit(50);
            }
            var data = await model.collation({ locale: 'vi', strength: 1 }).lean();
            return { data: data, total: total };
        }
        return null;
    },
};

function HasKeyObj(entireObj, valToFind) {
    if (valToFind) {
        let listKey = new Set();
        JSON.stringify(entireObj, (_, nestedValue) => {
            if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
                Object.keys(nestedValue).forEach((element) => {
                    if (element && element.indexOf('$') < 0) listKey.add(element);
                });
            }
            return nestedValue;
        });
        return Array.from(listKey).every((everyValue) => valToFind.some((someValue) => someValue == everyValue));
    } else {
        return true;
    }
}
