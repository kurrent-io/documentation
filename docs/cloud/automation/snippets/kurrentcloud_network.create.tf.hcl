resource "kurrentcloud_project" "production" {
  name = "Production Project"
}
resource "kurrentcloud_network" "production_network" {
  name              = "Production Network"
  project_id        = data.kurrentcloud_project.production.id
  resource_provider = "aws"
  region            = "us-west-2"
  cidr_block        = "172.21.0.0/16"
}
