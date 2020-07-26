# `euw-prod` cluster

This AWS cluster is our main production European cluster. It holds the staging and production environments. 

## Node Groups

| Name | Machine Type | Min | Max |
| :---: | :---: | :---: | :---: |
| elassandra | `t2.medium` | 1 | 2 |
| core | `t2.small` | 1 | 6 |
