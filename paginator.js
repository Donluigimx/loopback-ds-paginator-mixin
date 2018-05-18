const _ = require('lodash')

module.exports = function(Model, options) {
  Model.afterRemote('find', function(ctx, instance, next) {
    paginator(ctx, instance, next, Model)
  })
  if (Array.isArray(options.methods)) {
    for (let method of options.methods) {
      if (typeof method === 'object')
        Model.afterRemote(method.method, function(ctx, instance, next) {
          paginator(ctx, instance, next, Model.app.models[method.model])
        })
      else if (typeof method === 'string')
        Model.afterRemote(method, function(ctx, instance, next) {
          paginator(ctx, instance, next, Model)
        })
    }
  }
}

function paginator(ctx, instance, next, Model) {
  if (ctx.req.query.filter) {
    const filter = JSON.parse(ctx.req.query.filter)
    if (
      filter.skip !== undefined &&
      filter.limit !== undefined &&
      filter.limit > 0
    ) {
      const { where } = ctx.args.filter,
        pos = ctx.req.originalUrl.search('\\?'),
        url = pos >= 0 ? ctx.req.originalUrl.slice(0, pos) : ctx.req.baseUrl

      Model.count(where ? where : {}).then(count => {
        ctx.result = {
          data: ctx.result,
          next:
            filter.skip + filter.limit >= count
              ? null
              : `${url}?${_.map(ctx.req.query, (val, key) => {
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
              : `${url}?${_.map(ctx.req.query, (val, key) => {
                  if (key === 'filter') {
                    return `${key}=${JSON.stringify({
                      ...filter,
                      skip: filter.skip - filter.limit
                    })}`
                  } else {
                    return `${key}=${val}`
                  }
                }).join('&')}`,
          pages: Math.ceil(count / ctx.args.filter.limit),
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
}
