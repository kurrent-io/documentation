# KurrentDB documentation

KurrentDB (formerly EventStoreDB) is the leading event-native data platform, enabling organizations to build modern, event-driven applications and unlock the power of their business history. By capturing every change as an immutable event, KurrentDB provides a single source of truth for real-time data, historical analysis, and advanced AI/ML initiatives.

This repository maintains documentation for KurrentDB (imported from the server repository on build), Kurrent Cloud, client SDKs, and other tools and product provided by Kurrent.

## Contributing

Feel free to [create a GitHub](https://github.com/kurrent-io/documentation/issues/new) issue if you have any questions or request for more explanation or samples.

We're open to any contribution. If you noticed some inconsistency, missing piece, or you'd like to extend existing docs - we'll be happy to [get your Pull Request](https://github.com/kurrent-io/documentation/compare).

Note that KurrentDB documentation is located in the [server repository](https://github.com/kurrent-io/KurrentDB). Open issues and PRs for server documentation in there.

Please make sure to follow the [contribution guidelines](CONTRIBUTING.md). It contains detailed information on how to contribute to the documentation.

## Samples

KurrentDB clients:
- C# - [see more](https://github.com/kurrent-io/KurrentDB-Client-Dotnet/tree/master/samples)
- NodeJS - [see more](https://github.com/kurrent-io/KurrentDB-Client-NodeJS/tree/master/packages/test/src/samples)
- Java - [see more](https://github.com/kurrent-io/KurrentDB-Client-Java/tree/trunk/src/test/java/io/kurrent/dbclient/samples)
- Rust - [see more](https://github.com/kurrent-io/KurrentDB-Client-Rust/tree/master/examples)
- Go - [see more](https://github.com/kurrent-io/KurrentDB-Client-Go/tree/master/samples)

## Local development

Read the [local development guide](CONTRIBUTING.md#running-the-documentation-locally) to learn how to run the documentation locally.

### Algolia Search

Documentation is using Algolia DocSearch service for indexing and searching through the contents. Currently, the search indexes are updated by Algolia Crawler and can only be configured on the Crawler dashboard.

If you notice any issues with the search, please create an issue in this repository.
