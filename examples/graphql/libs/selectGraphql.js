var qs = require('qs');

// string find
// qs.stringify({$or:[{is_admin:false},{username:"sadmin"}]},{encodeValuesOnly: true})
// $or[0][is_admin]=false&$or[1][username]=RegExp:sadmin
// $or[0][code]=RegExp:${key}:i,$or[1][name]=RegExp:${key}:i

module.exports = {
    selects: async (model, parent, args, context, find_required = undefined) => {
        var search,
            find,
            skip,
            limit,
            sort = undefined;
        var total = 0;

        if (args && args.select) {
            search = args.select.search;
            find = args.select.find;
            skip = args.select.skip;
            limit = args.select.limit;
            sort = args.select.sort;
        }

        delete args.select;

        if (search) {
            search = {
                $text: {
                    $search: search,
                },
            };
        }

        //             model = models[model_name](context.tenant).aggregate();
        //             model.match({
        //                 $and: [search, find, args, find_required].filter(Boolean),
        //             });
        //             if (typeof aggregate === 'function') {
        //                 await aggregate(model);
        //             }
        //             model.facet({
        //                 data: [
        //                     sort ? { $sort: sort } : undefined,
        //                     skip ? { $skip: skip } : undefined,
        //                     limit ? { $limit: limit } : { $limit: 50 },
        //                 ],
        //                 total: [
        //                     {
        //                         $count: 'count',
        //                     },
        //                 ],
        //             });
        //             var data = await model.collation({ locale: 'vi', strength: 1 }).exec();
        //             return { data: data.data, total: data.total[0].count };
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

        var query = model.find({
            $and: [search, find, args, find_required].filter(Boolean),
        });
        total = await model.count({
            $and: [search, find, args, find_required].filter(Boolean),
        });
        if (skip) {
            query.skip(skip);
        }
        if (limit) {
            query.limit(limit);
        } else {
            query.limit(1000);
        }
        if (sort) {
            query.sort(sort);
        }
        var data = await query.collation({ locale: 'vi', strength: 1 }).lean();
        return { data: data, total: total };
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
