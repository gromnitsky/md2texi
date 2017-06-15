# DNS

> Stability: 2 - Stable

The `dns` module contains functions belonging to two different categories:

## dns.resolve(hostname[, rrtype], callback)
<!-- YAML
added: v0.1.27
-->
- `hostname` {string} Hostname to resolve.
- `rrtype` {string} Resource record type. Default: `'A'`.
- `callback` {Function}
  - `err` {Error}
  - `records` {string[] | Object[] | string[][] | Object}

Uses the DNS protocol to resolve a hostname (e.g. `'nodejs.org'`) into an array
of the resource records. The `callback` function has arguments
`(err, records)`. When successful, `records` will be an array of resource
records. The type and structure of individual results varies based on `rrtype`:

|  `rrtype` | `records` contains             | Result type | Shorthand method         |
|-----------|--------------------------------|-------------|--------------------------|
| `'A'`     | IPv4 addresses (default)       | {string}    | [`dns.resolve4()`][]     |
| `'AAAA'`  | IPv6 addresses                 | {string}    | [`dns.resolve6()`][]     |
| `'CNAME'` | canonical name records         | {string}    | [`dns.resolveCname()`][] |
| `'MX'`    | mail exchange records          | {Object}    | [`dns.resolveMx()`][]    |
| `'NAPTR'` | name authority pointer records | {Object}    | [`dns.resolveNaptr()`][] |
| `'NS'`    | name server records            | {string}    | [`dns.resolveNs()`][]    |
| `'PTR'`   | pointer records                | {string}    | [`dns.resolvePtr()`][]   |
| `'SOA'`   | start of authority records     | {Object}    | [`dns.resolveSoa()`][]   |
| `'SRV'`   | service records                | {Object}    | [`dns.resolveSrv()`][]   |
| `'TXT'`   | text records                   | {string}    | [`dns.resolveTxt()`][]   |
| `'ANY'`   | any records                    | {Object}    | [`dns.resolveAny()`][]   |

On error, `err` is an [`Error`][] object, where `err.code` is one of the
[DNS error codes](#dns_error_codes).

## dns.resolveAny(hostname, callback)

- `hostname` {string}
- `callback` {Function}
  - `err` {Error}
  - `ret` {Object[][]}

Uses the DNS protocol to resolve all records (also known as `ANY` or `*` query).
The `ret` argument passed to the `callback` function will be an array containing
various types of records. Each object has a property `type` that indicates the
type of the current record. And depending on the `type`, additional properties
will be present on the object:

| Type | Properties |
|------|------------|
| `"A"` | `address` / `ttl` |
| `"AAAA"` | `address` / `ttl` |
| `"CNAME"` | `value` |
| `"MX"` | Refer to [`dns.resolveMx()`][] |
| `"NAPTR"` | Refer to [`dns.resolveNaptr()`][] |
| `"NS"` | `value` |
| `"PTR"` | `value` |
| `"SOA"` | Refer to [`dns.resolveSoa()`][] |
| `"SRV"` | Refer to [`dns.resolveSrv()`][] |
| `"TXT"` | This type of record contains an array property called `entries` which refers to [`dns.resolveTxt()`][], eg. `{ entries: ['...'], type: 'TXT' }` |

Here is a example of the `ret` object passed to the callback:

<!-- eslint-disable -->
```js
[ { type: 'A', address: '127.0.0.1', ttl: 299 },
  { type: 'CNAME', value: 'example.com' },
  { type: 'MX', exchange: 'alt4.aspmx.l.example.com', priority: 50 },
  { type: 'NS', value: 'ns1.example.com', type: 'NS' },
  { type: 'TXT', entries: [ 'v=spf1 include:_spf.example.com ~all' ] },
  { type: 'SOA',
    nsname: 'ns1.example.com',
    hostmaster: 'admin.example.com',
    serial: 156696742,
    refresh: 900,
    retry: 900,
    expire: 1800,
    minttl: 60 } ]
```

[`Error`]: errors.html#errors_class_error
[`dns.lookup()`]: #dns_dns_lookup_hostname_options_callback
[`dns.resolve4()`]: #dns_dns_resolve4_hostname_options_callback
[`dns.resolve6()`]: #dns_dns_resolve6_hostname_options_callback
[`dns.resolveCname()`]: #dns_dns_resolvecname_hostname_callback
[`dns.resolveMx()`]: #dns_dns_resolvemx_hostname_callback
[`dns.resolveNaptr()`]: #dns_dns_resolvenaptr_hostname_callback
[`dns.resolveNs()`]: #dns_dns_resolvens_hostname_callback
[`dns.resolvePtr()`]: #dns_dns_resolveptr_hostname_callback
[`dns.resolveSoa()`]: #dns_dns_resolvesoa_hostname_callback
[`dns.resolveSrv()`]: #dns_dns_resolvesrv_hostname_callback
[`dns.resolveTxt()`]: #dns_dns_resolvetxt_hostname_callback
[`dns.resolveAny()`]: #dns_dns_resolveany_hostname_callback
[DNS error codes]: #dns_error_codes
[Implementation considerations section]: #dns_implementation_considerations
[supported `getaddrinfo` flags]: #dns_supported_getaddrinfo_flags
[the official libuv documentation]: http://docs.libuv.org/en/latest/threadpool.html
[`util.promisify()`]: util.html#util_util_promisify_original
