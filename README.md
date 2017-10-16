# Possible Chrome / Chromium bug when making byte range requests

## Explanation

This small code reproduces a problem when making byte range requests in Chrome.

When lots of requests are done at the same time, some of them see their range header
removed, resulting in an error, or the send of the whole file by the server (depending its implementation)

In this screenshots can be seen how some requests are receiving the whole file:

![screen shot 2017-10-16 at 14 40 55](https://user-images.githubusercontent.com/1634229/31612685-deee02fa-b280-11e7-81b5-3c299986bb09.png)

![screen shot 2017-10-16 at 14 42 10](https://user-images.githubusercontent.com/1634229/31612691-e23fbe3a-b280-11e7-9cd2-97a45f6ad67a.png)

I have tried in Firefox and Opera, and works properly. So I have been observing chrome://net-internals/#events and I see a strange behaviour. Somehow, when the cache is enabled this behaviour appears, but if in the network devTools the `Disable cache` option is ON, then everything works fine, so it seems to be a problem with the Chrome caching.

These are logs of events of URL_REQUESTS, the first one is of a working request (206 partial content), while the second one is of a failing one. As you can see, after what seems to be a request to the cache, then the original request has the range header removed.

Working request:
```
3201472: URL_REQUEST
http://localhost:5000/ab3c6460-1682-4a2e-bac5-d59da9650ed6.enc
Start Time: 2017-10-13 16:31:39.561

t=69136 [st= 0] +REQUEST_ALIVE  [dt=38]
                 --> priority = "MEDIUM"
                 --> url = "http://localhost:5000/ab3c6460-1682-4a2e-bac5-d59da9650ed6.enc"
t=69136 [st= 0]   +URL_REQUEST_DELEGATE  [dt=1]
t=69136 [st= 0]      DELEGATE_INFO  [dt=1]
                     --> delegate_blocked_by = "extension AdBlock"
t=69137 [st= 1]   -URL_REQUEST_DELEGATE
t=69137 [st= 1]   +URL_REQUEST_START_JOB  [dt=36]
                   --> load_flags = 34624 (DO_NOT_SAVE_COOKIES | DO_NOT_SEND_AUTH_DATA | DO_NOT_SEND_COOKIES | MAYBE_USER_GESTURE | VERIFY_EV_CERT)
                   --> method = "GET"
                   --> url = "http://localhost:5000/ab3c6460-1682-4a2e-bac5-d59da9650ed6.enc"
t=69137 [st= 1]      URL_REQUEST_DELEGATE  [dt=0]
t=69137 [st= 1]      HTTP_CACHE_CALLER_REQUEST_HEADERS
                     --> Origin: http://localhost:4200
                         X-DevTools-Emulate-Network-Conditions-Client-Id: 7405794b-d70d-47c3-bd12-0183cf81ed44
                         User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36
                         Range: bytes=14614528-14621551
                         Accept: */*
                         Referer: http://localhost:4200/files/list
                         Accept-Encoding: gzip, deflate, br
                         Accept-Language: es-ES,es;q=0.8
                     --> line = ""
t=69137 [st= 1]      HTTP_CACHE_GET_BACKEND  [dt=0]
t=69137 [st= 1]      HTTP_CACHE_OPEN_ENTRY  [dt=1]
                     --> net_error = -2 (ERR_FAILED)
t=69138 [st= 2]      HTTP_CACHE_CREATE_ENTRY  [dt=0]
t=69138 [st= 2]      HTTP_CACHE_ADD_TO_ENTRY  [dt=0]
t=69138 [st= 2]     +HTTP_STREAM_REQUEST  [dt=0]
t=69138 [st= 2]        HTTP_STREAM_JOB_CONTROLLER_BOUND
                       --> source_dependency = 3201475 (HTTP_STREAM_JOB_CONTROLLER)
t=69138 [st= 2]        HTTP_STREAM_REQUEST_BOUND_TO_JOB
                       --> source_dependency = 3201476 (HTTP_STREAM_JOB)
t=69138 [st= 2]     -HTTP_STREAM_REQUEST
t=69139 [st= 3]     +HTTP_TRANSACTION_SEND_REQUEST  [dt=0]
t=69139 [st= 3]        HTTP_TRANSACTION_SEND_REQUEST_HEADERS
                       --> GET /ab3c6460-1682-4a2e-bac5-d59da9650ed6.enc HTTP/1.1
                           Host: localhost:5000
                           Connection: keep-alive
                           Origin: http://localhost:4200
                           User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36
                           Accept: */*
                           Referer: http://localhost:4200/files/list
                           Accept-Encoding: gzip, deflate, br
                           Accept-Language: es-ES,es;q=0.8
                           Range: bytes=14614528-14621551
t=69139 [st= 3]     -HTTP_TRANSACTION_SEND_REQUEST
t=69139 [st= 3]     +HTTP_TRANSACTION_READ_HEADERS  [dt=34]
t=69139 [st= 3]        HTTP_STREAM_PARSER_READ_HEADERS  [dt=34]
t=69173 [st=37]        HTTP_TRANSACTION_READ_RESPONSE_HEADERS
                       --> HTTP/1.1 206 Partial Content
                           Access-Control-Allow-Origin: http://localhost:4200
                           Access-Control-Allow-Methods: GET,HEAD,PUT,POST,DELETE
                           Accept-Ranges: bytes
                           Content-Type: application/octet-stream
                           Content-Range: bytes 14614528-14621551/*
                           Date: Fri, 13 Oct 2017 14:31:39 GMT
                           Connection: keep-alive
                           Transfer-Encoding: chunked
t=69173 [st=37]     -HTTP_TRANSACTION_READ_HEADERS
t=69173 [st=37]      URL_REQUEST_DELEGATE  [dt=0]
t=69173 [st=37]   -URL_REQUEST_START_JOB
t=69173 [st=37]    URL_REQUEST_DELEGATE  [dt=1]
t=69174 [st=38]    HTTP_TRANSACTION_READ_BODY  [dt=0]
t=69174 [st=38]    URL_REQUEST_JOB_FILTERED_BYTES_READ
                   --> byte_count = 3757
t=69174 [st=38]    HTTP_TRANSACTION_READ_BODY  [dt=0]
t=69174 [st=38]    URL_REQUEST_JOB_FILTERED_BYTES_READ
                   --> byte_count = 3267
t=69174 [st=38]    HTTP_TRANSACTION_READ_BODY  [dt=0]
t=69174 [st=38] -REQUEST_ALIVE

```

Failing request:
```
3201529: URL_REQUEST
http://localhost:5000/ab3c6460-1682-4a2e-bac5-d59da9650ed6.enc
Start Time: 2017-10-13 16:31:40.439

t=70014 [st= 0] +REQUEST_ALIVE  [dt=17]
                 --> priority = "MEDIUM"
                 --> url = "http://localhost:5000/ab3c6460-1682-4a2e-bac5-d59da9650ed6.enc"
t=70014 [st= 0]   +URL_REQUEST_DELEGATE  [dt=1]
t=70014 [st= 0]      DELEGATE_INFO  [dt=1]
                     --> delegate_blocked_by = "extension AdBlock"
t=70015 [st= 1]   -URL_REQUEST_DELEGATE
t=70015 [st= 1]   +URL_REQUEST_START_JOB  [dt=14]
                   --> load_flags = 34624 (DO_NOT_SAVE_COOKIES | DO_NOT_SEND_AUTH_DATA | DO_NOT_SEND_COOKIES | MAYBE_USER_GESTURE | VERIFY_EV_CERT)
                   --> method = "GET"
                   --> url = "http://localhost:5000/ab3c6460-1682-4a2e-bac5-d59da9650ed6.enc"
t=70015 [st= 1]      URL_REQUEST_DELEGATE  [dt=0]
t=70015 [st= 1]      HTTP_CACHE_CALLER_REQUEST_HEADERS
                     --> Origin: http://localhost:4200
                         X-DevTools-Emulate-Network-Conditions-Client-Id: 7405794b-d70d-47c3-bd12-0183cf81ed44
                         User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36
                         Range: bytes=14598144-14614527
                         Accept: */*
                         Referer: http://localhost:4200/player
                         Accept-Encoding: gzip, deflate, br
                         Accept-Language: es-ES,es;q=0.8
                     --> line = ""
t=70015 [st= 1]      HTTP_CACHE_GET_BACKEND  [dt=0]
t=70015 [st= 1]      HTTP_CACHE_OPEN_ENTRY  [dt=0]
t=70015 [st= 1]      HTTP_CACHE_ADD_TO_ENTRY  [dt=10]
t=70025 [st=11]      HTTP_CACHE_READ_INFO  [dt=0]
t=70025 [st=11]      HTTP_CACHE_GET_BACKEND  [dt=0]
t=70025 [st=11]      HTTP_CACHE_OPEN_ENTRY  [dt=0]
                     --> net_error = -2 (ERR_FAILED)
t=70025 [st=11]      HTTP_CACHE_CREATE_ENTRY  [dt=0]
t=70025 [st=11]      HTTP_CACHE_ADD_TO_ENTRY  [dt=0]
t=70025 [st=11]     +HTTP_STREAM_REQUEST  [dt=1]
t=70025 [st=11]        HTTP_STREAM_JOB_CONTROLLER_BOUND
                       --> source_dependency = 3201532 (HTTP_STREAM_JOB_CONTROLLER)
t=70026 [st=12]        HTTP_STREAM_REQUEST_BOUND_TO_JOB
                       --> source_dependency = 3201533 (HTTP_STREAM_JOB)
t=70026 [st=12]     -HTTP_STREAM_REQUEST
t=70026 [st=12]     +HTTP_TRANSACTION_SEND_REQUEST  [dt=0]
t=70026 [st=12]        HTTP_TRANSACTION_SEND_REQUEST_HEADERS
                       --> GET /ab3c6460-1682-4a2e-bac5-d59da9650ed6.enc HTTP/1.1
                           Host: localhost:5000
                           Connection: keep-alive
                           Origin: http://localhost:4200
                           User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36
                           Accept: */*
                           Referer: http://localhost:4200/player
                           Accept-Encoding: gzip, deflate, br
                           Accept-Language: es-ES,es;q=0.8
t=70026 [st=12]     -HTTP_TRANSACTION_SEND_REQUEST
t=70026 [st=12]     +HTTP_TRANSACTION_READ_HEADERS  [dt=3]
t=70026 [st=12]        HTTP_STREAM_PARSER_READ_HEADERS  [dt=3]
t=70029 [st=15]        HTTP_TRANSACTION_READ_RESPONSE_HEADERS
                       --> HTTP/1.1 416 Range Not Satisfiable
                           Access-Control-Allow-Origin: http://localhost:4200
                           Access-Control-Allow-Methods: GET,HEAD,PUT,POST,DELETE
                           Content-Type: text/plain; charset=utf-8
                           Content-Length: 21
                           Date: Fri, 13 Oct 2017 14:31:40 GMT
                           Connection: keep-alive
t=70029 [st=15]     -HTTP_TRANSACTION_READ_HEADERS
t=70029 [st=15]      URL_REQUEST_DELEGATE  [dt=0]
t=70029 [st=15]   -URL_REQUEST_START_JOB
t=70029 [st=15]    URL_REQUEST_DELEGATE  [dt=0]
t=70029 [st=15]    HTTP_TRANSACTION_READ_BODY  [dt=0]
t=70029 [st=15]    HTTP_CACHE_WRITE_DATA  [dt=1]
t=70030 [st=16]    URL_REQUEST_JOB_FILTERED_BYTES_READ
                   --> byte_count = 21
t=70030 [st=16]    HTTP_TRANSACTION_READ_BODY  [dt=0]
t=70030 [st=16]    HTTP_CACHE_WRITE_DATA  [dt=0]
t=70031 [st=17] -REQUEST_ALIVE

```

My setup is Macbook Pro 13', macOS Sierra 10.12.6, Chrome 61.0.3163.100

The bug can be seen when, due to the small interval time, the requests overlap each other.
When the requests are fulfilled first before the next one is done, usually the bug is not seen.

## Running

`npm install` && `npm run start`, then go to `localhost:9000`, and open dev tools and play.
