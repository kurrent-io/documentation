
<b>Pattern 1: Ensure version-specific documentation uses correct product names, features, and connection strings tied to that version, and preserve legacy terminology for older versions while introducing new terms for current releases.</b>

Example code before:
```
The client connects using esdb:// and esdb+discover://.
Auto-Scavenge is available in KurrentDB 24.2.
```

Example code after:
```
For KurrentDB 25.0 docs use kurrentdb:// and kurrentdb+discover:// (esdb:// variants remain supported).
For EventStoreDB ≤ 24.10, keep EventStoreDB naming; for 25.0+ use KurrentDB. Clarify availability per version.
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/kurrent-io/documentation/pull/828#discussion_r2021773742
- https://github.com/kurrent-io/documentation/pull/828#discussion_r2011000563
- https://github.com/kurrent-io/documentation/pull/875#discussion_r2072199212
- https://github.com/kurrent-io/documentation/pull/882#discussion_r2084909559
- https://github.com/kurrent-io/documentation/pull/882#discussion_r2084909741
</details>


___

<b>Pattern 2: When restructuring navigation or moving/removing pages, add redirects and update all inbound links to prevent 404s and SEO regressions.</b>

Example code before:
```
// Sidebar item removed, old path still referenced elsewhere
link: "/getting-started/use-cases/time-travel/introduction.md"
```

Example code after:
```
// Add redirect and update references
// .vuepress/config or redirects file
{ from: "/getting-started/use-cases/time-travel/introduction.html", to: "/dev-center/time-travel/overview.html" }
link: "/dev-center/time-travel/overview.md"
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/kurrent-io/documentation/pull/891#discussion_r2134987223
- https://github.com/kurrent-io/documentation/pull/891#discussion_r2134985301
</details>


___

<b>Pattern 3: Normalize capitalization and terminology for branded versus generic feature names, and keep consistent casing across titles, UI labels, HTTP endpoints, and prose.</b>

Example code before:
```
Deploy Read-only Replica nodes...
Tutorial: Using Auto-Scavenge
POST /Auto-Scavenge/configure
```

Example code after:
```
Deploy read-only replica nodes...
Tutorial: Using auto-scavenge
POST /auto-scavenge/configure
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/kurrent-io/documentation/pull/875#discussion_r2072198632
- https://github.com/kurrent-io/documentation/pull/823#discussion_r1995872042
</details>


___

<b>Pattern 4: Prefer precise, reader-focused language in docs and examples by replacing vague phrasing with actionable wording, and correct grammar, tense, and clarity in step-by-step instructions.</b>

Example code before:
```
The previous examples will subscribe to the stream from the beginning. This will end up calling the handler...
If you want to subscribe to multiple streams then it might be better to provide a regular expression.
```

Example code after:
```
The previous examples subscribed from the beginning, invoking the handler for every event before waiting for new ones.
To subscribe to multiple streams, use a regular expression.
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/kurrent-io/documentation/pull/790#discussion_r1980265625
- https://github.com/kurrent-io/documentation/pull/790#discussion_r1980272328
- https://github.com/kurrent-io/documentation/pull/790#discussion_r1980278338
- https://github.com/kurrent-io/documentation/pull/872#discussion_r2063825124
</details>


___
