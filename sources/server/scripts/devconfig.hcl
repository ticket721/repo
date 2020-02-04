storage "consul" {
  address = "consul:8500"
  path    = "vault"
}

plugin_directory = "/vault/plugins"
api_addr = "http://127.0.0.1:8200"
