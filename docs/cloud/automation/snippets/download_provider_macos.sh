curl -o ./terraform-provider-kurrentcloud.zip -L \
  https://github.com/kurrent-io/terraform-provider-kurrentcloud/releases/download/v2.0.0/terraform-provider-kurrentcloud_2.0.0_darwin_amd64.zip
unzip ./terraform-provider-kurrentcloud.zip
mv ./terraform-provider-kurrentcloud ~/.terraform.d/plugins/terraform-provider-kurrentcloud
