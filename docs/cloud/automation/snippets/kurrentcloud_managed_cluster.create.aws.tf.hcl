data "kurrentcloud_project" "production" {
  name = "Production Project"
}

resource "kurrentcloud_network" "production" {
  name              = "Production Network"
  project_id        = data.kurrentcloud_project.production.id
  resource_provider = "aws"
  region            = "us-west-2"
  cidr_block        = "172.21.0.0/16"
}

resource "kurrentcloud_managed_cluster" "production" {
  name             = "Production Cluster"
  project_id       = kurrentcloud_project.Production.project_id
  network_id       = kurrentcloud_network.Production.id
  topology         = "three-node-multi-zone"
  instance_type    = "F1"
  disk_size        = 10
  disk_type        = "gp3"
  disk_iops        = 3000
  disk_throughput  = 125
  server_version   = "21.10"
  projection_level = "user"
}