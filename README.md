# Loopback DS Mixin Paginator

## How to install

```bash
npm install loopback-ds-paginator-mixin
```

or

```bash
yarn add loopback-ds-paginator-mixin
```

## How to use

`server/model-config.json`

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-ds-paginator-mixin/paginator",
      "../common/mixins"
    ]
  }
}
```

And in your model:

```json
{
  "mixins": {
    "Paginator": {
      "methods": [
        {
          "method": "prototype.__get__relatedModel",
          "model": "RelatedModel"
        },
        {
          "method": "get",
          "model": "AppUser"
        },
        {
          "method": "myCustomMethod",
          "model": "AppUser"
        }
      ]
    }
  }
}
```

## TODO

* [ ] Better Documentation
* [ ] Improve the module structure
