# This assumes a project with the name "Production" exists
data "kurrentcloud_project" "production" {
  name = "Production Project"
}
output "project_id" {
  value = data.kurrentcloud_project.production.id
}