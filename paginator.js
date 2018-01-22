_ = require('lodash')

module.exports = function(Model, options) {
  Model.afterRemote('find', function(ctx, instance, next) {
    if (ctx.req.query.filter) {
      const filter = JSON.parse(ctx.req.query.filter)
      if (
        filter.skip !== undefined &&
        filter.limit !== undefined &&
        filter.limit > 0
      ) {
        const { skip, limit, ...query } = filter
        Model.count(query).then(count => {
          ctx.result = {
            data: ctx.result,
            next:
              filter.skip + filter.limit >= count
                ? null
                : `${ctx.req.baseUrl}?${_.map(ctx.req.query, (val, key) => {
                    if (key === 'filter') {
                      return `${key}=${JSON.stringify({
                        ...filter,
                        skip: filter.skip + filter.limit
                      })}`
                    } else {
                      return `${key}=${val}`
                    }
                  }).join('&')}`,
            prev:
              filter.skip - filter.limit < 0
                ? null
                : `${ctx.req.baseUrl}?${_.map(ctx.req.query, (val, key) => {
                    if (key === 'filter') {
                      return `${key}=${JSON.stringify({
                        ...filter,
                        skip: filter.skip - filter.limit
                      })}`
                    } else {
                      return `${key}=${val}`
                    }
                  }).join('&')}`,
            pages: Math.floor(count / ctx.args.filter.limit),
            count
          }
          next()
        })
      } else {
        next()
      }
    } else {
      return next()
    }
  })
}
