# Helmsman configuration

Helmsman allows us to manage our infrastructure in a declarative and reviewed manner. With commits, we are able to alter the current state of our infrastructure.

## Environment Variables

| Name | Description |
| :---: | :---: |
| `CONTEXT` | The kubectl context name to use |
| `CONFIG_STRIPE_APIKEY` | The Stripe API Key to use |
| `CONFIG_ROCKSIDE_APIKEY` | The Rockside API Key to use |
| `CONFIG_MAILJET_APIKEY` | The Mailjet API Key to use |
| `CONFIG_MAILJET_APISECRET` | The Mailjet API Secret to use |
| `CONFIG_JWT_SECRET` | The JwT secret used for signing |
| `CONFIG_ROUTE53_KEY` | The Key ID of an account able to perform route53 operations |
| `CONFIG_ROUTE53_SECRET` | The Key Secret of an account able to perform route53 operations |
| `CONFIG_ROUTE53_HOSTEDZONE` | The Hostedzone ID on which ExternalDNS will perform actions |

